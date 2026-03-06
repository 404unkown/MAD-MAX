const axios = require('axios');
const fs = require('fs');
const path = require('path');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');

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

// Ensure temp directory exists
const tempDir = path.join(__dirname, '../temp');
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

async function seriesCommand(client, chatId, message, args, sender, pushName, isOwnerSimple) {
    try {
        const query = args.join(' ').trim();
        
        if (!query) {
            await client.sendMessage(chatId, {
                text: `📺 *SERIES DOWNLOADER*\n\n*Usage:* .series <series name> S01E01\n*Example:* .series Money Heist S01E01\n\n*Note:* Bot will download and split large files into 90MB parts.`,
                ...channelInfo
            }, { quoted: message });
            return;
        }

        await client.sendMessage(chatId, { 
            react: { text: '⏳', key: message.key } 
        });

        const statusMsg = await client.sendMessage(chatId, {
            text: `🔍 *Searching for:* "${query}"...`
        }, { quoted: message });

        // Extract series and episode info
        const episodeMatch = query.match(/(.+?)\s*[sS](\d+)[eE](\d+)/);
        if (!episodeMatch) {
            await client.sendMessage(chatId, { delete: statusMsg.key });
            await client.sendMessage(chatId, {
                text: `❌ Please use format: .series SeriesName S01E01`,
                ...channelInfo
            }, { quoted: message });
            await client.sendMessage(chatId, { react: { text: '❌', key: message.key } });
            return;
        }

        const seriesName = episodeMatch[1].trim();
        const season = episodeMatch[2];
        const episode = episodeMatch[3];
        
        await client.sendMessage(chatId, {
            text: `📥 *Downloading:* ${seriesName} S${season}E${episode}\n\n⏳ This may take a few minutes...`
        }, { quoted: statusMsg });

        // Search for video source
        const videoUrl = await findVideoSource(seriesName, season, episode);
        
        if (!videoUrl) {
            await client.sendMessage(chatId, { delete: statusMsg.key });
            await client.sendMessage(chatId, {
                text: `❌ Could not find "${seriesName} S${season}E${episode}"`,
                ...channelInfo
            }, { quoted: message });
            await client.sendMessage(chatId, { react: { text: '❌', key: message.key } });
            return;
        }

        // Download video
        const videoPath = path.join(tempDir, `${seriesName}_S${season}E${episode}_${Date.now()}.mp4`);
        await downloadVideo(videoUrl, videoPath, client, chatId, statusMsg);

        // Check file size
        const stats = fs.statSync(videoPath);
        const fileSizeMB = stats.size / (1024 * 1024);
        
        // WhatsApp limit is 100MB [citation:1]
        const MAX_PART_SIZE = 90 * 1024 * 1024; // 90MB to be safe
        
        if (fileSizeMB <= 100) {
            // Send as single file
            await client.sendMessage(chatId, {
                document: { url: videoPath },
                fileName: `${seriesName}_S${season}E${episode}.mp4`,
                mimetype: 'video/mp4',
                caption: `📺 *${seriesName}* - S${season}E${episode}\n\nSize: ${fileSizeMB.toFixed(2)}MB`,
                ...channelInfo
            });
            
            // Clean up
            fs.unlinkSync(videoPath);
        } else {
            // Split into parts
            await client.sendMessage(chatId, {
                text: `📦 File is ${fileSizeMB.toFixed(2)}MB. Splitting into parts...`
            }, { quoted: statusMsg });
            
            const parts = await splitVideo(videoPath, MAX_PART_SIZE);
            
            await client.sendMessage(chatId, {
                text: `📺 *${seriesName}* - S${season}E${episode}\n\nSplit into ${parts.length} parts (90MB each):`,
                ...channelInfo
            }, { quoted: message });
            
            // Send each part
            for (let i = 0; i < parts.length; i++) {
                const partPath = parts[i];
                const partStats = fs.statSync(partPath);
                const partSizeMB = partStats.size / (1024 * 1024);
                
                await client.sendMessage(chatId, {
                    document: { url: partPath },
                    fileName: `${seriesName}_S${season}E${episode}_part${i+1}of${parts.length}.mp4`,
                    mimetype: 'video/mp4',
                    caption: `📦 Part ${i+1}/${parts.length} (${partSizeMB.toFixed(2)}MB)`,
                    ...channelInfo
                });
                
                // Clean up part
                fs.unlinkSync(partPath);
                
                // Small delay between parts
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
            
            // Clean up original
            fs.unlinkSync(videoPath);
            
            await client.sendMessage(chatId, {
                text: `✅ All ${parts.length} parts sent! Use a file joiner app to combine them.`
            });
        }

        await client.sendMessage(chatId, { delete: statusMsg.key });
        await client.sendMessage(chatId, { react: { text: '✅', key: message.key } });

    } catch (error) {
        console.error('Series Command Error:', error);
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: message.key } 
        });
        await client.sendMessage(chatId, {
            text: `❌ Error: ${error.message}`
        }, { quoted: message });
    }
}

// Helper function to find video source
async function findVideoSource(seriesName, season, episode) {
    // This is a placeholder - you'll need to implement actual search
    // Options: yts.mx, 1337x, or streaming APIs
    return null;
}

// Helper function to download video
async function downloadVideo(url, outputPath, client, chatId, statusMsg) {
    return new Promise((resolve, reject) => {
        // Using ytdl-core for YouTube or other sources
        // You'll need to implement based on your source
        resolve();
    });
}

// Helper function to split video into parts
function splitVideo(filePath, maxSize) {
    return new Promise((resolve, reject) => {
        const outputDir = path.dirname(filePath);
        const baseName = path.basename(filePath, '.mp4');
        const outputPattern = path.join(outputDir, `${baseName}_part%03d.mp4`);
        
        ffmpeg(filePath)
            .outputOptions([
                `-fs ${maxSize}`, // Limit file size
                '-c copy', // Copy codecs without re-encoding
                '-map 0' // Map all streams
            ])
            .output(outputPattern)
            .on('end', () => {
                // Find all generated parts
                const parts = fs.readdirSync(outputDir)
                    .filter(f => f.startsWith(baseName) && f.includes('_part'))
                    .map(f => path.join(outputDir, f))
                    .sort();
                resolve(parts);
            })
            .on('error', reject)
            .run();
    });
}

module.exports = seriesCommand;