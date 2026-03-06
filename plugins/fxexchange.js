const axios = require('axios');

const fxexchangeCommand = async (client, chatId, m, args, sender, pushName, isOwner) => {
    try {
        // Send loading reaction
        await client.sendMessage(chatId, { 
            react: { text: '💱', key: m.key } 
        });

        const currencyCode = args[0]?.toUpperCase() || "USD";
        const apiUrl = `https://api.exchangerate-api.com/v4/latest/${currencyCode}`;
        const response = await axios.get(apiUrl);
        const data = response.data;

        if (!data || !data.rates) {
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: m.key } 
            });
            return await client.sendMessage(chatId, {
                text: `❌ Failed to fetch exchange rates for ${currencyCode}.`
            }, { quoted: m });
        }

        // Get only major currencies to avoid message being too long
        const majorCurrencies = [
            'USD', 'EUR', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD', 'NZD', 'CNY', 
            'INR', 'BRL', 'RUB', 'ZAR', 'MXN', 'SGD', 'HKD', 'KRW', 'TRY',
            'AED', 'SAR', 'KES', 'NGN', 'TZS', 'UGX', 'GHS', 'EGP'
        ];

        let output = `💱 *FOREIGN EXCHANGE RATES (${data.base})*\n\n`;
        output += `📅 *Last updated:* ${data.date}\n\n`;
        output += `*Major Currencies:*\n`;

        // Add major currencies first
        majorCurrencies.forEach(currency => {
            if (data.rates[currency] && currency !== data.base) {
                output += `• *${currency}:* ${data.rates[currency].toFixed(4)}\n`;
            }
        });

        // Add a note about total currencies
        const totalCurrencies = Object.keys(data.rates).length;
        output += `\n📊 *Total Currencies Available:* ${totalCurrencies}`;
        output += `\n\n💡 *Check specific currency:* .fxexchange EUR`;
        output += `\n💡 *Convert currency:* .exchange 100 USD EUR`;
        output += `\n\n─ MAD-MAX BOT`;

        // Success reaction
        await client.sendMessage(chatId, { 
            react: { text: '✅', key: m.key } 
        });

        await client.sendMessage(chatId, {
            text: output
        }, { quoted: m });

    } catch (error) {
        console.error('Error fetching exchange rates:', error);
        
        // Error reaction
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: m.key } 
        });
        
        await client.sendMessage(chatId, {
            text: "❌ Failed to fetch exchange rates. Please try again later."
        }, { quoted: m });
    }
};

module.exports = {
    fxexchangeCommand
};