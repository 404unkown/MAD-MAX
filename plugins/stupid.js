const fetch = require('node-fetch');

async function stupidCommand(client, chatId, message, args, sender, pushName, isOwner) {
    try {
        const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const mentionedJid = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        
        let who = quotedMsg 
            ? (message.message?.extendedTextMessage?.contextInfo?.participant || sender)
            : mentionedJid && mentionedJid[0] 
                ? mentionedJid[0] 
                : sender;

        let text = args.length > 0 ? args.join(' ') : 'im+stupid';
        
        await client.sendMessage(chatId, { 
            react: { text: '⏳', key: message.key } 
        });

        let avatarUrl;
        try {
            avatarUrl = await client.profilePictureUrl(who, 'image');
        } catch (error) {
            console.error('Error fetching profile picture:', error);
            avatarUrl = 'https://telegra.ph/file/24fa902ead26340f3df2c.png';
        }

        const apiUrl = `https://some-random-api.com/canvas/misc/its-so-stupid?avatar=${encodeURIComponent(avatarUrl)}&dog=${encodeURIComponent(text)}`;
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}`);
        }

        const imageBuffer = await response.buffer();

        await client.sendMessage(chatId, {
            image: imageBuffer,
            caption: `🤪 *Its So Stupid*\n\n_Requested by: ${pushName}_`,
            mentions: [who]
        }, { quoted: message });

        await client.sendMessage(chatId, { 
            react: { text: '✅', key: message.key } 
        });

    } catch (error) {
        console.error('Error in stupid command:', error);
        await client.sendMessage(chatId, { 
            text: '❌ Sorry, I couldn\'t generate the stupid card. Please try again later!'
        }, { quoted: message });
        
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: message.key } 
        });
    }
}

module.exports = { stupidCommand };