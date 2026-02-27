const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const sharp = require('sharp');

async function blurCommand(client, chatId, message, args, sender, pushName, isOwnerSimple) {
    try {
        // Get the image to blur
        let imageBuffer;
        
        // Check if replying to a message with image
        const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        
        if (quotedMsg?.imageMessage) {
            // If replying to an image message
            const quoted = {
                message: {
                    imageMessage: quotedMsg.imageMessage
                },
                key: {
                    remoteJid: chatId,
                    id: message.message.extendedTextMessage.contextInfo.stanzaId
                }
            };
            
            imageBuffer = await downloadMediaMessage(
                quoted,
                'buffer',
                {},
                {}
            );
        } else if (message.message?.imageMessage) {
            // If image is in current message
            imageBuffer = await downloadMediaMessage(
                message,
                'buffer',
                {},
                {}
            );
        } else {
            await client.sendMessage(chatId, { 
                text: '❌ *Image Blur Effect*\n\n*Usage:* Reply to an image with .blur or send an image with caption .blur\n\n*Example:* Send an image with caption .blur'
            }, { quoted: message });
            return;
        }

        // Send processing reaction
        await client.sendMessage(chatId, { 
            react: { text: '🎨', key: message.key } 
        });

        const processingMsg = await client.sendMessage(chatId, {
            text: '🎨 *Applying blur effect...*'
        }, { quoted: message });

        // Resize and optimize image
        const resizedImage = await sharp(imageBuffer)
            .resize(800, 800, { // Resize to max 800x800
                fit: 'inside',
                withoutEnlargement: true
            })
            .jpeg({ quality: 80 }) // Convert to JPEG with 80% quality
            .toBuffer();

        // Apply blur effect directly using sharp
        const blurredImage = await sharp(resizedImage)
            .blur(10) // Blur radius of 10
            .toBuffer();

        // Delete processing message
        await client.sendMessage(chatId, { delete: processingMsg.key });

        // Send the blurred image
        await client.sendMessage(chatId, {
            image: blurredImage,
            caption: `✅ *Image Blurred Successfully*\n\n👤 *Requested by:* @${sender.split('@')[0]}`,
            mentions: [sender]
        }, { quoted: message });

        // Success reaction
        await client.sendMessage(chatId, { 
            react: { text: '✅', key: message.key } 
        });

    } catch (error) {
        console.error('Error in blur command:', error);
        await client.sendMessage(chatId, { 
            text: '❌ Failed to blur image. Please try again later.' 
        }, { quoted: message });
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: message.key } 
        });
    }
}

module.exports = blurCommand;