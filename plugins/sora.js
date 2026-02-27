const axios = require('axios');

async function soraCommand(client, chatId, message, args, sender, pushName, isOwnerSimple) {
    try {
        const input = args.join(' ').trim();
        
        // Check if there's a quoted message
        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const quotedText = quoted?.conversation || quoted?.extendedTextMessage?.text || '';
        const finalInput = input || quotedText;

        if (!finalInput) {
            await client.sendMessage(chatId, { 
                text: '🎬 *AI Text-to-Video (Sora)*\n\n*Usage:* .sora <prompt>\n*Example:* .sora anime girl with short blue hair\n\nYou can also reply to a message with .sora'
            }, { quoted: message });
            return;
        }

        // Send processing reaction
        await client.sendMessage(chatId, { 
            react: { text: '⏳', key: message.key } 
        });

        const processingMsg = await client.sendMessage(chatId, {
            text: `🎬 *Generating video...*\n\nPrompt: ${finalInput}\n\nThis may take up to 60 seconds.`
        }, { quoted: message });

        const apiUrl = `https://fast-api-ochre.vercel.app/api/sora?prompt=${encodeURIComponent(finalInput)}`;
        const { data } = await axios.get(apiUrl, { timeout: 60000, headers: { 'user-agent': 'Mozilla/5.0' } });

        const videoUrl = data?.videoUrl || data?.result || data?.data?.videoUrl;
        if (!videoUrl) {
            throw new Error('No videoUrl in API response');
        }

        // Delete processing message
        await client.sendMessage(chatId, { delete: processingMsg.key });

        await client.sendMessage(chatId, {
            video: { url: videoUrl },
            mimetype: 'video/mp4',
            caption: `🎬 *AI Generated Video*\n\n📝 *Prompt:* ${finalInput}\n👤 *Requested by:* @${sender.split('@')[0]}`,
            mentions: [sender]
        }, { quoted: message });

        // Success reaction
        await client.sendMessage(chatId, { 
            react: { text: '✅', key: message.key } 
        });

    } catch (error) {
        console.error('[SORA] error:', error?.message || error);
        await client.sendMessage(chatId, { 
            text: '❌ Failed to generate video. Try a different prompt later.'
        }, { quoted: message });
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: message.key } 
        });
    }
}

module.exports = soraCommand;