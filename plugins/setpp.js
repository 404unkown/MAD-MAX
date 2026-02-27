const fs = require('fs');
const path = require('path');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const isOwner = require('../lib/isOwner');

async function setppCommand(client, chatId, message, args, sender, pushName, isOwnerSimple) {
    try {
        // Check if user is owner
        const isUserOwner = await isOwner(sender, client, chatId);
        
        if (!isUserOwner && !isOwnerSimple) {
            await client.sendMessage(chatId, { 
                text: '❌ This command is only available for the owner!'
            }, { quoted: message });
            return;
        }

        // Send processing reaction
        await client.sendMessage(chatId, { 
            react: { text: '⏳', key: message.key } 
        });

        // Check if message is a reply
        const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quotedMessage) {
            await client.sendMessage(chatId, { 
                text: '⚠️ Please reply to an image with the .setpp command!'
            }, { quoted: message });
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: message.key } 
            });
            return;
        }

        // Check if quoted message contains an image
        const imageMessage = quotedMessage.imageMessage || quotedMessage.stickerMessage;
        if (!imageMessage) {
            await client.sendMessage(chatId, { 
                text: '❌ The replied message must contain an image!'
            }, { quoted: message });
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: message.key } 
            });
            return;
        }

        const processingMsg = await client.sendMessage(chatId, {
            text: '🔄 *Updating profile picture...*'
        }, { quoted: message });

        // Create tmp directory if it doesn't exist
        const tmpDir = path.join(process.cwd(), 'tmp');
        if (!fs.existsSync(tmpDir)) {
            fs.mkdirSync(tmpDir, { recursive: true });
        }

        // Download the image
        const stream = await downloadContentFromMessage(imageMessage, 'image');
        let buffer = Buffer.from([]);
        
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        const imagePath = path.join(tmpDir, `profile_${Date.now()}.jpg`);
        
        // Save the image
        fs.writeFileSync(imagePath, buffer);

        // Set the profile picture
        await client.updateProfilePicture(client.user.id, { url: imagePath });

        // Clean up the temporary file
        fs.unlinkSync(imagePath);
        
        // Delete processing message
        await client.sendMessage(chatId, { delete: processingMsg.key });

        await client.sendMessage(chatId, { 
            text: '🤯 *Successfully updated your profile picture!*'
        }, { quoted: message });

        // Success reaction
        await client.sendMessage(chatId, { 
            react: { text: '✅', key: message.key } 
        });

    } catch (error) {
        console.error('Error in setpp command:', error);
        await client.sendMessage(chatId, { 
            text: '❌ Failed to update profile picture!'
        }, { quoted: message });
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: message.key } 
        });
    }
}

module.exports = setppCommand;