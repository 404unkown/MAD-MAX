const { igdl } = require("ruhend-scraper");

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

// Store processed message IDs to prevent duplicates
const processedMessages = new Set();

// Function to extract unique media URLs with simple deduplication
function extractUniqueMedia(mediaData) {
    const uniqueMedia = [];
    const seenUrls = new Set();
    
    for (const media of mediaData) {
        if (!media.url) continue;
        
        // Only check for exact URL duplicates
        if (!seenUrls.has(media.url)) {
            seenUrls.add(media.url);
            uniqueMedia.push(media);
        }
    }
    
    return uniqueMedia;
}

async function instagramCommand(client, chatId, message, args, sender, pushName, isOwnerSimple) {
    try {
        // Check if message has already been processed
        if (processedMessages.has(message.key.id)) {
            return;
        }
        
        // Add message ID to processed set
        processedMessages.add(message.key.id);
        
        // Clean up old message IDs after 5 minutes
        setTimeout(() => {
            processedMessages.delete(message.key.id);
        }, 5 * 60 * 1000);

        // Get the URL from args
        const url = args.join(' ');
        
        if (!url) {
            await client.sendMessage(chatId, {
                text: `📷 *INSTAGRAM DOWNLOADER*\n\nPlease provide an Instagram link.\n\n*Usage:* .instagram <url>\n*Example:* .instagram https://www.instagram.com/reel/xyz123/`,
                ...channelInfo
            }, { quoted: message });
            
            await client.sendMessage(chatId, { 
                react: { text: '⚠️', key: message.key } 
            });
            return;
        }

        // Check for various Instagram URL formats
        const instagramPatterns = [
            /https?:\/\/(?:www\.)?instagram\.com\//,
            /https?:\/\/(?:www\.)?instagr\.am\//,
            /https?:\/\/(?:www\.)?instagram\.com\/p\//,
            /https?:\/\/(?:www\.)?instagram\.com\/reel\//,
            /https?:\/\/(?:www\.)?instagram\.com\/tv\//
        ];

        const isValidUrl = instagramPatterns.some(pattern => pattern.test(url));
        
        if (!isValidUrl) {
            await client.sendMessage(chatId, {
                text: "❌ That is not a valid Instagram link. Please provide a valid Instagram post, reel, or video link.",
                ...channelInfo
            }, { quoted: message });
            
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: message.key } 
            });
            return;
        }

        // Send processing reaction
        await client.sendMessage(chatId, {
            react: { text: '🔄', key: message.key }
        });

        // Send processing message
        const processingMsg = await client.sendMessage(chatId, {
            text: '📥 *Downloading from Instagram...*\n\nPlease wait while I fetch the media.',
            ...channelInfo
        }, { quoted: message });

        // Fetch Instagram media
        const downloadData = await igdl(url);
        
        if (!downloadData || !downloadData.data || downloadData.data.length === 0) {
            await client.sendMessage(chatId, { 
                text: "❌ No media found at the provided link. The post might be private or the link is invalid.",
                ...channelInfo
            }, { quoted: message });
            
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: message.key } 
            });
            return;
        }

        // Delete processing message
        await client.sendMessage(chatId, { delete: processingMsg.key });

        const mediaData = downloadData.data;
        
        // Simple deduplication
        const uniqueMedia = extractUniqueMedia(mediaData);
        
        // Limit to maximum 20 unique media items
        const mediaToDownload = uniqueMedia.slice(0, 20);
        
        if (mediaToDownload.length === 0) {
            await client.sendMessage(chatId, { 
                text: "❌ No valid media found to download.",
                ...channelInfo
            }, { quoted: message });
            
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: message.key } 
            });
            return;
        }

        // Send count message for multiple items
        if (mediaToDownload.length > 1) {
            await client.sendMessage(chatId, {
                text: `📸 Found *${mediaToDownload.length}* media items. Sending them now...`,
                ...channelInfo
            }, { quoted: message });
        }

        // Download all media
        let successCount = 0;
        
        for (let i = 0; i < mediaToDownload.length; i++) {
            try {
                const media = mediaToDownload[i];
                const mediaUrl = media.url;

                // Check if it's a video
                const isVideo = /\.(mp4|mov|avi|mkv|webm)$/i.test(mediaUrl) || 
                              media.type === 'video' || 
                              url.includes('/reel/') || 
                              url.includes('/tv/');

                if (isVideo) {
                    await client.sendMessage(chatId, {
                        video: { url: mediaUrl },
                        mimetype: "video/mp4",
                        caption: `📹 *Instagram Video ${mediaToDownload.length > 1 ? `(${i+1}/${mediaToDownload.length})` : ''}\n\n> Downloaded by MAD-MAX`,
                        ...channelInfo
                    }, { quoted: message });
                } else {
                    await client.sendMessage(chatId, {
                        image: { url: mediaUrl },
                        caption: `📷 *Instagram Image ${mediaToDownload.length > 1 ? `(${i+1}/${mediaToDownload.length})` : ''}\n\n> Downloaded by MAD-MAX`,
                        ...channelInfo
                    }, { quoted: message });
                }
                
                successCount++;
                
                // Add small delay between downloads
                if (i < mediaToDownload.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 1500));
                }
                
            } catch (mediaError) {
                console.error(`Error downloading media ${i + 1}:`, mediaError);
                // Continue with next media if one fails
            }
        }

        // Final status
        if (successCount === mediaToDownload.length) {
            await client.sendMessage(chatId, {
                text: `✅ Successfully downloaded ${successCount} media items.`,
                ...channelInfo
            }, { quoted: message });
        } else if (successCount > 0) {
            await client.sendMessage(chatId, {
                text: `⚠️ Downloaded ${successCount}/${mediaToDownload.length} media items. Some may have failed.`,
                ...channelInfo
            }, { quoted: message });
        }

        // Success reaction
        await client.sendMessage(chatId, {
            react: { text: '✅', key: message.key }
        });

    } catch (error) {
        console.error('Instagram Command Error:', error);
        
        await client.sendMessage(chatId, { 
            text: "❌ An error occurred while processing the Instagram request. Please try again.",
            ...channelInfo
        }, { quoted: message });
        
        await client.sendMessage(chatId, {
            react: { text: '❌', key: message.key }
        });
    }
}

module.exports = instagramCommand;