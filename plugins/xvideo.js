const axios = require('axios');

// Configure axios
const axiosInstance = axios.create({
  timeout: 20000,
  maxRedirects: 5
});

async function xvideoCommand(client, chatId, message, args, sender, pushName, isOwnerSimple) {
  try {
    const text = args.join(' ').trim();
    
    // Ensure we have a search term
    if (!text) {
      await client.sendMessage(chatId, { 
        text: '🔞 *18+ Video Downloader*\n\n*Usage:* .xvideo <search query>\n*Example:* .xvideo big boobs\n\n*Aliases:* .hentai, .xnxx, .yxx'
      }, { quoted: message });
      return;
    }

    // Send processing reaction
    await client.sendMessage(chatId, { 
      react: { text: '⏳', key: message.key } 
    });

    const processingMsg = await client.sendMessage(chatId, {
      text: `🔞 *Searching for:* "${text}"...\n\n⏳ Please wait...`
    }, { quoted: message });

    // Query Dracula yvideos API
    const apiUrl = `https://draculazyx-xyzdrac.hf.space/api/xvideos?q=${encodeURIComponent(text.trim())}`;
    const { data } = await axiosInstance.get(apiUrl);

    // Check for a valid video
    if (data.STATUS !== 200 || !data.video?.downloadLink) {
      await client.sendMessage(chatId, { delete: processingMsg.key });
      await client.sendMessage(chatId, { 
        text: '🔞 No results found or API error. Try a different search term.'
      }, { quoted: message });
      await client.sendMessage(chatId, { 
        react: { text: '❌', key: message.key } 
      });
      return;
    }

    const { title, imageUrl, videoUrl, downloadLink } = data.video;

    // Update processing message
    await client.sendMessage(chatId, {
      text: `🔞 *Found video*\n\n📹 *Title:* ${title}\n⏳ Downloading video...`
    }, { quoted: message });

    // Attempt to fetch thumbnail
    let thumbBuf = null;
    try {
      const thumbRes = await axiosInstance.get(imageUrl, { responseType: 'arraybuffer' });
      thumbBuf = Buffer.from(thumbRes.data);
    } catch { /* silent thumbnail failure */ }

    // Send thumbnail preview with link (if thumbnail available)
    if (thumbBuf) {
      await client.sendMessage(
        chatId,
        {
          image: thumbBuf,
          caption: `🔞 *${title}*\n🔗 ${videoUrl}\n\n👤 *Requested by:* @${sender.split('@')[0]}`,
          mentions: [sender]
        },
        { quoted: message }
      );
    }

    // Download the video
    const videoRes = await axiosInstance.get(downloadLink, {
      responseType: 'arraybuffer',
      headers: { 
        'Referer': 'https://www.xvideos.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 60000 // 60 seconds for video download
    });
    
    const videoBuf = Buffer.from(videoRes.data);

    // Delete processing message
    await client.sendMessage(chatId, { delete: processingMsg.key });

    // Sanitize filename and send video
    const safeTitle = title.replace(/[\\/:"*?<>|]/g, '').slice(0, 50) || 'video';
    await client.sendMessage(
      chatId,
      {
        video: videoBuf,
        mimetype: 'video/mp4',
        fileName: `${safeTitle}.mp4`,
        caption: `🔞 *${title}*\n\n👤 *Requested by:* @${sender.split('@')[0]}`,
        mentions: [sender]
      },
      { quoted: message }
    );

    // Success reaction
    await client.sendMessage(chatId, { 
      react: { text: '✅', key: message.key } 
    });

  } catch (error) {
    console.error('Error in yvideo command:', error);
    
    await client.sendMessage(chatId, { 
      text: `🔞 Error: ${error.message || 'Please try again later'}`
    }, { quoted: message });
    
    await client.sendMessage(chatId, { 
      react: { text: '❌', key: message.key } 
    });
  }
}

module.exports = xvideoCommand;