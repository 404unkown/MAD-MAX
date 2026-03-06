const axios = require('axios');
const FormData = require('form-data');

async function uploadToCatbox(buffer) {
    const form = new FormData();
    form.append('reqtype', 'fileupload');
    form.append('fileToUpload', buffer, { filename: 'image.jpg' });

    const res = await axios.post(
        'https://catbox.moe/user/api.php',
        form,
        {
            headers: form.getHeaders()
        }
    );

    if (typeof res.data !== 'string') {
        throw new Error('Catbox upload failed');
    }

    return res.data.trim();
}

const img2imgCommand = async (client, chatId, m, args, sender, pushName, isOwner) => {
    try {
        const text = args.join(' ').trim();
        const prompt = text || 'make it look epic';

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
                text: `🎨 *AI IMAGE EDITOR*\n\nPlease reply to an image to edit it.\n\nExample: Reply to an image with .img2img make it look like a painting`
            }, { quoted: m });
        }

        const q = m.quoted;
        const mime = (q.msg || q).mimetype || '';

        // Check if it's an image
        if (!mime.startsWith('image/')) {
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: m.key } 
            });
            return await client.sendMessage(chatId, {
                text: `🎨 *AI IMAGE EDITOR*\n\nThat is not an image. Please reply to an image file.`
            }, { quoted: m });
        }

        // Send processing message
        const processingMsg = await client.sendMessage(chatId, {
            text: `🎨 *AI IMAGE EDITOR*\n\nEditing your image...\nPrompt: "${prompt}"\n\nPlease wait 30-60 seconds.`
        }, { quoted: m });

        // Download the image
        const mediaBuffer = await q.download();
        
        if (!mediaBuffer || !Buffer.isBuffer(mediaBuffer)) {
            await client.sendMessage(chatId, { delete: processingMsg.key });
            throw new Error('Failed to download image');
        }

        // Check file size (10MB limit)
        if (mediaBuffer.length > 10 * 1024 * 1024) {
            await client.sendMessage(chatId, { delete: processingMsg.key });
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: m.key } 
            });
            return await client.sendMessage(chatId, {
                text: `❌ Image exceeds 10MB limit. Please use a smaller image.`
            }, { quoted: m });
        }

        // Update processing message
        await client.sendMessage(chatId, {
            edit: processingMsg.key,
            text: `🎨 *AI IMAGE EDITOR*\n\nUploading image...\nPrompt: "${prompt}"`
        });

        // Upload to Catbox
        const uploadedUrl = await uploadToCatbox(mediaBuffer);

        // Update processing message
        await client.sendMessage(chatId, {
            edit: processingMsg.key,
            text: `🎨 *AI IMAGE EDITOR*\n\nProcessing with AI...\nPrompt: "${prompt}"\n\nThis may take 30-60 seconds.`
        });

        // Call the AI image editing API
        const apiUrl = `https://www.movanest.xyz/v2/img2img?image_url=${encodeURIComponent(uploadedUrl)}&prompt=${encodeURIComponent(prompt)}&your_api_key=movanest-key17WR5ISK4U`;

        const res = await axios.get(apiUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json'
            },
            timeout: 60000
        });

        if (!res.data || !res.data.results || !res.data.results.resultUrl) {
            throw new Error('Invalid API response format');
        }

        const resultUrl = res.data.results.resultUrl;

        // Download the edited image
        const imageResponse = await axios.get(resultUrl, {
            responseType: 'arraybuffer',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'image/*'
            },
            timeout: 30000
        });

        if (!imageResponse.data || imageResponse.data.length < 1000) {
            throw new Error('Edited image is empty or too small');
        }

        // Delete processing message
        await client.sendMessage(chatId, { delete: processingMsg.key });

        // Success reaction
        await client.sendMessage(chatId, { 
            react: { text: '✅', key: m.key } 
        });

        // Send the edited image
        await client.sendMessage(
            chatId,
            {
                image: Buffer.from(imageResponse.data),
                caption: `🎨 *AI IMAGE EDITOR*\n\n✅ Image edited successfully!\n\n📝 *Prompt:* "${prompt}"\n\n─ MAD-MAX BOT`
            },
            { quoted: m }
        );

    } catch (err) {
        console.error('Image edit error:', {
            message: err.message,
            status: err.response?.status,
            data: err.response?.data
        });

        // Error reaction
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: m.key } 
        });

        let errorMessage = err.message;

        if (err.message.includes('timeout')) {
            errorMessage = 'Processing took too long. Please try again with a simpler prompt.';
        } else if (err.message.includes('ENOTFOUND')) {
            errorMessage = 'Cannot connect to the AI service. Please check your internet.';
        } else if (err.message.includes('400')) {
            errorMessage = 'Invalid request. Check your prompt and try again.';
        } else if (err.message.includes('500')) {
            errorMessage = 'Server error. The AI service might be down.';
        }

        await client.sendMessage(chatId, {
            text: `🎨 *AI IMAGE EDITOR*\n\n❌ Edit failed.\n\n*Error:* ${errorMessage}`
        }, { quoted: m });
    }
};

module.exports = {
    img2imgCommand
};