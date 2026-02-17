const axios = require('axios');

async function pairCommand(client, chatId, message, args, sender, pushName, isOwnerSimple) {
    try {
        const q = args.join(' ').trim();
        
        if (!q) {
            await client.sendMessage(chatId, {
                text: `📱 *Pair Command*\n\n*Usage:* .pair <whatsapp-number>\n*Example:* .pair 254769769295\n\n*Multiple numbers:* .pair 254769769295,254712345678\n\n🔗 *Manual Pair:* https://pair-1-3xsl.onrender.com/pair`
            }, { quoted: message });
            return;
        }

        // Send processing reaction
        await client.sendMessage(chatId, { 
            react: { text: '⏳', key: message.key } 
        });

        const numbers = q.split(',')
            .map(num => num.trim().replace(/[^0-9]/g, ''))
            .filter(num => num.length >= 9 && num.length <= 15);

        if (numbers.length === 0) {
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: message.key } 
            });
            await client.sendMessage(chatId, {
                text: `❌ *Invalid number(s)!*\n\nFormat: 9-15 digits\nExample: .pair 254769769295\nExample: .pair 254712345678,254798765432`
            }, { quoted: message });
            return;
        }

        const processingMsg = await client.sendMessage(chatId, {
            text: `🔍 *Processing ${numbers.length} number(s)...*`
        }, { quoted: message });

        let successResults = [];
        let failedResults = [];

        for (const number of numbers) {
            try {
                // Check if number exists on WhatsApp
                const whatsappID = number + '@s.whatsapp.net';
                const result = await client.onWhatsApp(whatsappID);
                
                if (!result[0]?.exists) {
                    failedResults.push(`${number} ❌ Not on WhatsApp`);
                    continue;
                }

                // Get pairing code from API
                console.log(`🔍 Fetching code for: ${number}`);
                const response = await axios.get(`https://pair-1-3xsl.onrender.com/code?number=${number}`, {
                    timeout: 15000,
                    headers: {
                        'Accept': 'application/json',
                        'User-Agent': 'WhatsApp-Bot/1.0'
                    }
                });

                if (response.data && response.data.code) {
                    const code = response.data.code;
                    successResults.push(`${number}: *${code}*`);
                    
                    // Send individual code
                    await client.sendMessage(chatId, {
                        text: `📱 *Pairing Code for ${number}:*\n\n${code}\n\n⏱️ *Valid for:* 30 seconds`,
                        quoted: message
                    });
                    
                    // Wait a bit between numbers
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    
                } else {
                    failedResults.push(`${number} ❌ No code received`);
                }
                
            } catch (error) {
                console.error(`Error for ${number}:`, error.message);
                
                if (error.code === 'ECONNREFUSED' || error.message.includes('timeout')) {
                    // API is down, stop processing
                    failedResults.push(`${number} ❌ Service unavailable`);
                    break;
                } else {
                    failedResults.push(`${number} ❌ ${error.message}`);
                }
            }
        }

        // Delete processing message
        await client.sendMessage(chatId, { delete: processingMsg.key });

        // Send summary
        let summaryText = `📊 *Pairing Summary*\n\n`;
        
        if (successResults.length > 0) {
            summaryText += `✅ *Successful:*\n${successResults.join('\n')}\n\n`;
        }
        
        if (failedResults.length > 0) {
            summaryText += `❌ *Failed:*\n${failedResults.join('\n')}\n\n`;
        }
        
        if (failedResults.length > 0 && successResults.length === 0) {
            summaryText += `🔧 *Try:*\n• Visit: https://pair-1-3xsl.onrender.com/pair\n• Enter numbers manually\n• Contact bot owner`;
        } else if (successResults.length > 0) {
            summaryText += `💡 *Instructions:*\nUse codes above within 30 seconds!`;
        }
        
        if (successResults.length + failedResults.length > 1) {
            await client.sendMessage(chatId, {
                text: summaryText,
                quoted: message
            });
        }

        // Success/Error reaction
        if (successResults.length > 0) {
            await client.sendMessage(chatId, { 
                react: { text: '✅', key: message.key } 
            });
        } else {
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: message.key } 
            });
        }

    } catch (error) {
        console.error('Pair command error:', error);
        
        await client.sendMessage(chatId, {
            text: `❌ *Error*\n\n${error.message}\n\n🔗 *Alternative:*\nVisit https://pair-1-3xsl.onrender.com/pair\nEnter your number manually`,
            quoted: message
        });
        
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: message.key } 
        });
    }
}

module.exports = pairCommand;