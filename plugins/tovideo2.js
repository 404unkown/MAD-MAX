const { audioToVideo, getExtensionFromMime } = require('../lib/mediaconverter');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

module.exports = async function tovideo2Command(client, chatId, message, args, sender, pushName, isOwner) {
    try {
        const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quotedMsg) {
            await client.sendMessage(chatId, {
                text: "🎵 *AUDIO TO VIDEO*\n\nPlease reply to an audio message\n\n*Example:* Reply to audio with `.tovideo2`"
            }, { quoted: message });
            return;
        }

        await client.sendMessage(chatId, { 
            react: { text: '⏳', key: message.key } 
        });

        const isAudio = !!quotedMsg.audioMessage;
        if (!isAudio) {
            await client.sendMessage(chatId, {
                text: "❌ Only audio messages can be converted to video\nPlease reply to an audio message."
            }, { quoted: message });
            
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: message.key } 
            });
            return;
        }

        const duration = quotedMsg.audioMessage?.seconds || 0;
        if (duration > 300) {
            await client.sendMessage(chatId, {
                text: `⏱️ *Audio too long*\n\nDuration: ${duration} seconds\nMax allowed: 300 seconds (5 minutes)`
            }, { quoted: message });
            
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: message.key } 
            });
            return;
        }

        const processingMsg = await client.sendMessage(chatId, {
            text: "🔄 *Downloading audio and preparing video...*\nThis may take a moment..."
        }, { quoted: message });

        let audioBuffer;
        try {
            const stream = await downloadContentFromMessage(quotedMsg.audioMessage, 'audio');
            const chunks = [];
            for await (const chunk of stream) {
                chunks.push(chunk);
            }
            audioBuffer = Buffer.concat(chunks);
            
            if (!audioBuffer || audioBuffer.length === 0) {
                throw new Error('Downloaded empty audio');
            }
        } catch (error) {
            console.error('Audio download error:', error);
            throw new Error('Failed to download audio message');
        }

        await client.sendMessage(chatId, {
            text: "🔄 *Converting audio to video...*\nThis may take a while depending on audio length.",
            edit: processingMsg.key
        });

        const mimeType = quotedMsg.audioMessage?.mimetype || 'audio/mpeg';
        const audioExt = getExtensionFromMime(mimeType);

        const videoBuffer = await audioToVideo(audioBuffer, audioExt);

        await client.sendMessage(chatId, {
            video: videoBuffer,
            caption: `🎵 *Audio Visualized*\n\n_Requested by: ${pushName}_`
        }, { quoted: message });

        await client.sendMessage(chatId, {
            react: { text: '✅', key: message.key }
        });

    } catch (error) {
        console.error('tovideo2 command error:', error);
        await client.sendMessage(chatId, {
            text: `❌ *Failed to convert to video*\nError: ${error.message}\n\nPlease try again with a different audio.`
        }, { quoted: message });
        
        await client.sendMessage(chatId, {
            react: { text: '❌', key: message.key }
        });
    }
};