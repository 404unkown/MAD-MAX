const config = require('../set');

module.exports = async (client, chatId, m, args, sender, pushName, isOwner) => {
    try {
        const startTime = Date.now();

        const emojis = ['🔥', '⚡', '🚀', '💨', '🎯', '🎉', '🌟', '💥', '🕐', '🔹', '💎', '🏆', '🎶', '🌠', '🌀', '🔱', '🛡️', '✨'];
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

        // React instantly with a random emoji
        await client.sendMessage(chatId, {
            react: { text: randomEmoji, key: m.key }
        });

        const ping = Date.now() - startTime;

        // Speed categorization
        let badge = '🐢 Slow', color = '🔴';
        if (ping <= 150) {
            badge = '🚀 Super Fast';
            color = '🟢';
        } else if (ping <= 300) {
            badge = '⚡ Fast';
            color = '🟡';
        } else if (ping <= 600) {
            badge = '⚠️ Medium';
            color = '🟠';
        }

        const sender = m.key.participant || m.key.remoteJid;

        // Final response
        await client.sendMessage(chatId, {
            text: `> *MAD-MAX RESPONSE: ${ping} ms ${randomEmoji}*\n> *sᴛᴀᴛᴜs: ${color} ${badge}*\n> *ᴠᴇʀsɪᴏɴ: ${config.version || "1.0.0"}*`,
            contextInfo: {
                mentionedJid: [sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363401269012709@newsletter',
                    newsletterName: "MAD-MAX",
                    serverMessageId: 143
                }
            }
        }, { quoted: m });

    } catch (e) {
        console.error("❌ Error in ping command:", e);
        await client.sendMessage(chatId, {
            text: `⚠️ Error: ${e.message}`
        }, { quoted: m });
    }
};