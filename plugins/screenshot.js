const axios = require("axios");
const { channelInfo } = require('../lib/messageConfig');

async function screenshotCommand(client, chatId, message, args, sender, pushName, isOwnerSimple) {
    try {
        const url = args[0];
        
        if (!url) {
            await client.sendMessage(chatId, {
                text: "🌐 *Website Screenshot*\n\nPlease provide a website URL\n\n*Example:* .ss https://github.com\n.ss https://google.com\n\n*Aliases:* .ss, .screenshot, .ssweb",
                ...channelInfo
            }, { quoted: message });
            return;
        }

        // Validate URL
        let validUrl = url.trim();
        if (!validUrl.startsWith("http://") && !validUrl.startsWith("https://")) {
            validUrl = "https://" + validUrl;
        }

        try {
            new URL(validUrl);
        } catch (error) {
            await client.sendMessage(chatId, {
                text: "❌ Invalid URL format\n\nPlease provide a valid website URL\n*Example:* .ss https://example.com",
                ...channelInfo
            }, { quoted: message });
            return;
        }

        // Send processing reaction
        await client.sendMessage(chatId, { 
            react: { text: '⏳', key: message.key } 
        });

        const processingMsg = await client.sendMessage(chatId, {
            text: `📸 *Capturing screenshot...*\n\nWebsite: ${validUrl}\n\nThis may take a few seconds.`,
            ...channelInfo
        }, { quoted: message });

        let imageBuffer = null;
        let serviceUsed = "";
        
        // ====== METHOD 1: ScreenshotMachine (Currently working for you) ======
        try {
            const apiUrl = `https://www.screenshotmachine.com/?url=${encodeURIComponent(validUrl)}&size=M&format=jpg`;
            console.log("Trying ScreenshotMachine:", apiUrl);
            
            const response = await axios.get(apiUrl, { 
                timeout: 20000,
                responseType: 'arraybuffer',
                maxRedirects: 5,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            
            if (response.status === 200 && response.data && response.data.length > 5000) {
                imageBuffer = Buffer.from(response.data);
                serviceUsed = "ScreenshotMachine";
                console.log("✅ Using ScreenshotMachine");
            }
        } catch (error) {
            console.log("ScreenshotMachine failed:", error.message);
        }

        // ====== METHOD 2: MiniScreenshot (Like your .img fallback) ======
        if (!imageBuffer) {
            try {
                const apiUrl = `https://mini.s-shot.ru/1280x1024/JPG/1024/${encodeURIComponent(validUrl)}`;
                console.log("Trying MiniScreenshot:", apiUrl);
                
                const response = await axios.get(apiUrl, { 
                    timeout: 15000,
                    responseType: 'arraybuffer',
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                });
                
                if (response.status === 200 && response.data && response.data.length > 5000) {
                    imageBuffer = Buffer.from(response.data);
                    serviceUsed = "MiniScreenshot";
                    console.log("✅ Using MiniScreenshot");
                }
            } catch (error) {
                console.log("MiniScreenshot failed:", error.message);
            }
        }

        // ====== METHOD 3: Browserless.io (Like your .img fallback) ======
        if (!imageBuffer) {
            try {
                // Try to get screenshot via API
                const apiUrl = `https://browserless-url-to-image.vercel.app/api/image?url=${encodeURIComponent(validUrl)}&width=1280&height=720`;
                
                const response = await axios.get(apiUrl, { 
                    timeout: 20000,
                    responseType: 'arraybuffer'
                });
                
                if (response.status === 200 && response.data && response.data.length > 5000) {
                    imageBuffer = Buffer.from(response.data);
                    serviceUsed = "Browserless";
                    console.log("✅ Using Browserless");
                }
            } catch (error) {
                console.log("Browserless failed:", error.message);
            }
        }

        // ====== METHOD 4: API的首都 (Like your .img fallback) ======
        if (!imageBuffer) {
            try {
                const apiUrl = `https://api.首都.com/screenshot?url=${encodeURIComponent(validUrl)}`;
                console.log("Trying API.首都:", apiUrl);
                
                const response = await axios.get(apiUrl, { 
                    timeout: 15000,
                    responseType: 'arraybuffer'
                });
                
                if (response.status === 200 && response.data && response.data.length > 5000) {
                    imageBuffer = Buffer.from(response.data);
                    serviceUsed = "Capital API";
                    console.log("✅ Using API.首都");
                }
            } catch (error) {
                console.log("API.首都 failed:", error.message);
            }
        }

        // ====== NO SERVICE WORKED ======
        if (!imageBuffer) {
            await client.sendMessage(chatId, { delete: processingMsg.key });
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: message.key } 
            });
            
            await client.sendMessage(chatId, {
                text: `❌ *All screenshot services failed*\n\nCould not capture screenshot of:\n${validUrl}\n\n🔧 *Try:*\n1. Visit this link directly:\nhttps://mini.s-shot.ru/1280x1024/JPG/1024/${encodeURIComponent(validUrl)}`,
                ...channelInfo
            }, { quoted: message });
            return;
        }

        // ====== SEND SCREENSHOT (Like .img command) ======
        try {
            await client.sendMessage(chatId, { delete: processingMsg.key });

            // Send exactly like .img command does
            await client.sendMessage(chatId, {
                image: imageBuffer,
                caption: `🌐 *Website Screenshot*\n\n🔗 *URL:* ${validUrl}\n📱 *Service:* ${serviceUsed}\n\n🤖 *Requested by: ${pushName}*`,
                ...channelInfo
            }, { quoted: message });

            // Success reaction
            await client.sendMessage(chatId, { 
                react: { text: '✅', key: message.key } 
            });

            console.log(`✅ Screenshot sent successfully using ${serviceUsed}`);

        } catch (sendError) {
            console.error('Send error:', sendError);
            
            // FALLBACK: Try sending as document (like .img would handle errors)
            try {
                await client.sendMessage(chatId, {
                    document: imageBuffer,
                    mimetype: 'image/jpeg',
                    fileName: `screenshot-${Date.now()}.jpg`,
                    caption: `🌐 *Website Screenshot*\n\n🔗 *URL:* ${validUrl}\n📱 *Service:* ${serviceUsed}\n\n🤖 *Requested by: ${pushName}*`,
                    ...channelInfo
                }, { quoted: message });
                
                console.log("✅ Sent as document instead");
                
                await client.sendMessage(chatId, { 
                    react: { text: '✅', key: message.key } 
                });
            } catch (fallbackError) {
                throw fallbackError;
            }
        }

    } catch (error) {
        console.error('Screenshot command error:', error);
        
        let errorMsg = "❌ Failed to capture screenshot.";
        
        if (error.message.includes("timeout")) {
            errorMsg = "⏳ Website took too long to load.";
        } else if (error.message.includes("ENOTFOUND")) {
            errorMsg = "🌐 Website not found or unreachable.";
        }

        await client.sendMessage(chatId, {
            text: errorMsg,
            ...channelInfo
        }, { quoted: message });

        await client.sendMessage(chatId, { 
            react: { text: '❌', key: message.key } 
        });
    }
}

module.exports = screenshotCommand;