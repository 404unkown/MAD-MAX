const fs = require('fs');
const path = require('path');
const isAdmin = require('../lib/isAdmin');

// Path to store antitag settings
const ANTITAG_PATH = path.join(__dirname, '../data/antitag.json');

// Ensure data directory exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize file if it doesn't exist
if (!fs.existsSync(ANTITAG_PATH)) {
    fs.writeFileSync(ANTITAG_PATH, JSON.stringify({}, null, 2));
}

// Get antitag setting for a group
async function getAntitag(groupId) {
    try {
        const data = JSON.parse(fs.readFileSync(ANTITAG_PATH, 'utf8'));
        return data[groupId] || null;
    } catch {
        return null;
    }
}

// Set antitag for a group
async function setAntitag(groupId, enabled) {
    try {
        const data = JSON.parse(fs.readFileSync(ANTITAG_PATH, 'utf8'));
        data[groupId] = { enabled: !!enabled };
        fs.writeFileSync(ANTITAG_PATH, JSON.stringify(data, null, 2));
        return true;
    } catch {
        return false;
    }
}

// Remove antitag for a group
async function removeAntitag(groupId) {
    try {
        const data = JSON.parse(fs.readFileSync(ANTITAG_PATH, 'utf8'));
        delete data[groupId];
        fs.writeFileSync(ANTITAG_PATH, JSON.stringify(data, null, 2));
        return true;
    } catch {
        return false;
    }
}

// Main command handler
async function handleAntitagCommand(client, chatId, message, args, sender, pushName, isOwner) {
    try {
        // Check if it's a group
        if (!chatId.endsWith('@g.us')) {
            await client.sendMessage(chatId, { 
                text: '🚫 This command can only be used in groups!',
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

        // Check if user is admin
        const adminStatus = await isAdmin(client, chatId, sender);
        const isSenderAdmin = adminStatus.isSenderAdmin;
        
        if (!isSenderAdmin && !isOwner) {
            await client.sendMessage(chatId, { 
                text: '🚫 This command is only for group admins!',
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

        const action = args[0]?.toLowerCase();

        if (!action) {
            const usage = `╭─❖ *ANTITAG COMMANDS* ❖─
│
├─ *Usage:* .antitag <option>
│
├─ *Options:*
│  ├─ .antitag on - Enable antitag
│  ├─ .antitag off - Disable antitag
│  └─ .antitag status - Check status
│
├─ *Feature:* Deletes messages that tag 3+ people
│
╰─➤ _Only group admins can use this_`;

            await client.sendMessage(chatId, { 
                text: usage,
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

        switch (action) {
            case 'on':
            case 'enable':
                const existingConfig = await getAntitag(chatId);
                if (existingConfig?.enabled) {
                    await client.sendMessage(chatId, { 
                        text: '⚠️ *Antitag is already enabled*',
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
                const result = await setAntitag(chatId, true);
                await client.sendMessage(chatId, { 
                    text: result ? '✅ *Antitag has been ENABLED*\n\nMessages with 3+ tags will be deleted.' : '🚫 *Failed to enable Antitag*',
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
                break;

            case 'off':
            case 'disable':
                await removeAntitag(chatId);
                await client.sendMessage(chatId, { 
                    text: '🚫 *Antitag has been DISABLED*',
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
                break;

            case 'status':
            case 'get':
                const status = await getAntitag(chatId);
                const statusText = status?.enabled ? '✅ ON' : '🚫 OFF';
                await client.sendMessage(chatId, { 
                    text: `📊 *ANTITAG STATUS*\n\nStatus: ${statusText}\nThreshold: 3 mentions`,
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
                break;

            default:
                await client.sendMessage(chatId, { 
                    text: '🚫 *Invalid option!*\n\nUse `.antitag` to see available commands.',
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
        console.error('Error in antitag command:', error);
        await client.sendMessage(chatId, { 
            text: '🚫 *Error processing antitag command*',
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

// Function to detect and handle mass tagging
async function handleTagDetection(client, chatId, message, senderId) {
    try {
        // Get antitag setting for this group
        const antitagSetting = await getAntitag(chatId);
        if (!antitagSetting?.enabled) return;

        // Get mentioned JIDs from the message
        const mentionedJids = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        
        // If 3 or more people are tagged, delete the message
        if (mentionedJids.length >= 3) {
            try {
                // Delete the message that tagged multiple people
                await client.sendMessage(chatId, {
                    delete: {
                        remoteJid: chatId,
                        fromMe: false,
                        id: message.key.id,
                        participant: senderId
                    }
                });

                // Send warning message
                await client.sendMessage(chatId, {
                    text: `⚠️ *ANTITAG ACTIVATED*\n\n@${senderId.split('@')[0]}, mass tagging (${mentionedJids.length} people) is not allowed in this group.`,
                    mentions: [senderId],
                    contextInfo: {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363401269012709@newsletter',
                            newsletterName: 'MAD-MAX',
                            serverMessageId: -1
                        }
                    }
                });

                console.log(`[ANTITAG] Deleted message with ${mentionedJids.length} mentions from ${senderId}`);
                
            } catch (error) {
                console.error('Failed to delete tagged message:', error);
            }
        }
    } catch (error) {
        console.error('Error in tag detection:', error);
    }
}

module.exports = {
    handleAntitagCommand,
    handleTagDetection
};