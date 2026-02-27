const axios = require('axios');
const yts = require('yt-search');

// Izumi API configuration
const izumi = {
    baseURL: "https://izumiiiiiiii.dpdns.org"
};

const AXIOS_DEFAULTS = {
    timeout: 60000,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*'
    }
};

async function tryRequest(getter, attempts = 3) {
    let lastError;
    for (let attempt = 1; attempt <= attempts; attempt++) {
        try {
            return await getter();
        } catch (err) {
            lastError = err;
            if (attempt < attempts) {
                await new Promise(r => setTimeout(r, 1000 * attempt));
            }
        }
    }
    throw lastError;
}

async function getIzumiVideoByUrl(youtubeUrl) {
    const apiUrl = `${izumi.baseURL}/downloader/youtube?url=${encodeURIComponent(youtubeUrl)}&format=720`;
    const res = await tryRequest(() => axios.get(apiUrl, AXIOS_DEFAULTS));
    if (res?.data?.result?.download) return res.data.result;
    throw new Error('Izumi video api returned no download');
}

async function getOkatsuVideoByUrl(youtubeUrl) {
    const apiUrl = `https://okatsu-rolezapiiz.vercel.app/downloader/ytmp4?url=${encodeURIComponent(youtubeUrl)}`;
    const res = await tryRequest(() => axios.get(apiUrl, AXIOS_DEFAULTS));
    if (res?.data?.result?.mp4) {
        return { download: res.data.result.mp4, title: res.data.result.title };
    }
    throw new Error('Okatsu ytmp4 returned no mp4');
}

async function videoCommand(client, chatId, message, args, sender, pushName, isOwner) {
    try {
        const searchQuery = args.join(' ').trim();
        
        if (!searchQuery) {
            await client.sendMessage(chatId, { 
                text: 'What video do you want to download?\n\nExample: .video never gonna give you up' 
            }, { quoted: message });
            return;
        }

        await client.sendMessage(chatId, { react: { text: '⏳', key: message.key } });

        // Determine if input is a YouTube link
        let videoUrl = '';
        let videoTitle = '';
        let videoThumbnail = '';
        
        if (searchQuery.startsWith('http://') || searchQuery.startsWith('https://')) {
            videoUrl = searchQuery;
        } else {
            // Search YouTube for the video
            const { videos } = await yts(searchQuery);
            if (!videos || videos.length === 0) {
                await client.sendMessage(chatId, { 
                    text: 'No videos found!' 
                }, { quoted: message });
                await client.sendMessage(chatId, { react: { text: '❌', key: message.key } });
                return;
            }
            videoUrl = videos[0].url;
            videoTitle = videos[0].title;
            videoThumbnail = videos[0].thumbnail;
        }

        // Send thumbnail immediately
        try {
            const ytId = (videoUrl.match(/(?:youtu\.be\/|v=)([a-zA-Z0-9_-]{11})/) || [])[1];
            const thumb = videoThumbnail || (ytId ? `https://i.ytimg.com/vi/${ytId}/sddefault.jpg` : undefined);
            const captionTitle = videoTitle || searchQuery;
            if (thumb) {
                await client.sendMessage(chatId, {
                    image: { url: thumb },
                    caption: `*${captionTitle}*\n\n⏳ Downloading...\n_Requested by: ${pushName}_`
                }, { quoted: message });
            }
        } catch (e) { console.error('[VIDEO] thumb error:', e?.message || e); }

        // Validate YouTube URL
        let urls = videoUrl.match(/(?:https?:\/\/)?(?:youtu\.be\/|(?:www\.|m\.)?youtube\.com\/(?:watch\?v=|v\/|embed\/|shorts\/|playlist\?list=)?)([a-zA-Z0-9_-]{11})/gi);
        if (!urls) {
            await client.sendMessage(chatId, { 
                text: 'This is not a valid YouTube link!' 
            }, { quoted: message });
            await client.sendMessage(chatId, { react: { text: '❌', key: message.key } });
            return;
        }

        // Get video: try Izumi first, then Okatsu fallback
        let videoData;
        try {
            videoData = await getIzumiVideoByUrl(videoUrl);
        } catch (e1) {
            videoData = await getOkatsuVideoByUrl(videoUrl);
        }

        // Send video directly using the download URL
        await client.sendMessage(chatId, {
            video: { url: videoData.download },
            mimetype: 'video/mp4',
            fileName: `${videoData.title || videoTitle || 'video'}.mp4`,
            caption: `*${videoData.title || videoTitle || 'Video'}*\n\n_Downloaded by: ${pushName}_`
        }, { quoted: message });

        await client.sendMessage(chatId, { react: { text: '✅', key: message.key } });

    } catch (error) {
        console.error('[VIDEO] Command Error:', error?.message || error);
        await client.sendMessage(chatId, { 
            text: 'Download failed: ' + (error?.message || 'Unknown error') 
        }, { quoted: message });
        await client.sendMessage(chatId, { react: { text: '❌', key: message.key } });
    }
}

module.exports = videoCommand;