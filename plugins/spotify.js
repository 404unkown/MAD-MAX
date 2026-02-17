const axios = require('axios');

async function spotifyCommand(client, chatId, message, args, sender, pushName, isOwnerSimple) {
    try {
        const query = args.join(' ').trim();

        if (!query) {
            await client.sendMessage(chatId, { 
                text: '🎵 *Spotify Downloader*\n\n*Usage:* .spotify <song name>\n*Example:* .spotify con calma\n\n*Aliases:* .sp, .spotifydl'
            }, { quoted: message });
            return;
        }

        // Send processing reaction
        await client.sendMessage(chatId, { 
            react: { text: '⏳', key: message.key } 
        });

        const processingMsg = await client.sendMessage(chatId, {
            text: `🎵 *Searching Spotify for:* "${query}"...`
        }, { quoted: message });

        const apiUrl = `https://spotiza-beta.vercel.app/api/download/spotify?query=${encodeURIComponent(query)}`;
        const { data } = await axios.get(apiUrl, { timeout: 20000, headers: { 'user-agent': 'Mozilla/5.0' } });

        if (!data || !data.status || !data.data) {
            throw new Error('No result from Spotify API');
        }

        const result = data.data;
        const audioUrl = result.downloadUrl || result.url;
        
        if (!audioUrl) {
            await client.sendMessage(chatId, { 
                text: 'No downloadable audio found for this query.'
            }, { quoted: message });
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: message.key } 
            });
            return;
        }

        // Delete processing message
        await client.sendMessage(chatId, { delete: processingMsg.key });

        const caption = `🎵 *${result.title || 'Unknown Title'}*\n` +
                       `👤 *Artist:* ${result.artist || ''}\n` +
                       `⏱ *Duration:* ${result.duration || ''}\n` +
                       `👤 *Requested by:* @${sender.split('@')[0]}`;

        // Send cover if available
        if (result.thumbnail) {
            await client.sendMessage(chatId, { 
                image: { url: result.thumbnail }, 
                caption,
                mentions: [sender]
            }, { quoted: message });
        } else if (caption) {
            await client.sendMessage(chatId, { 
                text: caption,
                mentions: [sender]
            }, { quoted: message });
        }

        // Send audio
        await client.sendMessage(chatId, {
            audio: { url: audioUrl },
            mimetype: 'audio/mpeg',
            fileName: `${(result.title || 'track').replace(/[\\/:*?"<>|]/g, '')}.mp3`
        }, { quoted: message });

        // Success reaction
        await client.sendMessage(chatId, { 
            react: { text: '✅', key: message.key } 
        });

    } catch (error) {
        console.error('[SPOTIFY] error:', error?.message || error);
        await client.sendMessage(chatId, { 
            text: '❌ Failed to fetch Spotify audio. Try another query later.'
        }, { quoted: message });
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: message.key } 
        });
    }
}

module.exports = spotifyCommand;