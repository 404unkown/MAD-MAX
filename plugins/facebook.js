const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Global channel info
const channelInfo = {
    contextInfo: {
        forwardingScore: 1,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363401269012709@newsletter',
            newsletterName: 'MAD-MAX',
            serverMessageId: -1
        }
    }
};

async function facebookCommand(client, chatId, message, args, sender, pushName, isOwnerSimple) {
    try {
        const url = args[0];
        
        if (!url) {
            await client.sendMessage(chatId, { 
                text: "📱 *FACEBOOK DOWNLOADER*\n\nPlease provide a Facebook video URL.\nExample: .fb https://www.facebook.com/watch?v=12345",
                ...channelInfo
            }, { quoted: message });
            
            await client.sendMessage(chatId, { 
                react: { text: '⚠️', key: message.key } 
            });
            return;
        }

        // Validate Facebook URL
        if (!url.includes('facebook.com')) {
            await client.sendMessage(chatId, { 
                text: "❌ That is not a valid Facebook link.",
                ...channelInfo
            }, { quoted: message });
            
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: message.key } 
            });
            return;
        }

        // Send processing reaction
        await client.sendMessage(chatId, {
            react: { text: '⏳', key: message.key }
        });

        // Send processing message
        const processingMsg = await client.sendMessage(chatId, {
            text: '📥 *Downloading from Facebook...*\n\nThis may take a moment.',
            ...channelInfo
        }, { quoted: message });

        // Resolve share/short URLs to their final destination first
        let resolvedUrl = url;
        try {
            const res = await axios.get(url, { 
                timeout: 20000, 
                maxRedirects: 10, 
                headers: { 'User-Agent': 'Mozilla/5.0' } 
            });
            const possible = res?.request?.res?.responseUrl;
            if (possible && typeof possible === 'string') {
                resolvedUrl = possible;
            }
        } catch {
            // ignore resolution errors; use original url
        }

     // Use Dreaded API or alternative
