const axios = require('axios');

// Try multiple APIs in case one fails
const APIs = [
    {
        name: 'API 1',
        url: 'https://www.tikwm.com/api/',
        parseResponse: (data) => {
            if (data.data && data.data.music) {
                return {
                    title: data.data.music_info?.title || data.data.title || 'TikTok Audio',
                    audioUrl: data.data.music,
                    videoUrl: data.data.play,
                    author: data.data.author?.unique_id || 'unknown'
                };
            }
            return null;
        }
    },
    {
        name: 'API 2',
        url: 'https://api.tikmate.io/api/tiktok',
        parseResponse: (data) => {
            if (data.audio_url) {
                return {
                    title: data.title || 'TikTok Audio',
                    audioUrl: data.audio_url,
                    videoUrl: data.video_url,
                    author: data.author || 'unknown'
                };
            }
            return null;
        }
    },
    {
        name: 'API 3',
        url: 'https://api.nikosanka.xyz/api/tiktok',
        parseResponse: (data) => {
            if (data.audio) {
                return {
                    title: data.title || 'TikTok Audio',
                    audioUrl: data.audio,
                    videoUrl: data.video,
                    author: data.author || 'unknown'
                };
            }
            return null;
        }
    }
];

const tiktokaudioCommand = async (client, chatId, m, args, sender, pushName, isOwner) => {
    try {
        // Check if URL is provided
        const url = args.join(' ').trim();
        
        if (!url) {
            return await client.sendMessage(chatId, { 
                text: `🎵 *TIKTOK AUDIO DOWNLOADER*\n\nPlease provide a TikTok video URL.\n\nExample: .tiktokaudio https://vm.tiktok.com/xxxxxx` 
            }, { quoted: m });
        }

        // Validate URL
        if (!url.includes('tiktok.com')) {
            return await client.sendMessage(chatId, { 
                text: `❌ Invalid TikTok URL. Please provide a valid TikTok video link.` 
            }, { quoted: m });
        }

        // Send loading reaction
        await client.sendMessage(chatId, { 
            react: { text: '🎵', key: m.key } 
        });

        // Send processing message
        const processingMsg = await client.sendMessage(chatId, {
            text: `🎵 *TIKTOK AUDIO DOWNLOADER*\n\nFetching audio...\n\nPlease wait.`
        }, { quoted: m });

        let result = null;
        let lastError = null;

        // Try each API until one works
        for (const api of APIs) {
            try {
                console.log(`Trying ${api.name}...`);
                
                const response = await axios.get(api.url, {
                    params: { url: url },
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                        'Accept': 'application/json'
                    },
                    timeout: 10000
                });

                if (response.data) {
                    result = api.parseResponse(response.data);
                    if (result && result.audioUrl) {
                        console.log(`✅ Success with ${api.name}`);
                        break;
                    }
                }
            } catch (err) {
                console.log(`${api.name} failed:`, err.message);
                lastError = err;
            }
        }

        // Delete processing message
        await client.sendMessage(chatId, { delete: processingMsg.key });

        if (!result || !result.audioUrl) {
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: m.key } 
            });
            
            return await client.sendMessage(chatId, { 
                text: `🎵 *TIKTOK AUDIO DOWNLOADER*\n\n❌ Failed to fetch audio.\n\nThe API might be temporarily down. Please try again later.\n\nError: ${lastError?.message || 'Unknown error'}`
            }, { quoted: m });
        }

        // Prepare caption
        const caption = `🎵 *TIKTOK AUDIO DOWNLOADER*\n\n` +
            `*Title:* ${result.title || 'Unknown'}\n` +
            `*Author:* @${result.author || 'unknown'}\n` +
            `\n_Powered by MAD-MAX_`;

        // Send the audio
        await client.sendMessage(chatId, {
            audio: { url: result.audioUrl },
            mimetype: 'audio/mpeg',
            fileName: `${result.title || 'tiktok'}.mp3`,
            caption: caption
        }, { quoted: m });

        // Success reaction
        await client.sendMessage(chatId, { 
            react: { text: '✅', key: m.key } 
        });

    } catch (error) {
        console.error('TikTok audio error:', error);
        
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: m.key } 
        });

        await client.sendMessage(chatId, {
            text: `🎵 *TIKTOK AUDIO DOWNLOADER*\n\n❌ An error occurred.\n\nError: ${error.message}`
        }, { quoted: m });
    }
};

module.exports = {
    tiktokaudioCommand
};