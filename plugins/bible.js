const axios = require('axios');

// Global channel info (to match your main.js)
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

async function bibleCommand(client, chatId, message, args, sender, pushName, isOwnerSimple) {
    try {
        if (args.length === 0) {
            await client.sendMessage(chatId, {
                text: `📖 *BIBLE COMMAND*\n\nPlease provide a Bible reference.\n\n*Example:*\n.bible John 1:1`,
                ...channelInfo
            }, { quoted: message });
            
            await client.sendMessage(chatId, { 
                react: { text: '⚠️', key: message.key } 
            });
            return;
        }

        // Send processing reaction
        await client.sendMessage(chatId, { 
            react: { text: '📖', key: message.key } 
        });

        const reference = args.join(" ");
        const apiUrl = `https://bible-api.com/${encodeURIComponent(reference)}`;
        const response = await axios.get(apiUrl);

        if (response.status === 200 && response.data.text) {
            const { reference: ref, text, translation_name } = response.data;

            const bibleText = `📜 *Bible Verse Found!*\n\n` +
                `📖 *Reference:* ${ref}\n` +
                `📚 *Text:* ${text}\n\n` +
                `🗂️ *Translation:* ${translation_name}\n\n` +
                `© MAD-MAX BIBLE`;

            await client.sendMessage(chatId, {
                text: bibleText,
                contextInfo: {
                    externalAdReply: {
                        title: "HOLY BIBLE VERSES",
                        body: "Powered by MAD-MAX",
                        thumbnailUrl: "https://files.catbox.moe/4gjzv5.png",
                        sourceUrl: "https://github.com/404unkown/MAD-MAX",
                        mediaType: 1,
                        renderLargerThumbnail: false,
                        showAdAttribution: true
                    },
                    ...channelInfo.contextInfo
                }
            }, { quoted: message });

            // Success reaction
            await client.sendMessage(chatId, { 
                react: { text: '✅', key: message.key } 
            });

        } else {
            await client.sendMessage(chatId, {
                text: "❌ *Verse not found.* Please check the reference and try again.",
                ...channelInfo
            }, { quoted: message });
            
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: message.key } 
            });
        }
    } catch (error) {
        console.error("Bible Command Error:", error);
        
        await client.sendMessage(chatId, {
            text: "⚠️ *An error occurred while fetching the Bible verse.* Please try again.",
            ...channelInfo
        }, { quoted: message });
        
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: message.key } 
        });
    }
}

module.exports = bibleCommand;