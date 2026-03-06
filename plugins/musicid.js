const axios = require('axios');
const FormData = require('form-data');

const musicidCommand = async (client, chatId, m, args, sender, pushName, isOwner) => {
    try {
        // Send loading reaction
        await client.sendMessage(chatId, { 
            react: { text: '🎵', key: m.key } 
        });

        // Check if there's a quoted message
        if (!m.quoted) {
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: m.key } 
            });
            return await client.sendMessage(chatId, { 
                text: `🎵 *MUSIC RECOGNITION*\n\nPlease quote an audio or video message to identify.\n\nExample: Reply to a song with .musicid` 
            }, { quoted: m });
        }

        // Check media type
        const quoted = m.quoted;
        const mime = (quoted.msg || quoted).mimetype || '';

        if (!/audio|video/.test(mime)) {
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: m.key } 
            });
            return await client.sendMessage(chatId, { 
                text: `🎵 *MUSIC RECOGNITION*\n\nThat's not an audio or video file. Please quote an audio/video message.` 
            }, { quoted: m });
        }

        // Send processing message
        const processingMsg = await client.sendMessage(chatId, {
            text: `🎵 *MUSIC RECOGNITION*\n\nAnalyzing audio...\n\nPlease wait.`
        }, { quoted: m });

        // Download the media
        const buffer = await quoted.download();
        
        if (!buffer || buffer.length < 1000) {
            await client.sendMessage(chatId, { delete: processingMsg.key });
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: m.key } 
            });
            return await client.sendMessage(chatId, { 
                text: `❌ Failed to download audio or file too small.` 
            }, { quoted: m });
        }

        // Try AudD.io (free API with limited monthly usage)
        try {
            const form = new FormData();
            form.append('audio', buffer, { 
                filename: 'audio.mp3',
                contentType: 'audio/mpeg'
            });
            form.append('return', 'apple_music,spotify');

            // You need to get a free API key from https://audd.io/
            // Free tier: 200 requests/month
            const AUDD_API_KEY = 'your_audd_api_key_here'; // Replace with your key
            
            const response = await axios.post('https://api.audd.io/', form, {
                headers: {
                    ...form.getHeaders(),
                },
                params: {
                    api_token: AUDD_API_KEY
                },
                timeout: 30000
            });

            // Delete processing message
            await client.sendMessage(chatId, { delete: processingMsg.key });

            if (response.data && response.data.status === 'success' && response.data.result) {
                const result = response.data.result;
                
                // Format response
                let text = `🎵 *MUSIC IDENTIFIED*\n\n`;
                text += `*Title:* ${result.title || 'Unknown'}\n`;
                text += `*Artist:* ${result.artist || 'Unknown'}\n`;
                if (result.album) text += `*Album:* ${result.album}\n`;
                if (result.release_date) text += `*Release Date:* ${result.release_date}\n`;
                if (result.label) text += `*Label:* ${result.label}\n`;
                
                if (result.apple_music && result.apple_music.url) {
                    text += `\n*Apple Music:* ${result.apple_music.url}\n`;
                }
                if (result.spotify && result.spotify.external_urls && result.spotify.external_urls.spotify) {
                    text += `*Spotify:* ${result.spotify.external_urls.spotify}\n`;
                }

                text += `\n─ MAD-MAX BOT`;

                await client.sendMessage(chatId, { 
                    react: { text: '✅', key: m.key } 
                });

                return await client.sendMessage(chatId, { 
                    text: text
                }, { quoted: m });
            } else {
                throw new Error('Could not identify the song');
            }
        } catch (apiError) {
            console.error('API Error:', apiError.message);
            
            // Delete processing message
            await client.sendMessage(chatId, { delete: processingMsg.key });
            
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: m.key } 
            });

            return await client.sendMessage(chatId, {
                text: `🎵 *MUSIC RECOGNITION*\n\n❌ Could not identify the song.\n\nTry with a clearer audio clip or different part of the song.\n\nError: ${apiError.message}`
            }, { quoted: m });
        }

    } catch (error) {
        console.error('Music recognition error:', error);

        await client.sendMessage(chatId, { 
            react: { text: '❌', key: m.key } 
        });

        await client.sendMessage(chatId, {
            text: `🎵 *MUSIC RECOGNITION*\n\n❌ An error occurred.\n\nError: ${error.message}`
        }, { quoted: m });
    }
};

module.exports = {
    musicidCommand
};