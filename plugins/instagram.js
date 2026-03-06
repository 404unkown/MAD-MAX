const { igdl } = require("ruhend-scraper");

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

const instagramCommand = async (client, chatId, m, args, sender, pushName, isOwner) => {
    try {
        const text = args.join(' ').trim();
        
        // Check if message has already been processed
        if (processedMessages.has(m.key.id)) {
            return;
        }
        
        // Add message ID to processed set
        processedMessages.add(m.key.id);
        
        // Clean up old message IDs after 5 minutes
        setTimeout(() => {
            processedMessages.delete(m.key.id);
        }, 5 * 60 * 1000);

        if (!text) {
            return await client.sendMessage(chatId, { 
                text: "📷 *INSTAGRAM DOWNLOADER*\n\nPlease provide an Instagram link.\n\nExample: .ig https://www.instagram.com/reel/xxx"
            }, { quoted: m });
        }

        // Check for various Instagram URL formats
        const instagramPatterns = [
            /https?:\/\/(?:www\.)?instagram\.com\//,
            /https?:\/\/(?:www\.)?instagr\.am\//,
            /https?:\/\/(?:www\.)?instagram\.com\/p\//,
            /https?:\/\/(?:www\.)?instagram\.com\/reel\//,
            /https?:\/\/(?:www\.)?instagram\.com\/tv\//
        ];

        const isValidUrl = instagramPatterns.some(pattern => pattern.test(text));
        
        if (!isValidUrl) {
            return await client.sendMessage(chatId, { 
                text: "❌ That is not a valid Instagram link.\n\nPlease provide a valid Instagram post, reel, or video link."
            }, { quoted: m });
        }

        // Send loading reaction
        await client.sendMessage(chatId, {
            react: { text: '🔄', key: m.key }
        });

        const downloadData = await igdl(text);
        
        if (!downloadData || !downloadData.data || downloadData.data.length === 0) {
            return await client.sendMessage(chatId, { 
                text: "❌ No media found at the provided link.\n\nThe post might be private, deleted, or the link is invalid."
            }, { quoted: m });
        }

        const mediaData = downloadData.data;
        
        // Simple deduplication - just remove exact URL duplicates
        const uniqueMedia = extractUniqueMedia(mediaData);
        
        // Limit to maximum 20 unique media items
        const mediaToDownload = uniqueMedia.slice(0, 20);
        
        if (mediaToDownload.length === 0) {
            return await client.sendMessage(chatId, { 
                text: "❌ No valid media found to download.\n\nThis might be a private post or the scraper failed."
            }, { quoted: m });
        }

        // Send processing message for multiple items
        if (mediaToDownload.length > 1) {
            await client.sendMessage(chatId, { 
                text: `📥 *Found ${mediaToDownload.length} media items*\n\nSending them one by one...`
            }, { quoted: m });
        }

        // Download all media
        let successCount = 0;
        
        for (let i = 0; i < mediaToDownload.length; i++) {
            try {
                const media = mediaToDownload[i];
                const mediaUrl = media.url;

                // Check if URL ends with common video extensions
                const isVideo = /\.(mp4|mov|avi|mkv|webm)$/i.test(mediaUrl) || 
                              media.type === 'video' || 
                              text.includes('/reel/') || 
                              text.includes('/tv/');

                const caption = `📥 *INSTAGRAM DOWNLOADER*\n\n_Powered by MAD-MAX_`;

                if (isVideo) {
                    await client.sendMessage(chatId, {
                        video: { url: mediaUrl },
                        mimetype: "video/mp4",
                        caption: caption
                    }, { quoted: m });
                } else {
                    await client.sendMessage(chatId, {
                        image: { url: mediaUrl },
                        caption: caption
                    }, { quoted: m });
                }
                
                successCount++;
                
                // Add small delay between downloads to prevent rate limiting
                if (i < mediaToDownload.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 1500));
                }
                
            } catch (mediaError) {
                console.error(`Error downloading media ${i + 1}:`, mediaError);
                // Continue with next media if one fails
            }
        }

        // Send success reaction
        await client.sendMessage(chatId, {
            react: { text: '✅', key: m.key }
        });

        // Summary if multiple files
        if (mediaToDownload.length > 1 && successCount < mediaToDownload.length) {
            await client.sendMessage(chatId, { 
                text: `📊 *Download Summary*\n\n✅ Successfully downloaded: ${successCount}/${mediaToDownload.length}\n❌ Failed: ${mediaToDownload.length - successCount}`
            }, { quoted: m });
        }

    } catch (error) {
        console.error('Error in Instagram command:', error);
        
        // Send error reaction
        await client.sendMessage(chatId, {
            react: { text: '❌', key: m.key }
        });
        
        await client.sendMessage(chatId, { 
            text: "❌ *An error occurred while processing the Instagram request.*\n\nPlease try again later or check if the link is valid.\n\nError: " + error.message
        }, { quoted: m });
    }
};
module.exports = instagramCommand;