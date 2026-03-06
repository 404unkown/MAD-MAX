const axios = require('axios');

const shortenCommand = async (client, chatId, m, args, sender, pushName, isOwner) => {
    try {
        const text = args.join(' ').trim();

        if (!text) {
            return await client.sendMessage(chatId, { 
                text: `🔗 *URL SHORTENER*\n\nPlease provide a URL to shorten.\n\nExample: .shorten https://github.com/Fred1e/Fee-Xmd` 
            }, { quoted: m });
        }

        let url = text.trim();
        
        // Add https:// if no protocol is provided
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }

        // Send loading reaction
        await client.sendMessage(chatId, { 
            react: { text: '⌛', key: m.key } 
        });

        // Send processing message
        const processingMsg = await client.sendMessage(chatId, {
            text: `🔗 *URL SHORTENER*\n\nShortening URL...\n\nPlease wait.`
        }, { quoted: m });

        const encodedUrl = encodeURIComponent(url);
        const apiUrl = `https://api.nekolabs.web.id/tools/shortlink/tinyurl?url=${encodedUrl}`;

        const response = await axios.get(apiUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json'
            },
            timeout: 10000
        });

        // Delete processing message
        await client.sendMessage(chatId, { delete: processingMsg.key });

        if (!response.data?.success || !response.data?.result) {
            throw new Error('API returned invalid response');
        }

        const shortUrl = response.data.result;
        const responseTime = response.data.responseTime || 'N/A';

        // Success reaction
        await client.sendMessage(chatId, { 
            react: { text: '✅', key: m.key } 
        });

        // Format the response
        const message = `🔗 *URL SHORTENER*\n\n` +
            `*Original URL:*\n${url}\n\n` +
            `*Shortened URL:*\n${shortUrl}\n\n` +
            `*Response Time:* ${responseTime}\n\n` +
            `─ MAD-MAX BOT`;

        await client.sendMessage(chatId, { 
            text: message
        }, { quoted: m });

        // Also try to send with copy button if your bot supports it
        try {
            await client.sendMessage(chatId, {
                text: `📋 *Tap to copy:* ${shortUrl}`,
                contextInfo: {
                    externalAdReply: {
                        title: "Shortened URL",
                        body: "Click to copy",
                        sourceUrl: shortUrl
                    }
                }
            }, { quoted: m });
        } catch (buttonError) {
            // Ignore if buttons aren't supported
        }

    } catch (error) {
        console.error('Shorten error:', error);

        // Error reaction
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: m.key } 
        });

        let errorMessage = "Failed to shorten URL. ";
        
        if (error.response?.status === 400) {
            errorMessage += "Invalid URL format.";
        } else if (error.response?.status === 429) {
            errorMessage += "Rate limit exceeded. Try again later.";
        } else if (error.message.includes('timeout')) {
            errorMessage += "Request timeout.";
        } else if (error.message.includes('ENOTFOUND')) {
            errorMessage += "Cannot reach API server.";
        } else if (error.message.includes('Invalid response')) {
            errorMessage += "API returned invalid response.";
        } else {
            errorMessage += `Error: ${error.message}`;
        }

        await client.sendMessage(chatId, {
            text: `🔗 *URL SHORTENER*\n\n❌ ${errorMessage}`
        }, { quoted: m });
    }
};

module.exports = {
    shortenCommand
};