const axios = require('axios');

async function githubstalkCommand(client, chatId, message, args, sender, pushName, isOwnerSimple) {
    try {
        // Extract username from args
        const username = args[0];
        
        if (!username) {
            await client.sendMessage(chatId, {
                text: "❌ *GitHub Profile Stalker*\n\nPlease provide a GitHub username.\n\n*Usage:* .githubstalk <username>\n*Example:* .githubstalk octocat"
            }, { quoted: message });
            return;
        }

        // Send processing reaction
        await client.sendMessage(chatId, { 
            react: { text: '⏳', key: message.key } 
        });

        const processingMsg = await client.sendMessage(chatId, {
            text: `🔍 *Fetching GitHub profile for:* ${username}...`
        }, { quoted: message });

        const apiUrl = `https://api.github.com/users/${username}`;
        const response = await axios.get(apiUrl);
        const data = response.data;

        // Format user info
        let userInfo = `👤 *Username:* ${data.name || data.login}
🔗 *GitHub URL:* ${data.html_url}
📝 *Bio:* ${data.bio || 'Not available'}
🏙️ *Location:* ${data.location || 'Unknown'}
📊 *Public Repos:* ${data.public_repos}
👥 *Followers:* ${data.followers} | *Following:* ${data.following}
📅 *Created At:* ${new Date(data.created_at).toDateString()}
🔭 *Public Gists:* ${data.public_gists}
🏢 *Company:* ${data.company || 'Not specified'}
📧 *Email:* ${data.email || 'Not public'}
🔗 *Blog:* ${data.blog || 'Not available'}`;

        // Delete processing message
        await client.sendMessage(chatId, { delete: processingMsg.key });

        await client.sendMessage(
            chatId,
            {
                image: { url: data.avatar_url },
                caption: userInfo
            },
            { quoted: message }
        );

        // Success reaction
        await client.sendMessage(chatId, { 
            react: { text: '✅', key: message.key } 
        });

    } catch (error) {
        console.error('GitHub stalk error:', error);
        
        let errorMsg = "❌ Failed to fetch GitHub profile.";
        if (error.response?.status === 404) {
            errorMsg = "❌ GitHub user not found!";
        } else if (error.response?.data?.message) {
            errorMsg = `❌ ${error.response.data.message}`;
        } else if (error.message) {
            errorMsg = `❌ ${error.message}`;
        }

        await client.sendMessage(chatId, {
            text: errorMsg
        }, { quoted: message });

        await client.sendMessage(chatId, { 
            react: { text: '❌', key: message.key } 
        });
    }
}

module.exports = githubstalkCommand;