const axios = require('axios');

async function gdriveCommand(client, chatId, message, args, sender, pushName, isOwnerSimple) {
    try {
        if (!args || args.length === 0) {
            await client.sendMessage(chatId, {
                text: "📥 *Google Drive Downloader*\n\n📝 *Usage:* .gdrive [google-drive-url]\n\nExample: `.gdrive https://drive.google.com/file/d/...`"
            }, { quoted: message });
            return;
        }

        const gdriveUrl = args[0];
        
        // Validate Google Drive URL
        if (!gdriveUrl.includes("drive.google.com")) {
            await client.sendMessage(chatId, {
                text: "❌ *Invalid Google Drive URL*\n\nPlease provide a valid Google Drive link.\nExample: https://drive.google.com/file/d/..."
            }, { quoted: message });
            return;
        }

        // Send processing reaction
        await client.sendMessage(chatId, { 
            react: { text: '⏳', key: message.key } 
        });

        const processingMsg = await client.sendMessage(chatId, {
            text: `🔍 *Processing Google Drive link...*`
        }, { quoted: message });

        // Prepare API request
        const apiUrl = 'https://api.nexoracle.com/downloader/gdrive';
        const params = {
            apikey: 'free_key@maher_apis',
            url: gdriveUrl
        };

        // Get file info from API
        const response = await axios.get(apiUrl, { params });
        
        if (!response.data || response.data.status !== 200 || !response.data.result) {
            throw new Error('API response error');
        }

        const { downloadUrl, fileName, fileSize, mimetype } = response.data.result;

        // Update processing message
        await client.sendMessage(chatId, {
            text: `📥 *Downloading File*\n\n📁 *Name:* ${fileName}\n📊 *Size:* ${fileSize}\n⏳ *Status:* Downloading...`
        }, { quoted: message });

        // Download the file
        const fileResponse = await axios.get(downloadUrl, { 
            responseType: 'arraybuffer',
            timeout: 300000 // 5 minutes timeout for large files
        });

        if (!fileResponse.data) {
            throw new Error('Failed to download file');
        }

        const fileBuffer = Buffer.from(fileResponse.data, 'binary');

        // Delete processing message
        await client.sendMessage(chatId, { delete: processingMsg.key });

        // Prepare common caption
        const caption = `📥 *Google Drive Download*\n\n` +
                       `📁 *File Name:* ${fileName}\n` +
                       `📊 *File Size:* ${fileSize}\n` +
                       `📄 *Type:* ${mimetype}\n\n` +
                       `👤 *Requested by:* @${sender.split('@')[0]}\n` +
                       `💡 *Powered by 404 TECH*`;

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

        // Send file based on type
        if (mimetype.startsWith('image/')) {
            await client.sendMessage(chatId, {
                image: fileBuffer,
                caption: caption,
                contextInfo: contextInfo
            }, { quoted: message });
        } 
        else if (mimetype.startsWith('video/')) {
            await client.sendMessage(chatId, {
                video: fileBuffer,
                caption: caption,
                contextInfo: contextInfo
            }, { quoted: message });
        } 
        else if (mimetype.startsWith('audio/')) {
            await client.sendMessage(chatId, {
                audio: fileBuffer,
                mimetype: mimetype,
                caption: caption,
                contextInfo: contextInfo
            }, { quoted: message });
        }
        else {
            // Send as document
            await client.sendMessage(chatId, {
                document: fileBuffer,
                fileName: fileName,
                mimetype: mimetype,
                caption: caption,
                contextInfo: contextInfo
            }, { quoted: message });
        }

        // Success reaction
        await client.sendMessage(chatId, { 
            react: { text: '✅', key: message.key } 
        });

    } catch (error) {
        console.error('❌ Google Drive download error:', error.message);
        
        let errorMessage = '❌ *Download Failed*\n\n';
        
        if (error.response?.status === 404) {
            errorMessage += 'File not found or link is invalid.';
        } else if (error.code === 'ECONNREFUSED') {
            errorMessage += 'Service temporarily unavailable.';
        } else if (error.code === 'ETIMEDOUT') {
            errorMessage += 'Download timeout. File might be too large.';
        } else {
            errorMessage += 'Please check the link and try again.';
        }

        await client.sendMessage(chatId, {
            text: errorMessage
        }, { quoted: message });

        await client.sendMessage(chatId, { 
            react: { text: '❌', key: message.key } 
        });
    }
}

module.exports = gdriveCommand;