const axios = require('axios');

const currencylistCommand = async (client, chatId, m, args, sender, pushName, isOwner) => {
    try {
        // Send loading reaction
        await client.sendMessage(chatId, { 
            react: { text: '⌛', key: m.key } 
        });

        const response = await axios.get('https://v6.exchangerate-api.com/v6/0d36793326ec3af0c240a8d4/latest/USD');
        const data = response.data;

        if (!data || data.result !== "success") {
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: m.key } 
            });
            return await client.sendMessage(chatId, {
                text: '❌ Failed to retrieve currency rates. Please try again later.'
            }, { quoted: m });
        }

        // Get only the most common currencies to avoid message being too long
        const commonCurrencies = [
            'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 
            'INR', 'BRL', 'ZAR', 'RUB', 'KRW', 'SGD', 'NZD', 'MXN',
            'HKD', 'NOK', 'SEK', 'TRY', 'AED', 'SAR', 'THB', 'MYR'
        ];

        let message = '💱 *CURRENCY CONVERSION RATES (USD Base)*\n\n';
        
        // Add common currencies first
        for (const currency of commonCurrencies) {
            if (data.conversion_rates[currency]) {
                message += `*${currency}*: ${data.conversion_rates[currency].toFixed(4)}\n`;
            }
        }

        // Add a note about more currencies
        message += `\n_Showing 24 common currencies. Use .convert <amount> <from> <to> for specific conversions._\n\n─ MAD-MAX BOT`;

        // Success reaction
        await client.sendMessage(chatId, { 
            react: { text: '✅', key: m.key } 
        });

        await client.sendMessage(chatId, { 
            text: message 
        }, { quoted: m });

    } catch (error) {
        console.error('Error in currencylist command:', error);
        
        // Error reaction
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: m.key } 
        });
        
        await client.sendMessage(chatId, {
            text: '❌ Something went wrong while fetching currency rates. Please try again later.'
        }, { quoted: m });
    }
};

module.exports = {
    currencylistCommand
};