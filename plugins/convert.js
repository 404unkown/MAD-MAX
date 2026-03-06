const fs = require('fs');
const path = require('path');

// Global channel info (to match your main.js)
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

module.exports = async function convertCommand(client, chatId, message, args, sender, pushName, isOwner) {
    try {
        const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        
        if (!quotedMsg) {
            await client.sendMessage(chatId, {
                text: "╭─❖ *STICKER CONVERTER* ❖─\n│\n├─ ✨ Please reply to a sticker message\n│\n├─ *Example:* .convert (reply to sticker)\n├─ *Aliases:* .sticker2img, .stoimg, .stickertoimage, .s2i\n│\n╰─➤ _Converts stickers to images_",
                ...channelInfo
            }, { quoted: message });
            return;
        }

        if (!quotedMsg.stickerMessage) {
            await client.sendMessage(chatId, {
                text: "❌ *Only sticker messages can be converted to images*",
                ...channelInfo
            }, { quoted: message });
            return;
        }

        // Send processing reaction
        await client.sendMessage(chatId, { 
            react: { text: '⏳', key: message.key } 
        });

        // Download the sticker
        const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
        const media = quotedMsg.stickerMessage;
        
        const stream = await downloadContentFromMessage(media, 'sticker');
        const chunks = [];
        for await (const chunk of stream) {
            chunks.push(chunk);
        }
        const stickerBuffer = Buffer.concat(chunks);

        // Convert sticker to image
        const imageBuffer = await convertStickerToImage(stickerBuffer, chatId);

        // Send the converted image
        await client.sendMessage(chatId, {
            image: imageBuffer,
            caption: `🖼️ *Sticker Converted to Image*\n\n_Requested by: ${pushName}_`,
            mimetype: 'image/png',
            ...channelInfo
        }, { quoted: message });

        // Success reaction
        await client.sendMessage(chatId, { 
            react: { text: '✅', key: message.key } 
        });

    } catch (error) {
        console.error('Sticker conversion error:', error);
        
        await client.sendMessage(chatId, {
            text: "❌ *Failed to convert sticker.*\nPlease try with a different sticker.",
            ...channelInfo
        }, { quoted: message });

        await client.sendMessage(chatId, { 
            react: { text: '❌', key: message.key } 
        });
    }
};

// Simple sticker to image converter
async function convertStickerToImage(stickerBuffer, chatId) {
    try {
        // Method 1: Try to use webp-converter if installed
        try {
            const webp = require('webp-converter');
            
            // Ensure temp directory exists
            const tempDir = path.join(process.cwd(), 'temp');
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }
            
            const tempPath = path.join(tempDir, `sticker_${Date.now()}`);
            
            // Write buffer to temp file
            fs.writeFileSync(`${tempPath}.webp`, stickerBuffer);
            
            // Convert webp to png
            await webp.dwebp(`${tempPath}.webp`, `${tempPath}.png`, '-o');
            
            // Read converted file
            const pngBuffer = fs.readFileSync(`${tempPath}.png`);
            
            // Cleanup
            try { fs.unlinkSync(`${tempPath}.webp`); } catch (e) {}
            try { fs.unlinkSync(`${tempPath}.png`); } catch (e) {}
            
            console.log(`✅ Sticker converted using webp-converter`);
            return pngBuffer;
            
        } catch (webpError) {
            console.log('webp-converter not available, trying alternative...');
        }
        
        // Method 2: Check if it's already an image format
        const header = stickerBuffer.slice(0, 8).toString('hex');
        
        // Check if it's PNG
        if (header === '89504e470d0a1a0a') {
            console.log('Sticker is already PNG');
            return stickerBuffer;
        }
        
        // Check if it's JPEG
        if (header.slice(0, 4) === 'ffd8') {
            console.log('Sticker is already JPEG');
            return stickerBuffer;
        }
        
        // Method 3: If it's webp but no converter, try with ffmpeg
        if (header.slice(0, 4) === '524946') { // 'RIFF' header for webp
            console.log('WebP sticker detected, trying ffmpeg conversion...');
            
            try {
                const { exec } = require('child_process');
                const util = require('util');
                const execPromise = util.promisify(exec);
                
                const tempDir = path.join(process.cwd(), 'temp');
                if (!fs.existsSync(tempDir)) {
                    fs.mkdirSync(tempDir, { recursive: true });
                }
                
                const tempWebp = path.join(tempDir, `input_${Date.now()}.webp`);
                const tempPng = path.join(tempDir, `output_${Date.now()}.png`);
                
                fs.writeFileSync(tempWebp, stickerBuffer);
                
                await execPromise(`ffmpeg -i "${tempWebp}" "${tempPng}"`);
                
                const pngBuffer = fs.readFileSync(tempPng);
                
                // Cleanup
                try { fs.unlinkSync(tempWebp); } catch (e) {}
                try { fs.unlinkSync(tempPng); } catch (e) {}
                
                console.log(`✅ Sticker converted using ffmpeg`);
                return pngBuffer;
                
            } catch (ffmpegError) {
                console.log('ffmpeg conversion failed:', ffmpegError.message);
            }
        }
        
        // Default: return original buffer with message
        console.log('No converter available, returning original buffer');
        return stickerBuffer;
        
    } catch (error) {
        console.error('Conversion helper error:', error);
        return stickerBuffer; // Fallback
    }
}