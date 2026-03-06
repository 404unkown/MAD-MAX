const axios = require('axios');

const fxstatusCommand = async (client, chatId, m, args, sender, pushName, isOwner) => {
    try {
        // Send loading reaction
        await client.sendMessage(chatId, { 
            react: { text: '📊', key: m.key } 
        });

        const apiUrl = "https://api.polygon.io/v1/marketstatus/now?apiKey=Y4iTYoJANwppB8I3Bm4QVWdV5oXlvc45";
        const response = await axios.get(apiUrl);
        const data = response.data;

        if (!data) {
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: m.key } 
            });
            return await client.sendMessage(chatId, {
                text: "📊 *FOREX MARKET STATUS*\n\n❌ Failed to fetch forex market status."
            }, { quoted: m });
        }

        // Format market status with emojis
        const marketStatus = data.market ? "🟢 OPEN" : "🔴 CLOSED";
        const afterHoursStatus = data.afterHours ? "🔴 CLOSED" : "🟢 OPEN";
        
        let output = `📊 *FOREX MARKET STATUS*\n\n`;
        output += `*Server Time:* ${data.serverTime}\n`;
        output += `*Market:* ${marketStatus}\n`;
        output += `*After Hours:* ${afterHoursStatus}\n\n`;

        // Currencies
        output += `💱 *Currencies*\n`;
        output += `• Crypto: ${data.currencies?.crypto === 'open' ? '🟢 Open' : '🔴 Closed'}\n`;
        output += `• FX: ${data.currencies?.fx === 'open' ? '🟢 Open' : '🔴 Closed'}\n\n`;

        // Exchanges
        output += `🏛️ *Exchanges*\n`;
        output += `• NASDAQ: ${data.exchanges?.nasdaq === 'open' ? '🟢 Open' : '🔴 Closed'}\n`;
        output += `• NYSE: ${data.exchanges?.nyse === 'open' ? '🟢 Open' : '🔴 Closed'}\n`;
        output += `• OTC: ${data.exchanges?.otc === 'open' ? '🟢 Open' : '🔴 Closed'}\n\n`;

        // Indices Groups
        output += `📈 *Indices Groups*\n`;
        
        const indices = [
            { name: 'S&P', key: 's_and_p' },
            { name: 'Societe Generale', key: 'societe_generale' },
            { name: 'MSCI', key: 'msci' },
            { name: 'FTSE Russell', key: 'ftse_russell' },
            { name: 'MStar', key: 'mstar' },
            { name: 'MStarC', key: 'mstarc' },
            { name: 'CCCY', key: 'cccy' },
            { name: 'CGI', key: 'cgi' },
            { name: 'NASDAQ', key: 'nasdaq' },
            { name: 'Dow Jones', key: 'dow_jones' }
        ];

        indices.forEach(idx => {
            if (data.indicesGroups && data.indicesGroups[idx.key]) {
                const status = data.indicesGroups[idx.key] === 'open' ? '🟢 Open' : '🔴 Closed';
                output += `• ${idx.name}: ${status}\n`;
            }
        });

        output += `\n📅 *Last Updated:* ${new Date().toLocaleString()}`;
        output += `\n\n💡 *Related Commands:*`;
        output += `\n• .forex - Forex news`;
        output += `\n• .fxpairs - Currency pairs`;
        output += `\n• .exchange - Currency conversion`;
        output += `\n\n─ MAD-MAX BOT`;

        // Success reaction
        await client.sendMessage(chatId, { 
            react: { text: '✅', key: m.key } 
        });

        await client.sendMessage(chatId, {
            text: output
        }, { quoted: m });

    } catch (error) {
        console.error('Error fetching forex market status:', error);
        
        // Error reaction
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: m.key } 
        });
        
        await client.sendMessage(chatId, {
            text: "📊 *FOREX MARKET STATUS*\n\n❌ Failed to fetch forex market status. Please try again later."
        }, { quoted: m });
    }
};

module.exports = {
    fxstatusCommand
};