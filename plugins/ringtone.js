const axios = require('axios');

// Global channel info
const channelInfo = {
    contextInfo: {
        forwardingScore: 1,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363401269012709@newsletter',
            newsletterName: 'MAD-MAX',
            serverMessageId: -1
        }
    }
};

async function ringtoneCommand(client, chatId, message, args, sender, pushName, isOwnerSimple) {
    try {
        const query = args.join(" ");
        
        if (!query) {
            await client.sendMessage(chatId, {
                text: `🎵 *RINGTONE COMMAND*\n\nPlease provide a search query!\n\n*Example:* .ringtone Suna\n*Aliases:* .ringtones, .ring`,
                ...channelInfo
            }, { quoted: message });
            
            await client.sendMessage(chatId, { 
                react: { text: '⚠️', key: message.key } 
            });
            return;
        }

        // Send processing reaction
        await client.sendMessage(chatId, { 
            react: { text: '🎵', key: message.key } 
        });

        const { data } = await axios.get(`https://www.dark-yasiya-api.site/download/ringtone?text=${encodeURIComponent(query)}`);

        if (!data.status || !data.result || data.result.length === 0) {
            await client.sendMessage(chatId, {
                text: "❌ No ringtones found for your query. Please try a different keyword.",
                ...channelInfo
            }, { quoted: message });
            
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: message.key } 
            });
            return;
        }

        // Pick a random ringtone from results
        const randomRingtone = data.result[Math.floor(Math.random() * data.result.length)];

        // Send the audio file
        await client.sendMessage(chatId, {
            audio: { url: randomRingtone.dl_link },
            mimetype: "audio/mpeg",
            fileName: `${randomRingtone.title}.mp3`,
            caption: `🎵 *Ringtone:* ${randomRingtone.title}`,
            ...channelInfo
        }, { quoted: message });

        // Success reaction
        await client.sendMessage(chatId, { 
            react: { text: '✅', key: message.key } 
        });

    } catch (error) {
        console.error("Ringtone Command Error:", error);
        
        await client.sendMessage(chatId, {
            text: "❌ Sorry, something went wrong while fetching the ringtone. Please try again later.",
            ...channelInfo
        }, { quoted: message });
        
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: message.key } 
        });
    }
}

module.exports = ringtoneCommand;