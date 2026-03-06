const axios = require("axios");

const googleCommand = async (client, chatId, m, args, sender, pushName, isOwner) => {
    try {
        const query = args.join(' ').trim();

        if (!query) {
            return await client.sendMessage(chatId, { 
                text: `🔍 *GOOGLE SEARCH*\n\nPlease provide a search term.\n\nExample: .google What is JavaScript\nExample: .search How to code` 
            }, { quoted: m });
        }

        // Send loading reaction
        await client.sendMessage(chatId, { 
            react: { text: '🔍', key: m.key } 
        });

        // Send processing message
        const processingMsg = await client.sendMessage(chatId, {
            text: `🔍 *GOOGLE SEARCH*\n\nSearching for "${query}"...\n\nPlease wait.`
        }, { quoted: m });

        // Google Custom Search API
        const response = await axios.get(
            `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&key=AIzaSyDMbI3nvmQUrfjoCJYLS69Lej1hSXQjnWI&cx=baf9bdb0c631236e5`
        );

        const data = response.data;

        // Delete processing message
        await client.sendMessage(chatId, { delete: processingMsg.key });

        if (!data.items || data.items.length === 0) {
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: m.key } 
            });
            return await client.sendMessage(chatId, { 
                text: `🔍 *GOOGLE SEARCH*\n\nNo results found for "${query}". Try a different search term.` 
            }, { quoted: m });
        }

        // Format results (limit to 5 results to avoid message too long)
        let resultText = `🔍 *GOOGLE SEARCH RESULTS*\n\n`;
        resultText += `📌 *Search Term:* ${query}\n`;
        resultText += `📊 *Total Results:* ${data.searchInformation?.totalResults || data.items.length}\n\n`;

        const maxResults = Math.min(data.items.length, 5);
        
        for (let i = 0; i < maxResults; i++) {
            const item = data.items[i];
            resultText += `*${i + 1}. ${item.title}*\n`;
            resultText += `📝 ${item.snippet || 'No description'}\n`;
            resultText += `🔗 ${item.link}\n\n`;
        }

        if (data.items.length > 5) {
            resultText += `*...and ${data.items.length - 5} more results*\n\n`;
        }

        resultText += `⚡ *Search Time:* ${data.searchInformation?.searchTime || 'N/A'} seconds\n`;
        resultText += `─ MAD-MAX BOT`;

        // Success reaction
        await client.sendMessage(chatId, { 
            react: { text: '✅', key: m.key } 
        });

        // Check if message is too long
        if (resultText.length > 4000) {
            const chunks = resultText.match(/(.|[\r\n]){1,3500}/g) || [];
            
            await client.sendMessage(chatId, { 
                text: `🔍 *GOOGLE SEARCH (Part 1/${chunks.length})*\n\n${chunks[0]}`
            }, { quoted: m });

            for (let i = 1; i < chunks.length; i++) {
                await client.sendMessage(chatId, { 
                    text: `*Part ${i+1}/${chunks.length}:*\n\n${chunks[i]}`
                });
                
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        } else {
            await client.sendMessage(chatId, { 
                text: resultText
            }, { quoted: m });
        }

    } catch (error) {
        console.error('Google search error:', error);

        // Error reaction
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: m.key } 
        });

        await client.sendMessage(chatId, {
            text: `🔍 *GOOGLE SEARCH*\n\n❌ An error occurred.\n\nError: ${error.message}`
        }, { quoted: m });
    }
};

module.exports = {
    googleCommand
};