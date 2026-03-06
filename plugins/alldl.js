const fetch = require('node-fetch');

const alldlCommand = async (client, chatId, m, args, sender, pushName, isOwner) => {
    try {
        const url = args.join(' ').trim();

        if (!url) {
            return await client.sendMessage(chatId, { 
                text: `📥 *UNIVERSAL DOWNLOADER*\n\nPlease provide a link to download.\n\nSupported platforms: Facebook, Twitter/X, TikTok, CapCut, Instagram, etc.\n\nExample: .alldl https://vm.tiktok.com/xxxxxx` 
            }, { quoted: m });
        }

        // Get botname from config
        const config = require('../set');
        const botname = config.botname || 'MAD-MAX';

        // Send loading reaction
        await client.sendMessage(chatId, { 
            react: { text: '📥', key: m.key } 
        });

        // Send processing message
        const processingMsg = await client.sendMessage(chatId, {
            text: `📥 *UNIVERSAL DOWNLOADER*\n\nFetching media from:\n${url}\n\nPlease wait...`
        }, { quoted: m });

        // Try multiple APIs as fallback
        let data = null;
        let apiErrors = [];

        // Try first API
        try {
            const response = await fetch(`https://api.dreaded.site/api/alldl?url=${encodeURIComponent(url)}`);
            const text = await response.text();
            
            // Check if response is HTML (starts with <)
            if (text.trim().startsWith('<')) {
                throw new Error('API returned HTML instead of JSON');
            }
            
            data = JSON.parse(text);
        } catch (error) {
            apiErrors.push(`API 1 failed: ${error.message}`);
            console.log('First API failed, trying backup...');
            
            // Try backup API
            try {
                const backupResponse = await fetch(`https://api.ryzendesu.vip/api/downloader/alldl?url=${encodeURIComponent(url)}`);
                const backupText = await backupResponse.text();
                
                if (!backupText.trim().startsWith('<')) {
                    data = JSON.parse(backupText);
                } else {
                    throw new Error('Backup API returned HTML');
                }
            } catch (backupError) {
                apiErrors.push(`Backup API failed: ${backupError.message}`);
                
                // Try another backup
                try {
                    const secondBackup = await fetch(`https://vihangayt.me/download/alldl?url=${encodeURIComponent(url)}`);
                    const secondText = await secondBackup.text();
                    
                    if (!secondText.trim().startsWith('<')) {
                        data = JSON.parse(secondText);
                    } else {
                        throw new Error('Second backup API returned HTML');
                    }
                } catch (secondError) {
                    apiErrors.push(`Second backup failed: ${secondError.message}`);
                }
            }
        }

        // Delete processing message
        await client.sendMessage(chatId, { delete: processingMsg.key });

        if (!data || !data.status || data.status !== 200 || !data.data || !data.data.videoUrl) {
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: m.key } 
            });
            
            let errorDetails = apiErrors.join('\n');
            return await client.sendMessage(chatId, { 
                text: `📥 *UNIVERSAL DOWNLOADER*\n\n❌ Failed to download. All APIs failed.\n\nPossible reasons:\n• The API endpoints are down\n• The link is not supported\n• The platform may have changed\n\n${errorDetails ? `\nDebug: ${errorDetails}` : ''}` 
            }, { quoted: m });
        }

        const mediaUrl = data.data.videoUrl;
        const title = data.data.title || 'Media';
        const platform = data.data.platform || 'Unknown';

        // Success reaction
        await client.sendMessage(chatId, { 
            react: { text: '✅', key: m.key } 
        });

        // Determine if it's video or image based on URL
        const isVideo = mediaUrl.match(/\.(mp4|mov|avi|mkv|webm|m3u8|m3u)$/i) || data.data.type === 'video';
        const isImage = mediaUrl.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i) || data.data.type === 'image';

        // Send caption
        const caption = `📥 *DOWNLOADED*\n\n📹 *Title:* ${title}\n📱 *Platform:* ${platform}\n\nDownloaded by ${botname}`;

        if (isVideo) {
            await client.sendMessage(chatId, {
                video: { url: mediaUrl },
                caption: caption,
                gifPlayback: false
            }, { quoted: m });
        } else if (isImage) {
            await client.sendMessage(chatId, {
                image: { url: mediaUrl },
                caption: caption
            }, { quoted: m });
        } else {
            // If we can't determine, try as video first
            try {
                await client.sendMessage(chatId, {
                    video: { url: mediaUrl },
                    caption: caption,
                    gifPlayback: false
                }, { quoted: m });
            } catch (videoError) {
                // Fallback to document
                await client.sendMessage(chatId, {
                    document: { url: mediaUrl },
                    mimetype: 'application/octet-stream',
                    fileName: `${title.replace(/[<>:"/\\|?*]/g, '_')}.mp4`,
                    caption: caption
                }, { quoted: m });
            }
        }

    } catch (error) {
        console.error('Universal downloader error:', error);

        // Error reaction
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: m.key } 
        });

        await client.sendMessage(chatId, {
            text: `📥 *UNIVERSAL DOWNLOADER*\n\n❌ An error occurred.\n\nError: ${error.message}`
        }, { quoted: m });
    }
};

module.exports = {
    alldlCommand
};