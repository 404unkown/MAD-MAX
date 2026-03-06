const axios = require('axios');

const exchangeCommand = async (client, chatId, m, args, sender, pushName, isOwner) => {
    try {
        const text = args.join(' ').trim();

        // Send reaction
        await client.sendMessage(chatId, { 
            react: { text: '💱', key: m.key } 
        });

        // If user provides conversion request (e.g., "100 USD EUR")
        if (text) {
            const parts = text.split(' ');
            if (parts.length === 3) {
                const [amount, fromCurrency, toCurrency] = parts;
                const amountNum = parseFloat(amount);

                if (isNaN(amountNum)) {
                    return await client.sendMessage(chatId, {
                        text: `❌ *Invalid amount*\n\nUsage: .exchange 100 USD EUR`
                    }, { quoted: m });
                }

                // Get exchange rates
                const apiUrl = `https://api.exchangerate-api.com/v4/latest/${fromCurrency.toUpperCase()}`;
                const response = await axios.get(apiUrl);
                const data = response.data;

                if (!data || !data.rates) {
                    return await client.sendMessage(chatId, {
                        text: `❌ *Invalid currency code:* ${fromCurrency}`
                    }, { quoted: m });
                }

                const rate = data.rates[toCurrency.toUpperCase()];
                if (!rate) {
                    return await client.sendMessage(chatId, {
                        text: `❌ *Invalid currency code:* ${toCurrency}`
                    }, { quoted: m });
                }

                const converted = amountNum * rate;

                await client.sendMessage(chatId, {
                    text: `💱 *CURRENCY EXCHANGE*\n\n` +
                          `💰 *${amount} ${fromCurrency.toUpperCase()}* = ` +
                          `*${converted.toFixed(2)} ${toCurrency.toUpperCase()}*\n\n` +
                          `📊 *Exchange Rate:* 1 ${fromCurrency.toUpperCase()} = ${rate.toFixed(4)} ${toCurrency.toUpperCase()}\n` +
                          `📅 *Last updated:* ${data.date}\n\n` +
                          `─ MAD-MAX BOT`
                }, { quoted: m });
                return;
            } else {
                // Invalid format
                return await client.sendMessage(chatId, {
                    text: `❌ *Invalid format*\n\nUsage: .exchange 100 USD EUR\nExample: .exchange 1000 KES USD`
                }, { quoted: m });
            }
        }

        // Show all exchange rates if no specific conversion
        const currencyCode = "USD";
        const apiUrl = `https://api.exchangerate-api.com/v4/latest/${currencyCode}`;
        const response = await axios.get(apiUrl);
        const data = response.data;

        if (!data || !data.rates) {
            return await client.sendMessage(chatId, {
                text: `❌ Failed to fetch exchange rates.`
            }, { quoted: m });
        }

        let output = `💱 *EXCHANGE RATES (${data.base})*\n\n`;
        output += `*Popular Currencies:*\n`;

        const popular = ['EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR', 'KES', 'TZS', 'NGN', 'ZAR', 'UGX', 'RWF'];
        popular.forEach(currency => {
            if (data.rates[currency]) {
                output += `• *${currency}:* ${data.rates[currency].toFixed(4)}\n`;
            }
        });

        output += `\n📊 *Total Currencies:* ${Object.keys(data.rates).length}`;
        output += `\n📅 *Last updated:* ${data.date}`;
        output += `\n\n💡 *Exchange Currency:* .exchange <amount> <from> <to>`;
        output += `\n📌 *Example:* .exchange 100 USD EUR`;
        output += `\n📌 *Example:* .exchange 1000 KES USD`;
        output += `\n📌 *Example:* .exchange 50 EUR GBP`;
        output += `\n\n─ MAD-MAX BOT`;

        await client.sendMessage(chatId, {
            text: output
        }, { quoted: m });

    } catch (error) {
        console.error('Exchange error:', error);
        await client.sendMessage(chatId, {
            text: `❌ *Failed to fetch exchange rates*\n\nPlease try again later.\n\n💡 Usage: .exchange 100 USD EUR`
        }, { quoted: m });
    }
};

module.exports = {
    exchangeCommand
};