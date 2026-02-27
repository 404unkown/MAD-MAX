const fs = require('fs');
const path = require('path');

// Store deleted messages in memory
const deletedMessages = new Map();

// Anti-delete state file
const ANTIDELETE_PATH = path.join(__dirname, '../data/antidelete.json');

// Channel info for message formatting
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

// Handle incoming messages - store them for potential deletion recovery
function handleIncomingMessage(message) {
    try {
        if (!message || !message.key || !message.key.remoteJid || !message.key.id) {
            return;
        }
        
        const key = `${message.key.remoteJid}:${message.key.id}`;
        deletedMessages.set(key, {
            message: message,
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

// Handle message revocation (deleted messages)
async function handleMessageRevocation(client, revocationMessage) {
    try {
        const isEnabled = await getAnti();
        if (!isEnabled) return;
        
        const remoteJid = revocationMessage.key.remoteJid;
        const messageId = revocationMessage.message?.protocolMessage?.key?.id;
        
        if (!messageId) return;
        
        const key = `${remoteJid}:${messageId}`;
        const storedMessage = deletedMessages.get(key);
        
        if (!storedMessage) return;
        
        const originalMsg = storedMessage.message;
        const deletedBy = revocationMessage.participant || revocationMessage.key.participant || revocationMessage.key.remoteJid;
        const sentBy = originalMsg.key.participant || originalMsg.key.remoteJid;
        
        const deletedByFormatted = `@${deletedBy.split('@')[0]}`;
        const sentByFormatted = `@${sentBy.split('@')[0]}`;
        
        // Don't notify if it's the bot's own messages
        if (deletedBy.includes(client.user.id) || sentBy.includes(client.user.id)) return;
        
        let notificationText = `🚫 *message*\n\n` +
            `By: ${deletedByFormatted}\n\n`;
        
        try {
            // Text message
            if (originalMsg.message?.conversation) {
                const messageText = originalMsg.message.conversation;
                notificationText += `Deleted Message: ${messageText}`;
                await client.sendMessage(remoteJid, { 
                    text: notificationText,
                    mentions: [deletedBy, sentBy],
                    ...channelInfo
                });
                return;
            } 
            
            // Extended text message
            if (originalMsg.message?.extendedTextMessage) {
                const messageText = originalMsg.message.extendedTextMessage.text;
                notificationText += `Deleted Content: ${messageText}`;
                await client.sendMessage(remoteJid, { 
                    text: notificationText,
                    mentions: [deletedBy, sentBy],
                    ...channelInfo
                });
                return;
            }
            
            // Image message
            if (originalMsg.message?.imageMessage) {
                notificationText += `Deleted Media: [Image]`;
                
                // Get the image message
                const imageMsg = originalMsg.message.imageMessage;
                
                // Download using downloadContentFromMessage
                const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
                const stream = await downloadContentFromMessage(imageMsg, 'image');
                let buffer = Buffer.from([]);
                for await (const chunk of stream) {
                    buffer = Buffer.concat([buffer, chunk]);
                }
                
                await client.sendMessage(remoteJid, { 
                    image: buffer,
                    caption: `${notificationText}\n\nCaption: ${imageMsg.caption || ''}`,
                    mentions: [deletedBy, sentBy],
                    ...channelInfo
                });
                return;
            } 
            
            // Video message
            if (originalMsg.message?.videoMessage) {
                notificationText += `Deleted Media: [Video]`;
                
                const videoMsg = originalMsg.message.videoMessage;
                
                const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
                const stream = await downloadContentFromMessage(videoMsg, 'video');
                let buffer = Buffer.from([]);
                for await (const chunk of stream) {
                    buffer = Buffer.concat([buffer, chunk]);
                }
                
                await client.sendMessage(remoteJid, { 
                    video: buffer, 
                    caption: `${notificationText}\n\nCaption: ${videoMsg.caption || ''}`,
                    mentions: [deletedBy, sentBy],
                    ...channelInfo
                });
                return;
            } 
            
            // Sticker message
            if (originalMsg.message?.stickerMessage) {
                notificationText += `Deleted Media: [Sticker]`;
                
                const stickerMsg = originalMsg.message.stickerMessage;
                
                const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
                const stream = await downloadContentFromMessage(stickerMsg, 'sticker');
                let buffer = Buffer.from([]);
                for await (const chunk of stream) {
                    buffer = Buffer.concat([buffer, chunk]);
                }
                
                await client.sendMessage(remoteJid, { 
                    sticker: buffer,
                    ...channelInfo
                });
                return;
            } 
            
            // Audio message
            if (originalMsg.message?.audioMessage) {
                notificationText += `Deleted Media: [Audio]`;
                
                const audioMsg = originalMsg.message.audioMessage;
                
                const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
                const stream = await downloadContentFromMessage(audioMsg, 'audio');
                let buffer = Buffer.from([]);
                for await (const chunk of stream) {
                    buffer = Buffer.concat([buffer, chunk]);
                }
                
                const isPTT = audioMsg.ptt === true;
                await client.sendMessage(remoteJid, { 
                    audio: buffer, 
                    ptt: isPTT, 
                    mimetype: audioMsg.mimetype || 'audio/mpeg',
                    ...channelInfo
                });
                return;
            }
            
            // If we get here, message type not handled
            notificationText += `⚠️ Message type not supported for recovery`;
            await client.sendMessage(remoteJid, { 
                text: notificationText,
                mentions: [deletedBy, sentBy],
                ...channelInfo
            });
            
        } catch (error) {
            console.error('Error handling deleted message:', error);
            notificationText += `\n\n⚠️ Error recovering deleted content: ${error.message}`;
            await client.sendMessage(remoteJid, { 
                text: notificationText,
                mentions: [deletedBy, sentBy],
                ...channelInfo
            });
        }
        
        // Clean up stored message
        deletedMessages.delete(key);
        
    } catch (error) {
        console.error('Error in message revocation:', error);
    }
}

// Anti-delete command
async function antideleteCommand(client, chatId, message, args, sender, pushName, isOwnerSimple) {
    try {
        if (!isOwnerSimple) {
            await client.sendMessage(chatId, {
                text: '🚫 This command is only for the bot owner/sudo',
                ...channelInfo
            }, { quoted: message });
            return;
        }
        
        const currentStatus = await getAnti();
        const action = args[0]?.toLowerCase();
        const prefix = require('../set').prefix || '.';
        
        if (!action || action === 'status') {
            await client.sendMessage(chatId, {
                text: `🛡️ *AntiDelete Status:* ${currentStatus ? '✅ ON' : '🚫 OFF'}\n\n` +
                      `Usage:\n• ${prefix}antidelete on - Enable\n• ${prefix}antidelete off - Disable`,
                ...channelInfo
            }, { quoted: message });
            return;
        }
        
        if (action === 'on') {
            const success = await setAnti(true);
            if (success) {
                await client.sendMessage(chatId, {
                    text: '✅ Anti-delete has been enabled',
                    ...channelInfo
                }, { quoted: message });
            } else {
                await client.sendMessage(chatId, {
                    text: '🚫 Failed to enable anti-delete',
                    ...channelInfo
                }, { quoted: message });
            }
        } 
        else if (action === 'off') {
            const success = await setAnti(false);
            if (success) {
                await client.sendMessage(chatId, {
                    text: '🚫 Anti-delete has been disabled',
                    ...channelInfo
                }, { quoted: message });
            } else {
                await client.sendMessage(chatId, {
                    text: '🚫 Failed to disable anti-delete',
                    ...channelInfo
                }, { quoted: message });
            }
        } 
        else {
            await client.sendMessage(chatId, {
                text: `Invalid command. Usage:\n• ${prefix}antidelete on\n• ${prefix}antidelete off\n• ${prefix}antidelete status`,
                ...channelInfo
            }, { quoted: message });
        }
    } catch (e) {
        console.error("Error in antidelete command:", e);
        await client.sendMessage(chatId, {
            text: "🚫 An error occurred while processing your request.",
            ...channelInfo
        }, { quoted: message });
    }
}

module.exports = {
    antideleteCommand,
    storeMessage: handleIncomingMessage,  // alias
    handleMessageRevocation,
    getAnti,
    setAnti
};