module.exports = async (client, chatId, m) => {
    const runtime = (seconds) => {
        const d = Math.floor(seconds / 86400);
        const h = Math.floor((seconds % 86400) / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        return `${d}d ${h}h ${m}m ${s}s`;
    };
    await client.sendMessage(chatId, { 
        text: `⏱️ *Bot Uptime:*\n${runtime(process.uptime())}` 
    }, { quoted: m });
};