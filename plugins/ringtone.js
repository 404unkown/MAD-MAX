const axios = require("axios");

async function ringtoneCommand(client, chatId, message, args, sender, pushName, isOwnerSimple) {
    try {
        const query = args.join(" ");
        if (!query) {
            await client.sendMessage(chatId, {
                text: "📱 *Ringtone Downloader*\n\n*Usage:* .ringtone <query>\n*Example:* .ringtone Suna\n\n*Aliases:* .rt, .ringtonedl"
            }, { quoted: message });
            return;
        }

        // Send processing reaction
        await client.sendMessage(chatId, { 
            react: { text: '⏳', key: message.key } 
        });

        const processingMsg = await client.sendMessage(chatId, {
            text: `🔍 *Searching for ringtone:* "${query}"...`
        }, { quoted: message });

        const { data } = await axios.get(`https://www.dark-yasiya-api.site/download/ringtone?text=${encodeURIComponent(query)}`);

        if (!data.status || !data.result || data.result.length === 0) {
            await client.sendMessage(chatId, { delete: processingMsg.key });
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: message.key } 
            });
            await client.sendMessage(chatId, {
                text: "❌ No ringtones found for your query. Please try a different keyword."
            }, { quoted: message });
            return;
        }

        const randomRingtone = data.result[Math.floor(Math.random() * data.result.length)];

        // Update processing message
        await client.sendMessage(chatId, {
            text: `📱 *Downloading:* ${randomRingtone.title}...`
        }, { quoted: message });

        // Download the audio first
        const response = await axios.get(randomRingtone.dl_link, {
            responseType: 'arraybuffer'
        });

        // Delete processing message
        await client.sendMessage(chatId, { delete: processingMsg.key });

        // Send the audio
        await client.sendMessage(
            chatId,
            {
                audio: response.data,
                mimetype: "audio/mpeg",
                fileName: `${randomRingtone.title.replace(/[^\w\s]/gi, '')}.mp3`,
            },
            { quoted: message }
        );

        // Success reaction
        await client.sendMessage(chatId, { 
            react: { text: '✅', key: message.key } 
        });

    } catch (error) {
        console.error("Error in ringtone command:", error);
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: message.key } 
        });
        await client.sendMessage(chatId, {
            text: "❌ Sorry, something went wrong while fetching the ringtone. Please try again later."
        }, { quoted: message });
    }
}

module.exports = ringtoneCommand;