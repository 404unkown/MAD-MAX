const axios = require('axios');

const screenshotCommand = async (client, chatId, m, args, sender, pushName, isOwner) => {
    try {
        const text = args.join(' ').trim();
        
        // Get botname from config
        const config = require('../set');
        const botname = config.botname || 'MAD-MAX';
        
        const cap = `📸 Screenshot by ${botname}`;

        if (!text) {
            return await client.sendMessage(chatId, { 
                text: `📸 *WEBSITE SCREENSHOT*\n\nPlease provide a website link to screenshot.\n\nExample: .screenshot https://example.com` 
            }, { quoted: m });
        }

        // Validate URL
        if (!/^https?:\/\//i.test(text)) {
            return await client.sendMessage(chatId, { 
                text: `❌ *Invalid URL*\n\nPlease provide a URL starting with http:// or https://` 
            }, { quoted: m });
        }

        // Send loading reaction
        await client.sendMessage(chatId, { 
            react: { text: '📸', key: m.key } 
        });

        // Send processing message
        const processingMsg = await client.sendMessage(chatId, {
            text: `📸 *WEBSITE SCREENSHOT*\n\nTaking screenshot of *${text}*...\n\nPlease wait.`
        }, { quoted: m });

        // Generate screenshot URL
        const image = `https://image.thum.io/get/fullpage/${text}`;

        // Delete processing message
        await client.sendMessage(chatId, { delete: processingMsg.key });

        // Success reaction
        await client.sendMessage(chatId, { 
            react: { text: '✅', key: m.key } 
        });

        // Send the screenshot
        await client.sendMessage(chatId, { 
            image: { url: image }, 
            caption: `📸 *WEBSITE SCREENSHOT*\n\n${cap}\n\n🔗 *URL:* ${text}\n\n─ MAD-MAX BOT`
        }, { quoted: m });

    } catch (error) {
        console.error('Screenshot error:', error);

        // Error reaction
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: m.key } 
        });

        await client.sendMessage(chatId, {
            text: `📸 *WEBSITE SCREENSHOT*\n\n❌ An error occurred while taking the screenshot.\n\nPlease check if the URL is valid and accessible.\n\nError: ${error.message}`
        }, { quoted: m });
    }
};

module.exports = {
    screenshotCommand
};