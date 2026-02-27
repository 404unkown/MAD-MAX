const fs = require('fs');
const path = require('path');

const anticall_PATH = path.join(__dirname, '..', 'data', 'anticall.json');

// Ensure data directory exists
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

function readState() {
    try {
        if (!fs.existsSync(anticall_PATH)) {
            return { enabled: false };
        }
        const raw = fs.readFileSync(anticall_PATH, 'utf8');
        const data = JSON.parse(raw || '{}');
        return {
            enabled: !!data.enabled
        };
    } catch {
        return { enabled: false };
    }
}

function writeState(enabled) {
    try {
        const payload = {
            enabled: !!enabled
        };
        fs.writeFileSync(anticall_PATH, JSON.stringify(payload, null, 2));
    } catch {}
}

async function anticallCommand(client, chatId, message, args, sender, pushName, isOwner) {
    // Check if user is owner
    if (!isOwner) {
        await client.sendMessage(chatId, { 
            text: '❌ Only bot owner can use this command!',
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363401269012709@newsletter',
                    newsletterName: 'MAD-MAX',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });
        return;
    }
    
    // args is an array from main.js, join to make string
    const argStr = args.join(' ').trim();
    const [sub, ...rest] = argStr.split(' ');
    const state = readState();

    if (!sub || !['on', 'off', 'status'].includes(sub.toLowerCase())) {
        await client.sendMessage(chatId, { 
            text: '*ANTICALL (Owner Only)*\n\n' +
                  '▢ *.anticall on* - Enable auto-block on incoming calls\n' +
                  '▢ *.anticall off* - Disable anticall\n' +
                  '▢ *.anticall status* - Show current status',
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363401269012709@newsletter',
                    newsletterName: 'MAD-MAX',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });
        return;
    }

    if (sub.toLowerCase() === 'status') {
        await client.sendMessage(chatId, { 
            text: `📞 *ANTICALL STATUS*\n\n` +
                  `Status: *${state.enabled ? '✅ ON' : '❌ OFF'}*`,
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363401269012709@newsletter',
                    newsletterName: 'MAD-MAX',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });
        return;
    }

    const enable = sub.toLowerCase() === 'on';
    writeState(enable);
    await client.sendMessage(chatId, { 
        text: `✅ *Anticall is now ${enable ? 'ENABLED' : 'DISABLED'}*.`,
        contextInfo: {
            forwardingScore: 1,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363401269012709@newsletter',
                newsletterName: 'MAD-MAX',
                serverMessageId: -1
            }
        }
    }, { quoted: message });
}

module.exports = { 
    anticallCommand, 
    readState 
};