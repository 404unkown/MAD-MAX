const { toAudio, getExtensionFromMime } = require('../lib/mediaconverter');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

// Global channel info for consistent formatting (minimal)
const channelInfo = {
    contextInfo: {
        forwardingScore: 1,
        isForwarded: true
    }
};

module.exports = async function tomp3Command(client, chatId, message, args, sender, pushName, isOwner) {
    try {
        // Check if message is quoted
        const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quotedMsg) {
            await client.sendMessage(chatId, {
                text: "🔊 *MP3 CONVERTER*\n\nPlease reply to a video or audio message\n\nExample: Reply to video with `.tomp3`",
                ...channelInfo
            }, { quoted: message });
            return;
        }

        // Send processing reaction
        await client.sendMessage(chatId, { 
            react: { text: '⏳', key: message.key } 
        });

        // Check if quoted is video or audio
        const isVideo = !!quotedMsg.videoMessage;
        const isAudio = !!quotedMsg.audioMessage;
        
        if (!isVideo && !isAudio) {
            await client.sendMessage(chatId, {
                text: "❌ Only video or audio messages can be converted\nPlease reply to a video or audio message.",
                ...channelInfo
            }, { quoted: message });
            
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: message.key } 
            });
            return;
        }

        // Check duration (max 5 minutes = 300 seconds)
        const media = isVideo ? quotedMsg.videoMessage : quotedMsg.audioMessage;
        const duration = media?.seconds || 0;
        
        if (duration > 300) {
            await client.sendMessage(chatId, {
                text: `⏱️ *Duration Limit Exceeded*\n\nDuration: ${duration} seconds\nMax allowed: 300 seconds (5 minutes)`,
                ...channelInfo
            }, { quoted: message });
            
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: message.key } 
            });
            return;
        }

        // Send processing message
        await client.sendMessage(chatId, {
            text: "🔄 *Converting to MP3 audio...*",
            ...channelInfo
        }, { quoted: message });

        // Download media
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

        // Get extension
        const mimeType = media?.mimetype || (isVideo ? 'video/mp4' : 'audio/mpeg');
        const mediaExt = getExtensionFromMime(mimeType);

        // Convert to MP3
        const audioBuffer = await toAudio(mediaBuffer, mediaExt);

        // Send audio
        await client.sendMessage(chatId, {
            audio: audioBuffer,
            mimetype: 'audio/mpeg',
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true
            }
        }, { quoted: message });

        // Success reaction
        await client.sendMessage(chatId, {
            react: { text: '✅', key: message.key }
        });

    } catch (error) {
        console.error('tomp3 command error:', error);
        await client.sendMessage(chatId, {
            text: `❌ *Failed to convert to MP3*\nError: ${error.message}`,
            ...channelInfo
        }, { quoted: message });
        
        // Error reaction
        await client.sendMessage(chatId, {
            react: { text: '❌', key: message.key }
        });
    }
};