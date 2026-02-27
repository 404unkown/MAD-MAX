const Config = require('../set');
const fs = require('fs');
const path = require('path');

// File to store anti-status-mention settings
const antistatusFile = path.join(__dirname, '..', 'data', 'antistatusmention.json');

// Store warn counts in memory per user per group
const statusWarnCounts = new Map(); // Key: `${groupJid}:${userJid}`

// Default settings
const defaultSettings = {
    status: 'off',
    action: 'warn', // warn, delete, remove
    warn_limit: 3
};

// Ensure data directory exists
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Read all settings from file
function readAllAntiStatusSettings() {
    try {
        if (!fs.existsSync(antistatusFile)) {
            fs.writeFileSync(antistatusFile, JSON.stringify({}, null, 2));
            return {};
        }
        const data = fs.readFileSync(antistatusFile, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading anti-status-mention settings:', error);
        return {};
    }
}

// Write all settings to file
function writeAllAntiStatusSettings(settings) {
    try {
        fs.writeFileSync(antistatusFile, JSON.stringify(settings, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing anti-status-mention settings:', error);
        return false;
    }
}

// Get settings for a specific group
function getAntiStatusSettings(groupJid) {
    try {
        const allSettings = readAllAntiStatusSettings();
        if (!allSettings[groupJid]) {
            allSettings[groupJid] = { ...defaultSettings, groupName: '' };
            writeAllAntiStatusSettings(allSettings);
        }
        return allSettings[groupJid];
    } catch (error) {
        console.error('Error getting anti-status-mention settings:', error);
        return { ...defaultSettings };
    }
}

// Update settings for a group
function updateAntiStatusSettings(groupJid, updates, groupName = '') {
    try {
        const allSettings = readAllAntiStatusSettings();
        if (!allSettings[groupJid]) {
            allSettings[groupJid] = { ...defaultSettings, groupName: groupName };
        }
        
        // Update fields
        if (updates.status !== undefined) allSettings[groupJid].status = updates.status;
        if (updates.action !== undefined) allSettings[groupJid].action = updates.action;
        if (updates.warn_limit !== undefined) allSettings[groupJid].warn_limit = updates.warn_limit;
        if (groupName) allSettings[groupJid].groupName = groupName;
        
        writeAllAntiStatusSettings(allSettings);
        return allSettings[groupJid];
    } catch (error) {
        console.error('Error updating anti-status-mention settings:', error);
        return null;
    }
}

// Get all groups with anti-status-mention enabled
function getAllActiveGroups() {
    try {
        const allSettings = readAllAntiStatusSettings();
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
function getStatusWarnCount(groupJid, userJid) {
    const key = `${groupJid}:${userJid}`;
    return statusWarnCounts.get(key) || 0;
}

function incrementStatusWarnCount(groupJid, userJid) {
    const key = `${groupJid}:${userJid}`;
    const current = getStatusWarnCount(groupJid, userJid);
    statusWarnCounts.set(key, current + 1);
    return current + 1;
}

function resetStatusWarnCount(groupJid, userJid) {
    const key = `${groupJid}:${userJid}`;
    statusWarnCounts.delete(key);
}

function clearAllStatusWarns(groupJid) {
    for (const key of statusWarnCounts.keys()) {
        if (key.startsWith(`${groupJid}:`)) {
            statusWarnCounts.delete(key);
        }
    }
}

// Main anti-status-mention command
async function antistatusmentionCommand(client, chatId, message, args, sender, pushName, isOwnerSimple) {
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

        const settings = getAntiStatusSettings(chatId);

        // If no arguments, show current settings
        if (!args || args.length === 0) {
            const statusEmoji = settings.status === 'on' ? '✅' : '❌';
            const statusText = settings.status === 'on' ? 'Enabled' : 'Disabled';
            
            const actionEmoji = {
                'warn': '⚠️',
                'delete': '🗑️',
                'remove': '👢'
            }[settings.action] || '⚠️';
            
            await client.sendMessage(chatId, {
                text: `🛡️ *ANTI-STATUS-MENTION SETTINGS*\n\n` +
                      `📊 *Status:* ${statusEmoji} ${statusText}\n` +
                      `${actionEmoji} *Action:* ${settings.action}\n` +
                      `⚠️ *Warn Limit:* ${settings.warn_limit}\n\n` +
                      `*Commands:*\n` +
                      `▸ .antistatus on - Enable\n` +
                      `▸ .antistatus off - Disable\n` +
                      `▸ .antistatus action [warn/delete/remove] - Set action\n` +
                      `▸ .antistatus limit [number] - Set warn limit\n` +
                      `▸ .antistatus list - List active groups\n\n` +
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

        // Handle: .antistatus on
        if (subCommand === 'on') {
            updateAntiStatusSettings(chatId, { status: 'on' }, groupName);
            await client.sendMessage(chatId, {
                text: `✅ *Anti-Status-Mention Enabled*\n\n` +
                      `Action: ${settings.action}\n` +
                      `Warn Limit: ${settings.warn_limit}\n\n` +
                      `Users who mention bot's status will be ${settings.action === 'remove' ? 'removed' : settings.action === 'delete' ? 'message deleted' : 'warned'}.`,
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
        
        // Handle: .antistatus off
        else if (subCommand === 'off') {
            updateAntiStatusSettings(chatId, { status: 'off' }, groupName);
            clearAllStatusWarns(chatId);
            await client.sendMessage(chatId, {
                text: `❌ *Anti-Status-Mention Disabled*`,
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
        
        // Handle: .antistatus action [warn/delete/remove]
        else if (subCommand === 'action') {
            const action = args[1]?.toLowerCase();
            
            if (!action || !['warn', 'delete', 'remove'].includes(action)) {
                await client.sendMessage(chatId, {
                    text: `❌ Please specify a valid action: warn, delete, or remove\n\nExample: .antistatus action warn`,
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

            updateAntiStatusSettings(chatId, { action: action }, groupName);
            clearAllStatusWarns(chatId); // Reset warns when action changes
            
            await client.sendMessage(chatId, {
                text: `✅ *Action Updated*\n\nNew action: ${action}\n\nUsers will be ${action === 'remove' ? 'removed' : action === 'delete' ? 'messages deleted' : 'warned'} when mentioning bot's status.`,
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
        
        // Handle: .antistatus limit [number]
        else if (subCommand === 'limit') {
            const limit = parseInt(args[1]);
            
            if (isNaN(limit) || limit < 1 || limit > 10) {
                await client.sendMessage(chatId, {
                    text: `❌ Please provide a valid limit (1-10).\n\nExample: .antistatus limit 3`,
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

            updateAntiStatusSettings(chatId, { warn_limit: limit }, groupName);
            clearAllStatusWarns(chatId); // Reset warns when limit changes
            
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
        
        // Handle: .antistatus list
        else if (subCommand === 'list') {
            const activeGroups = getAllActiveGroups();
            
            if (activeGroups.length === 0) {
                await client.sendMessage(chatId, {
                    text: `📋 *No groups have anti-status-mention enabled*`,
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

            let listText = `📋 *ACTIVE ANTI-STATUS GROUPS*\n\n`;
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
        
        // Handle: .antistatus resetwarns
        else if (subCommand === 'resetwarns') {
            clearAllStatusWarns(chatId);
            await client.sendMessage(chatId, {
                text: `✅ *All warnings have been reset for this group*`,
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
                text: `❌ Unknown command. Use .antistatus for help.`,
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
        console.error('Anti-status-mention error:', error);
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

// Handler for detecting status mentions
async function handleStatusMention(client, message, groupJid, sender) {
    try {
        const settings = getAntiStatusSettings(groupJid);
        
        // Check if feature is enabled
        if (settings.status !== 'on') return false;

        // Get user's current warn count
        const warnCount = getStatusWarnCount(groupJid, sender);
        
        // Take action based on settings
        if (settings.action === 'warn') {
            // Increment warn count
            const newCount = incrementStatusWarnCount(groupJid, sender);
            
            // Send warning
            await client.sendMessage(groupJid, {
                text: `⚠️ *WARNING (${newCount}/${settings.warn_limit})*\n\n@${sender.split('@')[0]}, please don't mention the bot's status!\n\n${newCount >= settings.warn_limit ? '🚫 You will be removed on next offense!' : ''}`,
                mentions: [sender]
            });
            
            // If reached limit, remove
            if (newCount >= settings.warn_limit) {
                await client.groupParticipantsUpdate(groupJid, [sender], 'remove');
                resetStatusWarnCount(groupJid, sender);
                await client.sendMessage(groupJid, {
                    text: `👢 @${sender.split('@')[0]} has been removed for repeatedly mentioning bot's status.`,
                    mentions: [sender]
                });
            }
            
            return true;
            
        } else if (settings.action === 'delete') {
            // Delete the message (will be handled by the caller)
            return true;
            
        } else if (settings.action === 'remove') {
            // Remove immediately
            await client.groupParticipantsUpdate(groupJid, [sender], 'remove');
            await client.sendMessage(groupJid, {
                text: `👢 @${sender.split('@')[0]} has been removed for mentioning bot's status.`,
                mentions: [sender]
            });
            return true;
        }
        
        return false;
        
    } catch (error) {
        console.error('Error handling status mention:', error);
        return false;
    }
}

module.exports = {
    antistatusmentionCommand,
    handleStatusMention,
    getAntiStatusSettings,
    updateAntiStatusSettings,
    getAllActiveGroups,
    getStatusWarnCount,
    resetStatusWarnCount,
    clearAllStatusWarns
};