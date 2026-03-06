const axios = require('axios');
const FormData = require('form-data');
const crypto = require('crypto');

function generateToken(secretKey) {
    const timestamp = Date.now().toString();
    const hmac = crypto.createHmac('sha256', secretKey);
    hmac.update(timestamp);
    const token = hmac.digest('hex');

    return {
        'x-timestamp': timestamp,
        'x-token': token
    };
}

async function transcribeWithTalknotes(buffer) {
    try {
        const form = new FormData();
        form.append('file', buffer, {
            filename: 'audio.mp3',
            contentType: 'audio/mpeg'
        });

        const tokenData = generateToken('w0erw90wr3rnhwoi3rwe98sdfihqio432033we8rhoeiw');

        const headers = {
            ...form.getHeaders(),
            ...tokenData,
            'referer': 'https://talknotes.io/',
            'origin': 'https://talknotes.io',
            'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36',
        };

        const { data } = await axios.post('https://api.talknotes.io/tools/converter', form, { headers });

        return data;
    } catch (err) {
        console.error('Talknotes error:', err.message);
        return null;
    }
}

const transcribeCommand = async (client, chatId, m, args, sender, pushName, isOwner) => {
    try {
        const quoted = m.quoted || m;
        const mime = (quoted.msg || quoted).mimetype || '';

        if (!/audio|video/.test(mime)) {
            return await client.sendMessage(chatId, { 
                text: '🎤 *AUDIO TRANSCRIBER*\n\nPlease reply to an audio or video file with the caption: _.transcribe_\n\nExample: Reply to a voice note with `.transcribe`' 
            }, { quoted: m });
        }

        // Send processing message
        await client.sendMessage(chatId, { 
            text: '🔄 *Processing audio...*\n\nPlease wait while I transcribe your file.' 
        }, { quoted: m });

        // Send loading reaction
        await client.sendMessage(chatId, {
            react: { text: '⏳', key: m.key }
        });

        // Check if quoted message exists
        if (!m.quoted) {
            return await client.sendMessage(chatId, { 
                text: '❌ Please reply to an audio or video file.' 
            }, { quoted: m });
        }

        const buffer = await m.quoted.download();

        if (buffer.length > 5 * 1024 * 1024) {
            await client.sendMessage(chatId, {
                react: { text: '❌', key: m.key }
            });
            return await client.sendMessage(chatId, { 
                text: '❌ *File too large!*\n\nMaximum file size is 5 MB.' 
            }, { quoted: m });
        }

        const result = await transcribeWithTalknotes(buffer);

        if (!result || !result.text) {
            await client.sendMessage(chatId, {
                react: { text: '❌', key: m.key }
            });
            return await client.sendMessage(chatId, { 
                text: '❌ Failed to extract text. Please try again later.' 
            }, { quoted: m });
        }

        // Success reaction
        await client.sendMessage(chatId, {
            react: { text: '✅', key: m.key }
        });

        // Format the response
        const responseText = `🎤 *TRANSCRIPTION RESULT*\n\n${result.text}\n\n─ MAD-MAX BOT`;

        // Check if response is too long
        if (responseText.length > 4000) {
            const chunks = result.text.match(/(.|[\r\n]){1,3500}/g) || [];
            
            await client.sendMessage(chatId, { 
                text: `🎤 *TRANSCRIPTION RESULT (Part 1/${chunks.length})*\n\n${chunks[0]}\n\n─ MAD-MAX BOT`
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
        console.error('Transcribe error:', error);
        
        // Error reaction
        await client.sendMessage(chatId, {
            react: { text: '❌', key: m.key }
        });
        
        await client.sendMessage(chatId, { 
            text: `❌ *An error occurred while processing the file.*\n\nError: ${error.message}` 
        }, { quoted: m });
    }
};

module.exports = {
    transcribeCommand
};