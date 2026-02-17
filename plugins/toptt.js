const { toPTT, getExtensionFromMime } = require('../lib/mediaconverter');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

module.exports = async function topttCommand(client, chatId, message, args, sender, pushName, isOwner) {
    try {
        const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quotedMsg) {
            await client.sendMessage(chatId, {
                text: "🗣️ *VOICE NOTE CONVERTER*\n\nPlease reply to a video or audio message\n\n*Example:* Reply to video with `.toptt`"
            }, { quoted: message });
            return;
        }

        await client.sendMessage(chatId, { 
            react: { text: '⏳', key: message.key } 
        });

        const isVideo = !!quotedMsg.videoMessage;
        const isAudio = !!quotedMsg.audioMessage;
        
        if (!isVideo && !isAudio) {
            await client.sendMessage(chatId, {
                text: "❌ Only video or audio messages can be converted\nPlease reply to a video or audio message."
            }, { quoted: message });
            
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: message.key } 
            });
            return;
        }

        const media = isVideo ? quotedMsg.videoMessage : quotedMsg.audioMessage;
        const duration = media?.seconds || 0;
        
        if (duration > 60) {
            await client.sendMessage(chatId, {
                text: `⏱️ *Media too long for voice note*\n\nDuration: ${duration} seconds\nMax allowed: 60 seconds (1 minute)`
            }, { quoted: message });
            
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: message.key } 
            });
            return;
        }

        const processingMsg = await client.sendMessage(chatId, {
            text: "🔄 *Converting to voice message...*"
        }, { quoted: message });

        let mediaBuffer;
        try {
            const mediaType = isVideo ? 'video' : 'audio';
            const stream = await downloadContentFromMessage(media, mediaType);
            const chunks = [];
            for await (const chunk of stream) {
                chunks.push(chunk);
            }
            mediaBuffer = Buffer.concat(chunks);
            
            if (!mediaBuffer || mediaBuffer.length === 0) {
                throw new Error('Downloaded empty media');
            }
        } catch (error) {
            console.error('Media download error:', error);
            throw new Error('Failed to download media');
        }

        const mimeType = media?.mimetype || (isVideo ? 'video/mp4' : 'audio/mpeg');
        const mediaExt = getExtensionFromMime(mimeType);

        const pttBuffer = await toPTT(mediaBuffer, mediaExt);

        await client.sendMessage(chatId, {
            audio: pttBuffer,
            ptt: true,
            mimetype: 'audio/ogg; codecs=opus'
        }, { quoted: message });

        await client.sendMessage(chatId, {
            react: { text: '✅', key: message.key }
        });

    } catch (error) {
        console.error('toptt command error:', error);
        await client.sendMessage(chatId, {
            text: `❌ *Failed to create voice message*\nError: ${error.message}`
        }, { quoted: message });
        
        await client.sendMessage(chatId, {
            react: { text: '❌', key: message.key }
        });
    }
};