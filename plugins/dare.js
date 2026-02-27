const fetch = require('node-fetch');

async function dareCommand(client, chatId, message, args, sender, pushName, isOwnerSimple) {
    try {
        // Send processing reaction
        await client.sendMessage(chatId, { 
            react: { text: '🎲', key: message.key } 
        });

        const shizokeys = 'shizo';
        const res = await fetch(`https://shizoapi.onrender.com/api/texts/dare?apikey=${shizokeys}`);
        
        if (!res.ok) {
            throw await res.text();
        }
        
        const json = await res.json();
        const dareMessage = json.result;

        // Send the dare message
        await client.sendMessage(chatId, { 
            text: `🎲 *DARE*\n\n${dareMessage}`
        }, { quoted: message });

        // Success reaction
        await client.sendMessage(chatId, { 
            react: { text: '✅', key: message.key } 
        });

    } catch (error) {
        console.error('Error in dare command:', error);
        await client.sendMessage(chatId, { 
            text: '❌ Failed to get dare. Please try again later!'
        }, { quoted: message });
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: message.key } 
        });
    }
}

module.exports = dareCommand;