const axios = require('axios');
const cheerio = require('cheerio');

async function fetchWallpapers(query) {
    const searchUrl = `https://www.uhdpaper.com/search?q=${encodeURIComponent(query)}&by-date=true`;

    const { data } = await axios.get(searchUrl, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36"
        },
        timeout: 30000
    });

    const $ = cheerio.load(data);
    const results = [];

    $('.post-outer').each((_, el) => {
        const title = $(el).find('h2').text().trim() || null;
        const resolution = $(el).find('b').text().trim() || null;
        let image = $(el).find('img').attr('data-src') || $(el).find('img').attr('src');
        if (image && image.startsWith('//')) image = 'https:' + image;
        const description = $(el).find('p').text().trim() || null;
        const link = $(el).find('a').attr('href');
        if (image) {
            results.push({ 
                title, 
                resolution, 
                image, 
                description, 
                source: 'uhdpaper.com', 
                link: link ? 'https://www.uhdpaper.com' + link : null 
            });
        }
    });

    return results;
}

const wallpaperCommand = async (client, chatId, m, args, sender, pushName, isOwner) => {
    try {
        const text = args.join(' ').trim();
        const prefix = '.'; // or get from config

        if (!text) {
            return await client.sendMessage(chatId, { 
                text: `🖼️ *WALLPAPER SEARCH*\n\nPlease provide a search query.\n\nExample: .wallpaper anime girl\nExample with count: .wallpaper anime girl, 10` 
            }, { quoted: m });
        }

        // Parse query and count
        let query, count;
        if (text.includes(',')) {
            const [q, c] = text.split(',');
            query = q.trim();
            count = parseInt(c.trim()) || 5;
        } else {
            query = text.trim();
            count = 5;
        }

        // Limit count to max 20
        if (count > 20) count = 20;

        // Send loading reaction
        await client.sendMessage(chatId, { 
            react: { text: '🖼️', key: m.key } 
        });

        // Send processing message
        const processingMsg = await client.sendMessage(chatId, {
            text: `🖼️ *WALLPAPER SEARCH*\n\nSearching for "${query}"...\n\nPlease wait.`
        }, { quoted: m });

        const results = await fetchWallpapers(query);

        // Delete processing message
        await client.sendMessage(chatId, { delete: processingMsg.key });

        if (results.length === 0) {
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: m.key } 
            });
            return await client.sendMessage(chatId, { 
                text: `🖼️ *WALLPAPER SEARCH*\n\nNo wallpapers found for "${query}". Try a different search term.` 
            }, { quoted: m });
        }

        const toSend = results.slice(0, count);

        for (let i = 0; i < toSend.length; i++) {
            const wp = toSend[i];
            const caption = `🖼️ *WALLPAPER ${i+1}/${toSend.length}*\n\n` +
                            `🔖 *Title:* ${wp.title || 'Untitled'}\n` +
                            `📐 *Resolution:* ${wp.resolution || 'Unknown'}\n` +
                            `📝 *Description:* ${wp.description || 'No description'}\n` +
                            `🔗 *Source:* ${wp.link || 'N/A'}\n\n` +
                            `─ MAD-MAX BOT`;

            await client.sendMessage(chatId, {
                image: { url: wp.image },
                caption: caption
            }, { quoted: m });

            // Add delay between images to avoid rate limiting
            if (i < toSend.length - 1) await new Promise(res => setTimeout(res, 1500));
        }

        // Success reaction
        await client.sendMessage(chatId, { 
            react: { text: '✅', key: m.key } 
        });

        // Send summary
        await client.sendMessage(chatId, { 
            text: `🖼️ *WALLPAPER SEARCH*\n\n✅ Found ${results.length} wallpapers for "${query}". Showing ${toSend.length} results.` 
        }, { quoted: m });

    } catch (err) {
        console.error('Wallpaper error:', err);

        // Error reaction
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: m.key } 
        });

        await client.sendMessage(chatId, {
            text: `🖼️ *WALLPAPER SEARCH*\n\n❌ Failed to fetch wallpapers.\n\nError: ${err.message}`
        }, { quoted: m });
    }
};

module.exports = {
    wallpaperCommand
};