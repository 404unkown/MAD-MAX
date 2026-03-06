const axios = require('axios');

const wormgptCommand = async (client, chatId, m, args, sender, pushName, isOwner) => {
    try {
        const text = args.join(' ').trim();
        
        if (!text) {
            return await client.sendMessage(chatId, { 
                text: `🤖 *WORMGPT - Uncensored AI*\n\n❥ Example: .wormgpt how to hack a website?\n\n_Use with caution - uncensored AI_` 
            }, { quoted: m });
        }

        // Send loading reaction
        await client.sendMessage(chatId, {
            react: { text: '⌛', key: m.key }
        });

        // Show typing indicator
        await client.sendPresenceUpdate('composing', chatId);

        const apiUrl = `https://api.danzy.web.id/api/ai/wormgpt?q=${encodeURIComponent(text)}`;
        const response = await axios.get(apiUrl);

        if (!response.data || !response.data.status || !response.data.result) {
            throw new Error('The API returned garbage. WormGPT is probably offline drinking whiskey.');
        }

        const answer = response.data.result.trim();

        // Send success reaction
        await client.sendMessage(chatId, {
            react: { text: '✅', key: m.key }
        });

        // Format the response with your bot's branding
        const responseText = `❥┈┈┈┈┈┈┈┈┈┈┈┈┈┈➤\n` +
                            `┋❥✿ *WORMGPT RESPONSE*\n` +
                            `┋❥✿\n` +
                            `┋❥✿ ${answer}\n` +
                            `┋❥✿\n` +
                            `┋❥✿ *MAD-MAX BOT*\n` +
                            `❥┈┈┈┈┈┈┈┈┈┈┈┈┈┈➤`;

        await client.sendMessage(chatId, { 
            text: responseText
        }, { quoted: m });

    } catch (error) {
        console.error("WormGPT error:", error);

        // Send error reaction
        await client.sendMessage(chatId, {
            react: { text: '❌', key: m.key }
        });

        let errorMessage = "WormGPT decided your question was too stupid to answer.";

        if (error.response?.status === 404) {
            errorMessage = "WormGPT API vanished. Probably went to get more whiskey.";
        } else if (error.response?.status === 429) {
            errorMessage = "Rate limit exceeded. Even WormGPT needs a break from your questions.";
        } else if (error.message.includes("ENOTFOUND")) {
            errorMessage = "Can't find WormGPT. It's probably busy causing chaos elsewhere.";
        } else if (error.message.includes("garbage")) {
            errorMessage = error.message;
        } else if (error.message.includes("timeout")) {
            errorMessage = "WormGPT took too long to respond. Probably drunk.";
        }

        const errorText = `❥┈┈┈┈┈┈┈┈┈┈┈┈┈┈➤\n` +
                         `┋❥✿ *ERROR*\n` +
                         `┋❥✿\n` +
                         `┋❥✿ ${errorMessage}\n` +
                         `┋❥✿\n` +
                         `┋❥✿ *MAD-MAX BOT*\n` +
                         `❥┈┈┈┈┈┈┈┈┈┈┈┈┈┈➤`;

        await client.sendMessage(chatId, { 
            text: errorText
        }, { quoted: m });
    }
};

module.exports = {
    wormgptCommand
};