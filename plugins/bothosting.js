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

module.exports = async (client, chatId, message, args, sender, pushName, isOwner) => {
    try {
        const more = String.fromCharCode(8206);
        const readMore = more.repeat(4001);

        const guideText = `
╭─❖ *BOT HOSTING GUIDE* ❖─
│
├─ *STEP 1: Create GitHub Account*
│  https://github.com/
│
├─ *STEP 2: Create Discord Account*
│  https://discord.com/login
│
├─ *STEP 3: Fork Repository*
│  https://github.com/404unkown/MAD-MAX
│
├─ *STEP 4: Download Zip File*
│  Extract the code after downloading
│
├─ *STEP 5: Get Free Hosting*
│  https://bot-hosting.net/?aff=1358062837397852211
│
├─ *STEP 6: Claim Coins*
│  • Login with Discord
│  • Claim 10 coins daily
│  • Some bots need 25 coins
│
├─ *STEP 7: Create Server*
│  • Choose 25 coin plan
│  • Upload your bot code
│  • Start server
│
├─ *STEP 8: Enjoy!* 🎉
│
├─ *Watch Tutorial:*
│  https://youtube.com/@404tech
│
╰─➤ _Requested by: ${pushName}_
`.trim();

        // Send processing reaction
        await client.sendMessage(chatId, { 
            react: { text: '⏳', key: message.key } 
        });

        // Send the guide with image
        await client.sendMessage(chatId, {
            image: { url: 'https://files.catbox.moe/852x91.jpeg' },
            caption: guideText,
            contextInfo: {
                mentionedJid: [sender],
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363401269012709@newsletter',
                    newsletterName: 'MAD-MAX',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });

        // Success reaction
        await client.sendMessage(chatId, { 
            react: { text: '✅', key: message.key } 
        });

    } catch (error) {
        console.error('Error in bothosting command:', error);
        await client.sendMessage(chatId, {
            text: '⚠️ An error occurred while fetching the deployment guide.',
            ...channelInfo
        }, { quoted: message });
        
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: message.key } 
        });
    }
};