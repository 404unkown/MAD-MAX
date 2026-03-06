const axios = require('axios');

const forexCommand = async (client, chatId, m, args, sender, pushName, isOwner) => {
    try {
        // Send loading reaction
        await client.sendMessage(chatId, { 
            react: { text: '📰', key: m.key } 
        });

        const apiUrl = "https://api.polygon.io/v2/reference/news?apiKey=Y4iTYoJANwppB8I3Bm4QVWdV5oXlvc45";
        const response = await axios.get(apiUrl);
        const data = response.data;

        if (!data.results || data.results.length === 0) {
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: m.key } 
            });
            return await client.sendMessage(chatId, {
                text: "📰 *FOREX NEWS*\n\nNo forex news available at the moment."
            }, { quoted: m });
        }

        const articles = data.results.slice(0, 5); // Limit to 5 articles to avoid message too long
        let output = "📰 *FOREX NEWS*\n\n";

        articles.forEach((article, index) => {
            output += `*${index + 1}. ${article.title}*\n`;
            output += `📌 *Publisher:* ${article.publisher.name}\n`;
            output += `🕒 *Published:* ${new Date(article.published_utc).toLocaleString()}\n`;
            output += `🔗 *Link:* ${article.article_url}\n\n`;

            if (index < articles.length - 1) {
                output += "───\n\n";
            }
        });

        output += "─ MAD-MAX BOT";

        // Success reaction
        await client.sendMessage(chatId, { 
            react: { text: '✅', key: m.key } 
        });

        // Check if message is too long
        if (output.length > 4000) {
            const chunks = output.match(/(.|[\r\n]){1,3500}/g) || [];
            
            for (let i = 0; i < chunks.length; i++) {
                await client.sendMessage(chatId, { 
                    text: i === 0 ? chunks[i] : `*Part ${i+1}/${chunks.length}*\n\n${chunks[i]}`
                }, { quoted: i === 0 ? m : null });
                
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        } else {
            await client.sendMessage(chatId, {
                text: output
            }, { quoted: m });
        }

    } catch (error) {
        console.error('Error fetching forex news:', error);
        
        // Error reaction
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: m.key } 
        });
        
        await client.sendMessage(chatId, {
            text: "📰 *FOREX NEWS*\n\n❌ Failed to fetch forex news. Please try again later."
        }, { quoted: m });
    }
};

module.exports = {
    forexCommand
};