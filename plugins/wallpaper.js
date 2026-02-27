const axios = require("axios");
const Config = require("../set");

// Simple Pinterest scraper function (no API key needed)
async function searchPinterest(query, limit = 10) {
    try {
        // Using a free Pinterest scraper API
        const response = await axios.get(`https://api.pinterest-scraper.workers.dev/search?q=${encodeURIComponent(query)}&limit=${limit}`, {
            timeout: 10000
        });
        
        if (response.data && response.data.data && response.data.data.length > 0) {
            return response.data.data.map(item => ({
                imageUrl: item.images?.[0]?.url || item.image,
                title: item.title || query,
                source: "Pinterest"
            }));
        }
        return [];
    } catch (error) {
        console.log("Pinterest scraper failed:", error.message);
        return [];
    }
}

// Alternative Pinterest scraper (backup)
async function searchPinterestBackup(query, limit = 10) {
    try {
        // Alternative free Pinterest API
        const response = await axios.get(`https://pinterest-api-xi.vercel.app/pinterest?query=${encodeURIComponent(query)}`, {
            timeout: 10000
        });
        
        if (response.data && response.data.data && response.data.data.length > 0) {
            return response.data.data.slice(0, limit).map(url => ({
                imageUrl: url,
                title: query,
                source: "Pinterest (Backup)"
            }));
        }
        return [];
    } catch (error) {
        console.log("Pinterest backup failed:", error.message);
        return [];
    }
}

async function searchWallpaper(client, chatId, message, args, sender, pushName, isOwnerSimple) {
    try {
        const query = args.join(' ');
        
        if (!query) {
            await client.sendMessage(chatId, {
                text: `🖼️ *WALLPAPER SEARCH*\n\nSearch for any wallpaper on Pinterest!\n\n*Usage:* .wallpaper [search term]\n*Example:* .wallpaper ice\n*Aliases:* .wp, .wall, .searchwall`
            }, { quoted: message });
            return;
        }

        // Send processing reaction
        await client.sendMessage(chatId, { 
            react: { text: '🔍', key: message.key } 
        });

        const processingMsg = await client.sendMessage(chatId, {
            text: `🖼️ *Searching Pinterest for "${query}" wallpaper...*`
        }, { quoted: message });

        let images = [];
        let sourceUsed = "";

        // Try primary Pinterest scraper
        images = await searchPinterest(query, 15);
        
        if (images.length === 0) {
            // Try backup Pinterest scraper
            images = await searchPinterestBackup(query, 15);
        }

        // ====== NO RESULTS FOUND ======
        if (images.length === 0) {
            await client.sendMessage(chatId, { delete: processingMsg.key });
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: message.key } 
            });
            
            await client.sendMessage(chatId, {
                text: `❌ No images found for "${query}" on Pinterest.\n\nTry searching directly:\n🔗 https://www.pinterest.com/search/pins/?q=${encodeURIComponent(query)}`
            }, { quoted: message });
            return;
        }

        // Select random image from results
        const randomIndex = Math.floor(Math.random() * images.length);
        const selectedImage = images[randomIndex];
        
        // Delete processing message
        await client.sendMessage(chatId, { delete: processingMsg.key });

        // Send the image
        await client.sendMessage(chatId, {
            image: { url: selectedImage.imageUrl },
            caption: `🖼️ *Wallpaper Found on Pinterest*\n\n🔍 *Search:* ${query}\n📌 *Title:* ${selectedImage.title || query}\n📡 *Source:* ${selectedImage.source || 'Pinterest'}\n📊 *Total found:* ${images.length}\n👤 *Requested by:* ${pushName}\n\n> ${Config.caption || 'MAD-MAX BOT'}`,
            mentions: [sender]
        }, { quoted: message });

        // Success reaction
        await client.sendMessage(chatId, { 
            react: { text: '✅', key: message.key } 
        });

    } catch (error) {
        console.error("Wallpaper search error:", error);
        
        // Fallback to direct Pinterest link
        await client.sendMessage(chatId, {
            text: `❌ Failed to search Pinterest.\n\nTry manually:\n🔗 https://www.pinterest.com/search/pins/?q=${encodeURIComponent(args.join(' '))}`
        }, { quoted: message });
        
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: message.key } 
        });
    }
}

module.exports = {
    searchWallpaper
};