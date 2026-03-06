const axios = require('axios');

async function getimageCommand(client, chatId, message, args, sender, pushName, isOwnerSimple) {
    try {
        // Get the URL from args
        const imageUrl = args.join(' ').trim();

        // Check if URL is provided
        if (!imageUrl) {
            await client.sendMessage(chatId, {
                text: `🖼️ *Image URL Converter*\n\nPlease provide an image URL\n\n*Usage:*\n.getimage https://example.com/image.jpg\n\n*Example:*\n.getimage https://picsum.photos/1080/1920\n\n*Supported formats:* JPG, PNG, GIF, WebP`
            }, { quoted: message });
            return;
        }

        // Validate URL format
        if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
            await client.sendMessage(chatId, {
                text: '❌ *Invalid URL*\nURL must start with http:// or https://'
            }, { quoted: message });
            return;
        }

        // Send processing reaction
        await client.sendMessage(chatId, { 
            react: { text: '⏳', key: message.key } 
        });

        // Send processing message
        const processingMsg = await client.sendMessage(chatId, {
            text: '🔄 *Downloading and processing image...*'
        }, { quoted: message });

        try {
            // Download the image directly
            const response = await axios.get(imageUrl, {
                responseType: 'arraybuffer',
                timeout: 30000,
                maxContentLength: 20 * 1024 * 1024, // 20MB
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
                    'Referer': 'https://www.google.com/'
                }
            });

            const imageBuffer = Buffer.from(response.data);
            const contentType = response.headers['content-type'] || 'application/octet-stream';
            const contentLength = parseInt(response.headers['content-length'] || '0');

            // Check if it's an image based on content-type
            if (!contentType.startsWith('image/')) {
                await client.sendMessage(chatId, { delete: processingMsg.key });
                await client.sendMessage(chatId, {
                    text: `❌ *Not an image file*\nContent-Type: ${contentType}\n\nPlease provide a direct link to an image (JPG, PNG, GIF, WebP).`
                }, { quoted: message });
                await client.sendMessage(chatId, { 
                    react: { text: '❌', key: message.key } 
                });
                return;
            }

            // Check file size (max 20MB for WhatsApp)
            if (contentLength > 20 * 1024 * 1024 && contentLength > 0) { // 20MB
                await client.sendMessage(chatId, { delete: processingMsg.key });
                await client.sendMessage(chatId, {
                    text: `⚠️ *Image too large*\nSize: ${(contentLength / (1024 * 1024)).toFixed(2)}MB\nMaximum allowed: 20MB\n\nPlease use a smaller image.`
                }, { quoted: message });
                await client.sendMessage(chatId, { 
                    react: { text: '❌', key: message.key } 
                });
                return;
            }

            // Verify it's a valid image by checking magic bytes
            const isJpg = imageBuffer.slice(0, 3).toString('hex') === 'ffd8ff';
            const isPng = imageBuffer.slice(0, 8).toString('hex') === '89504e470d0a1a0a';
            const isGif = imageBuffer.slice(0, 6).toString().includes('GIF');
            const isWebp = imageBuffer.slice(0, 4).toString() === 'RIFF' && 
                          imageBuffer.slice(8, 12).toString() === 'WEBP';

            if (!isJpg && !isPng && !isGif && !isWebp) {
                await client.sendMessage(chatId, { delete: processingMsg.key });
                await client.sendMessage(chatId, {
                    text: '❌ *Invalid image file*\nThe downloaded file is not a valid image.\n\nPlease check the URL and try again.'
                }, { quoted: message });
                await client.sendMessage(chatId, { 
                    react: { text: '❌', key: message.key } 
                });
                return;
            }

            // Send the image
            await client.sendMessage(chatId, {
                image: imageBuffer,
                caption: `🖼️ *Image from URL*\n\n🔗 ${imageUrl}\n📏 ${(imageBuffer.length / 1024).toFixed(2)}KB\n📝 ${contentType}`
            }, { quoted: message });

            // Delete processing message
            try {
                await client.sendMessage(chatId, { delete: processingMsg.key });
            } catch (deleteError) {
                // Ignore if can't delete
            }

            // Success reaction
            await client.sendMessage(chatId, {
                react: { text: '✅', key: message.key }
            });

        } catch (downloadError) {
            console.error('Download error:', downloadError.message);
            
            // Delete processing message on error
            try {
                await client.sendMessage(chatId, { delete: processingMsg.key });
            } catch (deleteError) {
                // Ignore if can't delete
            }
            
            // Handle specific errors
            let errorMessage = '❌ *Download failed*\n';
            
            if (downloadError.code === 'ECONNABORTED' || downloadError.code === 'ETIMEDOUT') {
                errorMessage = '❌ *Download timeout*\nThe server took too long to respond.';
            } else if (downloadError.response?.status === 404) {
                errorMessage = '❌ *Image not found (404)*\nThe URL points to a non-existent image.';
            } else if (downloadError.response?.status === 403) {
                errorMessage = '❌ *Access forbidden (403)*\nThe server denied access to this image.';
            } else if (downloadError.response?.status === 429) {
                errorMessage = '⚠️ *Rate limited*\nToo many requests to this server.';
            } else {
                errorMessage = `❌ *Download failed*\nError: ${downloadError.message}`;
            }
            
            await client.sendMessage(chatId, {
                text: errorMessage
            }, { quoted: message });
            
            // Error reaction
            await client.sendMessage(chatId, {
                react: { text: '❌', key: message.key }
            });
        }

    } catch (error) {
        console.error('Getimage command error:', error);
        await client.sendMessage(chatId, {
            text: `❌ *Unexpected error*\n${error.message}`
        }, { quoted: message });
        
        // Error reaction
        await client.sendMessage(chatId, {
            react: { text: '❌', key: message.key }
        });
    }
}

module.exports = getimageCommand;