async function shipCommand(client, chatId, message, args, sender, pushName, isOwnerSimple) {
    try {
        // Check if in a group
        if (!chatId.endsWith('@g.us')) {
            await client.sendMessage(chatId, { 
                text: '❌ *Ship Command*\n\nThis command can only be used in groups!'
            }, { quoted: message });
            return;
        }

        // Send processing reaction
        await client.sendMessage(chatId, { 
            react: { text: '💘', key: message.key } 
        });

        // Get all participants from the group
        const groupMetadata = await client.groupMetadata(chatId);
        const participants = groupMetadata.participants.map(v => v.id);
        
        // Get two random participants
        let firstUser, secondUser;
        
        // Select first random user
        firstUser = participants[Math.floor(Math.random() * participants.length)];
        
        // Select second random user (different from first)
        do {
            secondUser = participants[Math.floor(Math.random() * participants.length)];
        } while (secondUser === firstUser);

        // Format the mentions
        const formatMention = id => '@' + id.split('@')[0];

        // Create ship percentage (random 50-100%)
        const shipPercentage = Math.floor(Math.random() * 51) + 50;
        
        // Ship emojis based on percentage
        let shipEmoji = '💔';
        if (shipPercentage >= 90) shipEmoji = '💖💖';
        else if (shipPercentage >= 75) shipEmoji = '💕';
        else if (shipPercentage >= 60) shipEmoji = '💗';
        else if (shipPercentage >= 50) shipEmoji = '💓';

        // Create the ship message
        const shipMessage = `💘 *SHIP RESULT* 💘\n\n` +
                           `${formatMention(firstUser)}\n` +
                           `     ${shipEmoji} ${shipPercentage}% ${shipEmoji}\n` +
                           `${formatMention(secondUser)}\n\n` +
                           `🎉 *Congratulations!* 🎉\n\n` +
                           `👤 *Shipped by:* @${sender.split('@')[0]}`;

        await client.sendMessage(chatId, {
            text: shipMessage,
            mentions: [firstUser, secondUser, sender]
        });

        // Success reaction
        await client.sendMessage(chatId, { 
            react: { text: '✅', key: message.key } 
        });

    } catch (error) {
        console.error('Error in ship command:', error);
        await client.sendMessage(chatId, { 
            text: '❌ Failed to ship! Make sure this is a group.'
        }, { quoted: message });
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: message.key } 
        });
    }
}

module.exports = shipCommand;