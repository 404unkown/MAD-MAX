const fs = require('fs');
const path = require('path');
const isAdmin = require('../lib/isAdmin');

// Path to store antilink settings
const ANTILINK_PATH = path.join(__dirname, '../data/antilink.json');

// Global channel info
const channelInfo = {
    contextInfo: {
        forwardingScore: 1,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363401269012709@newsletter',
            newsletterName: 'MAD-MAX',
            serverMessageId: -1
        }
    }
};

// Ensure data directory exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize file if it doesn't exist
if (!fs.existsSync(ANTILINK_PATH)) {
    fs.writeFileSync(ANTILINK_PATH, JSON.stringify({}, null, 2));
}

// Get antilink setting for a group
async function getAntilink(groupId) {
    try {
        const data = JSON.parse(fs.readFileSync(ANTILINK_PATH, 'utf8'));
        return data[groupId] || null;
    } catch {
        return null;
    }
}

// Set antilink for a group
async function setAntilink(groupId, enabled, action = 'delete') {
    try {
        const data = JSON.parse(fs.readFileSync(ANTILINK_PATH, 'utf8'));
        data[groupId] = { 
            enabled: !!enabled, 
            action: action 
        };
        fs.writeFileSync(ANTILINK_PATH, JSON.stringify(data, null, 2));
        return true;
    } catch {
        return false;
    }
}

// Remove antilink for a group
async function removeAntilink(groupId) {
    try {
        const data = JSON.parse(fs.readFileSync(ANTILINK_PATH, 'utf8'));
        delete data[groupId];
        fs.writeFileSync(ANTILINK_PATH, JSON.stringify(data, null, 2));
        return true;
    } catch {
        return false;
    }
}

// Check if BOT OWNER is admin in the group
async function isBotOwnerAdmin(client, chatId) {
    try {
        const config = require('../set');
        const metadata = await client.groupMetadata(chatId);
        const botOwnerNumber = config.owner || '254104503383';
        
        const botOwnerJid = `${botOwnerNumber}@s.whatsapp.net`;
        
        const owner = metadata.participants.find(p => p.id === botOwnerJid);
        return owner?.admin === 'admin' || owner?.admin === 'superadmin';
    } catch (error) {
        console.error('Error checking bot owner admin status:', error);
        return false;
    }
}

// Main command handler
async function handleAntilinkCommand(client, chatId, message, args, sender, pushName, isOwner) {
    try {
        // Check if it's a group
        if (!chatId.endsWith('@g.us')) {
            await client.sendMessage(chatId, { 
                text: '❌ This command can only be used in groups!',
                ...channelInfo
            }, { quoted: message });
            return;
        }

        // Check if user is admin
        const adminStatus = await isAdmin(client, chatId, sender);
        const isSenderAdmin = adminStatus.isSenderAdmin;
        
        if (!isSenderAdmin && !isOwner) {
            await client.sendMessage(chatId, { 
                text: '❌ This command is only for group admins!',
                ...channelInfo
            }, { quoted: message });
            return;
        }

        const action = args[0]?.toLowerCase();

        if (!action) {
            const usage = `╭─❖ *ANTILINK COMMANDS* ❖─
│
├─ *Usage:* .antilink <option> [value]
│
├─ *Options:*
│  ├─ .antilink on - Enable antilink
│  ├─ .antilink off - Disable antilink
│  ├─ .antilink set delete - Delete links
│  ├─ .antilink set kick - Kick user who posts links
│  ├─ .antilink set warn - Warn user who posts links
│  ├─ .antilink status - Check current settings
│  └─ .antilink get - Get configuration
│
├─ *Examples:*
│  ├─ .antilink on
│  └─ .antilink set kick
│
╰─➤ _Only group admins can use this_`;

            await client.sendMessage(chatId, { 
                text: usage,
                ...channelInfo
            }, { quoted: message });
            return;
        }

        // Send processing reaction
        await client.sendMessage(chatId, { 
            react: { text: '⏳', key: message.key } 
        });

        switch (action) {
            case 'on':
            case 'enable':
                const existingConfig = await getAntilink(chatId);
                if (existingConfig?.enabled) {
                    await client.sendMessage(chatId, { 
                        text: '⚠️ *Antilink is already enabled*',
                        ...channelInfo
                    }, { quoted: message });
                    await client.sendMessage(chatId, { 
                        react: { text: '⚠️', key: message.key } 
                    });
                    return;
                }
                const result = await setAntilink(chatId, true, 'delete');
                await client.sendMessage(chatId, { 
                    text: result ? '✅ *Antilink has been ENABLED*\n\nAction: Delete' : '❌ *Failed to enable Antilink*',
                    ...channelInfo
                }, { quoted: message });
                await client.sendMessage(chatId, { 
                    react: { text: result ? '✅' : '❌', key: message.key } 
                });
                break;

            case 'off':
            case 'disable':
                await removeAntilink(chatId);
                await client.sendMessage(chatId, { 
                    text: '❌ *Antilink has been DISABLED*',
                    ...channelInfo
                }, { quoted: message });
                await client.sendMessage(chatId, { 
                    react: { text: '✅', key: message.key } 
                });
                break;

            case 'set':
                if (args.length < 2) {
                    await client.sendMessage(chatId, { 
                        text: '❌ *Please specify an action: delete, kick, or warn*',
                        ...channelInfo
                    }, { quoted: message });
                    await client.sendMessage(chatId, { 
                        react: { text: '❌', key: message.key } 
                    });
                    return;
                }
                
                const setAction = args[1].toLowerCase();
                if (!['delete', 'kick', 'warn'].includes(setAction)) {
                    await client.sendMessage(chatId, { 
                        text: '❌ *Invalid action. Choose: delete, kick, or warn*',
                        ...channelInfo
                    }, { quoted: message });
                    await client.sendMessage(chatId, { 
                        react: { text: '❌', key: message.key } 
                    });
                    return;
                }
                
                const currentConfig = await getAntilink(chatId);
                if (!currentConfig?.enabled) {
                    await client.sendMessage(chatId, { 
                        text: '⚠️ *Please enable antilink first using: .antilink on*',
                        ...channelInfo
                    }, { quoted: message });
                    await client.sendMessage(chatId, { 
                        react: { text: '⚠️', key: message.key } 
                    });
                    return;
                }
                
                const setResult = await setAntilink(chatId, true, setAction);
                await client.sendMessage(chatId, { 
                    text: setResult ? `✅ *Antilink action set to ${setAction.toUpperCase()}*` : '❌ *Failed to set Antilink action*',
                    ...channelInfo
                }, { quoted: message });
                await client.sendMessage(chatId, { 
                    react: { text: setResult ? '✅' : '❌', key: message.key } 
                });
                break;

            case 'status':
            case 'get':
                const status = await getAntilink(chatId);
                const statusText = status?.enabled ? '✅ ON' : '❌ OFF';
                const actionText = status?.action || 'Not set';
                
                await client.sendMessage(chatId, { 
                    text: `📊 *ANTILINK CONFIGURATION*\n\nStatus: ${statusText}\nAction: ${actionText}`,
                    ...channelInfo
                }, { quoted: message });
                await client.sendMessage(chatId, { 
                    react: { text: '✅', key: message.key } 
                });
                break;

            default:
                await client.sendMessage(chatId, { 
                    text: '❌ *Invalid option!*\n\nUse `.antilink` to see available commands.',
                    ...channelInfo
                }, { quoted: message });
                await client.sendMessage(chatId, { 
                    react: { text: '❌', key: message.key } 
                });
        }
    } catch (error) {
        console.error('Error in antilink command:', error);
        await client.sendMessage(chatId, { 
            text: '❌ *Error processing antilink command*',
            ...channelInfo
        }, { quoted: message });
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: message.key } 
        });
    }
}

