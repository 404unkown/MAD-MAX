const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');
const util = require('util');
const execPromise = util.promisify(exec);

// Use your bot's owner check function
const isOwner = require('../lib/isOwner');

function run(cmd) {
    return new Promise((resolve, reject) => {
        exec(cmd, { windowsHide: true }, (err, stdout, stderr) => {
            if (err) return reject(new Error((stderr || stdout || err.message || '').toString()));
            resolve((stdout || '').toString());
        });
    });
}

async function hasGitRepo() {
    const gitDir = path.join(process.cwd(), '.git');
    if (!fs.existsSync(gitDir)) return false;
    try {
        await run('git --version');
        return true;
    } catch {
        return false;
    }
}

async function updateViaGit() {
    const oldRev = (await run('git rev-parse HEAD').catch(() => 'unknown')).trim();
    await run('git fetch --all --prune');
    const newRev = (await run('git rev-parse origin/main')).trim();
    const alreadyUpToDate = oldRev === newRev;
    const commits = alreadyUpToDate ? '' : await run(`git log --pretty=format:"%h %s (%an)" ${oldRev}..${newRev}`).catch(() => '');
    const files = alreadyUpToDate ? '' : await run(`git diff --name-status ${oldRev} ${newRev}`).catch(() => '');
    await run(`git reset --hard ${newRev}`);
    await run('git clean -fd');
    return { oldRev, newRev, alreadyUpToDate, commits, files };
}

function downloadFile(url, dest, visited = new Set()) {
    return new Promise((resolve, reject) => {
        try {
            // Avoid infinite redirect loops
            if (visited.has(url) || visited.size > 5) {
                return reject(new Error('Too many redirects'));
            }
            visited.add(url);

            const useHttps = url.startsWith('https://');
            const client = useHttps ? require('https') : require('http');
            const req = client.get(url, {
                headers: {
                    'User-Agent': 'MAD-MAX-Updater/1.0',
                    'Accept': '*/*'
                }
            }, res => {
                // Handle redirects
                if ([301, 302, 303, 307, 308].includes(res.statusCode)) {
                    const location = res.headers.location;
                    if (!location) return reject(new Error(`HTTP ${res.statusCode} without Location`));
                    const nextUrl = new URL(location, url).toString();
                    res.resume();
                    return downloadFile(nextUrl, dest, visited).then(resolve).catch(reject);
                }

                if (res.statusCode !== 200) {
                    return reject(new Error(`HTTP ${res.statusCode}`));
                }

                const file = fs.createWriteStream(dest);
                res.pipe(file);
                file.on('finish', () => file.close(resolve));
                file.on('error', err => {
                    try { file.close(() => {}); } catch {}
                    fs.unlink(dest, () => reject(err));
                });
            });
            req.on('error', err => {
                fs.unlink(dest, () => reject(err));
            });
        } catch (e) {
            reject(e);
        }
    });
}

async function extractZip(zipPath, outDir) {
    // Try to use platform tools; no extra npm modules required
    if (process.platform === 'win32') {
        const cmd = `powershell -NoProfile -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${outDir.replace(/\\/g, '/')}' -Force"`;
        await run(cmd);
        return;
    }
    // Linux/mac: try unzip, else 7z, else busybox unzip
    try {
        await run('command -v unzip');
        await run(`unzip -o '${zipPath}' -d '${outDir}'`);
        return;
    } catch {}
    try {
        await run('command -v 7z');
        await run(`7z x -y '${zipPath}' -o'${outDir}'`);
        return;
    } catch {}
    try {
        await run('busybox unzip -h');
        await run(`busybox unzip -o '${zipPath}' -d '${outDir}'`);
        return;
    } catch {}
    throw new Error("No system unzip tool found (unzip/7z/busybox). Git mode is recommended on this panel.");
}

function copyRecursive(src, dest, ignore = [], relative = '', outList = []) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
        if (ignore.includes(entry)) continue;
        const s = path.join(src, entry);
        const d = path.join(dest, entry);
        const stat = fs.lstatSync(s);
        if (stat.isDirectory()) {
            copyRecursive(s, d, ignore, path.join(relative, entry), outList);
        } else {
            fs.copyFileSync(s, d);
            if (outList) outList.push(path.join(relative, entry).replace(/\\/g, '/'));
        }
    }
}

