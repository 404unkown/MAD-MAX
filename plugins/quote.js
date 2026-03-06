const fetch = require('node-fetch');

async function quoteCommand(client, chatId, message, args, sender, pushName, isOwnerSimple) {
    try {
        // Send processing reaction
        await client.sendMessage(chatId, { 
            react: { text: '📜', key: message.key } 
        });

        const processingMsg = await client.sendMessage(chatId, {
            text: '📜 *Fetching an inspiring quote...*'
        }, { quoted: message });

        const shizokeys = 'shizo';
        const res = await fetch(`https://shizoapi.onrender.com/api/texts/quotes?apikey=${shizokeys}`);
        
        if (!res.ok) {
            throw await res.text();
        }
        
        const json = await res.json();
        const quoteMessage = json.result;

        // Delete processing message
        await client.sendMessage(chatId, { delete: processingMsg.key });

        // Send the quote message with formatting
        await client.sendMessage(chatId, { 
            text: `📜 *Quote*\n\n“${quoteMessage}”\n\n— @${sender.split('@')[0]}`,
            mentions: [sender]
        }, { quoted: message });

        // Success reaction
        await client.sendMessage(chatId, { 
            react: { text: '✅', key: message.key } 
        });

    } catch (error) {
        console.error('Error in quote command:', error);
        await client.sendMessage(chatId, { 
            text: '❌ Failed to get quote. Please try again later!'
        }, { quoted: message });
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: message.key } 
        });
    }
}

module.exports = quoteCommand;