async function fetchFromApi(u) {
    // Try multiple APIs for reliability
    const apis = [
        `https://api.dreaded.site/api/facebook?url=${encodeURIComponent(u)}`,
        `https://api.ryzendesu.vip/api/downloader/fb?url=${encodeURIComponent(u)}`,
        `https://restapi.virtualffs.co.uk/api/facebook?url=${encodeURIComponent(u)}`
    ];
    
    for (const apiUrl of apis) {
        try {
            console.log(`Trying API: ${apiUrl.split('?')[0]}`);
            const response = await axios.get(apiUrl, {
                timeout: 15000,
                headers: {
                    'accept': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            
            if (response.data) {
                // Handle different API response formats
                const data = response.data;
                
                // Check for video URL in common formats
                let videoUrl = null;
                
                // Dreaded API format
                if (data.result?.hd) videoUrl = data.result.hd;
                else if (data.result?.sd) videoUrl = data.result.sd;
                else if (data.video) videoUrl = data.video;
                else if (data.url) videoUrl = data.url;
                else if (data.download) videoUrl = data.download;
                else if (Array.isArray(data) && data[0]?.url) videoUrl = data[0].url;
                
                if (videoUrl) {
                    return { 
                        response: { data: { result: { media: { video_hd: videoUrl } } } }, 
                        apiName: apiUrl.split('?')[0] 
                    };
                }
            }
        } catch (error) {
            console.log(`API ${apiUrl.split('?')[0]} failed: ${error.message}`);
            continue; // Try next API
        }
    }
    throw new Error('All Facebook APIs failed');
}
        // Try resolved URL, then fallback to original URL
        let apiResult;
        try {
            apiResult = await fetchFromApi(resolvedUrl);
        } catch {
            apiResult = await fetchFromApi(url);
        }

        const response = apiResult.response;
        const apiName = apiResult.apiName;
        const data = response.data;

        let fbvid = null;
        let title = null;

        // Handle Hanggts API response format
        if (data) {
            // Try different possible response structures
            if (data.result) {
                // Hanggts API format: data.result.media.video_hd or video_sd
                if (data.result.media) {
                    // Prefer HD, fallback to SD
                    fbvid = data.result.media.video_hd || data.result.media.video_sd;
                    title = data.result.info?.title || data.result.title || data.title || "Facebook Video";
                }
                // Check if result is an object with url
                else if (typeof data.result === 'object' && data.result.url) {
                    fbvid = data.result.url;
                    title = data.result.title || data.result.caption || data.title || "Facebook Video";
                } 
                // Check if result is a string (direct URL)
                else if (typeof data.result === 'string' && data.result.startsWith('http')) {
                    fbvid = data.result;
                    title = data.title || "Facebook Video";
                }
                // Check if result has download or video property
                else if (data.result.download) {
                    fbvid = data.result.download;
                    title = data.result.title || data.title || "Facebook Video";
                } else if (data.result.video) {
                    fbvid = data.result.video;
                    title = data.result.title || data.title || "Facebook Video";
                }
            }
            
            if (!fbvid && data.data) {
                if (typeof data.data === 'object' && data.data.url) {
                    fbvid = data.data.url;
                    title = data.data.title || data.data.caption || data.title || "Facebook Video";
                } else if (typeof data.data === 'string' && data.data.startsWith('http')) {
                    fbvid = data.data;
                    title = data.title || "Facebook Video";
                } else if (Array.isArray(data.data) && data.data.length > 0) {
                    // Array format - find best quality
                    const hdVideo = data.data.find(item => (item.quality === 'HD' || item.quality === 'high') && (item.format === 'mp4' || !item.format));
                    const sdVideo = data.data.find(item => (item.quality === 'SD' || item.quality === 'low') && (item.format === 'mp4' || !item.format));
                    fbvid = hdVideo?.url || sdVideo?.url || data.data[0]?.url;
                    title = hdVideo?.title || sdVideo?.title || data.data[0]?.title || data.title || "Facebook Video";
                } else if (data.data.download) {
                    fbvid = data.data.download;
                    title = data.data.title || data.title || "Facebook Video";
                } else if (data.data.video) {
                    fbvid = data.data.video;
                    title = data.data.title || data.title || "Facebook Video";
                }
            }
            
            if (!fbvid && data.url) {
                fbvid = data.url;
                title = data.title || data.caption || "Facebook Video";
            }
            
            if (!fbvid && data.download) {
                fbvid = data.download;
                title = data.title || "Facebook Video";
            }
            
            if (!fbvid && data.video) {
                if (typeof data.video === 'string') {
                    fbvid = data.video;
                } else if (data.video.url) {
                    fbvid = data.video.url;
                }
                title = data.title || data.video.title || "Facebook Video";
            }
        }

        if (!fbvid) {
            await client.sendMessage(chatId, { delete: processingMsg.key });
            await client.sendMessage(chatId, { 
                text: '❌ Failed to get video URL from Facebook.\n\nPossible reasons:\n• Video is private or deleted\n• Link is invalid\n• Video is not available for download\n\nPlease try a different Facebook video link.',
                ...channelInfo
            }, { quoted: message });
            
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: message.key } 
            });
            return;
        }

        // Delete processing message
        await client.sendMessage(chatId, { delete: processingMsg.key });

        // Try URL method first (more reliable)
        try {
            const caption = title ? `📹 *Facebook Video*\n\n📝 *Title:* ${title}\n\n> Downloaded by MAD-MAX` : "📹 *Facebook Video*\n\n> Downloaded by MAD-MAX";
            
            await client.sendMessage(chatId, {
                video: { url: fbvid },
                mimetype: "video/mp4",
                caption: caption,
                ...channelInfo
            }, { quoted: message });
            
            await client.sendMessage(chatId, { 
                react: { text: '✅', key: message.key } 
            });
            return;
            
        } catch (urlError) {
            console.error(`URL method failed: ${urlError.message}`);
            
            // Fallback to buffer method
            try {
                // Create temp directory if it doesn't exist
                const tmpDir = path.join(process.cwd(), 'temp');
                if (!fs.existsSync(tmpDir)) {
                    fs.mkdirSync(tmpDir, { recursive: true });
                }

                // Generate temp file path
                const tempFile = path.join(tmpDir, `fb_${Date.now()}.mp4`);

                // Download the video
                const videoResponse = await axios({
                    method: 'GET',
                    url: fbvid,
                    responseType: 'stream',
                    timeout: 60000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                        'Accept': 'video/mp4,video/*;q=0.9,*/*;q=0.8',
                        'Accept-Language': 'en-US,en;q=0.5',
                        'Referer': 'https://www.facebook.com/'
                    }
                });

                const writer = fs.createWriteStream(tempFile);
                videoResponse.data.pipe(writer);

                await new Promise((resolve, reject) => {
                    writer.on('finish', resolve);
                    writer.on('error', reject);
                });

                // Check if file was downloaded successfully
                if (!fs.existsSync(tempFile) || fs.statSync(tempFile).size === 0) {
                    throw new Error('Failed to download video');
                }

                // Send the video
                const caption = title ? `📹 *Facebook Video*\n\n📝 *Title:* ${title}\n\n> Downloaded by MAD-MAX` : "📹 *Facebook Video*\n\n> Downloaded by MAD-MAX";
                
                await client.sendMessage(chatId, {
                    video: { url: tempFile },
                    mimetype: "video/mp4",
                    caption: caption,
                    ...channelInfo
                }, { quoted: message });

                // Clean up temp file
                try {
                    fs.unlinkSync(tempFile);
                } catch (err) {
                    console.error('Error cleaning up temp file:', err);
                }
                
                await client.sendMessage(chatId, { 
                    react: { text: '✅', key: message.key } 
                });
                return;
                
            } catch (bufferError) {
                console.error(`Buffer method also failed: ${bufferError.message}`);
                throw new Error('Both URL and buffer methods failed');
            }
        }

    } catch (error) {
        console.error('Facebook Command Error:', error);
        await client.sendMessage(chatId, { 
            text: "❌ An error occurred. API might be down. Error: " + error.message,
            ...channelInfo
        }, { quoted: message });
        
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: message.key } 
        });
    }
}

module.exports = facebookCommand;