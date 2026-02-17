const axios = require("axios");
const FormData = require('form-data');
const fs = require('fs');
const path = require("path");
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

async function wantedCommand(client, chatId, message, args, sender, pushName, isOwner) {
    try {
        const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        
        if (!quotedMsg) {
            await client.sendMessage(chatId, {
                text: "📸 *Wanted Poster Maker*\n\nPlease reply to an image to create a 'Wanted' poster\n\n*Example:* .wanted (reply to photo)"
            }, { quoted: message });
            return;
        }

        const isImage = !!quotedMsg.imageMessage;
        
        if (!isImage) {
            await client.sendMessage(chatId, {
                text: "❌ Please reply to an image file (JPEG/PNG)"
            }, { quoted: message });
            return;
        }

        // Send processing reaction
        await client.sendMessage(chatId, { 
            react: { text: '⏳', key: message.key } 
        });

        // Download the image
        const media = quotedMsg.imageMessage;
        const stream = await downloadContentFromMessage(media, 'image');
        const chunks = [];
        for await (const chunk of stream) {
            chunks.push(chunk);
        }
        const imageBuffer = Buffer.concat(chunks);

        // Create wanted poster
        const wantedBuffer = await createWantedPoster(imageBuffer);

        // Send the result
        await client.sendMessage(chatId, {
            image: wantedBuffer,
            caption: `🔫 *WANTED*\n\n_Requested by: ${pushName}_`
        }, { quoted: message });

        // Success reaction
        await client.sendMessage(chatId, { 
            react: { text: '✅', key: message.key } 
        });

    } catch (error) {
        console.error('Wanted poster error:', error);
        
        let errorMsg = "❌ Failed to create wanted poster.";
        if (error.message.includes("upload")) {
            errorMsg = "❌ Image upload failed. Please try with a smaller image.";
        } else if (error.message.includes("API")) {
            errorMsg = "❌ API service unavailable. Please try again later.";
        }

        await client.sendMessage(chatId, {
            text: errorMsg
        }, { quoted: message });

        await client.sendMessage(chatId, { 
            react: { text: '❌', key: message.key } 
        });
    }
}

// Function to create wanted poster using API
async function createWantedPoster(imageBuffer) {
    try {
        // First, upload image to a temporary hosting service
        const imageUrl = await uploadImage(imageBuffer);
        
        // Use PopCat API to create wanted poster
        const apiUrl = `https://api.popcat.xyz/v2/wanted?image=${encodeURIComponent(imageUrl)}`;
        const response = await axios.get(apiUrl, { 
            responseType: "arraybuffer",
            timeout: 30000
        });

        if (!response.data) {
            throw new Error("API returned empty response");
        }

        return Buffer.from(response.data);

    } catch (error) {
        console.error('Wanted API error:', error.message);
        // Fallback: return original image
        return imageBuffer;
    }
}

// Upload image to temporary hosting
async function uploadImage(buffer) {
    try {
        // Method 1: Try using Telegraph
        const form = new FormData();
        form.append('file', buffer, { filename: 'image.jpg' });
        
        const response = await axios.post('https://telegra.ph/upload', form, {
            headers: form.getHeaders(),
            timeout: 15000
        });

        if (response.data && response.data[0] && response.data[0].src) {
            return 'https://telegra.ph' + response.data[0].src;
        }
    } catch (error) {
        console.log('Telegraph upload failed, trying alternative...');
    }

    try {
        // Method 2: Base64 fallback
        const base64Image = buffer.toString('base64');
        return `data:image/jpeg;base64,${base64Image}`;
    } catch (error) {
        throw new Error("Failed to prepare image for upload");
    }
}

module.exports = wantedCommand;