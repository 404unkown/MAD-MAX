const axios = require('axios');
const FormData = require('form-data');

async function uploadToCatbox(buffer) {
    const form = new FormData();
    form.append('reqtype', 'fileupload');
    form.append('fileToUpload', buffer, { filename: 'image.png' });

    const response = await axios.post('https://catbox.moe/user/api.php', form, {
        headers: form.getHeaders(),
    });

    if (!response.data || !response.data.includes('catbox')) {
        throw new Error('Upload process failed');
    }

    return response.data;
}

const rmbgCommand = async (client, chatId, m, args, sender, pushName, isOwner) => {
    try {
        // Send loading reaction
        await client.sendMessage(chatId, { 
            react: { text: '⌛', key: m.key } 
        });

        // Check if there's a quoted message
        if (!m.quoted) {
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: m.key } 
            });
            return await client.sendMessage(chatId, {
                text: `🖼️ *REMOVE BACKGROUND*\n\nPlease quote an image to remove its background.\n\nExample: Reply to an image with .rmbg`
            }, { quoted: m });
        }

        const quoted = m.quoted ? m.quoted : m;
        const mime = (quoted.msg || quoted).mimetype || '';

        // Check if it's an image
        if (!/image/.test(mime)) {
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: m.key } 
            });
            return await client.sendMessage(chatId, {
                text: `🖼️ *REMOVE BACKGROUND*\n\nThat's not an image. Please quote an image file.`
            }, { quoted: m });
        }

        // Send processing message
        const loadingMsg = await client.sendMessage(chatId, {
            text: `🖼️ *REMOVE BACKGROUND*\n\nRemoving background... This might take a moment.`
        }, { quoted: m });

        try {
            // Download the image
            const media = await quoted.download();
            
            if (!media) {
                await client.sendMessage(chatId, { delete: loadingMsg.key });
                await client.sendMessage(chatId, { 
                    react: { text: '❌', key: m.key } 
                });
                return await client.sendMessage(chatId, {
                    text: `❌ Failed to download the image.`
                }, { quoted: m });
            }

            // Check file size (10MB limit)
            if (media.length > 10 * 1024 * 1024) {
                await client.sendMessage(chatId, { delete: loadingMsg.key });
                await client.sendMessage(chatId, { 
                    react: { text: '❌', key: m.key } 
                });
                return await client.sendMessage(chatId, {
                    text: `❌ Image exceeds 10MB limit. Please use a smaller image.`
                }, { quoted: m });
            }

            // Upload to Catbox
            const imageUrl = await uploadToCatbox(media);
            const encodedUrl = encodeURIComponent(imageUrl);
            const rmbgApiUrl = `https://api.ootaizumi.web.id/tools/rmbg?imageUrl=${encodedUrl}`;

            // Update loading message
            await client.sendMessage(chatId, {
                edit: loadingMsg.key,
                text: `🖼️ *REMOVE BACKGROUND*\n\nProcessing image with AI... This may take 30-60 seconds.`
            });

            const response = await axios.get(rmbgApiUrl, {
                headers: { 
                    'accept': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                },
                timeout: 60000
            });

            if (!response.data.status || !response.data.result) {
                throw new Error('AI failed to process your image');
            }

            const transparentImageUrl = response.data.result;
            const transparentResponse = await axios.get(transparentImageUrl, {
                responseType: 'arraybuffer',
                timeout: 30000
            });

            const transparentImage = Buffer.from(transparentResponse.data);

            // Delete loading message
            await client.sendMessage(chatId, { delete: loadingMsg.key });

            // Success reaction
            await client.sendMessage(chatId, { 
                react: { text: '✅', key: m.key } 
            });

            // Send the transparent image
            await client.sendMessage(
                chatId,
                { 
                    image: transparentImage, 
                    caption: `🖼️ *REMOVE BACKGROUND*\n\n✅ Background successfully removed!\n\n─ MAD-MAX BOT`
                },
                { quoted: m }
            );

            // Also send as PNG document if it's a PNG
            if (transparentResponse.headers['content-type']?.includes('png')) {
                await client.sendMessage(
                    chatId,
                    {
                        document: transparentImage,
                        mimetype: 'image/png',
                        fileName: `transparent_bg_${Date.now()}.png`,
                        caption: `📄 *PNG VERSION*\n\nHigher quality transparent image.\n\n─ MAD-MAX BOT`
                    },
                    { quoted: m }
                );
            }

        } catch (err) {
            console.error('rmbg error:', err);

            // Try to delete loading message
            try {
                await client.sendMessage(chatId, { delete: loadingMsg.key });
            } catch (e) {}

            // Error reaction
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: m.key } 
            });

            let errorMessage = 'An unexpected error occurred';

            if (err.message.includes('timeout')) {
                errorMessage = 'Processing took too long. Your image might be too complex or the server is busy.';
            } else if (err.message.includes('Network Error')) {
                errorMessage = 'Network connection failed. Please check your internet.';
            } else if (err.message.includes('Upload process failed')) {
                errorMessage = 'Failed to upload image for processing.';
            } else if (err.message.includes('AI failed to process')) {
                errorMessage = 'The AI could not process this image. Try a clearer image.';
            } else if (err.message.includes('ENOTFOUND')) {
                errorMessage = 'Cannot connect to the background removal service.';
            } else {
                errorMessage = err.message;
            }

            await client.sendMessage(chatId, {
                text: `🖼️ *REMOVE BACKGROUND*\n\n❌ Background removal failed.\n\n*Error:* ${errorMessage}\n\n*Tips:*\n• Use clear, high-contrast images\n• Ensure subject has defined edges\n• Try a simpler composition\n• Check your internet connection`
            }, { quoted: m });
        }

    } catch (error) {
        console.error('rmbg command error:', error);

        // Error reaction
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: m.key } 
        });

        await client.sendMessage(chatId, {
            text: `🖼️ *REMOVE BACKGROUND*\n\n❌ An error occurred: ${error.message}`
        }, { quoted: m });
    }
};

module.exports = {
    rmbgCommand
};