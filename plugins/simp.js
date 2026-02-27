const fetch = require('node-fetch');

async function simpCommand(client, chatId, message, args, sender, pushName, isOwnerSimple) {
    try {
        // Determine the target user
        let who = sender; // Default to sender
        
        // Check for mentioned users
        if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
            who = message.message.extendedTextMessage.contextInfo.mentionedJid[0];
        }
        // Check for replied message
        else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
            who = message.message.extendedTextMessage.contextInfo.participant;
        }

        // Send processing reaction
        await client.sendMessage(chatId, { 
            react: { text: '⏳', key: message.key } 
        });

        // Get the profile picture URL
        let avatarUrl;
        try {
            avatarUrl = await client.profilePictureUrl(who, 'image');
        } catch (error) {
            console.error('Error fetching profile picture:', error);
            avatarUrl = 'https://telegra.ph/file/24fa902ead26340f3df2c.png'; // Default avatar
        }

        // Fetch the simp card from the API
        const apiUrl = `https://some-random-api.com/canvas/misc/simpcard?avatar=${encodeURIComponent(avatarUrl)}`;
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}`);
        }

        // Get the image buffer
        const imageBuffer = await response.buffer();

        // Send the image with caption
        await client.sendMessage(chatId, {
            image: imageBuffer,
            caption: `*your religion is simping* 👑\n\n👤 *User:* @${who.split('@')[0]}`,
            mentions: [who]
        }, { quoted: message });

        // Success reaction
        await client.sendMessage(chatId, { 
            react: { text: '✅', key: message.key } 
        });

    } catch (error) {
        console.error('Error in simp command:', error);
        await client.sendMessage(chatId, { 
            text: '❌ Sorry, I couldn\'t generate the simp card. Please try again later!'
        }, { quoted: message });
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: message.key } 
        });
    }
}

module.exports = simpCommand;