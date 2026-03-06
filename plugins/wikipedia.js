const axios = require('axios');

const wikipediaCommand = async (client, chatId, m, args, sender, pushName, isOwner) => {
    try {
        const query = args.join(' ').trim();

        if (!query) {
            return await client.sendMessage(chatId, { 
                text: `📚 *WIKIPEDIA SEARCH*\n\nPlease provide a term to search.\n\nExample: .wiki JavaScript\nExample: .wikipedia Albert Einstein` 
            }, { quoted: m });
        }

        // Send loading reaction
        await client.sendMessage(chatId, { 
            react: { text: '📚', key: m.key } 
        });

        // Send processing message
        const processingMsg = await client.sendMessage(chatId, {
            text: `📚 *WIKIPEDIA SEARCH*\n\nSearching for "${query}"...\n\nPlease wait.`
        }, { quoted: m });

        // Use Wikipedia REST API directly
        const searchResponse = await axios.get(
            `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`,
            {
                headers: {
                    'User-Agent': 'MAD-MAX-Bot/1.0',
                    'Accept': 'application/json'
                }
            }
        );

        const summary = searchResponse.data;

        // Delete processing message
        await client.sendMessage(chatId, { delete: processingMsg.key });

        // Format the response
        let message = `📚 *WIKIPEDIA SEARCH*\n\n`;
        message += `*Title:* ${summary.title || 'N/A'}\n`;
        
        if (summary.description) {
            message += `*Description:* ${summary.description}\n`;
        }
        
        message += `\n*Summary:*\n${summary.extract || 'No summary available'}\n\n`;
        
        if (summary.content_urls?.desktop?.page) {
            message += `*URL:* ${summary.content_urls.desktop.page}\n`;
        }
        
        message += `\n─ MAD-MAX BOT`;

        // Success reaction
        await client.sendMessage(chatId, { 
            react: { text: '✅', key: m.key } 
        });

        // Check if message is too long
        if (message.length > 4000) {
            const chunks = message.match(/(.|[\r\n]){1,3500}/g) || [];
            
            await client.sendMessage(chatId, { 
                text: `📚 *WIKIPEDIA SEARCH (Part 1/${chunks.length})*\n\n${chunks[0]}`
            }, { quoted: m });

            for (let i = 1; i < chunks.length; i++) {
                await client.sendMessage(chatId, { 
                    text: `*Part ${i+1}/${chunks.length}:*\n\n${chunks[i]}`
                });
                
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        } else {
            await client.sendMessage(chatId, { 
                text: message
            }, { quoted: m });
        }

    } catch (error) {
        console.error('Wikipedia error:', error);

        // Handle 404/not found
        if (error.response?.status === 404) {
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: m.key } 
            });
            return await client.sendMessage(chatId, { 
                text: `📚 *WIKIPEDIA SEARCH*\n\n❌ No results found for "${args.join(' ')}". Try a different search term.` 
            }, { quoted: m });
        }

        // Error reaction for other errors
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: m.key } 
        });

        await client.sendMessage(chatId, {
            text: `📚 *WIKIPEDIA SEARCH*\n\n❌ An error occurred.\n\nError: ${error.message}`
        }, { quoted: m });
    }
};

module.exports = {
    wikipediaCommand
};