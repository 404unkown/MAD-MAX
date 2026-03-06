const axios = require('axios');
const sharp = require('sharp');

// Helper function to validate URL
function isValidUrl(string) {
    try {
        const url = new URL(string);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
        return false;
    }
}

async function downloadImage(url, options = {}) {
    const { timeout = 30000, maxSize = 20 * 1024 * 1024 } = options;
    
    const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout,
        maxContentLength: maxSize,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
            'Referer': 'https://www.google.com/',
            'Accept-Language': 'en-US,en;q=0.9'
        }
    });
    
    return {
        buffer: Buffer.from(response.data),
        contentType: response.headers['content-type'],
        contentLength: response.headers['content-length']
    };
}

function detectImageType(buffer) {
    const hex = buffer.slice(0, 12).toString('hex').toUpperCase();
    
    if (hex.startsWith('FFD8FF')) return { type: 'jpg', valid: true };
    if (hex.startsWith('89504E470D0A1A0A')) return { type: 'png', valid: true };
    if (hex.startsWith('47494638')) return { type: 'gif', valid: true };
    if (hex.startsWith('52494646') && buffer.slice(8, 12).toString() === 'WEBP') return { type: 'webp', valid: true };
    if (hex.startsWith('424D')) return { type: 'bmp', valid: true };
    if (hex.startsWith('49492A00') || hex.startsWith('4D4D002A')) return { type: 'tiff', valid: true };
    
    return { type: 'unknown', valid: false };
}

async function resizeImageIfNeeded(buffer, maxWidth = 4096, maxHeight = 4096) {
    try {
        const metadata = await sharp(buffer).metadata();
        
        if (metadata.width <= maxWidth && metadata.height <= maxHeight) {
            return buffer;
        }
        
        const ratio = Math.min(maxWidth / metadata.width, maxHeight / metadata.height);
        const newWidth = Math.round(metadata.width * ratio);
        const newHeight = Math.round(metadata.height * ratio);
        
        const resizedBuffer = await sharp(buffer)
            .resize(newWidth, newHeight, { fit: 'inside' })
            .jpeg({ quality: 85 })
            .toBuffer();
            
        return resizedBuffer;
    } catch (error) {
        console.error('Resize error:', error);
        return buffer;
    }
}

