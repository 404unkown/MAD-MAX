const axios = require('axios');

const bundesligaCommand = async (client, chatId, m, args, sender, pushName, isOwner) => {
    try {
        // Send loading reaction
        await client.sendMessage(chatId, { 
            react: { text: '⚽', key: m.key } 
        });

        // Send processing message
        const processingMsg = await client.sendMessage(chatId, {
            text: `⚽ *BUNDESLIGA STANDINGS*\n\nFetching latest German Bundesliga standings...`
        }, { quoted: m });

        const response = await axios.get('https://api.dreaded.site/api/standings/BL1');
        const data = response.data;

        if (!data || !data.data) {
            throw new Error('Invalid API response');
        }

        const standings = data.data;

        // Format the message
        const message = `⚽ *GERMAN BUNDESLIGA STANDINGS*\n\n${standings}\n\n─ MAD-MAX BOT`;

        // Delete processing message
        await client.sendMessage(chatId, { delete: processingMsg.key });

        // Success reaction
        await client.sendMessage(chatId, { 
            react: { text: '✅', key: m.key } 
        });

        // Check if message is too long
        if (message.length > 4000) {
            const chunks = message.match(/(.|[\r\n]){1,3500}/g) || [];
            
            for (let i = 0; i < chunks.length; i++) {
                await client.sendMessage(chatId, { 
                    text: i === 0 ? chunks[i] : `*Part ${i+1}/${chunks.length}*\n\n${chunks[i]}`
                }, { quoted: i === 0 ? m : null });
                
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        } else {
            await client.sendMessage(chatId, { 
                text: message
            }, { quoted: m });
        }

    } catch (error) {
        console.error('Bundesliga standings error:', error);

        // Error reaction
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: m.key } 
        });

        await client.sendMessage(chatId, {
            text: `⚽ *BUNDESLIGA STANDINGS*\n\n❌ Something went wrong. Unable to fetch Bundesliga standings.\n\nError: ${error.message}`
        }, { quoted: m });
    }
};

module.exports = {
    bundesligaCommand
};