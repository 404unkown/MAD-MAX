const fs = require('fs');
const path = require('path');

const dataDir = path.join(process.cwd(), 'data');
const settingsFile = path.join(dataDir, 'antistatusmention.json');
const warningsFile = path.join(dataDir, 'statusmention_warnings.json');

// Initialize settings
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

if (!fs.existsSync(settingsFile)) {
    fs.writeFileSync(settingsFile, JSON.stringify({}, null, 2));
}

if (!fs.existsSync(warningsFile)) {
    fs.writeFileSync(warningsFile, JSON.stringify({}, null, 2));
}

// Read settings
function readSettings() {
    try {
        return JSON.parse(fs.readFileSync(settingsFile, 'utf8'));
    } catch {
        return {};
    }
}

// Write settings
function writeSettings(settings) {
    fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2));
}

// Read warnings
function readWarnings() {
    try {
        return JSON.parse(fs.readFileSync(warningsFile, 'utf8'));
    } catch {
        return {};
    }
}

// Write warnings
function writeWarnings(warnings) {
    fs.writeFileSync(warningsFile, JSON.stringify(warnings, null, 2));
}

// Main command
async function antistatusmentionCommand(client, chatId, m, args, sender, pushName, isOwner) {
    try {
        if (!args[0]) {
            const settings = readSettings();
            const groupSettings = settings[chatId] || { 
                enabled: false, 
                action: 'warn', 
                kickAt: 3,
                message: "❌ Don't mention our group in your status!" 
            };
            
            let actionText = '';
            if (groupSettings.action === 'delete') actionText = 'Delete status';
            else if (groupSettings.action === 'warn') actionText = `Warn (${groupSettings.kickAt} warnings = kick)`;
            else if (groupSettings.action === 'kick') actionText = 'Kick immediately';
            
            return await client.sendMessage(chatId, {
                text: `👀 *ANTI-STATUS MENTION SETTINGS*\n\n` +
                      `Status: ${groupSettings.enabled ? '✅ ENABLED' : '❌ DISABLED'}\n` +
                      `Action: ${actionText}\n` +
                      `Message: ${groupSettings.message}\n\n` +
                      `*Commands:*\n` +
                      `▸ .antistatus on - Enable\n` +
                      `▸ .antistatus off - Disable\n` +
                      `▸ .antistatus delete - Delete their status\n` +
                      `▸ .antistatus warn - Warn system\n` +
                      `▸ .antistatus kick - Kick immediately\n` +
                      `▸ .antistatus setkick <number> - Set warn limit\n` +
                      `▸ .antistatus setmessage <text> - Set custom message\n` +
                      `▸ .antistatus reset - Reset all warnings`
            }, { quoted: m });
        }

        const settings = readSettings();
        if (!settings[chatId]) {
            settings[chatId] = { 
                enabled: false, 
                action: 'warn', 
                kickAt: 3,
                message: "❌ Don't mention our group in your status!" 
            };
        }

        switch (args[0].toLowerCase()) {
            case 'on':
            case 'enable':
                settings[chatId].enabled = true;
                writeSettings(settings);
                await client.sendMessage(chatId, { 
                    text: '✅ *Anti-Status Mention ENABLED*' 
                }, { quoted: m });
                break;

            case 'off':
            case 'disable':
                settings[chatId].enabled = false;
                writeSettings(settings);
                await client.sendMessage(chatId, { 
                    text: '❌ *Anti-Status Mention DISABLED*' 
                }, { quoted: m });
                break;

            case 'delete':
                settings[chatId].action = 'delete';
                writeSettings(settings);
                await client.sendMessage(chatId, { 
                    text: '✅ *Mode set to DELETE*\n\nTheir status will be deleted.' 
                }, { quoted: m });
                break;

            case 'warn':
                settings[chatId].action = 'warn';
                writeSettings(settings);
                await client.sendMessage(chatId, { 
                    text: `✅ *Mode set to WARN*\n\nUsers will be kicked after ${settings[chatId].kickAt} warnings.` 
                }, { quoted: m });
                break;

            case 'kick':
                settings[chatId].action = 'kick';
                writeSettings(settings);
                await client.sendMessage(chatId, { 
                    text: '✅ *Mode set to KICK*\n\nUsers will be kicked immediately.' 
                }, { quoted: m });
                break;

            case 'setkick':
                const num = parseInt(args[1]);
                if (isNaN(num) || num < 1 || num > 10) {
                    return await client.sendMessage(chatId, { 
                        text: '❌ Please provide a number between 1 and 10.' 
                    }, { quoted: m });
                }
                settings[chatId].kickAt = num;
                writeSettings(settings);
                await client.sendMessage(chatId, { 
                    text: `✅ *Warning limit set to ${num}*` 
                }, { quoted: m });
                break;

            case 'setmessage':
                const newMessage = args.slice(1).join(' ');
                if (!newMessage) {
                    return await client.sendMessage(chatId, { 
                        text: '❌ Please provide a message.' 
                    }, { quoted: m });
                }
                settings[chatId].message = newMessage;
                writeSettings(settings);
                await client.sendMessage(chatId, { 
                    text: `✅ *Message updated*` 
                }, { quoted: m });
                break;

            case 'reset':
                const warnings = readWarnings();
                if (warnings[chatId]) {
                    delete warnings[chatId];
                    writeWarnings(warnings);
                }
                await client.sendMessage(chatId, { 
                    text: '✅ *All warnings reset*' 
                }, { quoted: m });
                break;

            default:
                await client.sendMessage(chatId, { 
                    text: '❌ Unknown command. Use .antistatus for help.' 
                }, { quoted: m });
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

// Handle status mentions
async function handleStatusMention(client, statusUpdate) {
    try {
        if (!statusUpdate.message?.extendedTextMessage?.contextInfo?.mentionedJid) return;
        
        const mentionedJids = statusUpdate.message.extendedTextMessage.contextInfo.mentionedJid;
        if (!mentionedJids || mentionedJids.length === 0) return;

        const publisherJid = statusUpdate.key.participant || statusUpdate.key.remoteJid;
        if (!publisherJid) return;

        for (const mentionedJid of mentionedJids) {
            if (mentionedJid.endsWith('@g.us')) {
                const settings = readSettings();
                const groupSettings = settings[mentionedJid];
                
                if (groupSettings && groupSettings.enabled) {
                    const groupName = await getGroupName(client, mentionedJid);
                    
                    // DELETE MODE
                    if (groupSettings.action === 'delete') {
                        try {
                            await client.sendMessage(publisherJid, {
                                text: `❌ Your status mentioning *${groupName}* has been deleted.\n\nDon't mention our group in your status!`
                            });
                            
                            await client.sendMessage(mentionedJid, {
                                text: `👀 @${publisherJid.split('@')[0]} mentioned this group in their status.\n\n✅ Their status was deleted.`,
                                mentions: [publisherJid]
                            });
                            
                            console.log(`✅ Deleted status from ${publisherJid}`);
                        } catch (e) {
                            console.error('Delete failed:', e);
                        }
                    }
                    
                    // KICK MODE
                    else if (groupSettings.action === 'kick') {
                        try {
                            await client.groupParticipantsUpdate(mentionedJid, [publisherJid], 'remove');
                            
                            await client.sendMessage(publisherJid, {
                                text: `❌ You were kicked from *${groupName}* for mentioning them in your status.`
                            });
                            
                            console.log(`✅ Kicked ${publisherJid} from ${mentionedJid}`);
                        } catch (e) {
                            console.error('Kick failed:', e);
                        }
                    }
                    
                    // WARN MODE
                    else if (groupSettings.action === 'warn') {
                        const warnings = readWarnings();
                        
                        if (!warnings[mentionedJid]) warnings[mentionedJid] = {};
                        if (!warnings[mentionedJid][publisherJid]) warnings[mentionedJid][publisherJid] = 0;
                        
                        warnings[mentionedJid][publisherJid]++;
                        const currentWarnings = warnings[mentionedJid][publisherJid];
                        const kickAt = groupSettings.kickAt || 3;
                        
                        writeWarnings(warnings);

                        // Send warning
                        await client.sendMessage(publisherJid, {
                            text: `⚠️ *WARNING ${currentWarnings}/${kickAt}*\n\nYou mentioned *${groupName}* in your status.\n\n${groupSettings.message}\n\n${currentWarnings >= kickAt ? '❌ You will be kicked!' : 'Please remove the mention.'}`
                        });

                        // Notify group
                        await client.sendMessage(mentionedJid, {
                            text: `👀 @${publisherJid.split('@')[0]} mentioned this group in their status.\n\n⚠️ Warning: ${currentWarnings}/${kickAt}`,
                            mentions: [publisherJid]
                        });

                        // Kick if reached limit
                        if (currentWarnings >= kickAt) {
                            try {
                                await client.groupParticipantsUpdate(mentionedJid, [publisherJid], 'remove');
                                
                                delete warnings[mentionedJid][publisherJid];
                                writeWarnings(warnings);
                                
                                await client.sendMessage(mentionedJid, {
                                    text: `👢 @${publisherJid.split('@')[0]} was kicked for reaching ${kickAt} warnings.`,
                                    mentions: [publisherJid]
                                });
                            } catch (kickError) {
                                console.error('Kick failed:', kickError);
                            }
                        }
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error handling status mention:', error);
    }
}

// Helper to get group name
async function getGroupName(client, groupJid) {
    try {
        const metadata = await client.groupMetadata(groupJid);
        return metadata.subject || "the group";
    } catch {
        return "the group";
    }
}

module.exports = {
    antistatusmentionCommand,
    handleStatusMention
};