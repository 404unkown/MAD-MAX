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

async function emojimixCommand(client, chatId, message, args, sender, pushName, isOwnerSimple) {
    try {
        // Check if we have two emojis
        if (args.length < 2) {
            await client.sendMessage(chatId, {
                text: `❌ *EMOJI MIX COMMAND*\n\nPlease provide two emojis to mix.\n\n*Usage:* .emojimix 😂 😁\n*Example:* .emojimix 😂 😁`,
                ...channelInfo
            }, { quoted: message });
            return;
        }

        const emoji1 = args[0];
        const emoji2 = args[1];

        // Send processing reaction
        await client.sendMessage(chatId, { 
            react: { text: '⏳', key: message.key } 
        });

        // Call the emoji mix API
        const apiUrl = `https://tenor.googleapis.com/v2/featured?key=AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ&contentfilter=high&media_filter=png_transparent&component=proactive&collection=emoji_kitchen_v5&q=${encodeURIComponent(emoji1)}_${encodeURIComponent(emoji2)}`;
        
        const response = await axios.get(apiUrl);
        
        if (response.data && response.data.results && response.data.results.length > 0) {
            const result = response.data.results[0];
            const mediaUrl = result.url || result.media[0]?.png?.url;
            
            if (mediaUrl) {
                // Send the mixed emoji as an image
                await client.sendMessage(chatId, {
                    image: { url: mediaUrl },
                    caption: `🎭 *EMOJI MIX RESULT*\n\n${emoji1} + ${emoji2} =`,
                    ...channelInfo
                }, { quoted: message });
                
                // Success reaction
                await client.sendMessage(chatId, { 
                    react: { text: '✅', key: message.key } 
                });
            } else {
                throw new Error('No media URL found');
            }
        } else {
            // Alternative API if first one fails
            const altUrl = `https://emoji-api.com/emojis?search=${encodeURIComponent(emoji1 + emoji2)}&access_key=YOUR_API_KEY`;
            
            await client.sendMessage(chatId, {
                text: `❌ Could not mix these emojis. Try different combinations.`,
                ...channelInfo
            }, { quoted: message });
            
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: message.key } 
            });
        }

    } catch (error) {
        console.error('Emoji mix error:', error);
        await client.sendMessage(chatId, {
            text: `❌ Failed to mix emojis. Try different emojis.`,
            ...channelInfo
        }, { quoted: message });
        
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: message.key } 
        });
    }
}

module.exports = { emojimixCommand };