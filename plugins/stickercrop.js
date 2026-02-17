const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const config = require('../set');

async function stickercropCommand(client, chatId, message, args, sender, pushName, isOwnerSimple) {
    try {
        // Check if replying to a sticker
        const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        
        if (!quotedMsg || !quotedMsg.stickerMessage) {
            await client.sendMessage(chatId, {
                text: `✂️ *Sticker Crop Tool*\n\nPlease reply to a sticker with .crop to make it a square sticker.\n\n*Usage:* Reply to a sticker with .crop`
            }, { quoted: message });
            return;
        }

        // Send processing reaction
        await client.sendMessage(chatId, { 
            react: { text: '✂️', key: message.key } 
        });

        const processingMsg = await client.sendMessage(chatId, {
            text: '✂️ *Cropping sticker...*'
        }, { quoted: message });

        // Download the sticker
        const stream = await downloadContentFromMessage(quotedMsg.stickerMessage, 'sticker');
        const chunks = [];
        for await (const chunk of stream) {
            chunks.push(chunk);
        }
        const stickerBuffer = Buffer.concat(chunks);

        // Create temp directory if it doesn't exist
        const tmpDir = path.join(process.cwd(), 'tmp');
        if (!fs.existsSync(tmpDir)) {
            fs.mkdirSync(tmpDir, { recursive: true });
        }

        // Generate temp file paths
        const tempInput = path.join(tmpDir, `sticker_${Date.now()}.webp`);
        const tempOutput = path.join(tmpDir, `cropped_${Date.now()}.webp`);

        // Write sticker to temp file
        fs.writeFileSync(tempInput, stickerBuffer);

        // Crop the sticker to square using ffmpeg
        // This crops to a square based on the smaller dimension
        const ffmpegCommand = `ffmpeg -i "${tempInput}" -vf "crop=min(iw\\,ih):min(iw\\,ih),scale=512:512" -c:v libwebp -loop 0 -vsync 0 -pix_fmt yuva420p -quality 80 "${tempOutput}"`;

        await new Promise((resolve, reject) => {
            exec(ffmpegCommand, (error) => {
                if (error) {
                    console.error('FFmpeg error:', error);
                    reject(error);
                } else {
                    resolve();
                }
            });
        });

        // Check if output file exists
        if (!fs.existsSync(tempOutput)) {
            throw new Error('Failed to create cropped sticker');
        }

        // Read the cropped sticker
        const croppedBuffer = fs.readFileSync(tempOutput);

        // Delete processing message
        await client.sendMessage(chatId, { delete: processingMsg.key });

        // Send the cropped sticker
        await client.sendMessage(chatId, {
            sticker: croppedBuffer
        }, { quoted: message });

        // Success reaction
        await client.sendMessage(chatId, { 
            react: { text: '✅', key: message.key } 
        });

        // Cleanup temp files
        try {
            fs.unlinkSync(tempInput);
            fs.unlinkSync(tempOutput);
        } catch (err) {
            console.error('Error cleaning up temp files:', err);
        }

    } catch (error) {
        console.error('Error in stickercrop command:', error);
        await client.sendMessage(chatId, { 
            text: '❌ Failed to crop sticker. Make sure it\'s a valid sticker.'
        }, { quoted: message });
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: message.key } 
        });
    }
}

module.exports = stickercropCommand;