async function updateViaZip(sock, chatId, message, zipOverride) {
    // Get config from your set.js file
    const config = require('../set');
    const zipUrl = (zipOverride || config.updateZipUrl || process.env.UPDATE_ZIP_URL || '').trim();
    
    if (!zipUrl) {
        throw new Error('No ZIP URL configured. Set updateZipUrl in set.js or UPDATE_ZIP_URL env.');
    }
    
    const tmpDir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
    
    const zipPath = path.join(tmpDir, 'update.zip');
    await downloadFile(zipUrl, zipPath);
    
    const extractTo = path.join(tmpDir, 'update_extract');
    if (fs.existsSync(extractTo)) fs.rmSync(extractTo, { recursive: true, force: true });
    await extractZip(zipPath, extractTo);

    // Find the top-level extracted folder (GitHub zips create REPO-branch folder)
    const items = fs.readdirSync(extractTo).map(n => path.join(extractTo, n));
    const root = items.find(item => fs.lstatSync(item).isDirectory()) || extractTo;
    const srcRoot = fs.existsSync(root) && fs.lstatSync(root).isDirectory() ? root : extractTo;

    // Copy over while preserving runtime dirs/files
    const ignore = ['node_modules', '.git', 'sessions', 'tmp', 'temp', 'data', 'store.json', 'baileys_store.json', 'creds.json'];
    const copied = [];
    
    // Preserve owner and other important configs from existing set.js
    let preservedConfig = {};
    try {
        const currentConfig = require('../set');
        preservedConfig = {
            owner: currentConfig.owner,
            session: currentConfig.session,
            prefix: currentConfig.prefix,
            mycode: currentConfig.mycode,
            packname: currentConfig.packname
        };
    } catch {}
    
    copyRecursive(srcRoot, process.cwd(), ignore, '', copied);
    
    // Restore preserved config values
    if (preservedConfig.owner) {
        try {
            const setPath = path.join(process.cwd(), 'set.js');
            if (fs.existsSync(setPath)) {
                let text = fs.readFileSync(setPath, 'utf8');
                if (preservedConfig.owner) {
                    text = text.replace(/owner:\s*['"`][^'"`]*['"`]/, `owner: '${preservedConfig.owner}'`);
                }
                if (preservedConfig.session) {
                    text = text.replace(/session:\s*['"`][^'"`]*['"`]/, `session: '${preservedConfig.session}'`);
                }
                if (preservedConfig.prefix) {
                    text = text.replace(/prefix:\s*['"`][^'"`]*['"`]/, `prefix: '${preservedConfig.prefix}'`);
                }
                fs.writeFileSync(setPath, text);
            }
        } catch {}
    }
    
    // Cleanup extracted directory
    try { fs.rmSync(extractTo, { recursive: true, force: true }); } catch {}
    try { fs.rmSync(zipPath, { force: true }); } catch {}
    
    return { copiedFiles: copied };
}

async function restartProcess(sock, chatId, message) {
    try {
        await sock.sendMessage(chatId, { text: '✅ Update complete! Restarting…' }, { quoted: message });
    } catch {}
    
    try {
        // Preferred: PM2
        await run('pm2 restart all');
        return;
    } catch {}
    
    // Panels usually auto-restart when the process exits.
    // Exit after a short delay to allow the above message to flush.
    setTimeout(() => {
        process.exit(0);
    }, 500);
}

const updateCommand = async (client, chatId, m, args, sender, pushName, isOwnerSimple) => {
    try {
        // Check if user is owner
        const isUserOwner = await isOwner(sender, client, chatId);
        
        if (!m.key.fromMe && !isUserOwner && !isOwnerSimple) {
            await client.sendMessage(chatId, { 
                text: '❌ *Only bot owner can use this command!*' 
            }, { quoted: m });
            return;
        }

        // Check for zip override argument
        const zipOverride = args[0]?.startsWith('http') ? args[0] : null;

        // Send initial message
        await client.sendMessage(chatId, { 
            text: '🔄 *Updating the bot, please wait…*\n\nThis may take a few minutes.' 
        }, { quoted: m });

        // Send loading reaction
        await client.sendMessage(chatId, {
            react: { text: '🔄', key: m.key }
        });

        if (await hasGitRepo()) {
            // Update via Git
            const { oldRev, newRev, alreadyUpToDate, commits, files } = await updateViaGit();
            
            // Run npm install
            await run('npm install --no-audit --no-fund');
            
            // Send success message
            if (alreadyUpToDate) {
                await client.sendMessage(chatId, { 
                    text: `✅ *Bot is already up to date!*\n\n📌 *Current version:* ${newRev.slice(0, 7)}` 
                }, { quoted: m });
            } else {
                const commitCount = commits.split('\n').filter(c => c.trim()).length;
                await client.sendMessage(chatId, { 
                    text: `✅ *Update successful!*\n\n📌 *From:* ${oldRev.slice(0, 7)}\n📌 *To:* ${newRev.slice(0, 7)}\n📝 *Commits:* ${commitCount}\n\n_Restarting..._` 
                }, { quoted: m });
            }
        } else {
            // Update via ZIP
            const { copiedFiles } = await updateViaZip(client, chatId, m, zipOverride);
            
            // Run npm install
            await run('npm install --no-audit --no-fund');
            
            await client.sendMessage(chatId, { 
                text: `✅ *Update successful!*\n\n📦 *Files updated:* ${copiedFiles.length}\n\n_Restarting..._` 
            }, { quoted: m });
        }

        // Send success reaction
        await client.sendMessage(chatId, {
            react: { text: '✅', key: m.key }
        });

        // Restart the bot
        await restartProcess(client, chatId, m);

    } catch (error) {
        console.error('Update failed:', error);
        
        // Send error reaction
        await client.sendMessage(chatId, {
            react: { text: '❌', key: m.key }
        });
        
        await client.sendMessage(chatId, { 
            text: `❌ *Update failed:*\n\n${error.message || error}\n\nPlease check logs for more details.` 
        }, { quoted: m });
    }
};

module.exports = {
    updateCommand
};