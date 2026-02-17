const audioEditor = require('../lib/audioeditor');
const fs = require('fs');
const path = require('path');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

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

// Ensure temp directory exists
const tempDir = path.join(__dirname, '../temp');
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

async function handleAudioEffect(client, chatId, message, effect) {
    try {
        // Check if message is quoted
        const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quotedMsg) {
            await client.sendMessage(chatId, {
                text: `🔊 *Audio Effect*\n\nPlease reply to an audio or video message with \`.${effect}\``,
                ...channelInfo
            }, { quoted: message });
            return;
        }

        // Check if quoted is audio or video
        const isAudio = !!quotedMsg.audioMessage;
        const isVideo = !!quotedMsg.videoMessage;
        
        if (!isAudio && !isVideo) {
            await client.sendMessage(chatId, {
                text: "❌ *Invalid media*\nPlease reply to an audio or video message.",
                ...channelInfo
            }, { quoted: message });
            return;
        }

        // Send processing reaction
        await client.sendMessage(chatId, { 
            react: { text: '⏳', key: message.key } 
        });

        const processingMsg = await client.sendMessage(chatId, {
            text: `🎵 Applying *${effect}* effect...`,
            ...channelInfo
        }, { quoted: message });

        // Download the media
        const mediaType = isAudio ? 'audio' : 'video';
        const media = isAudio ? quotedMsg.audioMessage : quotedMsg.videoMessage;
        
        const stream = await downloadContentFromMessage(media, mediaType);
        const chunks = [];
        for await (const chunk of stream) {
            chunks.push(chunk);
        }
        const buffer = Buffer.concat(chunks);

        // Determine file extension
        const ext = isVideo ? 'mp4' : 'mp3';

        // Check if effect exists
        if (!audioEditor[effect]) {
            await client.sendMessage(chatId, { delete: processingMsg.key });
            await client.sendMessage(chatId, {
                text: `❌ *Unknown effect:* ${effect}\n\nAvailable: bass, blown, deep, earrape, fast, fat, nightcore, reverse, robot, slow, smooth, tupai, baby, chipmunk, demon, radio`,
                ...channelInfo
            }, { quoted: message });
            
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: message.key } 
            });
            return;
        }

        // Process audio
        const processedAudio = await audioEditor[effect](buffer, ext);

        // Send back processed audio
        await client.sendMessage(chatId, { delete: processingMsg.key });
        await client.sendMessage(chatId, {
            audio: processedAudio,
            mimetype: 'audio/mp4',
            ptt: isAudio ? true : false,
            caption: `🎵 *Effect: ${effect}*\n\n⬇️ Processed by MAD-MAX`,
            ...channelInfo
        }, { quoted: message });

        // Success reaction
        await client.sendMessage(chatId, { 
            react: { text: '✅', key: message.key } 
        });

    } catch (error) {
        console.error(`Audio effect (${effect}) error:`, error);
        await client.sendMessage(chatId, {
            text: `❌ Failed to process audio: ${error.message}`,
            ...channelInfo
        }, { quoted: message });
        
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: message.key } 
        });
    }
}

// Export all effect handlers
const effects = {
    bass: (client, chatId, message) => handleAudioEffect(client, chatId, message, 'bass'),
    blown: (client, chatId, message) => handleAudioEffect(client, chatId, message, 'blown'),
    deep: (client, chatId, message) => handleAudioEffect(client, chatId, message, 'deep'),
    earrape: (client, chatId, message) => handleAudioEffect(client, chatId, message, 'earrape'),
    fast: (client, chatId, message) => handleAudioEffect(client, chatId, message, 'fast'),
    fat: (client, chatId, message) => handleAudioEffect(client, chatId, message, 'fat'),
    nightcore: (client, chatId, message) => handleAudioEffect(client, chatId, message, 'nightcore'),
    reverse: (client, chatId, message) => handleAudioEffect(client, chatId, message, 'reverse'),
    robot: (client, chatId, message) => handleAudioEffect(client, chatId, message, 'robot'),
    slow: (client, chatId, message) => handleAudioEffect(client, chatId, message, 'slow'),
    smooth: (client, chatId, message) => handleAudioEffect(client, chatId, message, 'smooth'),
    tupai: (client, chatId, message) => handleAudioEffect(client, chatId, message, 'tupai'),
    baby: (client, chatId, message) => handleAudioEffect(client, chatId, message, 'baby'),
    chipmunk: (client, chatId, message) => handleAudioEffect(client, chatId, message, 'chipmunk'),
    demon: (client, chatId, message) => handleAudioEffect(client, chatId, message, 'demon'),
    radio: (client, chatId, message) => handleAudioEffect(client, chatId, message, 'radio'),
};

async function audioHelpCommand(client, chatId, message) {
    const effectList = Object.keys(effects).map(e => `• \`${e}\``).join('\n');
    
    await client.sendMessage(chatId, {
        text: `🎵 *AUDIO EFFECTS*\n\n*Available effects:*\n${effectList}\n\n*Usage:*\n1. Reply to an audio/video message\n2. Type the effect name\n\n*Example:* Reply to audio with \`.bass\``,
        ...channelInfo
    }, { quoted: message });
}

module.exports = {
    ...effects,
    audioHelpCommand
};