const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const config = require('../set');

module.exports = async (client, chatId, m, args, sender, pushName, isOwner) => {
    try {
        const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        
        if (!quoted?.imageMessage && !quoted?.videoMessage) {
            await client.sendMessage(chatId, { 
                text: '🖼️ *Please reply to an image or video!*\n\nExample: Reply to an image with `.sticker`' 
            }, { quoted: m });
            return;
        }

        await client.sendMessage(chatId, {
            react: { text: '⏳', key: m.key }
        });

        const mediaType = quoted.imageMessage ? 'image' : 'video';
        const media = quoted.imageMessage || quoted.videoMessage;
        
        // Download media
        const stream = await downloadContentFromMessage(media, mediaType);
        const chunks = [];
        for await (const chunk of stream) {
            chunks.push(chunk);
        }
        const buffer = Buffer.concat(chunks);
        
        // Create temp directory
        const tempDir = path.join(__dirname, '../temp');
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
        
        const tempPath = path.join(tempDir, `sticker_${Date.now()}.${mediaType === 'image' ? 'jpg' : 'mp4'}`);
        const outputPath = path.join(tempDir, `sticker_${Date.now()}.webp`);
        
        fs.writeFileSync(tempPath, buffer);
        
        // Convert to sticker using ffmpeg
        if (mediaType === 'image') {
            await execPromise(`ffmpeg -i ${tempPath} -vf "scale=512:512:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000" -c:v libwebp -lossless 1 -q:v 80 -preset picture -loop 0 -an -vsync 0 ${outputPath}`);
        } else {
            await execPromise(`ffmpeg -i ${tempPath} -vf "scale=512:512:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000,fps=10" -c:v libwebp -lossless 0 -q:v 80 -preset picture -loop 0 -an -vsync 0 ${outputPath}`);
        }
        
        const stickerBuffer = fs.readFileSync(outputPath);
        
        await client.sendMessage(chatId, {
            sticker: stickerBuffer,
            packname: config.packname || 'MAD-MAX',
            author: config.author || 'NUCH'
        }, { quoted: m });

        await client.sendMessage(chatId, {
            react: { text: '✅', key: m.key }
        });

        // Clean up
        fs.unlinkSync(tempPath);
        fs.unlinkSync(outputPath);

    } catch (error) {
        console.error('[STICKER] Error:', error);
        await client.sendMessage(chatId, { 
            text: `❌ Error: ${error.message}. Make sure ffmpeg is installed.` 
        }, { quoted: m });
        await client.sendMessage(chatId, {
            react: { text: '❌', key: m.key }
        });
    }
};