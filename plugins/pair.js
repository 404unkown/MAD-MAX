const axios = require('axios');
const { sleep } = require('../lib/myfunc');

async function pairCommand(client, chatId, message, args, sender, pushName, isOwnerSimple) {
    try {
        // Get the phone number from args
        const q = args.join(' ');
        
        if (!q) {
            return await client.sendMessage(chatId, {
                text: "📱 *PAIRING CODE GENERATOR*\n\nPlease provide a valid WhatsApp number\nExample: .pair 254104158915",
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363401269012709@newsletter',
                        newsletterName: 'MAD-MAX',
                        serverMessageId: -1
                    }
                }
            }, { quoted: message });
        }

        // Clean the number
        const number = q.replace(/[^0-9]/g, '');

        if (number.length < 9 || number.length > 15) {
            return await client.sendMessage(chatId, {
                text: "❌ *Invalid Number!*\n\nPlease use the correct format:\n.pair 254104158915",
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363401269012709@newsletter',
                        newsletterName: 'MAD-MAX',
                        serverMessageId: -1
                    }
                }
            }, { quoted: message });
        }

        const whatsappID = number + '@s.whatsapp.net';
        const result = await client.onWhatsApp(whatsappID);

        if (!result[0]?.exists) {
            return await client.sendMessage(chatId, {
                text: `❌ *${number}* is not registered on WhatsApp!`,
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363401269012709@newsletter',
                        newsletterName: 'MAD-MAX',
                        serverMessageId: -1
                    }
                }
            }, { quoted: message });
        }

        await client.sendMessage(chatId, {
            text: "⏳ *Generating your pairing code...*\n\nPlease wait a moment",
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363401269012709@newsletter',
                    newsletterName: 'MAD-MAX',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });

        try {
            // ✅ USING YOUR HEROKU API
            const response = await axios.get(`https://nuchu2-322767aabff0.herokuapp.com/code?number=${number}`, {
                timeout: 30000
            });
            
            if (response.data && response.data.code) {
                const code = response.data.formattedCode || response.data.code;
                
                await sleep(5000);
                
                await client.sendMessage(chatId, {
                    text: `✅ *Pairing Code*\n\n\`${code}\`\n\nEnter this code in WhatsApp > Linked Devices`,
                    contextInfo: {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363401269012709@newsletter',
                            newsletterName: 'MAD-MAX',
                            serverMessageId: -1
                        }
                    }
                }, { quoted: message });
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (apiError) {
            console.error('API Error:', apiError);
            
            const errorMessage = apiError.code === 'ECONNABORTED' || apiError.message.includes('timeout')
                ? "⏰ Request timeout. The service might be slow. Please try again."
                : "❌ Failed to generate pairing code. The service might be down.";
            
            await client.sendMessage(chatId, {
                text: `${errorMessage}\n\n🔗 Try manually: https://nuchu2-322767aabff0.herokuapp.com/pair`,
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363401269012709@newsletter',
                        newsletterName: 'MAD-MAX',
                        serverMessageId: -1
                    }
                }
            }, { quoted: message });
        }
        
    } catch (error) {
        console.error('Pair command error:', error);
        await client.sendMessage(chatId, {
            text: "❌ An error occurred. Please try again later.\n\nManual: https://nuchu2-322767aabff0.herokuapp.com/pair",
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363401269012709@newsletter',
                    newsletterName: 'MAD-MAX',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });
    }
}

module.exports = pairCommand;