module.exports = async function urlimageCommand(client, chatId, message, args, sender, pushName, isOwner) {
    try {
        let imageUrl = args.join(' ').trim();
        
        // Check if no URL provided
        if (!imageUrl) {
            const helpText = `╭─❖ *URL IMAGE DOWNLOADER* ❖─
│
├─ *Usage:* .getimage <url>
├─ *Aliases:* .tophoto, .url2image, .fetchimage
│
├─ *Examples:*
│  ├─ .getimage https://picsum.photos/1080/1920
│  ├─ .getimage https://example.com/image.png
│  └─ .getimage https://i.imgur.com/abc123.jpg
│
├─ *Supported formats:*
│  ├─ JPG/JPEG, PNG, GIF, WebP
│  ├─ BMP, TIFF (converted to JPG)
│  └─ Max size: 20MB
│
├─ *Features:*
│  ├─ Auto validation
│  ├─ Size checking
│  ├─ Format detection
│  └─ Smart downloading
│
╰─➤ _Requested by: ${pushName}_`;

            await client.sendMessage(chatId, {
                text: helpText
            }, { quoted: message });
            return;
        }
        
        // Send processing reaction
        await client.sendMessage(chatId, { 
            react: { text: '⏳', key: message.key } 
        });
        
        // Clean URL
        imageUrl = imageUrl.replace(/['"<>]/g, '').trim();
        
        // Validate URL
        if (!isValidUrl(imageUrl)) {
            await client.sendMessage(chatId, {
                text: "❌ *Invalid URL format*\n\nPlease provide a valid URL starting with http:// or https://"
            }, { quoted: message });
            
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: message.key } 
            });
            return;
        }
        
        // Show processing
        const processingMsg = await client.sendMessage(chatId, {
            text: "🔍 *Analyzing URL...*"
        }, { quoted: message });
        
        try {
            // Step 1: Check URL headers
            await client.sendMessage(chatId, {
                text: "📡 *Connecting to server...*",
                edit: processingMsg.key
            });
            
            const headResponse = await axios.head(imageUrl, {
                timeout: 10000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            
            const contentType = headResponse.headers['content-type'] || '';
            const contentLength = parseInt(headResponse.headers['content-length'] || '0');
            
            if (!contentType.startsWith('image/')) {
                await client.sendMessage(chatId, {
                    text: `❌ *Not an image file*\n\nContent-Type: ${contentType}\n\nThis URL doesn't point to an image file.`
                }, { quoted: message });
                
                await client.sendMessage(chatId, { 
                    react: { text: '❌', key: message.key } 
                });
                return;
            }
            
            if (contentLength > 20 * 1024 * 1024) {
                await client.sendMessage(chatId, {
                    text: `⚠️ *File too large*\n\nSize: ${(contentLength / (1024 * 1024)).toFixed(2)}MB\nMaximum: 20MB\n\nPlease use a smaller image.`
                }, { quoted: message });
                
                await client.sendMessage(chatId, { 
                    react: { text: '❌', key: message.key } 
                });
                return;
            }
            
            // Step 2: Download image
            await client.sendMessage(chatId, {
                text: `⬇️ *Downloading image (${(contentLength / 1024).toFixed(0)}KB)...*`,
                edit: processingMsg.key
            });
            
            const { buffer, contentType: actualContentType } = await downloadImage(imageUrl);
            
            // Step 3: Validate image
            await client.sendMessage(chatId, {
                text: "✅ *Validating image...*",
                edit: processingMsg.key
            });
            
            const imageInfo = detectImageType(buffer);
            
            if (!imageInfo.valid) {
                await client.sendMessage(chatId, {
                    text: "❌ *Invalid image file*\n\nThe downloaded file is corrupted or not an image."
                }, { quoted: message });
                
                await client.sendMessage(chatId, { 
                    react: { text: '❌', key: message.key } 
                });
                return;
            }
            
            // Step 4: Process if needed (resize, convert)
            await client.sendMessage(chatId, {
                text: "🔄 *Processing image...*",
                edit: processingMsg.key
            });
            
            let finalBuffer = buffer;
            let finalMime = actualContentType || `image/${imageInfo.type}`;
            
            // Convert unsupported formats to JPEG
            if (['bmp', 'tiff'].includes(imageInfo.type)) {
                try {
                    finalBuffer = await sharp(buffer).jpeg({ quality: 90 }).toBuffer();
                    finalMime = 'image/jpeg';
                } catch (error) {
                    console.error('Conversion error:', error);
                }
            }
            
            // Optional: Resize very large images
            if (finalBuffer.length > 5 * 1024 * 1024) { // >5MB
                try {
                    finalBuffer = await resizeImageIfNeeded(finalBuffer);
                } catch (error) {
                    console.error('Resize error:', error);
                }
            }
            
            // Get image dimensions
            let dimensions = 'Unknown';
            try {
                const metadata = await sharp(finalBuffer).metadata();
                dimensions = `${metadata.width}x${metadata.height}`;
            } catch (e) {}
            
            // Step 5: Send image
            await client.sendMessage(chatId, {
                image: finalBuffer,
                caption: `🖼️ *Image Downloaded*\n\n🔗 *URL:* ${imageUrl}\n📏 *Size:* ${(finalBuffer.length / 1024).toFixed(2)}KB\n🎨 *Format:* ${imageInfo.type.toUpperCase()}\n📊 *Dimensions:* ${dimensions}\n\n_Requested by: ${pushName}_`
            }, { quoted: message });
            
            // Success reaction
            await client.sendMessage(chatId, {
                react: { text: '✅', key: message.key }
            });
            
        } catch (error) {
            console.error('Download process error:', error);
            
            let errorMsg = "❌ *Failed to download image*";
            
            if (error.code === 'ECONNREFUSED') {
                errorMsg += "\nServer refused connection";
            } else if (error.code === 'ENOTFOUND') {
                errorMsg += "\nDomain not found";
            } else if (error.response?.status) {
                errorMsg += `\nHTTP ${error.response.status}: ${error.response.statusText}`;
            } else if (error.message.includes('timeout')) {
                errorMsg += "\nConnection timeout";
            } else {
                errorMsg += `\n${error.message}`;
            }
            
            errorMsg += "\n\nPlease check:\n• URL is correct\n• Image is accessible\n• Try a different URL";
            
            await client.sendMessage(chatId, {
                text: errorMsg
            }, { quoted: message });
            
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: message.key } 
            });
        }
        
    } catch (error) {
        console.error('URL Image command error:', error);
        await client.sendMessage(chatId, {
            text: `❌ *Unexpected error*\n${error.message}`
        }, { quoted: message });
        
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: message.key } 
        });
    }
};