const fs = require('fs');
const path = require('path');
const isAdmin = require('../lib/isAdmin');
const isOwner = require('../lib/isOwner');
const { isSudo, incrementWarningCount, resetWarningCount } = require('../lib/index');
const config = require('../set');

// Path to store antisticker settings
const ANTISTICKER_PATH = path.join(__dirname, '../data/antisticker.json');
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
if (!fs.existsSync(ANTISTICKER_PATH)) {
    fs.writeFileSync(ANTISTICKER_PATH, JSON.stringify({}, null, 2));
}

// Get antisticker setting for a group
async function getAntisticker(groupId) {
    try {
        const data = JSON.parse(fs.readFileSync(ANTISTICKER_PATH, 'utf8'));
        return data[groupId] || null;
    } catch {
        return null;
    }
}

// Set antisticker for a group
async function setAntisticker(groupId, enabled, action = 'delete', kickAt = 3) {
    try {
        const data = JSON.parse(fs.readFileSync(ANTISTICKER_PATH, 'utf8'));
        data[groupId] = { 
            enabled: !!enabled, 
            action: action,
            kickAt: kickAt
        };
        fs.writeFileSync(ANTISTICKER_PATH, JSON.stringify(data, null, 2));
        return true;
    } catch {
        return false;
    }
}

// Remove antisticker for a group
async function removeAntisticker(groupId) {
    try {
        const data = JSON.parse(fs.readFileSync(ANTISTICKER_PATH, 'utf8'));
        delete data[groupId];
        fs.writeFileSync(ANTISTICKER_PATH, JSON.stringify(data, null, 2));
        return true;
    } catch {
        return false;
    }
}

// Check if message is a sticker
function isStickerMessage(message) {
    // Check if it's a direct sticker message
    if (message.mtype === 'stickerMessage') return true;
    if (message.message?.stickerMessage) return true;
    
    // Check if it's a quoted sticker
    if (message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.stickerMessage) return true;
    
    return false;
}

