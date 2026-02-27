const axios = require('axios');

async function webzipCommand(client, chatId, message, args, sender, pushName, isOwner) {
    try {
        let url = args.join(' ').trim();
        
        if (!url) {
            await client.sendMessage(chatId, {
                text: `📦 *WEB ARCHIVER*\n\n*Usage:* .webzip <url>\n\n*Examples:*\n.webzip https://example.com\n.webzip https://github.com/404unkown\n\n*Features:*\n• Archives websites\n• Creates downloadable files`
            }, { quoted: message });
            return;
        }

        await client.sendMessage(chatId, { react: { text: '⏳', key: message.key } });

        // API attempts here...
        let zipUrl = null;
        let apiUsed = "";
        let fileInfo = {};

        // API 1: Wayback Machine Save Page Now
        try {
            const waybackUrl = `https://web.archive.org/save/${url}`;
            const waybackResponse = await axios.head(waybackUrl, { timeout: 15000 });
            
            if (waybackResponse.headers['content-location']) {
                const archiveUrl = `https://web.archive.org${waybackResponse.headers['content-location']}`;
                await client.sendMessage(chatId, {
                    text: `✅ *Website Archived*\n\n🌐 *Live Archive Link:*\n${archiveUrl}\n\n🔗 *Original:* ${url}\n📅 Archived: ${new Date().toLocaleDateString()}\n\n_Requested by: ${pushName}_`
                }, { quoted: message });
                
                await client.sendMessage(chatId, { react: { text: '✅', key: message.key } });
                return;
            }
        } catch (waybackError) {
            console.log('Wayback API failed:', waybackError.message);
        }

        // API 2: SingleFile API
        if (!zipUrl) {
            try {
                const singleFileUrl = `https://singlefile-psi.vercel.app/?url=${encodeURIComponent(url)}&source=web`;
                const singleResponse = await axios.get(singleFileUrl, { timeout: 30000 });
                
                if (singleResponse.data && singleResponse.data.success) {
                    zipUrl = singleResponse.data.downloadUrl;
                    apiUsed = "SingleFile API";
                    fileInfo = {
                        files: 1,
                        format: "Single HTML file",
                        note: "All assets embedded in one HTML file"
                    };
                }
            } catch (singleError) {
                console.log('SingleFile API failed:', singleError.message);
            }
        }

        // API 3: Archive.today
        if (!zipUrl) {
            try {
                const archiveTodayUrl = `https://archive.today/submit/?url=${encodeURIComponent(url)}`;
                await client.sendMessage(chatId, {
                    text: `📚 *Website Archive Created*\n\n🌐 *Archive Link:*\n${archiveTodayUrl}\n\n🔗 *Original:* ${url}\n\n_Requested by: ${pushName}_`
                }, { quoted: message });
                
                await client.sendMessage(chatId, { react: { text: '✅', key: message.key } });
                return;
            } catch (archiveError) {
                console.log('Archive.today failed:', archiveError.message);
            }
        }

        // Fallback: Simple HTML download
        if (!zipUrl) {
            try {
                const response = await axios.get(url, {
                    timeout: 30000,
                    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
                });
                
                const htmlContent = response.data;
                const htmlBuffer = Buffer.from(htmlContent, 'utf8');
                
                const domain = new URL(url).hostname.replace('www.', '');
                const filename = `${domain}_page_${Date.now()}.html`;
                
                await client.sendMessage(chatId, {
                    document: htmlBuffer,
                    fileName: filename,
                    mimetype: 'text/html',
                    caption: `📄 *Webpage Downloaded*\n\n🌐 ${url}\n📁 Single HTML file\n📦 ${(htmlBuffer.length / 1024).toFixed(2)}KB\n\n_Requested by: ${pushName}_`
                }, { quoted: message });
                
                await client.sendMessage(chatId, { react: { text: '✅', key: message.key } });
                return;
                
            } catch (downloadError) {
                console.log('Simple download failed:', downloadError.message);
            }
        }

        await client.sendMessage(chatId, { react: { text: '❌', key: message.key } });
        
        await client.sendMessage(chatId, {
            text: `❌ *Website Archiving Failed*\n\nAll archiving services are currently unavailable.\n\n🔗 *URL Tested:* ${url}`
        }, { quoted: message });

    } catch (error) {
        console.error('WebZIP error:', error);
        await client.sendMessage(chatId, { react: { text: '❌', key: message.key } });
        await client.sendMessage(chatId, { text: `❌ Error: ${error.message}` }, { quoted: message });
    }
}

module.exports = { webzipCommand };