// Link detection handler
async function handleLinkDetection(client, chatId, message, userMessage, senderId) {
    try {
        const antilinkSetting = await getAntilink(chatId);
        if (!antilinkSetting?.enabled) return;

        console.log(`[ANTILINK] Checking message in ${chatId}, action: ${antilinkSetting.action}`);
        
        let shouldProcess = false;

        // Link detection patterns
        const linkPatterns = {
            whatsappGroup: /chat\.whatsapp\.com\/[A-Za-z0-9]{20,}/i,
            whatsappChannel: /whatsapp\.com\/channel\/[A-Za-z0-9]{20,}|wa\.me\/channel\/[A-Za-z0-9]{20,}/i,
            telegram: /t\.me\/[A-Za-z0-9_]+/i,
            discord: /discord\.gg\/[A-Za-z0-9_]+|discord\.com\/invite\/[A-Za-z0-9_]+/i,
            allLinks: /https?:\/\/[^\s]+|www\.[^\s]+/i,
        };

        // Check all patterns
        for (const [type, pattern] of Object.entries(linkPatterns)) {
            if (pattern.test(userMessage)) {
                console.log(`[ANTILINK] Detected ${type} link`);
                shouldProcess = true;
                break;
            }
        }

        if (shouldProcess) {
            // Check if bot owner is admin
            const botOwnerAdmin = await isBotOwnerAdmin(client, chatId);
            if (!botOwnerAdmin) {
                console.log('[ANTILINK] Bot owner is not admin, cannot take action');
                return;
            }

            const action = antilinkSetting.action;

            // Always delete the message first
            try {
                await client.sendMessage(chatId, {
                    delete: { 
                        remoteJid: chatId, 
                        fromMe: false, 
                        id: message.key.id, 
                        participant: senderId 
                    },
                });
                console.log(`[ANTILINK] Message deleted successfully`);
            } catch (error) {
                console.error('[ANTILINK] Failed to delete message:', error);
            }

            // Take additional action based on setting
            switch (action) {
                case 'warn':
                    await client.sendMessage(chatId, { 
                        text: `⚠️ @${senderId.split('@')[0]}, links are not allowed in this group!`,
                        mentions: [senderId],
                        ...channelInfo
                    });
                    break;

                case 'kick':
                    await client.sendMessage(chatId, { 
                        text: `🚫 @${senderId.split('@')[0]} has been removed for posting links.`,
                        mentions: [senderId],
                        ...channelInfo
                    });
                    
                    // Kick the user
                    setTimeout(async () => {
                        try {
                            await client.groupParticipantsUpdate(chatId, [senderId], 'remove');
                            console.log(`[ANTILINK] Kicked ${senderId}`);
                        } catch (kickError) {
                            console.error('[ANTILINK] Failed to kick user:', kickError);
                        }
                    }, 1000);
                    break;

                case 'delete':
                default:
                    // Just deletion is enough, already done above
                    console.log('[ANTILINK] Link deleted');
                    break;
            }
        }
    } catch (error) {
        console.error('Error in link detection:', error);
    }
}

module.exports = {
    handleAntilinkCommand,
    handleLinkDetection,
};