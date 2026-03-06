const axios = require('axios');

const stocktickersCommand = async (client, chatId, m, args, sender, pushName, isOwner) => {
    try {
        // Send loading reaction
        await client.sendMessage(chatId, { 
            react: { text: '📈', key: m.key } 
        });

        // Parse limit from args (default: 20, max: 50 to avoid message too long)
        let limit = 20;
        if (args[0] && !isNaN(args[0])) {
            limit = Math.min(parseInt(args[0]), 50);
        }

        const apiUrl = `https://api.polygon.io/v3/reference/tickers?active=true&limit=${limit}&apiKey=Y4iTYoJANwppB8I3Bm4QVWdV5oXlvc45`;
        const response = await axios.get(apiUrl);
        const data = response.data;

        if (!data || !data.results || data.results.length === 0) {
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: m.key } 
            });
            return await client.sendMessage(chatId, {
                text: "📈 *STOCK TICKERS*\n\n❌ No active stock tickers found."
            }, { quoted: m });
        }

        let output = `📈 *ACTIVE STOCK TICKERS*\n\n`;
        output += `Showing ${data.results.length} tickers:\n\n`;

        // Group by exchange for better organization
        const tickersByExchange = {};
        data.results.forEach((ticker) => {
            const exchange = ticker.primary_exchange || 'Other';
            if (!tickersByExchange[exchange]) {
                tickersByExchange[exchange] = [];
            }
            tickersByExchange[exchange].push(ticker);
        });

        // Display tickers grouped by exchange
        for (const [exchange, tickers] of Object.entries(tickersByExchange)) {
            output += `*${exchange}*\n`;
            tickers.slice(0, 10).forEach((ticker) => {
                const name = ticker.name ? ticker.name.substring(0, 40) : 'N/A';
                output += `• *${ticker.ticker}* - ${name}\n`;
            });
            if (tickers.length > 10) {
                output += `  _...and ${tickers.length - 10} more_\n`;
            }
            output += '\n';
        }

        output += `📊 *Total Active Tickers:* ${data.results.length}`;
        output += `\n📅 *Last Updated:* ${new Date().toLocaleDateString()}`;
        output += `\n\n💡 *Usage:* .stocktickers [limit]`;
        output += `\n💡 *Example:* .stocktickers 30`;
        output += `\n💡 *Max limit:* 50`;
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
        console.error('Error fetching stock tickers:', error);
        
        // Error reaction
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: m.key } 
        });
        
        await client.sendMessage(chatId, {
            text: "📈 *STOCK TICKERS*\n\n❌ Failed to fetch stock tickers. Please try again later."
        }, { quoted: m });
    }
};

module.exports = {
    stocktickersCommand
};