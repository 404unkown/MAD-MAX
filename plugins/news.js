const axios = require('axios');

async function newsCommand(client, chatId, message, args, sender, pushName, isOwnerSimple) {
    try {
        // Send processing reaction
        await client.sendMessage(chatId, { 
            react: { text: '📰', key: message.key } 
        });

        const processingMsg = await client.sendMessage(chatId, {
            text: '📰 *Fetching latest news...*'
        }, { quoted: message });

        const apiKey = 'dcd720a6f1914e2d9dba9790c188c08c';
        
        // Get country from args or default to 'us'
        const country = args[0] || 'us';
        
        const response = await axios.get(`https://newsapi.org/v2/top-headlines?country=${country}&apiKey=${apiKey}`);
        
        if (!response.data || !response.data.articles || response.data.articles.length === 0) {
            await client.sendMessage(chatId, { delete: processingMsg.key });
            await client.sendMessage(chatId, { 
                text: `❌ No news found for country: ${country}`
            }, { quoted: message });
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: message.key } 
            });
            return;
        }

        const articles = response.data.articles.slice(0, 5); // Get top 5 articles
        
        let newsMessage = `📰 *Latest News - ${country.toUpperCase()}*\n\n`;
        
        articles.forEach((article, index) => {
            newsMessage += `${index + 1}. *${article.title || 'No title'}*\n`;
            if (article.description) {
                newsMessage += `${article.description}\n`;
            }
            if (article.source?.name) {
                newsMessage += `📌 *Source:* ${article.source.name}\n`;
            }
            newsMessage += '\n';
        });

        newsMessage += `👤 *Requested by:* @${sender.split('@')[0]}`;

        // Delete processing message
        await client.sendMessage(chatId, { delete: processingMsg.key });

        await client.sendMessage(chatId, { 
            text: newsMessage,
            mentions: [sender]
        }, { quoted: message });

        // Success reaction
        await client.sendMessage(chatId, { 
            react: { text: '✅', key: message.key } 
        });

    } catch (error) {
        console.error('Error fetching news:', error);
        await client.sendMessage(chatId, { 
            text: '❌ Sorry, I could not fetch news right now.'
        }, { quoted: message });
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: message.key } 
        });
    }
}

module.exports = newsCommand;