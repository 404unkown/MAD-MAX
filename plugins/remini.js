const axios = require('axios');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { uploadImage } = require('../lib/uploadImage');

async function getQuotedOrOwnImageUrl(client, message) {
    try {
        // 1) Quoted image (highest priority)
        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (quoted?.imageMessage) {
            const stream = await downloadContentFromMessage(quoted.imageMessage, 'image');
            const chunks = [];
            for await (const chunk of stream) chunks.push(chunk);
            const buffer = Buffer.concat(chunks);
            return await uploadImage(buffer);
        }

        // 2) Image in the current message
        if (message.message?.imageMessage) {
            const stream = await downloadContentFromMessage(message.message.imageMessage, 'image');
            const chunks = [];
            for await (const chunk of stream) chunks.push(chunk);
            const buffer = Buffer.concat(chunks);
            return await uploadImage(buffer);
        }

        return null;
    } catch (error) {
        console.error('Error getting image:', error);
        return null;
    }
}

// Helper function to validate URL
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

async function reminiCommand(client, chatId, message, args, sender, pushName, isOwnerSimple) {
    try {
        let imageUrl = null;
        
        // Check if args contain a URL
        if (args.length > 0) {
            const url = args.join(' ');
            if (isValidUrl(url)) {
                imageUrl = url;
            } else {
                await client.sendMessage(chatId, { 
                    text: '❌ *Remini AI Enhancement*\n\nInvalid URL provided.\n\n*Usage:*\n• `.remini <image_url>`\n• Reply to an image with `.remini`\n• Send image with `.remini`\n\n*Example:* `.remini https://example.com/image.jpg`' 
                }, { quoted: message });
                return;
            }
        } else {
            // Try to get image from message or quoted message
            imageUrl = await getQuotedOrOwnImageUrl(client, message);
            
            if (!imageUrl) {
                await client.sendMessage(chatId, { 
                    text: '📸 *Remini AI Enhancement Command*\n\n*Usage:*\n• `.remini <image_url>`\n• Reply to an image with `.remini`\n• Send image with `.remini`\n\n*Example:* `.remini https://example.com/image.jpg`' 
                }, { quoted: message });
                return;
            }
        }

        // Send processing reaction
        await client.sendMessage(chatId, { 
            react: { text: '🎨', key: message.key } 
        });

        const processingMsg = await client.sendMessage(chatId, {
            text: '🎨 *Enhancing image with AI...*\n\nThis may take 30-60 seconds.'
        }, { quoted: message });

        // Call the Remini API
        const apiUrl = `https://api.princetechn.com/api/tools/remini?apikey=prince_tech_api_azfsbshfb&url=${encodeURIComponent(imageUrl)}`;
        
        const response = await axios.get(apiUrl, {
            timeout: 60000, // 60 second timeout (AI processing takes longer)
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        if (response.data && response.data.success && response.data.result) {
            const result = response.data.result;
            
            if (result.image_url) {
                // Download the enhanced image
                const imageResponse = await axios.get(result.image_url, {
                    responseType: 'arraybuffer',
                    timeout: 30000
                });
                
                if (imageResponse.status === 200 && imageResponse.data) {
                    // Delete processing message
                    await client.sendMessage(chatId, { delete: processingMsg.key });
                    
                    // Send the enhanced image
                    await client.sendMessage(chatId, {
                        image: imageResponse.data,
                        caption: `✨ *Image enhanced successfully!*\n\n𝗘𝗡𝗛𝗔𝗡𝗖𝗘𝗗 𝗕𝗬 MAD-MAX\n👤 *Requested by:* @${sender.split('@')[0]}`,
                        mentions: [sender]
                    }, { quoted: message });

                    // Success reaction
                    await client.sendMessage(chatId, { 
                        react: { text: '✅', key: message.key } 
                    });
                } else {
                    throw new Error('Failed to download enhanced image');
                }
            } else {
                throw new Error(result.message || 'Failed to enhance image');
            }
        } else {
            throw new Error('API returned invalid response');
        }

    } catch (error) {
        console.error('Remini Error:', error.message);
        
        let errorMessage = '❌ Failed to enhance image.';
        
        if (error.response?.status === 429) {
            errorMessage = '⏰ Rate limit exceeded. Please try again later.';
        } else if (error.response?.status === 400) {
            errorMessage = '❌ Invalid image URL or format.';
        } else if (error.response?.status === 500) {
            errorMessage = '🔧 Server error. Please try again later.';
        } else if (error.code === 'ECONNABORTED') {
            errorMessage = '⏰ Request timeout. Please try again.';
        } else if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
            errorMessage = '🌐 Network error. Please check your connection.';
        } else if (error.message.includes('Error processing image')) {
            errorMessage = '❌ Image processing failed. Please try with a different image.';
        }
        
        await client.sendMessage(chatId, { 
            text: errorMessage 
        }, { quoted: message });
        
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: message.key } 
        });
    }
}

module.exports = reminiCommand;