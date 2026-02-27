const axios = require('axios');

async function wastedCommand(client, chatId, message, args, sender, pushName, isOwner) {
    try {
        let userToWaste;
        
        // Check for mentioned users
        if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
            userToWaste = message.message.extendedTextMessage.contextInfo.mentionedJid[0];
        }
        // Check for replied message
        else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
            userToWaste = message.message.extendedTextMessage.contextInfo.participant;
        }
        
        if (!userToWaste) {
            await client.sendMessage(chatId, { 
                text: 'Please mention someone or reply to their message to waste them!'
            }, { quoted: message });
            return;
        }

        await client.sendMessage(chatId, { react: { text: '⏳', key: message.key } });

        // Get user's profile picture
        let profilePic;
        try {
            profilePic = await client.profilePictureUrl(userToWaste, 'image');
        } catch {
            profilePic = 'https://i.imgur.com/2wzGhpF.jpeg';
        }

        // Get the wasted effect image
        const wastedResponse = await axios.get(
            `https://some-random-api.com/canvas/overlay/wasted?avatar=${encodeURIComponent(profilePic)}`,
            { responseType: 'arraybuffer' }
        );

        // Send the wasted image
        await client.sendMessage(chatId, {
            image: Buffer.from(wastedResponse.data),
            caption: `⚰️ *Wasted* : ${userToWaste.split('@')[0]} 💀\n\nRest in pieces!\n\n_Requested by: ${pushName}_`,
            mentions: [userToWaste]
        });

        await client.sendMessage(chatId, { react: { text: '✅', key: message.key } });

    } catch (error) {
        console.error('Error in wasted command:', error);
        await client.sendMessage(chatId, { 
            text: 'Failed to create wasted image! Try again later.'
        }, { quoted: message });
        await client.sendMessage(chatId, { react: { text: '❌', key: message.key } });
    }
}

module.exports = wastedCommand;