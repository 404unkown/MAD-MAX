const acrcloud = require("acrcloud");

const musicidCommand = async (client, chatId, m, args, sender, pushName, isOwner) => {
    try {
        // Initialize ACRCloud
        const acr = new acrcloud({
            host: 'identify-ap-southeast-1.acrcloud.com',
            access_key: '26afd4eec96b0f5e5ab16a7e6e05ab37',
            access_secret: 'wXOZIqdMNZmaHJP1YDWVyeQLg579uK2CfY6hWMN8'
        });

        // Send loading reaction
        await client.sendMessage(chatId, { 
            react: { text: '🎵', key: m.key } 
        });

        // Check if there's a quoted message
        if (!m.quoted) {
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: m.key } 
            });
            return await client.sendMessage(chatId, { 
                text: `🎵 *MUSIC RECOGNITION*\n\nPlease quote an audio or video message to identify.\n\nExample: Reply to a song with .musicid` 
            }, { quoted: m });
        }

        // Check media type
        const quoted = m.quoted;
        const mime = (quoted.msg || quoted).mimetype || '';

        if (!/audio|video/.test(mime)) {
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: m.key } 
            });
            return await client.sendMessage(chatId, { 
                text: `🎵 *MUSIC RECOGNITION*\n\nThat's not an audio or video file. Please quote an audio/video message.` 
            }, { quoted: m });
        }

        // Send processing message
        const processingMsg = await client.sendMessage(chatId, {
            text: `🎵 *MUSIC RECOGNITION*\n\nAnalyzing audio...\n\nPlease wait.`
        }, { quoted: m });

        // Download the media
        const buffer = await quoted.download();
        
        if (!buffer) {
            await client.sendMessage(chatId, { delete: processingMsg.key });
            throw new Error('Failed to download audio');
        }

        // Identify the song
        const { status, metadata } = await acr.identify(buffer);

        // Delete processing message
        await client.sendMessage(chatId, { delete: processingMsg.key });

        if (status.code !== 0) {
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: m.key } 
            });
            return await client.sendMessage(chatId, { 
                text: `🎵 *MUSIC RECOGNITION*\n\nSong not recognized. Please try a clearer audio sample.` 
            }, { quoted: m });
        }

        if (!metadata || !metadata.music || metadata.music.length === 0) {
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: m.key } 
            });
            return await client.sendMessage(chatId, { 
                text: `🎵 *MUSIC RECOGNITION*\n\nNo music identified in the audio.` 
            }, { quoted: m });
        }

        const song = metadata.music[0];
        
        // Format the response
        let result = `🎵 *MUSIC IDENTIFIED*\n\n`;
        result += `*Title:* ${song.title || 'Unknown'}\n`;
        
        if (song.artists && song.artists.length > 0) {
            result += `*Artist(s):* ${song.artists.map(a => a.name).join(', ')}\n`;
        }
        
        if (song.album && song.album.name) {
            result += `*Album:* ${song.album.name}\n`;
        }
        
        if (song.genres && song.genres.length > 0) {
            result += `*Genre:* ${song.genres.map(g => g.name).join(', ')}\n`;
        }
        
        if (song.release_date) {
            result += `*Release Date:* ${song.release_date}\n`;
        }
        
        if (song.label && song.label.length > 0) {
            result += `*Label:* ${song.label.map(l => l.name).join(', ')}\n`;
        }
        
        if (song.acrid) {
            result += `*ACR ID:* ${song.acrid}\n`;
        }
        
        if (song.duration_ms) {
            const durationSec = Math.floor(song.duration_ms / 1000);
            const minutes = Math.floor(durationSec / 60);
            const seconds = durationSec % 60;
            result += `*Duration:* ${minutes}:${seconds.toString().padStart(2, '0')}\n`;
        }

        result += `\n─ MAD-MAX BOT`;

        // Success reaction
        await client.sendMessage(chatId, { 
            react: { text: '✅', key: m.key } 
        });

        await client.sendMessage(chatId, { 
            text: result
        }, { quoted: m });

    } catch (error) {
        console.error('Music recognition error:', error);

        // Error reaction
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: m.key } 
        });

        await client.sendMessage(chatId, {
            text: `🎵 *MUSIC RECOGNITION*\n\n❌ An error occurred.\n\nError: ${error.message}`
        }, { quoted: m });
    }
};

module.exports = {
    shazamCommand
};