const axios = require('axios');

async function jokeCommand(client, chatId, message, args, sender, pushName, isOwnerSimple) {
    try {
        // Send processing reaction
        await client.sendMessage(chatId, { 
            react: { text: '😄', key: message.key } 
        });

        const response = await axios.get('https://icanhazdadjoke.com/', {
            headers: { 
                'Accept': 'application/json',
                'User-Agent': 'MAD-MAX Bot (https://github.com/404unkown)'
            }
        });
        
        const joke = response.data.joke;
        
        await client.sendMessage(chatId, { 
            text: `😄 *Dad Joke*\n\n${joke}\n\n👤 *Requested by:* @${sender.split('@')[0]}`,
            mentions: [sender]
        }, { quoted: message });

        // Success reaction
        await client.sendMessage(chatId, { 
            react: { text: '✅', key: message.key } 
        });

    } catch (error) {
        console.error('Error fetching joke:', error);
        await client.sendMessage(chatId, { 
            text: '❌ Sorry, I could not fetch a joke right now.'
        }, { quoted: message });
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: message.key } 
        });
    }
}

module.exports = jokeCommand;