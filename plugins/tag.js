const isAdmin = require('../lib/isAdmin');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');

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

// BOT ADMIN CHECK
async function isBotAdminCheck(client, chatId) {
    try {
        const metadata = await client.groupMetadata(chatId);
        const botId = client.user.id.split(':')[0] + '@s.whatsapp.net';
        const bot = metadata.participants.find(p => p.id === botId);
        return bot?.admin === 'admin' || bot?.admin === 'superadmin';
    } catch (error) {
        console.error('Error checking bot admin:', error);
        return false;
    }
}

async function downloadMediaMessage(message, mediaType) {
    try {
        const stream = await downloadContentFromMessage(message, mediaType);
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }
        
        // Ensure temp directory exists
        const tempDir = path.join(__dirname, '../temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }
        
        const filePath = path.join(tempDir, `${Date.now()}.${mediaType === 'image' ? 'jpg' : mediaType === 'video' ? 'mp4' : 'bin'}`);
        fs.writeFileSync(filePath, buffer);
        return filePath;
    } catch (error) {
        console.error('Error downloading media:', error);
        throw error;
    }
}

async function tagCommand(client, chatId, message, args, sender, pushName, isOwner) {
    try {
        // Check if in group
        if (!chatId.endsWith('@g.us')) {
            await client.sendMessage(chatId, {
                text: '❌ This command can only be used in groups!',
                ...channelInfo
            }, { quoted: message });
            return;
        }

        // Get message text from args
        const messageText = args.join(' ').trim();

        // Check if user is admin
        const adminStatus = await isAdmin(client, chatId, sender);
        const isSenderAdmin = adminStatus.isSenderAdmin;

        // Check bot admin status
        const botAdmin = await isBotAdminCheck(client, chatId);
        if (!botAdmin) {
            await client.sendMessage(chatId, {
                text: '⚠️ Please make the bot an admin first to use tag command.',
                ...channelInfo
            }, { quoted: message });
            return;
        }

        // If sender is not admin and not owner, send sticker instead
        if (!isSenderAdmin && !isOwner) {
            const stickerPath = path.join(__dirname, '../assets/sticktag.webp');
            if (fs.existsSync(stickerPath)) {
                const stickerBuffer = fs.readFileSync(stickerPath);
                await client.sendMessage(chatId, { 
                    sticker: stickerBuffer,
                    ...channelInfo
                }, { quoted: message });
            } else {
                await client.sendMessage(chatId, {
                    text: '❌ Only group admins can use tag command!',
                    ...channelInfo
                }, { quoted: message });
            }
            return;
        }

        // Get group participants
        const groupMetadata = await client.groupMetadata(chatId);
        const participants = groupMetadata.participants;
        const mentionedJidList = participants.map(p => p.id);

        // Check for quoted message
        const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;

        if (quotedMessage) {
            let messageContent = {};

            // Handle different message types
            if (quotedMessage.imageMessage) {
                try {
                    const filePath = await downloadMediaMessage(quotedMessage.imageMessage, 'image');
                    messageContent = {
                        image: { url: filePath },
                        caption: messageText || quotedMessage.imageMessage.caption || '',
                        mentions: mentionedJidList,
                        ...channelInfo
                    };
                    
                    // Clean up temp file after sending
                    setTimeout(() => {
                        try { fs.unlinkSync(filePath); } catch (e) {}
                    }, 5000);
                    
                } catch (error) {
                    console.error('Error downloading image:', error);
                    messageContent = {
                        text: messageText || quotedMessage.imageMessage.caption || 'Image message',
                        mentions: mentionedJidList,
                        ...channelInfo
                    };
                }
            } 
            else if (quotedMessage.videoMessage) {
                try {
                    const filePath = await downloadMediaMessage(quotedMessage.videoMessage, 'video');
                    messageContent = {
                        video: { url: filePath },
                        caption: messageText || quotedMessage.videoMessage.caption || '',
                        mentions: mentionedJidList,
                        ...channelInfo
                    };
                    
                    setTimeout(() => {
                        try { fs.unlinkSync(filePath); } catch (e) {}
                    }, 5000);
                    
                } catch (error) {
                    console.error('Error downloading video:', error);
                    messageContent = {
                        text: messageText || quotedMessage.videoMessage.caption || 'Video message',
                        mentions: mentionedJidList,
                        ...channelInfo
                    };
                }
            } 
            else if (quotedMessage.conversation || quotedMessage.extendedTextMessage) {
                messageContent = {
                    text: quotedMessage.conversation || quotedMessage.extendedTextMessage?.text || messageText,
                    mentions: mentionedJidList,
                    ...channelInfo
                };
            } 
            else if (quotedMessage.documentMessage) {
                try {
                    const filePath = await downloadMediaMessage(quotedMessage.documentMessage, 'document');
                    messageContent = {
                        document: { url: filePath },
                        fileName: quotedMessage.documentMessage.fileName || 'document',
                        caption: messageText || '',
                        mentions: mentionedJidList,
                        ...channelInfo
                    };
                    
                    setTimeout(() => {
                        try { fs.unlinkSync(filePath); } catch (e) {}
                    }, 5000);
                    
                } catch (error) {
                    console.error('Error downloading document:', error);
                    messageContent = {
                        text: messageText || 'Document message',
                        mentions: mentionedJidList,
                        ...channelInfo
                    };
                }
            }
            else {
                messageContent = {
                    text: messageText || 'Tagged message',
                    mentions: mentionedJidList,
                    ...channelInfo
                };
            }

            if (Object.keys(messageContent).length > 0) {
                await client.sendMessage(chatId, messageContent, { quoted: message });
            }
        } else {
            // No quoted message, just send text with mentions
            await client.sendMessage(chatId, {
                text: messageText || '👥 *Attention everyone!*',
                mentions: mentionedJidList,
                ...channelInfo
            }, { quoted: message });
        }

        // Add success reaction
        await client.sendMessage(chatId, {
            react: { text: '✅', key: message.key }
        });

    } catch (error) {
        console.error('Error in tag command:', error);
        await client.sendMessage(chatId, {
            text: '❌ Failed to execute tag command!',
            ...channelInfo
        }, { quoted: message });
        
        await client.sendMessage(chatId, {
            react: { text: '❌', key: message.key }
        });
    }
}

module.exports = tagCommand;