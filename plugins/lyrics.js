const fetch = require('node-fetch');

async function lyricsCommand(client, chatId, message, args, sender, pushName, isOwnerSimple) {
    try {
        const songTitle = args.join(' ').trim();
        
        if (!songTitle) {
            await client.sendMessage(chatId, { 
                text: '🎵 *Lyrics Finder*\n\n*Usage:* .lyrics <song name>\n*Example:* .lyrics Bohemian Rhapsody\n\n*Aliases:* .lyric, .songlyrics'
            }, { quoted: message });
            return;
        }

        // Send processing reaction
        await client.sendMessage(chatId, { 
            react: { text: '🎵', key: message.key } 
        });

        const processingMsg = await client.sendMessage(chatId, {
            text: `🔍 *Searching lyrics for:* "${songTitle}"...`
        }, { quoted: message });

        // Use lyricsapi.fly.dev and return only the raw lyrics text
        const apiUrl = `https://lyricsapi.fly.dev/api/lyrics?q=${encodeURIComponent(songTitle)}`;
        const res = await fetch(apiUrl);
        
        if (!res.ok) {
            const errText = await res.text();
            throw new Error(errText);
        }
        
        const data = await res.json();

        const lyrics = data && data.result && data.result.lyrics ? data.result.lyrics : null;
        if (!lyrics) {
            await client.sendMessage(chatId, { delete: processingMsg.key });
            await client.sendMessage(chatId, {
                text: `❌ Sorry, I couldn't find any lyrics for "${songTitle}".`
            }, { quoted: message });
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: message.key } 
            });
            return;
        }

        // Delete processing message
        await client.sendMessage(chatId, { delete: processingMsg.key });

        const maxChars = 4096;
        const output = lyrics.length > maxChars ? lyrics.slice(0, maxChars - 3) + '...' : lyrics;

        // Send lyrics with title
        const formattedOutput = `🎵 *${songTitle}*\n\n${output}`;

        await client.sendMessage(chatId, { 
            text: formattedOutput
        }, { quoted: message });

        // Success reaction
        await client.sendMessage(chatId, { 
            react: { text: '✅', key: message.key } 
        });

    } catch (error) {
        console.error('Error in lyrics command:', error);
        await client.sendMessage(chatId, { 
            text: `❌ An error occurred while fetching the lyrics for "${songTitle || 'your song'}".`
        }, { quoted: message });
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: message.key } 
        });
    }
}

module.exports = lyricsCommand;