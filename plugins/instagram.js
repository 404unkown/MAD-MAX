const axios = require('axios');

module.exports = async (client, chatId, m, args, sender, pushName, isOwner) => {
    const url = args.join(' ');
    
    if (!url) {
        await client.sendMessage(chatId, { 
            text: '📸 *Please provide an Instagram link!*\n\nExample: `.ig https://www.instagram.com/reel/xxxx`' 
        }, { quoted: m });
        return;
    }
    
    if (!url.includes('instagram.com')) {
        await client.sendMessage(chatId, { 
            text: '❌ That is not a valid Instagram link!' 
        }, { quoted: m });
        return;
    }

    await client.sendMessage(chatId, {
        react: { text: '⏳', key: m.key }
    });

    try {
        const response = await axios.get(`https://api.dreaded.site/api/instagram?url=${encodeURIComponent(url)}`);
        
        if (!response.data?.result?.url) {
            await client.sendMessage(chatId, { 
                text: '❌ Failed to download. The post might be private or unavailable.' 
            }, { quoted: m });
            return;
        }

        const media = response.data.result;
        
        if (media.type === 'video') {
            await client.sendMessage(chatId, {
                video: { url: media.url },
                caption: `📸 *Instagram ${media.isReel ? 'Reel' : 'Video'}*\n\n👤 *Author:* ${media.author || 'Unknown'}\n📝 *Caption:* ${media.caption || 'No caption'}\n\n⬇️ Downloaded by MAD-MAX`,
                gifPlayback: false
            }, { quoted: m });
        } else {
            await client.sendMessage(chatId, {
                image: { url: media.url },
                caption: `📸 *Instagram Post*\n\n👤 *Author:* ${media.author || 'Unknown'}\n📝 *Caption:* ${media.caption || 'No caption'}\n\n⬇️ Downloaded by MAD-MAX`
            }, { quoted: m });
        }

    } catch (error) {
        console.error('[INSTAGRAM] Error:', error);
        await client.sendMessage(chatId, { 
            text: `❌ Error: ${error.message}` 
        }, { quoted: m });
        await client.sendMessage(chatId, {
            react: { text: '❌', key: m.key }
        });
    }
};