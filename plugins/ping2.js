const moment = require('moment-timezone');

async function ping2Command(client, chatId, message, args, sender, pushName, isOwner) {
    try {
        const start = Date.now();

        // Emojis and styles
        const emojiSets = {
            reactions: ['⚡', '🚀', '💨', '🎯', '🌟', '💎', '🔥', '✨', '🌀', '🔹'],
            bars: [
                '▰▰▰▰▰▰▰▰▰▰',
                '▰▱▱▱▱▱▱▱▱▱',
                '▰▰▱▱▱▱▱▱▱▱',
                '▰▰▰▱▱▱▱▱▱▱',
                '▰▰▰▰▱▱▱▱▱▱'
            ],
            status: ['🟢 ONLINE', '🔵 ACTIVE', '🟣 RUNNING', '🟡 RESPONDING']
        };

        const reactionEmoji = emojiSets.reactions[Math.floor(Math.random() * emojiSets.reactions.length)];
        const statusText = emojiSets.status[Math.floor(Math.random() * emojiSets.status.length)];
        const loadingBar = emojiSets.bars[Math.floor(Math.random() * emojiSets.bars.length)];

        // React with emoji
        await client.sendMessage(chatId, {
            react: { text: reactionEmoji, key: message.key }
        });

        // Time info
        const responseTime = (Date.now() - start) / 1000;
        const time = moment().tz('Africa/Nairobi').format('HH:mm:ss');
        const date = moment().tz('Africa/Nairobi').format('DD/MM/YYYY');

        // Final output
        const pingMsg = `*${statusText}*

⚡ *Response Time:* ${responseTime.toFixed(2)}s
⏰ *Time:* ${time}
📅 *Date:* ${date}

💻 *Developer:* NUCH
🤖 *Bot Name:* MAD-MAX

🌟 MAD-MAX Bot is fully operational!

${loadingBar}`;

        await client.sendMessage(chatId, {
            text: pingMsg
        }, { quoted: message });

    } catch (e) {
        console.error("❌ Ping2 command error:", e);
        await client.sendMessage(chatId, {
            text: `❌ Error: ${e.message}`
        }, { quoted: message });
    }
}

module.exports = {
    ping2Command
};