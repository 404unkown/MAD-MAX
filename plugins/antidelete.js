const fs = require('fs');
const path = require('path');

// Store deleted messages in memory
const deletedMessages = new Map();

// Anti-delete state file
const ANTIDELETE_PATH = path.join(__dirname, '../data/antidelete.json');

// Ensure data directory exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize file if it doesn't exist
if (!fs.existsSync(ANTIDELETE_PATH)) {
    fs.writeFileSync(ANTIDELETE_PATH, JSON.stringify({ enabled: false }, null, 2));
}

// Get anti-delete status
async function getAnti() {
    try {
        const data = JSON.parse(fs.readFileSync(ANTIDELETE_PATH, 'utf8'));
        return data.enabled || false;
    } catch {
        return false;
    }
}

// Set anti-delete status
async function setAnti(enabled) {
    try {
        fs.writeFileSync(ANTIDELETE_PATH, JSON.stringify({ enabled: !!enabled }, null, 2));
        return true;
    } catch {
        return false;
    }
}

// Store messages for anti-delete
async function storeMessage(client, message) {
    try {
        const isEnabled = await getAnti();
        if (!isEnabled) return;
        
        // Get the actual message content
        const msg = message.message;
        if (!msg) return;
        
        // Store by message ID
        const key = message.key.id;
        
        // Get sender info
        const sender = message.key.participant || message.key.remoteJid;
        const pushName = message.pushName || 'Unknown';
        
        deletedMessages.set(key, {
            message: message,
            sender: sender,
            pushName: pushName,
            content: msg,
            timestamp: Date.now()
        });
        
        // Clean old messages (older than 5 minutes)
        setTimeout(() => {
            if (deletedMessages.has(key)) {
                deletedMessages.delete(key);
            }
        }, 5 * 60 * 1000);
    } catch (error) {
        console.error('Error storing message:', error);
    }
}

// Get stored message
function getStoredMessage(messageId) {
    return deletedMessages.get(messageId);
}

// Handle message deletion
async function handleMessageRevocation(client, message) {
    try {
        const isEnabled = await getAnti();
        if (!isEnabled) return;
        
        const protocolMsg = message.message?.protocolMessage;
        if (!protocolMsg) return;
        
        const chatId = message.key.remoteJid;
        const deletedMsgId = protocolMsg.key?.id;
        
        if (!deletedMsgId) return;
        
        // Get the stored message
        const stored = getStoredMessage(deletedMsgId);
        if (!stored) return;
        
        const sender = stored.sender;
        const senderName = stored.pushName;
        
        // Get message content
        let messageContent = '';
        let messageType = 'text';
        
        if (stored.content?.conversation) {
            messageContent = stored.content.conversation;
        } else if (stored.content?.extendedTextMessage?.text) {
            messageContent = stored.content.extendedTextMessage.text;
        } else if (stored.content?.imageMessage?.caption) {
            messageContent = stored.content.imageMessage.caption || '[No caption]';
            messageType = 'image';
        } else if (stored.content?.videoMessage?.caption) {
            messageContent = stored.content.videoMessage.caption || '[No caption]';
            messageType = 'video';
        } else if (stored.content?.audioMessage) {
            messageContent = '[Audio Message]';
            messageType = 'audio';
        } else if (stored.content?.stickerMessage) {
            messageContent = '[Sticker]';
            messageType = 'sticker';
        } else if (stored.content?.documentMessage) {
            messageContent = `[Document: ${stored.content.documentMessage?.fileName || 'Unknown'}]`;
            messageType = 'document';
        } else {
            messageContent = '[Unknown Message Type]';
        }
        
        // Prepare caption
        let caption = `🚫 *MESSAGE DELETED DETECTED*\n\n`;
        caption += `👤 *Sender:* @${sender.split('@')[0]}\n`;
        caption += `📝 *Name:* ${senderName}\n`;
        caption += `📱 *Type:* ${messageType}\n`;
        caption += `⏰ *Time:* ${new Date(stored.timestamp).toLocaleTimeString()}\n`;
        caption += `📄 *Content:*\n${messageContent}\n\n`;
        caption += `_Message was deleted by sender_`;
        
        // Send notification
        await client.sendMessage(chatId, {
            text: caption,
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
        });
        
        // Clean up stored message
        deletedMessages.delete(deletedMsgId);
        
    } catch (error) {
        console.error('Error handling message revocation:', error);
    }
}

async function antideleteCommand(client, chatId, message, args, sender, pushName, isOwner) {
    try {
        // Check if user is owner using the isOwner parameter from main.js
        if (!isOwner) {
            await client.sendMessage(chatId, {
                text: '❌ This command is only for the bot owner!',
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
        
        const currentStatus = await getAnti();
        // args is an array from main.js, so get first element
        const action = args[0]?.toLowerCase();
        
        if (!action || action === 'status') {
            await client.sendMessage(chatId, {
                text: `🛡️ *ANTI-DELETE STATUS*\n\n` +
                      `Current Status: ${currentStatus ? '✅ ENABLED' : '❌ DISABLED'}\n\n` +
                      `*Commands:*\n` +
                      `• .antidelete on - Enable anti-delete\n` +
                      `• .antidelete off - Disable anti-delete\n` +
                      `• .antidelete status - Show current status`,
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
        
        if (action === 'on') {
            const success = await setAnti(true);
            if (success) {
                await client.sendMessage(chatId, {
                    text: '✅ *Anti-Delete ENABLED*\n\nBot will now detect and show deleted messages.',
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
                    text: '❌ Failed to enable anti-delete. Please try again.',
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
        else if (action === 'off') {
            const success = await setAnti(false);
            if (success) {
                await client.sendMessage(chatId, {
                    text: '❌ *Anti-Delete DISABLED*\n\nBot will no longer detect deleted messages.',
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
                    text: '❌ Failed to disable anti-delete. Please try again.',
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
        else {
            await client.sendMessage(chatId, {
                text: `❌ *Invalid Command*\n\n` +
                      `Available options:\n` +
                      `• \`on\` - Enable anti-delete\n` +
                      `• \`off\` - Disable anti-delete\n` +
                      `• \`status\` - Check current status`,
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
    } catch (e) {
        console.error("Error in antidelete command:", e);
        await client.sendMessage(chatId, {
            text: "❌ An error occurred while processing your request.",
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

module.exports = {
    antideleteCommand,
    storeMessage,
    handleMessageRevocation
};