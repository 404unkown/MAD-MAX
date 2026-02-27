const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { sticker } = require('../lib/sticker');
const uploadImage = require('../lib/uploadImage');
const config = require('../set');

async function smemeCommand(client, chatId, message, args, sender, pushName, isOwnerSimple) {
    try {
        // Parse text for meme (format: "top text|bottom text")
        const text = args.join(' ');
        let atas = ''; // Top text
        let bawah = ''; // Bottom text
        
        if (text.includes('|')) {
            const parts = text.split('|');
            atas = parts[0].trim();
            bawah = parts.slice(1).join('|').trim();
        } else if (text) {
            atas = text.trim();
        }
        
        // Check if message is replying to an image
        const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        
        if (!quotedMsg?.imageMessage) {
            await client.sendMessage(chatId, {
                text: `🎭 *Sticker Meme Creator*\n\n❌ *Please reply to an image!*\n\n*Usage:*\nReply to image with: .smeme top text|bottom text\n\n*Examples:*\n• .smeme Hello|World\n• .smeme Funny Text\n• .smeme Top Text Only|`
            }, { quoted: message });
            return;
        }
        
        // Send processing reaction
        await client.sendMessage(chatId, { 
            react: { text: '⏳', key: message.key } 
        });

        const processingMsg = await client.sendMessage(chatId, {
            text: '🎭 *Creating meme sticker...*'
        }, { quoted: message });
        
        // Download the image
        let imageBuffer;
        try {
            const stream = await downloadContentFromMessage(quotedMsg.imageMessage, 'image');
            const chunks = [];
            for await (const chunk of stream) {
                chunks.push(chunk);
            }
            imageBuffer = Buffer.concat(chunks);
            
            if (!imageBuffer || imageBuffer.length === 0) {
                throw new Error('Failed to download image');
            }
        } catch (downloadError) {
            console.error('Image download error:', downloadError);
            throw new Error('Failed to download image. Try again.');
        }
        
        // Upload image to get URL
        let imageUrl;
        try {
            imageUrl = await uploadImage(imageBuffer);
        } catch (uploadError) {
            console.error('Image upload error:', uploadError);
            throw new Error('Failed to upload image for meme creation.');
        }
        
        // Create meme URL using memegen.link API
        const encodedTop = encodeURIComponent(atas || ' ');
        const encodedBottom = encodeURIComponent(bawah || ' ');
        const encodedImageUrl = encodeURIComponent(imageUrl);
        
        const memeUrl = `https://api.memegen.link/images/custom/${encodedTop}/${encodedBottom}.png?background=${encodedImageUrl}`;
        
        // Create sticker from the meme
        const stickerBuffer = await sticker(null, memeUrl, config.botname || "MAD-MAX", pushName || "User");
        
        // Delete processing message
        await client.sendMessage(chatId, { delete: processingMsg.key });
        
        // Send the sticker
        await client.sendMessage(chatId, {
            sticker: stickerBuffer
        }, { quoted: message });
        
        // Success reaction
        await client.sendMessage(chatId, { 
            react: { text: '✅', key: message.key } 
        });
        
    } catch (error) {
        console.error('Smeme command error:', error);
        
        let errorMessage = '❌ Failed to create meme sticker!';
        
        if (error.message.includes('Failed to download')) {
            errorMessage = '❌ Failed to download image. Try again.';
        } else if (error.message.includes('Failed to upload')) {
            errorMessage = '❌ Failed to process image. Try a different image.';
        } else if (error.message.includes('timeout')) {
            errorMessage = '❌ Request timed out. Please try again.';
        }
        
        await client.sendMessage(chatId, {
            text: `${errorMessage}\n\n_Error: ${error.message}_`
        }, { quoted: message });
        
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: message.key } 
        });
    }
}

module.exports = smemeCommand;