const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

async function saveCommand(client, chatId, message, args, sender, pushName, isOwnerSimple) {
    try {
        // Check if message is a reply
        const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quotedMessage) {
            await client.sendMessage(chatId, {
                text: "*🍁 Please reply to a status/media message!*\nUsage: Reply to any media with .save"
            }, { quoted: message });
            return;
        }

        // Send processing reaction
        await client.sendMessage(chatId, { 
            react: { text: '📤', key: message.key } 
        });

        const processingMsg = await client.sendMessage(chatId, {
            text: '💾 *Saving message...*'
        }, { quoted: message });

        let success = false;
        
        // Handle different media types
        if (quotedMessage.imageMessage) {
            const stream = await downloadContentFromMessage(quotedMessage.imageMessage, 'image');
            const chunks = [];
            for await (const chunk of stream) {
                chunks.push(chunk);
            }
            const buffer = Buffer.concat(chunks);
            
            await client.sendMessage(chatId, {
                image: buffer,
                caption: quotedMessage.imageMessage.caption || ''
            }, { quoted: message });
            success = true;
            
        } else if (quotedMessage.videoMessage) {
            const stream = await downloadContentFromMessage(quotedMessage.videoMessage, 'video');
            const chunks = [];
            for await (const chunk of stream) {
                chunks.push(chunk);
            }
            const buffer = Buffer.concat(chunks);
            
            await client.sendMessage(chatId, {
                video: buffer,
                caption: quotedMessage.videoMessage.caption || ''
            }, { quoted: message });
            success = true;
            
        } else if (quotedMessage.audioMessage) {
            const stream = await downloadContentFromMessage(quotedMessage.audioMessage, 'audio');
            const chunks = [];
            for await (const chunk of stream) {
                chunks.push(chunk);
            }
            const buffer = Buffer.concat(chunks);
            
            await client.sendMessage(chatId, {
                audio: buffer,
                mimetype: "audio/mp4",
                ptt: quotedMessage.audioMessage.ptt || false
            }, { quoted: message });
            success = true;
            
        } else if (quotedMessage.stickerMessage) {
            const stream = await downloadContentFromMessage(quotedMessage.stickerMessage, 'sticker');
            const chunks = [];
            for await (const chunk of stream) {
                chunks.push(chunk);
            }
            const buffer = Buffer.concat(chunks);
            
            await client.sendMessage(chatId, {
                sticker: buffer
            }, { quoted: message });
            success = true;
            
        } else if (quotedMessage.documentMessage) {
            const stream = await downloadContentFromMessage(quotedMessage.documentMessage, 'document');
            const chunks = [];
            for await (const chunk of stream) {
                chunks.push(chunk);
            }
            const buffer = Buffer.concat(chunks);
            
            await client.sendMessage(chatId, {
                document: buffer,
                fileName: quotedMessage.documentMessage.fileName || "file",
                mimetype: quotedMessage.documentMessage.mimetype || "application/octet-stream"
            }, { quoted: message });
            success = true;
            
        } else if (quotedMessage.conversation || quotedMessage.extendedTextMessage?.text) {
            // For text messages - send as forwarded
            const text = quotedMessage.conversation || quotedMessage.extendedTextMessage?.text;
            await client.sendMessage(chatId, {
                text: `💬 *Saved Text:*\n\n${text}`
            }, { quoted: message });
            success = true;
        }

        // Delete processing message
        await client.sendMessage(chatId, { delete: processingMsg.key });

        if (success) {
            // Success reaction
            await client.sendMessage(chatId, { 
                react: { text: '✅', key: message.key } 
            });
        } else {
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: message.key } 
            });
            await client.sendMessage(chatId, {
                text: "❌ This message type is not supported for saving"
            }, { quoted: message });
        }

    } catch (error) {
        console.error("Save Error:", error);
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: message.key } 
        });
        await client.sendMessage(chatId, {
            text: "❌ Error saving message:\n" + error.message
        }, { quoted: message });
    }
}

module.exports = saveCommand;