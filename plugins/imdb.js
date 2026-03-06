const axios = require("axios");

const imdbCommand = async (client, chatId, m, args, sender, pushName, isOwner) => {
    try {
        const text = args.join(' ').trim();

        if (!text) {
            return await client.sendMessage(chatId, { 
                text: `🎬 *IMDB MOVIE SEARCH*\n\nPlease provide a movie name or TV show.\n\nExample: .imdb Inception\nExample: .movie Breaking Bad` 
            }, { quoted: m });
        }

        // Send loading reaction
        await client.sendMessage(chatId, { 
            react: { text: '🎬', key: m.key } 
        });

        // Send processing message
        const processingMsg = await client.sendMessage(chatId, {
            text: `🎬 *IMDB MOVIE SEARCH*\n\nSearching for "${text}"...\n\nPlease wait.`
        }, { quoted: m });

        // Fetch from OMDB API
        const response = await axios.get(`http://www.omdbapi.com/?apikey=742b2d09&t=${encodeURIComponent(text)}&plot=full`);
        const data = response.data;

        // Delete processing message
        await client.sendMessage(chatId, { delete: processingMsg.key });

        if (data.Response === "False") {
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: m.key } 
            });
            return await client.sendMessage(chatId, { 
                text: `🎬 *IMDB MOVIE SEARCH*\n\n❌ Movie not found: "${text}"` 
            }, { quoted: m });
        }

        // Format the message
        let message = `🎬 *IMDB MOVIE INFO*\n\n`;
        message += `*Title:* ${data.Title || 'N/A'}\n`;
        message += `*Year:* ${data.Year || 'N/A'}\n`;
        message += `*Rated:* ${data.Rated || 'N/A'}\n`;
        message += `*Released:* ${data.Released || 'N/A'}\n`;
        message += `*Runtime:* ${data.Runtime || 'N/A'}\n`;
        message += `*Genre:* ${data.Genre || 'N/A'}\n`;
        message += `*Director:* ${data.Director || 'N/A'}\n`;
        message += `*Writer:* ${data.Writer || 'N/A'}\n`;
        message += `*Actors:* ${data.Actors || 'N/A'}\n`;
        message += `*Plot:* ${data.Plot || 'N/A'}\n`;
        message += `*Language:* ${data.Language || 'N/A'}\n`;
        message += `*Country:* ${data.Country || 'N/A'}\n`;
        message += `*Awards:* ${data.Awards || 'N/A'}\n`;
        message += `*Box Office:* ${data.BoxOffice || 'N/A'}\n`;
        message += `*Production:* ${data.Production || 'N/A'}\n`;
        message += `*IMDB Rating:* ${data.imdbRating || 'N/A'}/10\n`;
        message += `*IMDB Votes:* ${data.imdbVotes || 'N/A'}\n`;
        message += `*Type:* ${data.Type || 'N/A'}\n`;
        message += `*DVD Release:* ${data.DVD || 'N/A'}\n`;
        message += `*Website:* ${data.Website || 'N/A'}\n\n`;
        message += `─ MAD-MAX BOT`;

        // Success reaction
        await client.sendMessage(chatId, { 
            react: { text: '✅', key: m.key } 
        });

        // Send poster image with info
        if (data.Poster && data.Poster !== 'N/A') {
            await client.sendMessage(chatId, {
                image: { url: data.Poster },
                caption: message
            }, { quoted: m });
        } else {
            // If no poster, send text only
            await client.sendMessage(chatId, {
                text: message
            }, { quoted: m });
        }

    } catch (error) {
        console.error('IMDB search error:', error);

        // Error reaction
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: m.key } 
        });

        await client.sendMessage(chatId, {
            text: `🎬 *IMDB MOVIE SEARCH*\n\n❌ An error occurred.\n\nError: ${error.message}`
        }, { quoted: m });
    }
};

module.exports = {
    imdbCommand
};