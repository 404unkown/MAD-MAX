const axios = require('axios');

const fxpairsCommand = async (client, chatId, m, args, sender, pushName, isOwner) => {
    try {
        // Send loading reaction
        await client.sendMessage(chatId, { 
            react: { text: '💱', key: m.key } 
        });

        const apiUrl = "https://api.polygon.io/v3/reference/tickers?market=fx&active=true&apiKey=Y4iTYoJANwppB8I3Bm4QVWdV5oXlvc45";
        const response = await axios.get(apiUrl);
        const data = response.data;

        if (!data || !data.results || data.results.length === 0) {
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: m.key } 
            });
            return await client.sendMessage(chatId, {
                text: "💱 *FOREX CURRENCY PAIRS*\n\n❌ Failed to fetch forex currency pairs."
            }, { quoted: m });
        }

        // Get only major pairs to avoid message being too long
        const majorPairs = data.results.filter(pair => {
            const ticker = pair.ticker;
            // Filter for major currency pairs (EUR/USD, GBP/USD, USD/JPY, etc)
            return ticker.includes('EUR') || ticker.includes('USD') || 
                   ticker.includes('GBP') || ticker.includes('JPY') ||
                   ticker.includes('CHF') || ticker.includes('CAD') ||
                   ticker.includes('AUD') || ticker.includes('NZD');
        }).slice(0, 30); // Limit to 30 pairs

        let output = `💱 *ACTIVE FOREX CURRENCY PAIRS*\n\n`;
        
        if (args[0] === 'all') {
            // Show all pairs (might be very long)
            data.results.slice(0, 50).forEach((pair, index) => {
                output += `${index + 1}. *${pair.ticker}* - ${pair.name || 'N/A'}\n`;
            });
            output += `\n📊 *Showing 50 of ${data.results.length} total pairs*`;
        } else {
            // Show major pairs
            majorPairs.forEach((pair, index) => {
                output += `${index + 1}. *${pair.ticker}* - ${pair.name || 'N/A'}\n`;
            });
            output += `\n📊 *Showing ${majorPairs.length} major pairs*`;
            output += `\n💡 *Use* .fxpairs all *to see all ${data.results.length} pairs*`;
        }

        output += `\n\n📅 *Last updated:* ${new Date().toLocaleDateString()}`;
        output += `\n\n💡 *Check rates:* .exchange 100 USD EUR`;
        output += `\n💡 *Forex news:* .forex`;
        output += `\n\n─ MAD-MAX BOT`;

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
        console.error('Error fetching forex currency pairs:', error);
        
        // Error reaction
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: m.key } 
        });
        
        await client.sendMessage(chatId, {
            text: "💱 *FOREX CURRENCY PAIRS*\n\n❌ Failed to fetch forex currency pairs. Please try again later."
        }, { quoted: m });
    }
};

module.exports = {
    fxpairsCommand
};