const fetch = require('node-fetch');

const spotifyCommand = async (client, chatId, m, args, sender, pushName, isOwner) => {
    try {
        const query = args.join(' ').trim();

        if (!query) {
            return await client.sendMessage(chatId, { 
                text: `🎵 *SPOTIFY DOWNLOADER*\n\nPlease provide a song name to search.\n\nExample: .spotify Shape of You\nExample: .spotifydl Blinding Lights` 
            }, { quoted: m });
        }

        if (query.length > 100) {
            return await client.sendMessage(chatId, { 
                text: `❌ *Too Long*\n\nSong title must be under 100 characters.` 
            }, { quoted: m });
        }

        // Send loading reaction
        await client.sendMessage(chatId, { 
            react: { text: '🎵', key: m.key } 
        });

        // Send processing message
        const statusMsg = await client.sendMessage(chatId, {
            text: `🎵 *SPOTIFY DOWNLOADER*\n\nSearching Spotify for "${query}"...\n\nPlease wait.`
        }, { quoted: m });

        const response = await fetch(`https://api.ootaizumi.web.id/downloader/spotifyplay?query=${encodeURIComponent(query)}`);
        const data = await response.json();

        // Delete status message
        await client.sendMessage(chatId, { delete: statusMsg.key });

        if (!data.status || !data.result?.download) {
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: m.key } 
            });
            return await client.sendMessage(chatId, { 
                text: `🎵 *SPOTIFY DOWNLOADER*\n\nNo song found for "${query}". Try a different search term.` 
            }, { quoted: m });
        }

        const song = data.result;
        const audioUrl = song.download;
        const filename = song.title || "Unknown Song";
        const artist = song.artists || "Unknown Artist";
        const image = song.image || "";
        const externalUrl = song.external_url || "";

        // Success reaction
        await client.sendMessage(chatId, { 
            react: { text: '✅', key: m.key } 
        });

        // Send as audio with external ad reply
        try {
            await client.sendMessage(chatId, {
                audio: { url: audioUrl },
                mimetype: "audio/mpeg",
                fileName: `${filename}.mp3`,
                contextInfo: {
                    externalAdReply: {
                        title: filename.substring(0, 30),
                        body: artist.substring(0, 30),
                        thumbnailUrl: image,
                        sourceUrl: externalUrl,
                        mediaType: 1,
                        renderLargerThumbnail: true,
                    },
                },
            }, { quoted: m });
        } catch (audioError) {
            console.log('Audio send error, trying document fallback:', audioError);
            
            // Fallback to document if audio fails
            await client.sendMessage(chatId, {
                document: { url: audioUrl },
                mimetype: "audio/mpeg",
                fileName: `${filename.replace(/[<>:"/\\|?*]/g, '_')}.mp3`,
                caption: `🎵 *${filename}*\n👤 *Artist:* ${artist}\n\n─ MAD-MAX BOT`
            }, { quoted: m });
        }

        // Also send as document for download option (optional)
        try {
            await client.sendMessage(chatId, {
                document: { url: audioUrl },
                mimetype: "audio/mpeg",
                fileName: `${filename.replace(/[<>:"/\\|?*]/g, '_')}.mp3`,
                caption: `🎵 *${filename}*\n👤 *Artist:* ${artist}\n\n📥 Download option\n\n─ MAD-MAX BOT`
            }, { quoted: m });
        } catch (docError) {
            console.log('Document send error:', docError);
            // Ignore if document fails
        }

    } catch (error) {
        console.error('Spotify error:', error);

        // Error reaction
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: m.key } 
        });

        await client.sendMessage(chatId, {
            text: `🎵 *SPOTIFY DOWNLOADER*\n\n❌ Download failed.\n\nError: ${error.message}`
        }, { quoted: m });
    }
};

module.exports = {
    spotifyCommand
};