const axios = require('axios');

async function mediafireCommand(client, chatId, message, args, sender, pushName, isOwnerSimple) {
    try {
        if (!args || args.length === 0) {
            await client.sendMessage(chatId, {
                text: "📥 *MediaFire Downloader*\n\n" +
                      "📝 *Usage:* .mediafire [mediafire-url]\n\n" +
                      "📋 *Examples:*\n" +
                      "• `.mediafire https://mediafire.com/file/abc123/file.zip`\n" +
                      "• `.mediafire https://www.mediafire.com/download/xyz789`\n\n" +
                      "✨ *Features:*\n" +
                      "• Direct download from MediaFire\n" +
                      "• Auto-detects file type\n" +
                      "• Supports images, videos, documents\n" +
                      "• Two API fallbacks for reliability"
            }, { quoted: message });
            return;
        }

        const mediafireUrl = args[0];
        
        // Validate MediaFire URL
        if (!mediafireUrl.includes("mediafire.com")) {
            await client.sendMessage(chatId, {
                text: "❌ *Invalid MediaFire URL*\n\n" +
                      "Please provide a valid MediaFire link.\n" +
                      "Example: https://mediafire.com/file/abc123/file.zip"
            }, { quoted: message });
            return;
        }

        // Send processing reaction
        await client.sendMessage(chatId, { 
            react: { text: '⏳', key: message.key } 
        });

        const processingMsg = await client.sendMessage(chatId, {
            text: `🔍 *Processing MediaFire Link*\n\n⏳ Fetching file information...`
        }, { quoted: message });

        let fileInfo = null;
        let apiUsed = "First API (velyn.vercel.app)";
        
        // Try First API: Velyn API
        try {
            const apiUrl = `https://velyn.vercel.app/api/downloader/mediafire?url=${encodeURIComponent(mediafireUrl)}`;
            const response = await axios.get(apiUrl, { timeout: 15000 });
            
            if (response.data && response.data.status && response.data.data) {
                const { filename, size, mimetype, link } = response.data.data;
                fileInfo = {
                    filename,
                    size,
                    mimetype,
                    downloadUrl: link,
                    api: "v1"
                };
                console.log('✅ First API successful');
            }
        } catch (firstApiError) {
            console.log('First API failed, trying second API:', firstApiError.message);
        }

        // Try Second API: Keith's API if first fails
        if (!fileInfo) {
            try {
                const apiUrl = `https://apis-keith.vercel.app/download/mfire?url=${encodeURIComponent(mediafireUrl)}`;
                const response = await axios.get(apiUrl, { timeout: 15000 });
                
                if (response.data && response.data.status && response.data.result && response.data.result.dl_link) {
                    const { fileName, fileType, size, date, dl_link } = response.data.result;
                    fileInfo = {
                        filename: fileName,
                        size: size,
                        mimetype: fileType || 'application/octet-stream',
                        downloadUrl: dl_link,
                        uploadDate: date,
                        api: "v2"
                    };
                    apiUsed = "Second API (apis-keith.vercel.app)";
                    console.log('✅ Second API successful');
                }
            } catch (secondApiError) {
                console.log('Second API also failed:', secondApiError.message);
            }
        }

        // Check if we got file info
        if (!fileInfo) {
            await client.sendMessage(chatId, { delete: processingMsg.key });
            await client.sendMessage(chatId, {
                text: `❌ *Download Failed*\n\n` +
                      `Unable to fetch file information from MediaFire.\n\n` +
                      `Please check:\n` +
                      `1. URL is correct and accessible\n` +
                      `2. File is not password protected\n` +
                      `3. Try again later`
            }, { quoted: message });
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: message.key } 
            });
            return;
        }

        // Update processing message
        await client.sendMessage(chatId, {
            text: `📥 *Downloading File*\n\n` +
                  `📁 *Name:* ${fileInfo.filename}\n` +
                  `📊 *Size:* ${fileInfo.size}\n` +
                  `📄 *Type:* ${fileInfo.mimetype}\n` +
                  `🔗 *API:* ${apiUsed}\n` +
                  `⏳ *Downloading...*`
        }, { quoted: message });

        // Download the file
        const fileResponse = await axios.get(fileInfo.downloadUrl, {
            responseType: 'arraybuffer',
            timeout: 300000, // 5 minutes for large files
            maxContentLength: 100 * 1024 * 1024, // 100MB max
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        if (!fileResponse.data) {
            throw new Error('Failed to download file data');
        }

        const fileBuffer = Buffer.from(fileResponse.data);
        
        // Delete processing message
        await client.sendMessage(chatId, { delete: processingMsg.key });
        
        // Prepare caption with mention
        const caption = `✅ *MediaFire Download Complete*\n\n` +
                       `📁 *File Name:* ${fileInfo.filename}\n` +
                       `📊 *File Size:* ${fileInfo.size}\n` +
                       `📄 *File Type:* ${fileInfo.mimetype}\n` +
                       (fileInfo.uploadDate ? `📅 *Upload Date:* ${fileInfo.uploadDate}\n` : '') +
                       `🔗 *API Used:* ${apiUsed}\n\n` +
                       `👤 *Requested by:* @${sender.split('@')[0]}\n` +
                       `📥 *Downloaded Successfully*`;

        const contextInfo = {
            mentionedJid: [sender],
            forwardingScore: 1,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363401269012709@newsletter',
                newsletterName: 'MAD-MAX',
                serverMessageId: -1
            }
        };

        // Send file based on MIME type
        if (fileInfo.mimetype && fileInfo.mimetype.startsWith('image/')) {
            await client.sendMessage(chatId, {
                image: fileBuffer,
                caption: caption,
                contextInfo: contextInfo
            }, { quoted: message });
        } 
        else if (fileInfo.mimetype && (fileInfo.mimetype.startsWith('video/') || fileInfo.mimetype.includes('mp4'))) {
            await client.sendMessage(chatId, {
                video: fileBuffer,
                caption: caption,
                contextInfo: contextInfo
            }, { quoted: message });
        }
        else if (fileInfo.mimetype && fileInfo.mimetype.startsWith('audio/')) {
            await client.sendMessage(chatId, {
                audio: fileBuffer,
                mimetype: fileInfo.mimetype,
                caption: caption,
                contextInfo: contextInfo
            }, { quoted: message });
        }
        else {
            // Send as document for other types
            await client.sendMessage(chatId, {
                document: fileBuffer,
                fileName: fileInfo.filename,
                mimetype: fileInfo.mimetype || 'application/octet-stream',
                caption: caption,
                contextInfo: contextInfo
            }, { quoted: message });
        }

        // Success reaction
        await client.sendMessage(chatId, { 
            react: { text: '✅', key: message.key } 
        });

    } catch (error) {
        console.error('❌ MediaFire download error:', error.message);
        
        let errorMessage = '❌ *Download Failed*\n\n';
        
        if (error.code === 'ECONNABORTED') {
            errorMessage += 'Download timeout. File might be too large or server is slow.';
        } else if (error.response?.status === 404) {
            errorMessage += 'File not found or link is invalid.';
        } else if (error.response?.status === 403) {
            errorMessage += 'Access denied. File might be private or removed.';
        } else if (error.message.includes('maxContentLength')) {
            errorMessage += 'File is too large (max 100MB).';
        } else {
            errorMessage += `Error: ${error.message}\n\nPlease try again or use a different link.`;
        }

        await client.sendMessage(chatId, {
            text: errorMessage
        }, { quoted: message });

        await client.sendMessage(chatId, { 
            react: { text: '❌', key: message.key } 
        });
    }
}

module.exports = mediafireCommand;