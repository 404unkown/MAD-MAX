const axios = require('axios');

async function tiktokstalkCommand(client, chatId, message, args, sender, pushName, isOwner) {
    try {
        const username = args.join(' ').trim();
        
        if (!username) {
            await client.sendMessage(chatId, {
                text: "📱 *TIKTOK STALKER*\n\nPlease provide a TikTok username.\n\n*Example:* .tiktokstalk mrbeast\n*Example:* .tiktokstalk charlidamelio"
            }, { quoted: message });
            return;
        }

        await client.sendMessage(chatId, { 
            react: { text: '⏳', key: message.key } 
        });

        const apiUrl = `https://api.siputzx.my.id/api/stalk/tiktok?username=${encodeURIComponent(username)}`;
        const { data } = await axios.get(apiUrl);

        if (!data.status || !data.data) {
            await client.sendMessage(chatId, {
                text: "❌ User not found. Please check the username and try again."
            }, { quoted: message });
            
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: message.key } 
            });
            return;
        }

        const user = data.data.user;
        const stats = data.data.stats;

        const profileInfo = `📱 *TIKTOK PROFILE*\n\n` +
            `👤 *Username:* @${user.uniqueId}\n` +
            `📛 *Nickname:* ${user.nickname}\n` +
            `✅ *Verified:* ${user.verified ? "Yes ✅" : "No ❌"}\n` +
            `📍 *Region:* ${user.region || "Not specified"}\n` +
            `📝 *Bio:* ${user.signature || "No bio available."}\n\n` +
            `📊 *Statistics:*\n` +
            `👥 *Followers:* ${stats.followerCount ? stats.followerCount.toLocaleString() : "0"}\n` +
            `👤 *Following:* ${stats.followingCount ? stats.followingCount.toLocaleString() : "0"}\n` +
            `❤️ *Likes:* ${stats.heartCount ? stats.heartCount.toLocaleString() : "0"}\n` +
            `🎥 *Videos:* ${stats.videoCount ? stats.videoCount.toLocaleString() : "0"}\n\n` +
            `📅 *Created:* ${user.createTime ? new Date(user.createTime * 1000).toLocaleDateString() : "Unknown"}\n` +
            `🔒 *Private:* ${user.privateAccount ? "Yes 🔒" : "No 🌍"}\n\n` +
            `_Requested by: ${pushName}_`;

        if (user.avatarLarger) {
            try {
                await client.sendMessage(chatId, {
                    image: { url: user.avatarLarger },
                    caption: profileInfo
                }, { quoted: message });
            } catch (imageError) {
                console.error('Image load failed:', imageError);
                await client.sendMessage(chatId, {
                    text: profileInfo
                }, { quoted: message });
            }
        } else {
            await client.sendMessage(chatId, {
                text: profileInfo
            }, { quoted: message });
        }

        await client.sendMessage(chatId, { 
            react: { text: '✅', key: message.key } 
        });

    } catch (error) {
        console.error("❌ Error in TikTok stalk command:", error);
        
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: message.key } 
        });
        
        await client.sendMessage(chatId, {
            text: "⚠️ An error occurred while fetching TikTok profile data."
        }, { quoted: message });
    }
}

module.exports = {
    tiktokstalkCommand
};