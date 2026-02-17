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

        let screenshotUrl = null;
        let serviceUsed = "";
        
        // ====== TRY MULTIPLE SCREENSHOT SERVICES ======
        
        // SERVICE 1: Thum.io
        try {
            const thumUrl = `https://image.thum.io/get/fullpage/${encodeURIComponent(validUrl)}`;
            
            console.log("Trying Thum.io:", thumUrl);
            
            // Test if URL is accessible
            const testResponse = await axios.head(thumUrl, { timeout: 10000 });
            if (testResponse.status === 200) {
                screenshotUrl = thumUrl;
                serviceUsed = "Thum.io";
                console.log("✅ Using Thum.io");
            }
        } catch (thumError) {
            console.log("Thum.io failed:", thumError.message);
        }

        // SERVICE 2: ScreenshotAPI.net (free tier)
        if (!screenshotUrl) {
            try {
                const apiUrl = `https://shot.screenshotapi.net/screenshot?url=${encodeURIComponent(validUrl)}&width=1280&height=720&output=image&file_type=png&delay=2000`;
                
                const testResponse = await axios.head(apiUrl, { timeout: 10000 });
                if (testResponse.status === 200) {
                    screenshotUrl = apiUrl;
                    serviceUsed = "ScreenshotAPI.net";
                    console.log("✅ Using ScreenshotAPI.net");
                }
            } catch (apiError) {
                console.log("ScreenshotAPI.net failed:", apiError.message);
            }
        }

        // SERVICE 3: Miniature.io (free alternative)
        if (!screenshotUrl) {
            try {
                const miniatureUrl = `https://api.miniature.io/screenshot?url=${encodeURIComponent(validUrl)}&width=1280&height=720`;
                
                const testResponse = await axios.head(miniatureUrl, { timeout: 10000 });
                if (testResponse.status === 200) {
                    screenshotUrl = miniatureUrl;
                    serviceUsed = "Miniature.io";
                    console.log("✅ Using Miniature.io");
                }
            } catch (miniError) {
                console.log("Miniature.io failed:", miniError.message);
            }
        }

        // SERVICE 4: ScreenshotMachine (free tier - 100/month)
        if (!screenshotUrl) {
            try {
                // Free API key from https://www.screenshotmachine.com
                const apiKey = 'YOUR_API_KEY_HERE'; // Replace with your key if you have one
                if (apiKey !== 'YOUR_API_KEY_HERE') {
                    const smUrl = `https://api.screenshotmachine.com?key=${apiKey}&url=${encodeURIComponent(validUrl)}&dimension=1024x768&format=png`;
                    
                    const testResponse = await axios.head(smUrl, { timeout: 10000 });
                    if (testResponse.status === 200) {
                        screenshotUrl = smUrl;
                        serviceUsed = "ScreenshotMachine";
                        console.log("✅ Using ScreenshotMachine");
                    }
                }
            } catch (smError) {
                console.log("ScreenshotMachine failed:", smError.message);
            }
        }

        // ====== NO SERVICE WORKED ======
        if (!screenshotUrl) {
            await client.sendMessage(chatId, { delete: processingMsg.key });
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: message.key } 
            });
            
            await client.sendMessage(chatId, {
                text: `❌ *All screenshot services failed*\n\nCould not capture screenshot of:\n${validUrl}\n\n💡 *Possible reasons:*\n• Website blocks screenshot tools\n• Services temporarily down\n\n🔧 *Try:*\n1. Try a different URL\n2. Try again later`,
                ...channelInfo
            }, { quoted: message });
            return;
        }

        // ====== SEND SCREENSHOT ======
        try {
            // Delete processing message
            await client.sendMessage(chatId, { delete: processingMsg.key });

            // Send the screenshot
            await client.sendMessage(chatId, {
                image: { url: screenshotUrl },
                caption: `🌐 *Website Screenshot*\n\n🔗 *URL:* ${validUrl}\n📱 *Service:* ${serviceUsed}\n\n🤖 *${pushName}*`,
                ...channelInfo
            }, { quoted: message });

            // Success reaction
            await client.sendMessage(chatId, { 
                react: { text: '✅', key: message.key } 
            });

        } catch (sendError) {
            console.error('Send error:', sendError);
            await client.sendMessage(chatId, { delete: processingMsg.key });
            
            await client.sendMessage(chatId, {
                text: `❌ *Failed to send screenshot*\n\nError: ${sendError.message}`,
                ...channelInfo
            }, { quoted: message });

            await client.sendMessage(chatId, { 
                react: { text: '❌', key: message.key } 
            });
        }

    } catch (error) {
        console.error('Screenshot command error:', error);
        
        let errorMsg = "❌ Failed to capture screenshot.";
        
        if (error.message.includes("timeout")) {
            errorMsg = "⏳ Website took too long to load.";
        } else if (error.message.includes("ENOTFOUND")) {
            errorMsg = "🌐 Website not found or unreachable.";
        } else if (error.message.includes("ECONNREFUSED")) {
            errorMsg = "🚫 Connection refused by website.";
        } else if (error.message.includes("certificate")) {
            errorMsg = "🔒 SSL certificate error.";
        }

        errorMsg += `\n\n*Error:* ${error.message}`;

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