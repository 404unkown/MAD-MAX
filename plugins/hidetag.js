const isAdmin = require('../lib/isAdmin');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');

// Ensure temp directory exists
const tempDir = path.join(__dirname, '../temp');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

async function downloadMediaMessage(message, mediaType) {
    try {
        const stream = await downloadContentFromMessage(message, mediaType);
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }
        const filePath = path.join(tempDir, `${Date.now()}.${mediaType}`);
        fs.writeFileSync(filePath, buffer);
        return filePath;
    } catch (error) {
        console.error('Error downloading media:', error);
        return null;
    }
}

async function hideTagCommand(sock, chatId, sender, messageText, replyMessage, quotedMsg) {
    try {
        // Ensure sender is a string
        const senderId = typeof sender === 'string' ? sender : (sender?.id || sender?._serialized || String(sender));
        
        console.log('Sender ID:', senderId);

        const { isSenderAdmin, isBotAdmin } = await isAdmin(sock, chatId, senderId);

        if (!isBotAdmin) {
            await sock.sendMessage(chatId, { text: '❌ Please make the bot an admin first.' }, { quoted: quotedMsg });
            return;
        }

        if (!isSenderAdmin) {
            await sock.sendMessage(chatId, { text: '❌ Only admins can use the .hidetag command.' }, { quoted: quotedMsg });
            return;
        }

        const groupMetadata = await sock.groupMetadata(chatId);
        const participants = groupMetadata.participants || [];
        
        // Get all members (not just non-admins for hidetag)
        const allMembers = participants.map(p => p.id);

        if (replyMessage) {
            let content = {};
            
            if (replyMessage.imageMessage) {
                const filePath = await downloadMediaMessage(replyMessage.imageMessage, 'image');
                if (filePath) {
                    content = { 
                        image: { url: filePath }, 
                        caption: messageText || replyMessage.imageMessage.caption || '', 
                        mentions: allMembers 
                    };
                }
            } else if (replyMessage.videoMessage) {
                const filePath = await downloadMediaMessage(replyMessage.videoMessage, 'video');
                if (filePath) {
                    content = { 
                        video: { url: filePath }, 
                        caption: messageText || replyMessage.videoMessage.caption || '', 
                        mentions: allMembers 
                    };
                }
            } else if (replyMessage.conversation || replyMessage.extendedTextMessage) {
                content = { 
                    text: replyMessage.conversation || replyMessage.extendedTextMessage?.text || messageText, 
                    mentions: allMembers 
                };
            } else if (replyMessage.documentMessage) {
                const filePath = await downloadMediaMessage(replyMessage.documentMessage, 'document');
                if (filePath) {
                    content = { 
                        document: { url: filePath }, 
                        fileName: replyMessage.documentMessage.fileName, 
                        caption: messageText || '', 
                        mentions: allMembers 
                    };
                }
            }

            if (Object.keys(content).length > 0) {
                await sock.sendMessage(chatId, content);
            } else {
                await sock.sendMessage(chatId, { 
                    text: messageText || 'Hidden tag all members', 
                    mentions: allMembers 
                });
            }
        } else {
            await sock.sendMessage(chatId, { 
                text: messageText || 'Hidden tag all members', 
                mentions: allMembers 
            });
        }

        // Success reaction
        await sock.sendMessage(chatId, {
            react: { text: '✅', key: quotedMsg?.key }
        });

    } catch (error) {
        console.error('Error in hidetag command:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Failed to execute hidetag command.' 
        }, { quoted: quotedMsg });
    }
}

module.exports = hideTagCommand;