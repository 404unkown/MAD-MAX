const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Global channel info for minimal formatting
const channelInfo = {
    contextInfo: {
        forwardingScore: 1,
        isForwarded: true
    }
};

// Configuration
const COVER_URL = 'https://files.catbox.moe/mpu90y.png';
const TEMP_DIR = path.join(process.cwd(), 'temp');
const MAX_RETRIES = 3;

// Ensure temp directory exists
if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// Utility functions
function getRandomFileName(ext) {
    return `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
}

async function downloadWithRetry(url, filePath, retries = MAX_RETRIES) {
    while (retries > 0) {
        try {
            const response = await axios.get(url, { responseType: 'arraybuffer' });
            await fs.promises.writeFile(filePath, response.data);
            return true;
        } catch (err) {
            retries--;
            if (retries === 0) throw err;
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
}

async function runFFmpeg(args, timeout = 60000) {
    return new Promise((resolve, reject) => {
        const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
        const { spawn } = require('child_process');
        const ffmpeg = spawn(ffmpegPath, args);
        let stderrData = '';

        const timer = setTimeout(() => {
            ffmpeg.kill();
            reject(new Error('FFmpeg timeout'));
        }, timeout);

        ffmpeg.stderr.on('data', (data) => {
            stderrData += data.toString();
        });

        ffmpeg.on('close', (code) => {
            clearTimeout(timer);
            if (code === 0) {
                resolve(stderrData);
            } else {
                reject(new Error(`FFmpeg error ${code}\n${stderrData}`));
            }
        });

        ffmpeg.on('error', (err) => {
            clearTimeout(timer);
            reject(err);
        });
    });
}

async function toVideoCommand(client, chatId, message, args, sender, pushName, isOwner) {
    try {
        // Send processing reaction
        await client.sendMessage(chatId, { 
            react: { text: '⏳', key: message.key } 
        });

        // Check if quoted message exists
        const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quotedMsg) {
            await client.sendMessage(chatId, {
                text: "🎵 *AUDIO TO VIDEO*\n\nPlease reply to an audio message\n\nExample: Reply to an audio with `.tovideo`",
                ...channelInfo
            }, { quoted: message });
            
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: message.key } 
            });
            return;
        }

        // Check if quoted is audio
        if (!quotedMsg.audioMessage) {
            await client.sendMessage(chatId, {
                text: "❌ Only audio messages can be converted to video\n\nPlease reply to an audio message",
                ...channelInfo
            }, { quoted: message });
            
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: message.key } 
            });
            return;
        }

        // File paths
        const coverPath = path.join(TEMP_DIR, getRandomFileName('jpg'));
        const audioPath = path.join(TEMP_DIR, getRandomFileName('mp3'));
        const outputPath = path.join(TEMP_DIR, getRandomFileName('mp4'));

        try {
            // Send initial processing message
            const processingMsg = await client.sendMessage(chatId, {
                text: "🔄 Starting conversion process...\n\nPlease wait while I convert your audio to video",
                ...channelInfo
            }, { quoted: message });

            // Step 1: Download cover image
            await client.sendMessage(chatId, {
                text: "⬇️ Downloading cover image...",
                edit: processingMsg.key
            });
            await downloadWithRetry(COVER_URL, coverPath);

            // Step 2: Save audio file
            await client.sendMessage(chatId, {
                text: "💾 Saving audio file...",
                edit: processingMsg.key
            });
            
            // Download audio buffer using Baileys method
            const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
            const media = quotedMsg.audioMessage;
            const stream = await downloadContentFromMessage(media, 'audio');
            const chunks = [];
            for await (const chunk of stream) {
                chunks.push(chunk);
            }
            const audioBuffer = Buffer.concat(chunks);
            
            await fs.promises.writeFile(audioPath, audioBuffer);

            // Step 3: Convert to video
            await client.sendMessage(chatId, {
                text: "🎥 Converting to video...",
                edit: processingMsg.key
            });

            // FFmpeg arguments
            const ffmpegArgs = [
                '-y',
                '-loop', '1',
                '-i', coverPath,
                '-i', audioPath,
                '-c:v', 'libx264',
                '-preset', 'ultrafast',
                '-crf', '23',
                '-c:a', 'aac',
                '-b:a', '128k',
                '-pix_fmt', 'yuv420p',
                '-shortest',
                '-vf', 'scale=640:640:force_original_aspect_ratio=increase,crop=640:640',
                '-movflags', '+faststart',
                outputPath
            ];

            console.log('Running FFmpeg with args:', ffmpegArgs);
            await runFFmpeg(ffmpegArgs);

            // Verify output
            if (!fs.existsSync(outputPath)) {
                throw new Error('Video file was not created');
            }

            // Send result
            const videoBuffer = await fs.promises.readFile(outputPath);
            await client.sendMessage(chatId, {
                video: videoBuffer,
                mimetype: 'video/mp4',
                caption: `🎵 Audio to Video Complete!\n\n_Requested by: ${pushName}_`,
                ...channelInfo
            }, { quoted: message });

            // Success reaction
            await client.sendMessage(chatId, { 
                react: { text: '✅', key: message.key } 
            });

        } catch (error) {
            console.error('Conversion error:', error);
            await client.sendMessage(chatId, {
                text: `❌ *Conversion failed*\nError: ${error.message}\n\nTry again or use a different audio.`,
                ...channelInfo
            }, { quoted: message });
            
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: message.key } 
            });
        } finally {
            // Cleanup files
            const filesToDelete = [coverPath, audioPath, outputPath];
            for (const file of filesToDelete) {
                try {
                    if (fs.existsSync(file)) {
                        await fs.promises.unlink(file);
                    }
                } catch (cleanupError) {
                    console.error('Cleanup error:', cleanupError.message);
                }
            }
        }

    } catch (error) {
        console.error('ToVideo command error:', error);
        await client.sendMessage(chatId, {
            text: `❌ Failed to process: ${error.message}`,
            ...channelInfo
        }, { quoted: message });
        
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: message.key } 
        });
    }
}

module.exports = toVideoCommand;