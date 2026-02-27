const compliments = [
    "You're amazing just the way you are!",
    "You have a great sense of humor!",
    "You're incredibly thoughtful and kind.",
    "You are more powerful than you know.",
    "You light up the room!",
    "You're a true friend.",
    "You inspire me!",
    "Your creativity knows no bounds!",
    "You have a heart of gold.",
    "You make a difference in the world.",
    "Your positivity is contagious!",
    "You have an incredible work ethic.",
    "You bring out the best in people.",
    "Your smile brightens everyone's day.",
    "You're so talented in everything you do.",
    "Your kindness makes the world a better place.",
    "You have a unique and wonderful perspective.",
    "Your enthusiasm is truly inspiring!",
    "You are capable of achieving great things.",
    "You always know how to make someone feel special.",
    "Your confidence is admirable.",
    "You have a beautiful soul.",
    "Your generosity knows no limits.",
    "You have a great eye for detail.",
    "Your passion is truly motivating!",
    "You are an amazing listener.",
    "You're stronger than you think!",
    "Your laughter is infectious.",
    "You have a natural gift for making others feel valued.",
    "You make the world a better place just by being in it."
];

async function complimentCommand(client, chatId, message, args, sender, pushName, isOwnerSimple) {
    try {
        let userToCompliment;
        
        // Check for mentioned users
        if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
            userToCompliment = message.message.extendedTextMessage.contextInfo.mentionedJid[0];
        }
        // Check for replied message
        else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
            userToCompliment = message.message.extendedTextMessage.contextInfo.participant;
        }
        
        if (!userToCompliment) {
            await client.sendMessage(chatId, { 
                text: 'Please mention someone or reply to their message to compliment them!'
            }, { quoted: message });
            return;
        }

        const compliment = compliments[Math.floor(Math.random() * compliments.length)];

        await client.sendMessage(chatId, { 
            text: `Hey @${userToCompliment.split('@')[0]}, ${compliment}`,
            mentions: [userToCompliment]
        }, { quoted: message });

    } catch (error) {
        console.error('Error in compliment command:', error);
        await client.sendMessage(chatId, { 
            text: 'An error occurred while sending the compliment.'
        }, { quoted: message });
    }
}

module.exports = { complimentCommand };