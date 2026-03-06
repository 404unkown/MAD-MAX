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
        throw new Error('upload failed');
    }

    return response.data.trim();
}

const imagetopromptCommand = async (client, chatId, m, args, sender, pushName, isOwner) => {
    try {
        const text = args.join(' ').trim();
        const prompt = text || "describe this image";

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
                text: `📸 *IMAGE ANALYSIS*\n\nPlease quote an image first.\n\nExample: Reply to an image with .imagetoprompt`
            }, { quoted: m });
        }

        const q = m.quoted || m;
        const mime = (q.msg || q).mimetype || "";

        if (!mime.startsWith("image/")) {
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: m.key } 
            });
            return await client.sendMessage(chatId, {
                text: `📸 *IMAGE ANALYSIS*\n\nThat's not an image.\nPlease reply to an image file.`
            }, { quoted: m });
        }

        // Send processing message
        const processingMsg = await client.sendMessage(chatId, {
            text: `📸 *IMAGE ANALYSIS*\n\nPrompt: ${prompt}\nStatus: Uploading and processing...\n\nPlease wait.`
        }, { quoted: m });

        const mediaBuffer = await q.download();
        const uploadedURL = await uploadToCatbox(mediaBuffer);

        // Update processing message
        await client.sendMessage(chatId, {
            edit: processingMsg.key,
            text: `📸 *IMAGE ANALYSIS*\n\nPrompt: ${prompt}\nStatus: Analyzing with AI...\n\nPlease wait.`
        });

        const api = `https://api.deline.web.id/ai/toprompt?url=${encodeURIComponent(uploadedURL)}`;
        const result = await axios.get(api);

        if (!result.data?.status || !result.data?.result?.original) {
            throw new Error('api returned invalid response');
        }

        const originalText = result.data.result.original;

        // Delete processing message
        await client.sendMessage(chatId, { 
            delete: processingMsg.key 
        });

        // Success reaction
        await client.sendMessage(chatId, { 
            react: { text: '✅', key: m.key } 
        });

        // Format the response
        const responseText = `📸 *IMAGE ANALYSIS RESULT*\n\n*Prompt:* ${prompt}\n\n*Analysis:*\n${originalText}\n\n─ MAD-MAX BOT`;

        // Check if response is too long
        if (responseText.length > 4000) {
            const chunks = originalText.match(/(.|[\r\n]){1,3500}/g) || [];
            
            await client.sendMessage(chatId, { 
                text: `📸 *IMAGE ANALYSIS RESULT (Part 1/${chunks.length})*\n\n*Prompt:* ${prompt}\n\n${chunks[0]}\n\n─ MAD-MAX BOT`
            }, { quoted: m });

            for (let i = 1; i < chunks.length; i++) {
                await client.sendMessage(chatId, { 
                    text: `*Part ${i+1}/${chunks.length}:*\n\n${chunks[i]}`
                });
                
                // Small delay between chunks
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        } else {
            await client.sendMessage(chatId, { 
                text: responseText
            }, { quoted: m });
        }

    } catch (error) {
        console.error('Image analysis error:', error);
        
        // Error reaction
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: m.key } 
        });
        
        let errorMessage = 'Analysis failed';
        if (error.message.includes('upload failed')) errorMessage = 'Upload failed';
        if (error.message.includes('invalid response')) errorMessage = 'API returned invalid response';
        
        await client.sendMessage(chatId, {
            text: `📸 *IMAGE ANALYSIS*\n\n❌ ${errorMessage}\n\nError: ${error.message}`
        }, { quoted: m });
    }
};

module.exports = {
    imagetopromptCommand
};