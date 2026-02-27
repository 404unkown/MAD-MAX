const Config = require('../set');
const fs = require('fs');
const path = require('path');

// File to store anti-sticker settings
const antistickerFile = path.join(__dirname, '..', 'data', 'antisticker.json');

// Store warn counts in memory per user per group
const stickerWarnCounts = new Map(); // Key: `${groupJid}:${userJid}`

// Default settings
const defaultSettings = {
    status: 'off',
    action: 'delete', // delete, remove, warn
    warn_limit: 3
};

// Ensure data directory exists
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Read all settings from file
function readAllAntiStickerSettings() {
    try {
        if (!fs.existsSync(antistickerFile)) {
            fs.writeFileSync(antistickerFile, JSON.stringify({}, null, 2));
            return {};
        }
        const data = fs.readFileSync(antistickerFile, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading anti-sticker settings:', error);
        return {};
    }
}

// Write all settings to file
function writeAllAntiStickerSettings(settings) {
    try {
        fs.writeFileSync(antistickerFile, JSON.stringify(settings, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing anti-sticker settings:', error);
        return false;
    }
}

// Get settings for a specific group
function getAntiStickerSettings(groupJid) {
    try {
        const allSettings = readAllAntiStickerSettings();
        if (!allSettings[groupJid]) {
            allSettings[groupJid] = { ...defaultSettings, groupName: '' };
            writeAllAntiStickerSettings(allSettings);
        }
        return allSettings[groupJid];
    } catch (error) {
        console.error('Error getting anti-sticker settings:', error);
        return { ...defaultSettings };
    }
}

// Update settings for a group
function updateAntiStickerSettings(groupJid, updates, groupName = '') {
    try {
        const allSettings = readAllAntiStickerSettings();
        if (!allSettings[groupJid]) {
            allSettings[groupJid] = { ...defaultSettings, groupName: groupName };
        }
        
        // Update fields
        if (updates.status !== undefined) allSettings[groupJid].status = updates.status;
        if (updates.action !== undefined) allSettings[groupJid].action = updates.action;
        if (updates.warn_limit !== undefined) allSettings[groupJid].warn_limit = updates.warn_limit;
        if (groupName) allSettings[groupJid].groupName = groupName;
        
        writeAllAntiStickerSettings(allSettings);
        return allSettings[groupJid];
    } catch (error) {
        console.error('Error updating anti-sticker settings:', error);
        return null;
    }
}

// Get all groups with anti-sticker enabled
function getAllActiveStickerGroups() {
    try {
        const allSettings = readAllAntiStickerSettings();
        const activeGroups = [];
        
        for (const [groupJid, settings] of Object.entries(allSettings)) {
            if (settings.status === 'on') {
                activeGroups.push({
                    groupJid,
                    groupName: settings.groupName || 'Unknown Group',
                    action: settings.action,
                    warn_limit: settings.warn_limit
                });
            }
        }
        
        return activeGroups;
    } catch (error) {
        console.error('Error getting active groups:', error);
        return [];
    }
}

// Warn count functions
function getStickerWarnCount(groupJid, userJid) {
    const key = `${groupJid}:${userJid}`;
    return stickerWarnCounts.get(key) || 0;
}

function incrementStickerWarnCount(groupJid, userJid) {
    const key = `${groupJid}:${userJid}`;
    const current = getStickerWarnCount(groupJid, userJid);
    stickerWarnCounts.set(key, current + 1);
    return current + 1;
}

function resetStickerWarnCount(groupJid, userJid) {
    const key = `${groupJid}:${userJid}`;
    stickerWarnCounts.delete(key);
}

function clearAllStickerWarns(groupJid) {
    for (const key of stickerWarnCounts.keys()) {
        if (key.startsWith(`${groupJid}:`)) {
            stickerWarnCounts.delete(key);
        }
    }
}

// Check if message is a sticker
function isStickerMessage(message) {
    return !!(message.message?.stickerMessage || 
              message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.stickerMessage);
}

// Main anti-sticker command
async function antistickerCommand(client, chatId, message, args, sender, pushName, isOwnerSimple) {
    try {
        // Check if it's a group
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

        // Get group metadata
        const groupMetadata = await client.groupMetadata(chatId).catch(() => null);
        const groupName = groupMetadata?.subject || 'Unknown Group';
        
        // Check if user is admin
        const isAdmin = groupMetadata?.participants?.some(
            p => p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin')
        ) || false;

        if (!isAdmin && !isOwnerSimple) {
            await client.sendMessage(chatId, {
                text: '❌ Only group admins can use this command!',
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

        const settings = getAntiStickerSettings(chatId);

        // If no arguments, show current settings
        if (!args || args.length === 0) {
            const statusEmoji = settings.status === 'on' ? '✅' : '❌';
            const statusText = settings.status === 'on' ? 'Enabled' : 'Disabled';
            
            const actionEmoji = {
                'delete': '🗑️',
                'remove': '👢',
                'warn': '⚠️'
            }[settings.action] || '🗑️';
            
            await client.sendMessage(chatId, {
                text: `🛡️ *ANTI-STICKER SETTINGS*\n\n` +
                      `📊 *Status:* ${statusEmoji} ${statusText}\n` +
                      `${actionEmoji} *Action:* ${settings.action}\n` +
                      `⚠️ *Warn Limit:* ${settings.warn_limit}\n\n` +
                      `*Commands:*\n` +
                      `▸ .antisticker on - Enable\n` +
                      `▸ .antisticker off - Disable\n` +
                      `▸ .antisticker action [delete/remove/warn] - Set action\n` +
                      `▸ .antisticker limit [number] - Set warn limit\n` +
                      `▸ .antisticker list - List active groups\n` +
                      `▸ .antisticker resetwarns - Reset all warnings\n\n` +
                      `> ${Config.caption || 'MAD-MAX BOT'}`,
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

        const subCommand = args[0].toLowerCase();

        // Handle: .antisticker on
        if (subCommand === 'on') {
            updateAntiStickerSettings(chatId, { status: 'on' }, groupName);
            await client.sendMessage(chatId, {
                text: `✅ *Anti-Sticker Enabled*\n\n` +
                      `Action: ${settings.action}\n` +
                      `Warn Limit: ${settings.warn_limit}\n\n` +
                      `Stickers will be ${settings.action === 'remove' ? 'removed' : settings.action === 'delete' ? 'deleted' : 'warned'}.`,
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
        
        // Handle: .antisticker off
        else if (subCommand === 'off') {
            updateAntiStickerSettings(chatId, { status: 'off' }, groupName);
            clearAllStickerWarns(chatId);
            await client.sendMessage(chatId, {
                text: `❌ *Anti-Sticker Disabled*`,
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
        
        // Handle: .antisticker action [delete/remove/warn]
        else if (subCommand === 'action') {
            const action = args[1]?.toLowerCase();
            
            if (!action || !['delete', 'remove', 'warn'].includes(action)) {
                await client.sendMessage(chatId, {
                    text: `❌ Please specify a valid action: delete, remove, or warn\n\nExample: .antisticker action delete`,
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

            updateAntiStickerSettings(chatId, { action: action }, groupName);
            clearAllStickerWarns(chatId); // Reset warns when action changes
            
            await client.sendMessage(chatId, {
                text: `✅ *Action Updated*\n\nNew action: ${action}\n\nStickers will be ${action === 'remove' ? 'removed' : action === 'delete' ? 'deleted' : 'warned'}.`,
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
        
        // Handle: .antisticker limit [number]
        else if (subCommand === 'limit') {
            const limit = parseInt(args[1]);
            
            if (isNaN(limit) || limit < 1 || limit > 10) {
                await client.sendMessage(chatId, {
                    text: `❌ Please provide a valid limit (1-10).\n\nExample: .antisticker limit 3`,
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

            updateAntiStickerSettings(chatId, { warn_limit: limit }, groupName);
            clearAllStickerWarns(chatId); // Reset warns when limit changes
            
            await client.sendMessage(chatId, {
                text: `✅ *Warn Limit Updated*\n\nNew limit: ${limit} warnings before action`,
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
        
        // Handle: .antisticker list
        else if (subCommand === 'list') {
            const activeGroups = getAllActiveStickerGroups();
            
            if (activeGroups.length === 0) {
                await client.sendMessage(chatId, {
                    text: `📋 *No groups have anti-sticker enabled*`,
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

            let listText = `📋 *ACTIVE ANTI-STICKER GROUPS*\n\n`;
            activeGroups.forEach((group, index) => {
                listText += `${index + 1}. *${group.groupName}*\n`;
                listText += `   📍 Action: ${group.action}\n`;
                listText += `   ⚠️ Limit: ${group.warn_limit}\n\n`;
            });
            listText += `> ${Config.caption || 'MAD-MAX BOT'}`;

            await client.sendMessage(chatId, {
                text: listText,
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
        
        // Handle: .antisticker resetwarns
        else if (subCommand === 'resetwarns') {
            clearAllStickerWarns(chatId);
            await client.sendMessage(chatId, {
                text: `✅ *All sticker warnings have been reset for this group*`,
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
        
        else {
            await client.sendMessage(chatId, {
                text: `❌ Unknown command. Use .antisticker for help.`,
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

    } catch (error) {
        console.error('Anti-sticker error:', error);
        await client.sendMessage(chatId, {
            text: `❌ Error: ${error.message}`,
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

// Handler for detecting and acting on sticker messages
async function handleStickerMessage(client, message, groupJid, sender, pushName) {
    try {
        const settings = getAntiStickerSettings(groupJid);
        
        // Check if feature is enabled
        if (settings.status !== 'on') return false;

        // Get user's current warn count
        const warnCount = getStickerWarnCount(groupJid, sender);
        
        // Take action based on settings
        if (settings.action === 'delete') {
            // Delete the sticker message
            await client.sendMessage(groupJid, { delete: message.key });
            
            // Send notification
            await client.sendMessage(groupJid, {
                text: `🗑️ @${sender.split('@')[0]}, stickers are not allowed in this group!`,
                mentions: [sender]
            });
            
            return true;
            
        } else if (settings.action === 'warn') {
            // Increment warn count
            const newCount = incrementStickerWarnCount(groupJid, sender);
            
            // Delete the sticker
            await client.sendMessage(groupJid, { delete: message.key });
            
            // Send warning
            await client.sendMessage(groupJid, {
                text: `⚠️ *WARNING (${newCount}/${settings.warn_limit})*\n\n@${sender.split('@')[0]}, stickers are not allowed in this group!\n\n${newCount >= settings.warn_limit ? '🚫 You will be removed on next offense!' : ''}`,
                mentions: [sender]
            });
            
            // If reached limit, remove
            if (newCount >= settings.warn_limit) {
                await client.groupParticipantsUpdate(groupJid, [sender], 'remove');
                resetStickerWarnCount(groupJid, sender);
                await client.sendMessage(groupJid, {
                    text: `👢 @${sender.split('@')[0]} has been removed for repeatedly sending stickers.`,
                    mentions: [sender]
                });
            }
            
            return true;
            
        } else if (settings.action === 'remove') {
            // Delete the sticker first
            await client.sendMessage(groupJid, { delete: message.key });
            
            // Remove immediately
            await client.groupParticipantsUpdate(groupJid, [sender], 'remove');
            await client.sendMessage(groupJid, {
                text: `👢 @${sender.split('@')[0]} has been removed for sending stickers.`,
                mentions: [sender]
            });
            return true;
        }
        
        return false;
        
    } catch (error) {
        console.error('Error handling sticker message:', error);
        return false;
    }
}

module.exports = {
    antistickerCommand,
    handleStickerMessage,
    getAntiStickerSettings,
    updateAntiStickerSettings,
    getAllActiveStickerGroups,
    getStickerWarnCount,
    resetStickerWarnCount,
    clearAllStickerWarns,
    isStickerMessage
};