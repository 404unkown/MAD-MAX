const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');
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
    await run(`git reset --hard ${newRev}`);
    await run('git clean -fd');
    return { oldRev, newRev, alreadyUpToDate };
}

function downloadFile(url, dest, visited = new Set()) {
    return new Promise((resolve, reject) => {
        try {
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
    if (process.platform === 'win32') {
        const cmd = `powershell -NoProfile -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${outDir.replace(/\\/g, '/')}' -Force"`;
        await run(cmd);
        return;
    }
    try {
        await run('command -v unzip');
        await run(`unzip -o '${zipPath}' -d '${outDir}'`);
        return;
    } catch {}
    throw new Error("No system unzip tool found.");
}

async function updateViaZip() {
    const zipUrl = process.env.UPDATE_ZIP_URL || '';
    if (!zipUrl) {
        throw new Error('No ZIP URL configured. Set UPDATE_ZIP_URL env.');
    }
    const tmpDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
    const zipPath = path.join(tmpDir, 'update.zip');
    await downloadFile(zipUrl, zipPath);
    const extractTo = path.join(tmpDir, 'update_extract');
    if (fs.existsSync(extractTo)) fs.rmSync(extractTo, { recursive: true, force: true });
    await extractZip(zipPath, extractTo);

    const [root] = fs.readdirSync(extractTo).map(n => path.join(extractTo, n));
    const srcRoot = fs.existsSync(root) && fs.lstatSync(root).isDirectory() ? root : extractTo;

    const ignore = ['node_modules', '.git', 'sessions', 'temp', 'data'];
    copyRecursive(srcRoot, process.cwd(), ignore);
    
    try { fs.rmSync(extractTo, { recursive: true, force: true }); } catch {}
    try { fs.rmSync(zipPath, { force: true }); } catch {}
}

function copyRecursive(src, dest, ignore = []) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
        if (ignore.includes(entry)) continue;
        const s = path.join(src, entry);
        const d = path.join(dest, entry);
        const stat = fs.lstatSync(s);
        if (stat.isDirectory()) {
            copyRecursive(s, d, ignore);
        } else {
            fs.copyFileSync(s, d);
        }
    }
}

async function restartProcess(client, chatId, message) {
    try {
        await client.sendMessage(chatId, { text: '✅ Update complete! Restarting…' }, { quoted: message });
    } catch {}
    setTimeout(() => {
        process.exit(0);
    }, 500);
}

async function updateCommand(client, chatId, message, args, sender, pushName, isOwner) {
    try {
        const isUserOwner = await isOwner(sender, client, chatId);
        
        if (!isUserOwner && !isOwner) {
            await client.sendMessage(chatId, { 
                text: 'Only bot owner can use .update' 
            }, { quoted: message });
            return;
        }

        await client.sendMessage(chatId, { 
            text: '🔄 Updating the bot, please wait…' 
        }, { quoted: message });

        await client.sendMessage(chatId, { react: { text: '⏳', key: message.key } });

        if (await hasGitRepo()) {
            const { alreadyUpToDate, newRev } = await updateViaGit();
            if (!alreadyUpToDate) {
                await run('npm install --no-audit --no-fund');
            }
            await client.sendMessage(chatId, { 
                text: alreadyUpToDate ? `✅ Already up to date: ${newRev}` : `✅ Updated to ${newRev}` 
            });
        } else {
            await updateViaZip();
            await run('npm install --no-audit --no-fund');
        }

        await restartProcess(client, chatId, message);

    } catch (err) {
        console.error('Update failed:', err);
        await client.sendMessage(chatId, { 
            text: `❌ Update failed:\n${String(err.message || err)}` 
        }, { quoted: message });
        await client.sendMessage(chatId, { react: { text: '❌', key: message.key } });
    }
}

module.exports = updateCommand;