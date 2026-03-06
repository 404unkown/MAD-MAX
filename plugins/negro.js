const axios = require('axios');

const negroCommand = async (client, chatId, m, args, sender, pushName, isOwner) => {
    try {
        // Send loading reaction
        await client.sendMessage(chatId, { 
            react: { text: '🎨', key: m.key } 
        });

        // Check if there's a quoted message
        if (!m.quoted) {
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: m.key } 
            });
            return await client.sendMessage(chatId, {
                text: `🖤 *BLACK FILTER*\n\nPlease quote an image to apply the black filter.\n\nExample: Reply to an image with .negro`
            }, { quoted: m });
        }

        const quoted = m.quoted;
        const mime = (quoted.msg || quoted).mimetype || '';

        // Check if it's an image
        if (!/image/.test(mime)) {
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: m.key } 
            });
            return await client.sendMessage(chatId, {
                text: `🖤 *BLACK FILTER*\n\nThat's not an image. Please quote an image file.`
            }, { quoted: m });
        }

        // Send processing message
        const processingMsg = await client.sendMessage(chatId, {
            text: `🖤 *BLACK FILTER*\n\nHold on a moment, applying the black filter to your image...`
        }, { quoted: m });

        // Download the image
        const buffer = await quoted.download();
        
        if (!buffer) {
            await client.sendMessage(chatId, { delete: processingMsg.key });
            throw new Error('Failed to download image');
        }

        // Check file size (10MB limit)
        if (buffer.length > 10 * 1024 * 1024) {
            await client.sendMessage(chatId, { delete: processingMsg.key });
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: m.key } 
            });
            return await client.sendMessage(chatId, {
                text: `❌ Image exceeds 10MB limit. Please use a smaller image.`
            }, { quoted: m });
        }

        const base64Image = buffer.toString('base64');

        try {
            const response = await axios.post("https://negro.consulting/api/process-image", {
                filter: "hitam",
                imageData: "data:image/png;base64," + base64Image
            }, {
                timeout: 30000
            });

            if (!response.data || !response.data.processedImageUrl) {
                throw new Error('Invalid API response');
            }

            const resultBuffer = Buffer.from(
                response.data.processedImageUrl.replace("data:image/png;base64,", ""),
                "base64"
            );

            // Delete processing message
            await client.sendMessage(chatId, { delete: processingMsg.key });

            // Success reaction
            await client.sendMessage(chatId, { 
                react: { text: '✅', key: m.key } 
            });

            // Send the filtered image
            await client.sendMessage(chatId, {
                image: resultBuffer,
                caption: `🖤 *BLACK FILTER*\n\n✅ Done! Your image now has the black filter applied.\n\n─ MAD-MAX BOT`
            }, { quoted: m });

        } catch (apiError) {
            console.error("API Error while processing image:", apiError);
            
            await client.sendMessage(chatId, { delete: processingMsg.key });
            
            const errorMessage = apiError.message || 'An error occurred while processing the image.';
            
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: m.key } 
            });
            
            await client.sendMessage(chatId, {
                text: `🖤 *BLACK FILTER*\n\n❌ Error: ${errorMessage}`
            }, { quoted: m });
        }

    } catch (error) {
        console.error('Negro command error:', error);

        // Error reaction
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: m.key } 
        });

        await client.sendMessage(chatId, {
            text: `🖤 *BLACK FILTER*\n\n❌ An error occurred: ${error.message}`
        }, { quoted: m });
    }
};

module.exports = {
    negroCommand
};