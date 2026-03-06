const fetch = require('node-fetch');

async function memeCommand(client, chatId, message, args, sender, pushName, isOwnerSimple) {
    try {
        // Send processing reaction
        await client.sendMessage(chatId, { 
            react: { text: '🎭', key: message.key } 
        });

        const response = await fetch('https://shizoapi.onrender.com/api/memes/cheems?apikey=shizo');
        
        // Check if response is an image
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('image')) {
            const imageBuffer = await response.buffer();
            
            // Send the image
            await client.sendMessage(chatId, { 
                image: imageBuffer,
                caption: `🎭 *Cheems Meme*\n\n> Here's your cheems meme! 🐕\n\n👤 *Requested by:* @${sender.split('@')[0]}`,
                mentions: [sender]
            }, { quoted: message });

            // Success reaction
            await client.sendMessage(chatId, { 
                react: { text: '✅', key: message.key } 
            });
        } else {
            throw new Error('Invalid response type from API');
        }
    } catch (error) {
        console.error('Error in meme command:', error);
        await client.sendMessage(chatId, { 
            text: '❌ Failed to fetch meme. Please try again later.'
        }, { quoted: message });
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: message.key } 
        });
    }
}

module.exports = memeCommand;