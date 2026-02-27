const fs = require('fs');
const path = require('path');

const dmblocker_PATH = path.join(__dirname, '..', 'data', 'dmblocker.json');

// Ensure data directory exists
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

function readState() {
    try {
        if (!fs.existsSync(dmblocker_PATH)) {
            return { 
                enabled: false, 
                message: '⚠️ Direct messages are blocked!\nYou cannot DM this bot. Please contact the owner in group chats only.' 
            };
        }
        const raw = fs.readFileSync(dmblocker_PATH, 'utf8');
        const data = JSON.parse(raw || '{}');
        return {
            enabled: !!data.enabled,
            message: typeof data.message === 'string' && data.message.trim() ? data.message : '⚠️ Direct messages are blocked!\nYou cannot DM this bot. Please contact the owner in group chats only.'
        };
    } catch {
        return { 
            enabled: false, 
            message: '⚠️ Direct messages are blocked!\nYou cannot DM this bot. Please contact the owner in group chats only.' 
        };
    }
}

function writeState(enabled, message) {
    try {
        const current = readState();
        const payload = {
            enabled: !!enabled,
            message: typeof message === 'string' && message.trim() ? message : current.message
        };
        fs.writeFileSync(dmblocker_PATH, JSON.stringify(payload, null, 2));
    } catch {}
}

async function dmblockerCommand(client, chatId, message, args, sender, pushName, isOwner) {
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

    if (!sub || !['on', 'off', 'status', 'setmsg'].includes(sub.toLowerCase())) {
        await client.sendMessage(chatId, { 
            text: '*DMBLOCKER (Owner Only)*\n\n' +
                  '▢ *.dmblocker on* - Enable DM auto-block\n' +
                  '▢ *.dmblocker off* - Disable DM blocker\n' +
                  '▢ *.dmblocker status* - Show current status\n' +
                  '▢ *.dmblocker setmsg <text>* - Set warning message',
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
            text: `📊 *DM BLOCKER STATUS*\n\n` +
                  `Status: *${state.enabled ? '✅ ON' : '❌ OFF'}*\n` +
                  `Message: ${state.message}`,
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

    if (sub.toLowerCase() === 'setmsg') {
        const newMsg = rest.join(' ').trim();
        if (!newMsg) {
            await client.sendMessage(chatId, { 
                text: '❌ *Usage:* .dmblocker setmsg <message>\n\nExample: .dmblocker setmsg No DMs please!',
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
        writeState(state.enabled, newMsg);
        await client.sendMessage(chatId, { 
            text: '✅ *DM Blocker message updated!*',
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
        text: `✅ *DM Blocker is now ${enable ? 'ENABLED' : 'DISABLED'}*.`,
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
    dmblockerCommand, 
    readState 
};