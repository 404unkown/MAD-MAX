const fs = require('fs');
const path = require('path');
const isAdmin = require('../lib/isAdmin');
const isOwner = require('../lib/isOwner');
const { isSudo, incrementWarningCount, resetWarningCount } = require('../lib/index');
const config = require('../set');

// Path to store antilink settings
const ANTILINK_PATH = path.join(__dirname, '../data/antilink.json');
const WARN_COUNT = config.WARN_COUNT || 3;

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

/**
 * Checks if a string contains a URL.
 *
 * @param {string} str - The string to check.
 * @returns {boolean} - True if the string contains a URL, otherwise false.
 */
function containsURL(str) {
    const urlRegex = /(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(\/[^\s]*)?/i;
    return urlRegex.test(str);
}

// Main command handler
async function handleAntilinkCommand(client, chatId, message, args, sender, pushName, isOwner) {
    try {
        // Check if it's a group
        if (!chatId.endsWith('@g.us')) {
            await client.sendMessage(chatId, { 
                text: '🚫 This command can only be used in groups!',
                ...channelInfo
            }, { quoted: message });
            return;
        }

        // Check if user is admin
        const adminStatus = await isAdmin(client, chatId, sender);
        const isSenderAdmin = adminStatus.isSenderAdmin;
        
        if (!isSenderAdmin && !isOwner) {
            await client.sendMessage(chatId, { 
                text: '🚫 This command is only for group admins!',
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
│  ├─ .antilink on
│  ├─ .antilink off
│  ├─ .antilink set delete
│  ├─ .antilink set kick
│  ├─ .antilink set warn
│  ├─ .antilink status
│  └─ .antilink get
│
├─ *Examples:*
│  ├─ .antilink on
│  └─ .antilink set kick
│
╰─➤ _Only group admins_`;

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
                    text: result ? '✅ *Antilink has been ENABLED*\n\nAction: Delete' : '🚫 *Failed to enable Antilink*',
                    ...channelInfo
                }, { quoted: message });
                await client.sendMessage(chatId, { 
                    react: { text: result ? '✅' : '🚫', key: message.key } 
                });
                break;

            case 'off':
            case 'disable':
                await removeAntilink(chatId);
                await client.sendMessage(chatId, { 
                    text: '🚫 *Antilink has been DISABLED*',
                    ...channelInfo
                }, { quoted: message });
                await client.sendMessage(chatId, { 
                    react: { text: '✅', key: message.key } 
                });
                break;

            case 'set':
                if (args.length < 2) {
                    await client.sendMessage(chatId, { 
                        text: '🚫 *Please specify an action: delete, kick, or warn*',
                        ...channelInfo
                    }, { quoted: message });
                    await client.sendMessage(chatId, { 
                        react: { text: '🚫', key: message.key } 
                    });
                    return;
                }
                
                const setAction = args[1].toLowerCase();
                if (!['delete', 'kick', 'warn'].includes(setAction)) {
                    await client.sendMessage(chatId, { 
                        text: '🚫 *Invalid action. Choose: delete, kick, or warn*',
                        ...channelInfo
                    }, { quoted: message });
                    await client.sendMessage(chatId, { 
                        react: { text: '🚫', key: message.key } 
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
                    text: setResult ? `✅ *Antilink action set to ${setAction.toUpperCase()}*` : '🚫 *Failed to set Antilink action*',
                    ...channelInfo
                }, { quoted: message });
                await client.sendMessage(chatId, { 
                    react: { text: setResult ? '✅' : '🚫', key: message.key } 
                });
                break;

            case 'status':
            case 'get':
                const status = await getAntilink(chatId);
                const statusText = status?.enabled ? '✅ ON' : '🚫 OFF';
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
                    text: '🚫 *Invalid option!*\n\nUse `.antilink` to see available commands.',
                    ...channelInfo
                }, { quoted: message });
                await client.sendMessage(chatId, { 
                    react: { text: '🚫', key: message.key } 
                });
        }
    } catch (error) {
        console.error('Error in antilink command:', error);
        await client.sendMessage(chatId, { 
            text: '🚫 *Error processing antilink command*',
            ...channelInfo
        }, { quoted: message });
        await client.sendMessage(chatId, { 
            react: { text: '🚫', key: message.key } 
        });
    }
}

// Link detection handler
async function handleLinkDetection(client, chatId, message, userMessage, senderId) {
    try {
        // Get antilink config
        const antilinkConfig = await getAntilink(chatId);
        if (!antilinkConfig?.enabled) return;

        // Skip if message is empty or not a string
        if (!userMessage || typeof userMessage !== 'string') return;

// Skip bot's own messages
if (senderId === client.user.id) {
    console.log(`[ANTILINK] Bot's own message, skipping`);
    return;
}

// Skip if sender is bot owner
const isUserOwner = await isOwner(senderId, client, chatId);
if (isUserOwner) {
    console.log(`[ANTILINK] Bot owner detected, skipping`);
    return;
}

// Skip if sender is group admin
const { isSenderAdmin } = await isAdmin(client, chatId, senderId);
if (isSenderAdmin) {
    console.log(`[ANTILINK] Admin detected, skipping`);
    return;
}

// Skip if sender is sudo
const senderIsSudo = await isSudo(senderId);
if (senderIsSudo) {
    console.log(`[ANTILINK] Sudo detected, skipping`);
    return;
}

        // Check if message contains a URL
        if (!containsURL(userMessage.trim())) return;

        console.log(`[ANTILINK] Detected link in ${chatId} from ${senderId}`);

        const action = antilinkConfig.action;

        try {
            // Delete message first
            await client.sendMessage(chatId, { delete: message.key });

            switch (action) {
                case 'delete':
                    await client.sendMessage(chatId, { 
                        text: `\`\`\`@${senderId.split('@')[0]} links are not allowed here\`\`\``,
                        mentions: [senderId],
                        ...channelInfo
                    });
                    break;

                case 'kick':
                    await client.groupParticipantsUpdate(chatId, [senderId], 'remove');
                    await client.sendMessage(chatId, {
                        text: `\`\`\`@${senderId.split('@')[0]} has been kicked for sending links\`\`\``,
                        mentions: [senderId],
                        ...channelInfo
                    });
                    break;

                case 'warn':
                    const warningCount = await incrementWarningCount(chatId, senderId);
                    if (warningCount >= WARN_COUNT) {
                        await client.groupParticipantsUpdate(chatId, [senderId], 'remove');
                        await resetWarningCount(chatId, senderId);
                        await client.sendMessage(chatId, {
                            text: `\`\`\`@${senderId.split('@')[0]} has been kicked after ${WARN_COUNT} warnings\`\`\``,
                            mentions: [senderId],
                            ...channelInfo
                        });
                    } else {
                        await client.sendMessage(chatId, {
                            text: `\`\`\`@${senderId.split('@')[0]} warning ${warningCount}/${WARN_COUNT} for sending links\`\`\``,
                            mentions: [senderId],
                            ...channelInfo
                        });
                    }
                    break;
            }
        } catch (error) {
            console.error('[ANTILINK] Error taking action:', error);
        }
    } catch (error) {
        console.error('Error in link detection:', error);
    }
}

module.exports = {
    handleAntilinkCommand,
    handleLinkDetection,
};