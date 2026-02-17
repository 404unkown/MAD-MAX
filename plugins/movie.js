const axios = require('axios');
const https = require('https');
const config = require('../set');

// Create custom HTTPS agent for the problematic API only
const insecureAgent = new https.Agent({  
  rejectUnauthorized: false // Only for this specific API
});

// Normal secure axios instance for other requests
const secureAxios = axios.create({
  timeout: 30000,
  httpsAgent: new https.Agent() // Default secure agent
});

// Insecure axios instance only for the movie API
const movieAxios = axios.create({
  timeout: 30000,
  httpsAgent: insecureAgent,
  maxContentLength: 200 * 1024 * 1024
});

async function movieCommand(client, chatId, message, args, sender, pushName, isOwnerSimple) {
    try {
        const text = args.join(' ').trim();
        
        if (!text) {
            await client.sendMessage(chatId, {
                text: `🎬 *Movie Downloader*\n\n*Usage:* .movie <movie title>\n\n*Example:* .movie spiderman 2`
            }, { quoted: message });
            return;
        }

        // Send processing reaction
        await client.sendMessage(chatId, { 
            react: { text: '🎬', key: message.key } 
        });

        const processingMsg = await client.sendMessage(chatId, {
            text: `🎬 *Searching for movie:* "${text}"...`
        }, { quoted: message });

        // 1. Get movie metadata (using insecure agent only for this API)
        const apiUrl = `http://www.omdbapi.com/?apikey=742b2d09&t=${encodeURIComponent(text)}&plot=full`;  
        const { data } = await movieAxios.get(apiUrl);
        
        if (!data || data.Response === 'False') {
            await client.sendMessage(chatId, { delete: processingMsg.key });
            await client.sendMessage(chatId, {
                text: `🎬 *Movie not found!*\n\n"${text}" not found. Try another title.`
            }, { quoted: message });
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: message.key } 
            });
            return;
        }

        // 2. Prepare info message
        const yearMatch = data.Title ? data.Title.match(/\((\d{4})\)/) : null;
        const cleanTitle = data.Title || text;
        const shortDesc = data.Plot ? 
            data.Plot.substring(0, 150) + (data.Plot.length > 150 ? '...' : '') : 
            'No description available';

        // Note: The download_link field doesn't exist in OMDB API response
        // This appears to be from a different API. You'll need to use a proper movie download API
        
        const infoMsg = `🎬 *Movie Information*\n\n` +
                       `*Title:* ${cleanTitle} (${data.Year || 'N/A'})\n` +
                       `*Rating:* ⭐ ${data.imdbRating || 'N/A'}\n` +
                       `*Genre:* ${data.Genre || 'N/A'}\n` +
                       `*Director:* ${data.Director || 'N/A'}\n` +
                       `*Actors:* ${data.Actors || 'N/A'}\n\n` +
                       `*Plot:* ${shortDesc}\n\n` +
                       `👤 *Requested by:* @${sender.split('@')[0]}\n` +
                       `> Powered By MAD-MAX Bot`;

        // Delete processing message
        await client.sendMessage(chatId, { delete: processingMsg.key });

        // Send movie info with poster if available
        if (data.Poster && data.Poster !== 'N/A') {
            try {
                const imageResponse = await secureAxios.get(data.Poster, {
                    responseType: 'arraybuffer',
                    timeout: 10000
                });
                
                await client.sendMessage(chatId, {
                    image: imageResponse.data,
                    caption: infoMsg,
                    mentions: [sender]
                }, { quoted: message });
            } catch (imgError) {
                // If image fails, send text only
                await client.sendMessage(chatId, {
                    text: infoMsg,
                    mentions: [sender]
                }, { quoted: message });
            }
        } else {
            await client.sendMessage(chatId, {
                text: infoMsg,
                mentions: [sender]
            }, { quoted: message });
        }

        // Note: For actual movie downloads, you'll need to integrate with a different API
        // The original code had a download_link which doesn't come from OMDB

        // Success reaction
        await client.sendMessage(chatId, { 
            react: { text: '✅', key: message.key } 
        });

    } catch (error) {
        console.error('Movie Command Error:', error);
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: message.key } 
        });
        await client.sendMessage(chatId, {
            text: `🎬 *Error:* ${error.message || 'Failed to process request'}`
        }, { quoted: message });
    }
}

module.exports = movieCommand;