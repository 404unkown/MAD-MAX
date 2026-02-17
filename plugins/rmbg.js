const axios = require("axios");
const FormData = require('form-data');
const fs = require('fs');
const os = require('os');
const path = require("path");

// Helper function to format bytes
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

async function rmbgCommand(client, chatId, message, args, sender, pushName, isOwnerSimple) {
  try {
    // Send processing reaction
    await client.sendMessage(chatId, { 
      react: { text: '📸', key: message.key } 
    });

    // Check if message is replying to an image
    const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    
    // Determine if we have an image (either in quoted message or current message)
    let imageMessage = null;
    let mediaType = 'image';
    
    if (quotedMsg?.imageMessage) {
      imageMessage = quotedMsg.imageMessage;
    } else if (message.message?.imageMessage) {
      imageMessage = message.message.imageMessage;
    }
    
    if (!imageMessage) {
      await client.sendMessage(chatId, { 
        text: '📸 *Remove Background*\n\nPlease reply to an image file (JPEG/PNG) with .rmbg\n\n*Usage:* Reply to an image with .rmbg'
      }, { quoted: message });
      await client.sendMessage(chatId, { 
        react: { text: '❌', key: message.key } 
      });
      return;
    }

    const processingMsg = await client.sendMessage(chatId, {
      text: '📸 *Processing image...*\n\n⏳ Downloading image...'
    }, { quoted: message });

    // Download the media using proper method for your bot
    const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
    
    const stream = await downloadContentFromMessage(imageMessage, 'image');
    const chunks = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    const mediaBuffer = Buffer.concat(chunks);
    
    const fileSize = formatBytes(mediaBuffer.length);
    
    // Update processing message
    await client.sendMessage(chatId, {
      text: `📸 *Processing image...*\n\n📊 *Size:* ${fileSize}\n⏳ Uploading to server...`
    }, { quoted: message });

    // Get file extension based on mime type
    const mimeType = imageMessage.mimetype || '';
    let extension = '.jpg';
    if (mimeType.includes('image/png')) extension = '.png';
    else if (mimeType.includes('image/jpeg')) extension = '.jpg';
    else if (mimeType.includes('image/webp')) extension = '.webp';
    
    const tempFilePath = path.join(os.tmpdir(), `rmbg_${Date.now()}${extension}`);
    fs.writeFileSync(tempFilePath, mediaBuffer);

    // Upload to Catbox
    const form = new FormData();
    form.append('fileToUpload', fs.createReadStream(tempFilePath), `image${extension}`);
    form.append('reqtype', 'fileupload');

    const uploadResponse = await axios.post("https://catbox.moe/user/api.php", form, {
      headers: form.getHeaders(),
      timeout: 30000
    });

    const imageUrl = uploadResponse.data.trim();
    fs.unlinkSync(tempFilePath); // Clean up temp file

    if (!imageUrl || !imageUrl.startsWith('https://')) {
      throw new Error("Failed to upload image to Catbox");
    }

    // Update processing message
    await client.sendMessage(chatId, {
      text: `📸 *Processing image...*\n\n🔗 *Uploaded:* ✅\n⏳ Removing background...`
    }, { quoted: message });

    // Scan the image using the API
    const apiUrl = `https://apis.davidcyriltech.my.id/removebg?url=${encodeURIComponent(imageUrl)}`;
    const response = await axios.get(apiUrl, { 
      responseType: "arraybuffer",
      timeout: 60000 // 60 seconds for background removal
    });

    if (!response || !response.data) {
      throw new Error("The API did not return a valid image");
    }

    const imageBuffer = Buffer.from(response.data);

    // Delete processing message
    await client.sendMessage(chatId, { delete: processingMsg.key });

    await client.sendMessage(chatId, {
      image: imageBuffer,
      caption: `✅ *Background Removed*\n\n📊 *Original Size:* ${fileSize}\n👤 *Requested by:* @${sender.split('@')[0]}\n\n> *Powered By MAD-MAX*`,
      mentions: [sender]
    }, { quoted: message });

    // Success reaction
    await client.sendMessage(chatId, { 
      react: { text: '✅', key: message.key } 
    });

  } catch (error) {
    console.error("Rmbg Error:", error);
    
    let errorMessage = '❌ An error occurred while removing background.';
    
    if (error.response?.status === 404) {
      errorMessage = '❌ API service unavailable. Try again later.';
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = '❌ Request timeout. The image might be too large.';
    } else if (error.message.includes('upload')) {
      errorMessage = '❌ Failed to upload image. Try a different image.';
    }
    
    await client.sendMessage(chatId, { 
      text: errorMessage
    }, { quoted: message });
    
    await client.sendMessage(chatId, { 
      react: { text: '❌', key: message.key } 
    });
  }
}

module.exports = rmbgCommand;