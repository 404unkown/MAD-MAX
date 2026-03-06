const axios = require("axios");

async function twitterCommand(client, chatId, message, args, sender, pushName, isOwnerSimple) {
  try {
    const url = args[0];
    
    if (!url || !url.startsWith("https://")) {
      await client.sendMessage(chatId, { 
        text: "🐦 *Twitter Video Downloader*\n\n❌ Please provide a valid Twitter URL.\n\n*Usage:* .twitter <url>\n*Example:* .twitter https://twitter.com/user/status/123456789"
      }, { quoted: message });
      return;
    }

    // Send processing reaction
    await client.sendMessage(chatId, { 
      react: { text: '⏳', key: message.key } 
    });

    const processingMsg = await client.sendMessage(chatId, {
      text: `🐦 *Processing Twitter URL...*\n\n⏳ Fetching video information...`
    }, { quoted: message });

    const response = await axios.get(`https://www.dark-yasiya-api.site/download/twitter?url=${encodeURIComponent(url)}`);
    const data = response.data;

    if (!data || !data.status || !data.result) {
      await client.sendMessage(chatId, { delete: processingMsg.key });
      await client.sendMessage(chatId, { 
        text: "⚠️ Failed to retrieve Twitter video. Please check the link and try again." 
      }, { quoted: message });
      await client.sendMessage(chatId, { 
        react: { text: '❌', key: message.key } 
      });
      return;
    }

    const { desc, thumb, video_sd, video_hd, duration } = data.result;

    // Delete processing message
    await client.sendMessage(chatId, { delete: processingMsg.key });

    const caption = `🐦 *Twitter Video Downloader*\n\n` +
                   `📝 *Caption:* ${desc || 'No caption'}\n` +
                   `⏱️ *Duration:* ${duration || 'Unknown'}\n\n` +
                   `📥 *Download Options:*\n` +
                   `1️⃣ SD Quality (Video)\n` +
                   `2️⃣ HD Quality (Video)\n` +
                   `3️⃣ Audio (MP3)\n` +
                   `4️⃣ Audio as Document\n` +
                   `5️⃣ Voice Note\n\n` +
                   `👤 *Requested by:* @${sender.split('@')[0]}\n\n` +
                   `*Reply with the number (1-5) to download your choice.*`;

    const sentMsg = await client.sendMessage(chatId, {
      image: { url: thumb },
      caption: caption,
      mentions: [sender]
    }, { quoted: message });

    // Success reaction
    await client.sendMessage(chatId, { 
      react: { text: '✅', key: message.key } 
    });

    // Store the message ID for reply handling
    const messageID = sentMsg.key.id;
    
    // Store in global variable to handle replies (you'll need to add this to main.js)
    if (!global.twitterDownloads) global.twitterDownloads = {};
    global.twitterDownloads[messageID] = {
      chatId,
      sender,
      video_sd,
      video_hd,
      thumb
    };

  } catch (error) {
    console.error("Twitter Downloader Error:", error);
    await client.sendMessage(chatId, { 
      text: "❌ An error occurred while processing your request. Please try again." 
    }, { quoted: message });
    await client.sendMessage(chatId, { 
      react: { text: '❌', key: message.key } 
    });
  }
}

async function handleTwitterReply(client, message, replyId, choice) {
  try {
    if (!global.twitterDownloads || !global.twitterDownloads[replyId]) return false;
    
    const data = global.twitterDownloads[replyId];
    const chatId = data.chatId;
    const sender = data.sender;
    const video_sd = data.video_sd;
    const video_hd = data.video_hd;

    // Send processing reaction
    await client.sendMessage(chatId, { 
      react: { text: '⬇️', key: message.key } 
    });

    switch (choice) {
      case "1":
        await client.sendMessage(chatId, {
          video: { url: video_sd },
          caption: "📥 *Downloaded in SD Quality*\n\n👤 *Requested by:* @" + sender.split('@')[0],
          mentions: [sender]
        }, { quoted: message });
        break;

      case "2":
        await client.sendMessage(chatId, {
          video: { url: video_hd },
          caption: "📥 *Downloaded in HD Quality*\n\n👤 *Requested by:* @" + sender.split('@')[0],
          mentions: [sender]
        }, { quoted: message });
        break;

      case "3":
        await client.sendMessage(chatId, {
          audio: { url: video_sd },
          mimetype: "audio/mpeg",
          caption: "📥 *Audio Downloaded*\n\n👤 *Requested by:* @" + sender.split('@')[0],
          mentions: [sender]
        }, { quoted: message });
        break;

      case "4":
        await client.sendMessage(chatId, {
          document: { url: video_sd },
          mimetype: "audio/mpeg",
          fileName: "Twitter_Audio.mp3",
          caption: "📥 *Audio Downloaded as Document*\n\n👤 *Requested by:* @" + sender.split('@')[0],
          mentions: [sender]
        }, { quoted: message });
        break;

      case "5":
        await client.sendMessage(chatId, {
          audio: { url: video_sd },
          mimetype: "audio/mp4",
          ptt: true,
          caption: "📥 *Voice Note*\n\n👤 *Requested by:* @" + sender.split('@')[0],
          mentions: [sender]
        }, { quoted: message });
        break;

      default:
        await client.sendMessage(chatId, { 
          text: "❌ Invalid option! Please reply with 1, 2, 3, 4, or 5." 
        }, { quoted: message });
    }

    // Clean up
    delete global.twitterDownloads[replyId];
    
    return true;

  } catch (error) {
    console.error("Twitter Reply Error:", error);
    return false;
  }
}

module.exports = { 
  twitterCommand, 
  handleTwitterReply 
};