// Main command handler
async function antistickerCommand(client, chatId, message, args, sender, pushName, isOwner) {
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
            const settings = await getAntisticker(chatId);
            const status = settings?.enabled ? '✅ ON' : '❌ OFF';
            const actionText = settings?.action === 'delete' ? 'Delete' : 
                              settings?.action === 'kick' ? 'Kick immediately' : 
                              `Warn (${settings?.kickAt || 3} warnings)`;
            
            const usage = `╭─❖ *ANTISTICKER COMMANDS* ❖─
│
├─ *Status:* ${status}
├─ *Action:* ${actionText}
│
├─ *Options:*
│  ├─ .antisticker on
│  ├─ .antisticker off
│  ├─ .antisticker delete
│  ├─ .antisticker kick
│  ├─ .antisticker warn
│  ├─ .antisticker setkick <number>
│  └─ .antisticker status
│
├─ *Examples:*
│  ├─ .antisticker on
│  └─ .antisticker setkick 5
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
                const existingConfig = await getAntisticker(chatId);
                if (existingConfig?.enabled) {
                    await client.sendMessage(chatId, { 
                        text: '⚠️ *Antisticker is already enabled*',
                        ...channelInfo
                    }, { quoted: message });
                    await client.sendMessage(chatId, { 
                        react: { text: '⚠️', key: message.key } 
                    });
                    return;
                }
                const result = await setAntisticker(chatId, true, 'delete', 3);
                await client.sendMessage(chatId, { 
                    text: result ? '✅ *Antisticker has been ENABLED*\n\nAction: Delete' : '🚫 *Failed to enable Antisticker*',
                    ...channelInfo
                }, { quoted: message });
                await client.sendMessage(chatId, { 
                    react: { text: result ? '✅' : '🚫', key: message.key } 
                });
                break;

            case 'off':
            case 'disable':
                await removeAntisticker(chatId);
                await client.sendMessage(chatId, { 
                    text: '🚫 *Antisticker has been DISABLED*',
                    ...channelInfo
                }, { quoted: message });
                await client.sendMessage(chatId, { 
                    react: { text: '✅', key: message.key } 
                });
                break;

            case 'delete':
                const currentConfig = await getAntisticker(chatId);
                if (!currentConfig?.enabled) {
                    await client.sendMessage(chatId, { 
                        text: '⚠️ *Please enable antisticker first using: .antisticker on*',
                        ...channelInfo
                    }, { quoted: message });
                    await client.sendMessage(chatId, { 
                        react: { text: '⚠️', key: message.key } 
                    });
                    return;
                }
                await setAntisticker(chatId, true, 'delete', currentConfig.kickAt || 3);
                await client.sendMessage(chatId, { 
                    text: '✅ *Antisticker action set to DELETE*\n\nStickers will be deleted without warnings.',
                    ...channelInfo
                }, { quoted: message });
                await client.sendMessage(chatId, { 
                    react: { text: '✅', key: message.key } 
                });
                break;

            case 'kick':
                const kickConfig = await getAntisticker(chatId);
                if (!kickConfig?.enabled) {
                    await client.sendMessage(chatId, { 
                        text: '⚠️ *Please enable antisticker first using: .antisticker on*',
                        ...channelInfo
                    }, { quoted: message });
                    await client.sendMessage(chatId, { 
                        react: { text: '⚠️', key: message.key } 
                    });
                    return;
                }
                await setAntisticker(chatId, true, 'kick', kickConfig.kickAt || 3);
                await client.sendMessage(chatId, { 
                    text: '✅ *Antisticker action set to KICK*\n\nUsers will be kicked immediately for sending stickers.',
                    ...channelInfo
                }, { quoted: message });
                await client.sendMessage(chatId, { 
                    react: { text: '✅', key: message.key } 
                });
                break;

            case 'warn':
                const warnConfig = await getAntisticker(chatId);
                if (!warnConfig?.enabled) {
                    await client.sendMessage(chatId, { 
                        text: '⚠️ *Please enable antisticker first using: .antisticker on*',
                        ...channelInfo
                    }, { quoted: message });
                    await client.sendMessage(chatId, { 
                        react: { text: '⚠️', key: message.key } 
                    });
                    return;
                }
                await setAntisticker(chatId, true, 'warn', warnConfig.kickAt || 3);
                await client.sendMessage(chatId, { 
                    text: `✅ *Antisticker action set to WARN*\n\nUsers will be kicked after ${warnConfig.kickAt || 3} warnings.`,
                    ...channelInfo
                }, { quoted: message });
                await client.sendMessage(chatId, { 
                    react: { text: '✅', key: message.key } 
                });
                break;

            case 'setkick':
                if (args.length < 2) {
                    await client.sendMessage(chatId, { 
                        text: '🚫 *Please specify a number (1-10)*\n\nExample: .antisticker setkick 5',
                        ...channelInfo
                    }, { quoted: message });
                    await client.sendMessage(chatId, { 
                        react: { text: '🚫', key: message.key } 
                    });
                    return;
                }
                
                const kickNum = parseInt(args[1]);
                if (isNaN(kickNum) || kickNum < 1 || kickNum > 10) {
                    await client.sendMessage(chatId, { 
                        text: '🚫 *Please provide a valid number between 1 and 10*',
                        ...channelInfo
                    }, { quoted: message });
                    await client.sendMessage(chatId, { 
                        react: { text: '🚫', key: message.key } 
                    });
                    return;
                }
                
                const setkickConfig = await getAntisticker(chatId);
                if (!setkickConfig?.enabled) {
                    await client.sendMessage(chatId, { 
                        text: '⚠️ *Please enable antisticker first using: .antisticker on*',
                        ...channelInfo
                    }, { quoted: message });
                    await client.sendMessage(chatId, { 
                        react: { text: '⚠️', key: message.key } 
                    });
                    return;
                }
                
                await setAntisticker(chatId, true, setkickConfig.action || 'warn', kickNum);
                await client.sendMessage(chatId, { 
                    text: `✅ *Warning limit set to ${kickNum}*\n\nUsers will be kicked after ${kickNum} warnings.`,
                    ...channelInfo
                }, { quoted: message });
                await client.sendMessage(chatId, { 
                    react: { text: '✅', key: message.key } 
                });
                break;

            case 'status':
            case 'get':
                const status = await getAntisticker(chatId);
                const statusText = status?.enabled ? '✅ ON' : '❌ OFF';
                let actionText = '';
                if (status?.action === 'delete') actionText = 'Delete';
                else if (status?.action === 'kick') actionText = 'Kick immediately';
                else if (status?.action === 'warn') actionText = `Warn (${status.kickAt || 3} warnings)`;
                else actionText = 'Not set';
                
                await client.sendMessage(chatId, { 
                    text: `📊 *ANTISTICKER CONFIGURATION*\n\nStatus: ${statusText}\nAction: ${actionText}`,
                    ...channelInfo
                }, { quoted: message });
                await client.sendMessage(chatId, { 
                    react: { text: '✅', key: message.key } 
                });
                break;

            default:
                await client.sendMessage(chatId, { 
                    text: '🚫 *Invalid option!*\n\nUse `.antisticker` to see available commands.',
                    ...channelInfo
                }, { quoted: message });
                await client.sendMessage(chatId, { 
                    react: { text: '🚫', key: message.key } 
                });
        }
    } catch (error) {
        console.error('Error in antisticker command:', error);
        await client.sendMessage(chatId, { 
            text: '🚫 *Error processing antisticker command*',
            ...channelInfo
        }, { quoted: message });
        await client.sendMessage(chatId, { 
            react: { text: '🚫', key: message.key } 
        });
    }
}

// Sticker detection handler
async function handleStickerMessage(client, chatId, message, senderId, pushName) {
    try {
        // Get antisticker config
        const antistickerConfig = await getAntisticker(chatId);
        if (!antistickerConfig?.enabled) return false;

        // Skip bot's own messages
        if (senderId === client.user.id) {
            return false;
        }

        // Skip if sender is bot owner
        const isUserOwner = await isOwner(senderId, client, chatId);
        if (isUserOwner) {
            return false;
        }

        // Skip if sender is group admin
        const { isSenderAdmin } = await isAdmin(client, chatId, senderId);
        if (isSenderAdmin) {
            return false;
        }

        // Skip if sender is sudo
        const senderIsSudo = await isSudo(senderId);
        if (senderIsSudo) {
            return false;
        }

        // Check if message is a sticker
        if (!isStickerMessage(message)) return false;

        console.log(`[ANTISTICKER] Detected sticker in ${chatId} from ${senderId}`);

        const action = antistickerConfig.action;
        const kickAt = antistickerConfig.kickAt || 3;

        try {
            // Delete sticker first
            await client.sendMessage(chatId, { delete: message.key });

            switch (action) {
                case 'delete':
                    await client.sendMessage(chatId, { 
                        text: `\`\`\`@${senderId.split('@')[0]} stickers are not allowed here\`\`\``,
                        mentions: [senderId],
                        ...channelInfo
                    });
                    break;

                case 'kick':
                    await client.groupParticipantsUpdate(chatId, [senderId], 'remove');
                    await client.sendMessage(chatId, {
                        text: `\`\`\`@${senderId.split('@')[0]} has been kicked for sending stickers\`\`\``,
                        mentions: [senderId],
                        ...channelInfo
                    });
                    break;

                case 'warn':
                    const warningCount = await incrementWarningCount(`sticker_${chatId}`, senderId);
                    if (warningCount >= kickAt) {
                        await client.groupParticipantsUpdate(chatId, [senderId], 'remove');
                        await resetWarningCount(`sticker_${chatId}`, senderId);
                        await client.sendMessage(chatId, {
                            text: `\`\`\`@${senderId.split('@')[0]} has been kicked after ${kickAt} sticker warnings\`\`\``,
                            mentions: [senderId],
                            ...channelInfo
                        });
                    } else {
                        await client.sendMessage(chatId, {
                            text: `\`\`\`@${senderId.split('@')[0]} warning ${warningCount}/${kickAt} for sending stickers\`\`\``,
                            mentions: [senderId],
                            ...channelInfo
                        });
                    }
                    break;
            }
            
            return true;
            
        } catch (error) {
            console.error('[ANTISTICKER] Error taking action:', error);
            return false;
        }
    } catch (error) {
        console.error('Error in sticker detection:', error);
        return false;
    }
}

// Check warnings for a user
async function checkStickerWarnings(client, chatId, message, args, sender, pushName, isOwner) {
    try {
        const target = args[0] ? args[0].replace('@', '') + '@s.whatsapp.net' : sender;
        const { getWarningCount } = require('../lib/index');
        const warningCount = await getWarningCount(`sticker_${chatId}`, target) || 0;
        const config = await getAntisticker(chatId);
        const kickAt = config?.kickAt || 3;
        
        await client.sendMessage(chatId, {
            text: `📊 *STICKER WARNINGS*\n\nUser: @${target.split('@')[0]}\nWarnings: ${warningCount}/${kickAt}`,
            mentions: [target],
            ...channelInfo
        }, { quoted: message });
    } catch (error) {
        console.error('Error checking warnings:', error);
    }
}

module.exports = {
    antistickerCommand,
    handleStickerMessage,
    isStickerMessage,
    checkStickerWarnings
};