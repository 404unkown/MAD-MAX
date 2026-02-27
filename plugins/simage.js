const sharp = require('sharp');
const fs = require('fs');
const fsPromises = require('fs/promises');
const fse = require('fs-extra');
const path = require('path');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

const tempDir = './temp';
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

const scheduleFileDeletion = (filePath) => {
    setTimeout(async () => {
        try {
            await fse.remove(filePath);
            console.log(`File deleted: ${filePath}`);
        } catch (error) {
            console.error(`Failed to delete file:`, error);
        }
    }, 300000); // 5 minutes (300000ms)
};

async function simageCommand(client, chatId, message, args, sender, pushName, isOwnerSimple) {
    try {
        // Check if replying to a sticker
        const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        
        if (!quotedMsg || !quotedMsg.stickerMessage) {
            await client.sendMessage(chatId, { 
                text: '🖼️ *Sticker to Image Converter*\n\n*Usage:* Reply to a sticker with .simage to convert it to an image.\n\n*Aliases:* .s2img, .stoimg, .sticker2image'
            }, { quoted: message });
            return;
        }

        // Send processing reaction
        await client.sendMessage(chatId, { 
            react: { text: '⏳', key: message.key } 
        });

        const processingMsg = await client.sendMessage(chatId, {
            text: '🔄 *Converting sticker to image...*'
        }, { quoted: message });

        const stickerMessage = quotedMsg.stickerMessage;
        
        const stickerFilePath = path.join(tempDir, `sticker_${Date.now()}.webp`);
        const outputImagePath = path.join(tempDir, `converted_image_${Date.now()}.png`);

        const stream = await downloadContentFromMessage(stickerMessage, 'sticker');
        let buffer = Buffer.from([]);
        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

        await fsPromises.writeFile(stickerFilePath, buffer);
        await sharp(stickerFilePath).toFormat('png').toFile(outputImagePath);

        const imageBuffer = await fsPromises.readFile(outputImagePath);
        
        // Delete processing message
        await client.sendMessage(chatId, { delete: processingMsg.key });
        
        await client.sendMessage(chatId, { 
            image: imageBuffer, 
            caption: '✅ *Sticker converted to image!*'
        }, { quoted: message });

        // Success reaction
        await client.sendMessage(chatId, { 
            react: { text: '✅', key: message.key } 
        });

        scheduleFileDeletion(stickerFilePath);
        scheduleFileDeletion(outputImagePath);
        
    } catch (error) {
        console.error('Error converting sticker to image:', error);
        await client.sendMessage(chatId, { 
            text: '❌ An error occurred while converting the sticker.'
        }, { quoted: message });
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: message.key } 
        });
    }
}

module.exports = simageCommand;