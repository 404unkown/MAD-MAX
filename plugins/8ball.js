const eightBallResponses = [
    "Yes, definitely!",
    "No way!",
    "Ask again later.",
    "It is certain.",
    "Very doubtful.",
    "Without a doubt.",
    "My reply is no.",
    "Signs point to yes.",
    "Most likely!",
    "Cannot predict now.",
    "Better not tell you now.",
    "Concentrate and ask again.",
    "Don't count on it.",
    "Yes, in due time.",
    "Outlook good.",
    "My sources say no."
];

async function eightBallCommand(client, chatId, message, args, sender, pushName, isOwnerSimple) {
    const question = args.join(' ').trim();
    
    if (!question) {
        await client.sendMessage(chatId, { 
            text: '🎱 *Magic 8-Ball*\n\nPlease ask a question!\n\n*Usage:* .8ball <question>\n*Example:* .8ball Will I be rich?' 
        }, { quoted: message });
        return;
    }

    // Send processing reaction
    await client.sendMessage(chatId, { 
        react: { text: '🎱', key: message.key } 
    });

    const randomResponse = eightBallResponses[Math.floor(Math.random() * eightBallResponses.length)];
    
    await client.sendMessage(chatId, { 
        text: `🎱 *Magic 8-Ball* 🎱\n\n❓ *Question:* ${question}\n🔮 *Answer:* ${randomResponse}\n\n👤 *Asked by:* @${sender.split('@')[0]}`,
        mentions: [sender]
    }, { quoted: message });

    // Success reaction
    await client.sendMessage(chatId, { 
        react: { text: '✅', key: message.key } 
    });
}

module.exports = eightBallCommand;