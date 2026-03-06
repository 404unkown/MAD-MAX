const axios = require('axios');
const config = require('../set'); // Using your set.js config file

async function gifCommand(client, chatId, message, args, sender, pushName, isOwnerSimple) {
    const query = args.join(' ').trim();

    if (!query) {
        await client.sendMessage(chatId, { 
            text: '🎬 *GIF Search*\n\nPlease provide a search term for the GIF.\n\n*Usage:* .gif <search term>\n*Example:* .gif funny cat' 
        }, { quoted: message });
        return;
    }

    try {
        // Send processing reaction
        await client.sendMessage(chatId, { 
            react: { text: '🎬', key: message.key } 
        });

        const processingMsg = await client.sendMessage(chatId, {
            text: `🔍 *Searching for GIF:* "${query}"...`
        }, { quoted: message });

        // You need to add your Giphy API key to your set.js file
        // Add this line to your set.js: giphyApiKey: 'YOUR_API_KEY_HERE'
        const apiKey = config.giphyApiKey || 'DCXQ4c4VNyLcsQZc4lV3HcRkK1W60MlK'; // Default public key as fallback
        
        const response = await axios.get(`https://api.giphy.com/v1/gifs/search`, {
            params: {
                api_key: apiKey,
                q: query,
                limit: 1,
                rating: 'g'
            },
            timeout: 10000
        });

        const gifUrl = response.data.data[0]?.images?.downsized_medium?.url;

        // Delete processing message
        await client.sendMessage(chatId, { delete: processingMsg.key });

        if (gifUrl) {
            await client.sendMessage(chatId, { 
                video: { url: gifUrl }, 
                caption: `🎬 *GIF Result*\n\n🔍 *Search:* ${query}\n👤 *Requested by:* @${sender.split('@')[0]}`,
                mentions: [sender]
            }, { quoted: message });

            // Success reaction
            await client.sendMessage(chatId, { 
                react: { text: '✅', key: message.key } 
            });
        } else {
            await client.sendMessage(chatId, { 
                text: `❌ No GIFs found for "${query}". Try a different search term.` 
            }, { quoted: message });
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: message.key } 
            });
        }
    } catch (error) {
        console.error('Error fetching GIF:', error);
        await client.sendMessage(chatId, { 
            text: '❌ Failed to fetch GIF. Please try again later.' 
        }, { quoted: message });
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: message.key } 
        });
    }
}

module.exports = gifCommand;