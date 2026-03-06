const axios = require('axios');

module.exports = async (client, chatId, m, args, sender, pushName, isOwner) => {
    const text = args.join(' ');
    
    if (!text) {
        await client.sendMessage(chatId, { 
            text: '? *Please provide a TikTok video link!*' 
        }, { quoted: m });
        return;
    }
    
    if (!text.includes("tiktok.com")) {
        await client.sendMessage(chatId, { 
            text: '? *That is not a valid TikTok link!*' 
        }, { quoted: m });
        return;
    }

    // Send reaction
    await client.sendMessage(chatId, {
        react: { text: '??', key: m.key }
    });

    try {
        const response = await axios.get(`https://api.bk9.dev/download/tiktok?url=${encodeURIComponent(text)}`);

        if (response.data.status && response.data.BK9) {
            const videoUrl = response.data.BK9.BK9;
            const description = response.data.BK9.desc || 'No description';
            const nickname = response.data.BK9.nickname || 'Unknown';

            await client.sendMessage(chatId, {
                text: `? *Downloading TikTok video...*\n\n? *Author:* ${nickname}\n? *Caption:* ${description}`
            }, { quoted: m });

            await client.sendMessage(chatId, {
                video: { url: videoUrl },
                caption: `?? *TikTok Downloader*\n\n?? *Author:* ${nickname}\n? *Music:* ${response.data.BK9.music_info?.title || 'Unknown'}\n?? *Likes:* ${response.data.BK9.likes_count || 0}\n? *Comments:* ${response.data.BK9.comment_count || 0}\n\n? Downloaded by MAD-MAX`,
                gifPlayback: false
            }, { quoted: m });

        } else {
            await client.sendMessage(chatId, { 
                text: '? Failed to retrieve video from the provided link.' 
            }, { quoted: m });
        }

    } catch (e) {
        console.error('[TIKTOK] Error:', e);
        await client.sendMessage(chatId, { 
            text: `? An error occurred during download: ${e.message}` 
        }, { quoted: m });
    }
};