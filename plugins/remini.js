const fetch = require('node-fetch');
const FormData = require('form-data');

async function uploadToCatbox(buffer) {
    const form = new FormData();
    form.append('reqtype', 'fileupload');
    form.append('fileToUpload', buffer, { filename: 'image.png' });

    const response = await fetch('https://catbox.moe/user/api.php', {
        method: 'POST',
        body: form,
        headers: form.getHeaders(),
    });

    const text = await response.text();
    if (!text.includes('catbox')) {
        throw new Error('upload failed');
    }

    return text.trim();
}

const reminiCommand = async (client, chatId, m, args, sender, pushName, isOwner) => {
    try {
        const text = args.join(' ').trim();

        // Check if there's an image to process
        if (!text && !m.quoted && !(m.mtype === 'imageMessage')) {
            return await client.sendMessage(chatId, { 
                text: `📸 *IMAGE ENHANCER*\n\nPlease provide an image to enhance.\n\nExample: .remini (reply to an image)\nExample: .remini https://image.com/photo.jpg` 
            }, { quoted: m });
        }

        let imageUrl = text;

        // Handle replied image
        if ((!text || text === '.remini') && m.quoted && m.quoted.mtype === 'imageMessage') {
            try {
                const buffer = await client.downloadMediaMessage(m.quoted);
                imageUrl = await uploadToCatbox(buffer);
            } catch (uploadError) {
                console.error(`Upload failed: ${uploadError.message}`);
                return await client.sendMessage(chatId, { 
                    text: `❌ Failed to upload image. Please try again.` 
                }, { quoted: m });
            }
        }

        // Handle direct image message
        if (m.mtype === 'imageMessage') {
            try {
                const buffer = await client.downloadMediaMessage(m);
                imageUrl = await uploadToCatbox(buffer);
            } catch (uploadError) {
                console.error(`Upload failed: ${uploadError.message}`);
                return await client.sendMessage(chatId, { 
                    text: `❌ Failed to upload image. Please try again.` 
                }, { quoted: m });
            }
        }

        if (!imageUrl || imageUrl === '.remini') {
            return await client.sendMessage(chatId, { 
                text: `❌ No valid image found. Please provide an image URL or reply to an image.` 
            }, { quoted: m });
        }

        // Send loading reaction
        await client.sendMessage(chatId, { 
            react: { text: '⌛', key: m.key } 
        });

        // Send processing message
        const processingMsg = await client.sendMessage(chatId, {
            text: `📸 *IMAGE ENHANCER*\n\nEnhancing your image...\nPlease wait.`
        }, { quoted: m });

        const encodedUrl = encodeURIComponent(imageUrl);
        const apiUrl = `https://api.nekolabs.web.id/tools/upscale/ihancer?imageUrl=${encodedUrl}&size=medium`;

        const response = await fetch(apiUrl);
        const result = await response.json();

        if (!result.success || !result.result) {
            throw new Error('API returned error');
        }

        const imageResponse = await fetch(result.result);
        const imageBuffer = await imageResponse.buffer();

        if (!imageBuffer || imageBuffer.length < 1000) {
            throw new Error('API did not return an image');
        }

        // Delete processing message
        await client.sendMessage(chatId, { 
            delete: processingMsg.key 
        });

        // Success reaction
        await client.sendMessage(chatId, { 
            react: { text: '✅', key: m.key } 
        });

        // Send enhanced image
        await client.sendMessage(
            chatId,
            {
                image: imageBuffer,
                caption: `📸 *IMAGE ENHANCER*\n\n✅ Image enhanced successfully!\n\n─ MAD-MAX BOT`
            },
            { quoted: m }
        );

    } catch (error) {
        console.error(`Error in remini: ${error.message}`);
        
        // Error reaction
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: m.key } 
        });
        
        await client.sendMessage(chatId, { 
            text: `❌ *Enhancement failed*\n\nError: ${error.message}` 
        }, { quoted: m });
    }
};

module.exports = {
    reminiCommand
};