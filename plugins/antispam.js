const fs = require('fs');
const path = require('path');
const isAdmin = require('../lib/isAdmin');
const isOwner = require('../lib/isOwner');

// Path to store antispam settings (better than modifying settings.js)
const ANTISPAM_PATH = path.join(__dirname, '../data/antispam.json');

// Ensure data directory exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize file if it doesn't exist
if (!fs.existsSync(ANTISPAM_PATH)) {
    fs.writeFileSync(ANTISPAM_PATH, JSON.stringify({ enabled: true }, null, 2));
}

// Get antispam status
async function getAntispamStatus() {
    try {
        const data = JSON.parse(fs.readFileSync(ANTISPAM_PATH, 'utf8'));
        return data.enabled || false;
    } catch {
        return false;
    }
}

// Set antispam status
async function setAntispamStatus(enabled) {
    try {
        fs.writeFileSync(ANTISPAM_PATH, JSON.stringify({ enabled: !!enabled }, null, 2));
        return true;
    } catch {
        return false;
    }
}

module.exports = async (client, chatId, message, args, sender, pushName, isOwnerFlag) => {
    try {
        // Check if this is a group chat
        if (!chatId.endsWith('@g.us')) {
            await client.sendMessage(chatId, {
                text: '❌ This command can only be used in groups!',
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
        
        // Check if user is admin in the group
        const adminStatus = await isAdmin(client, chatId, sender);
        
        // Only allow admins to toggle anti-spam (except bot owner)
        const isUserOwner = await isOwner(sender, client, chatId);
        
        if (!adminStatus.isSenderAdmin && !isUserOwner && !isOwnerFlag) {
            await client.sendMessage(chatId, {
                text: '❌ Only group admins can use this command!',
                mentions: [sender],
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
        
        // Check if bot is admin (required for anti-spam to work)
        if (!adminStatus.isBotAdmin) {
            await client.sendMessage(chatId, {
                text: '❌ Bot must be an admin to use anti-spam feature!',
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
        
        // Get current status
        const isEnabled = await getAntispamStatus();
        const action = args?.[0]?.toLowerCase();
        
        // Handle help or status check
        if (action === 'status' || action === 'check') {
            await client.sendMessage(chatId, {
                text: `📊 *ANTI-SPAM STATUS*\n\n` +
                      `Current status: ${isEnabled ? '✅ ENABLED' : '❌ DISABLED'}\n\n` +
                      `*Rules:*\n` +
                      `• Max 8 messages in 5 seconds\n` +
                      `• 3 warnings = auto-mute (2 minutes)\n\n` +
                      `*Usage:*\n` +
                      `• .antispam on - Enable\n` +
                      `• .antispam off - Disable\n` +
                      `• .antispam status - Check status`,
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
        
        // If no action or invalid action, show help
        if (!action || (action !== 'on' && action !== 'off' && action !== 'enable' && action !== 'disable')) {
            await client.sendMessage(chatId, {
                text: `╭─❖ *ANTI-SPAM COMMANDS* ❖─
│
├─ *Usage:* .antispam <option>
│
├─ *Options:*
│  ├─ .antispam on - Enable anti-spam
│  ├─ .antispam off - Disable anti-spam
│  └─ .antispam status - Check status
│
├─ *Rules:*
│  ├─ 8 messages in 5 seconds = spam
│  ├─ 3 warnings = auto-mute (2 min)
│
╰─➤ _Only group admins can use this_`,
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
        
        // Handle on/off
        if (action === 'on' || action === 'enable') {
            if (isEnabled) {
                await client.sendMessage(chatId, {
                    text: '⚠️ *Anti-spam is already enabled*',
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
            
            const success = await setAntispamStatus(true);
            if (success) {
                await client.sendMessage(chatId, {
                    text: '✅ *ANTI-SPAM ENABLED*\n\nAnti-spam system is now active!\n\n• Max 8 messages in 5 seconds\n• 3 warnings = auto-mute (2 minutes)',
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
            } else {
                await client.sendMessage(chatId, {
                    text: '❌ *Failed to enable anti-spam*',
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
        }
        else if (action === 'off' || action === 'disable') {
            if (!isEnabled) {
                await client.sendMessage(chatId, {
                    text: '⚠️ *Anti-spam is already disabled*',
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
            
            const success = await setAntispamStatus(false);
            if (success) {
                await client.sendMessage(chatId, {
                    text: '❌ *ANTI-SPAM DISABLED*\n\nAnti-spam system has been turned off.',
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
            } else {
                await client.sendMessage(chatId, {
                    text: '❌ *Failed to disable anti-spam*',
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
        }
        
    } catch (error) {
        console.error('Error in antispam command:', error);
        await client.sendMessage(chatId, {
            text: '❌ *Failed to process anti-spam command*',
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
};