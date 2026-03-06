const fetch = require('node-fetch');

const githubstalkCommand = async (client, chatId, m, args, sender, pushName, isOwner) => {
    try {
        const text = args.join(' ').trim();

        if (!text) {
            return await client.sendMessage(chatId, { 
                text: `🐙 *GITHUB USER STALK*\n\nPlease provide a GitHub username to stalk.\n\nExample: .githubstalk octocat` 
            }, { quoted: m });
        }

        // Send loading reaction
        await client.sendMessage(chatId, { 
            react: { text: '🐙', key: m.key } 
        });

        // Send processing message
        const processingMsg = await client.sendMessage(chatId, {
            text: `🐙 *GITHUB USER STALK*\n\nFetching information for *${text}*...`
        }, { quoted: m });

        const response = await fetch(`https://itzpire.com/stalk/github-user?username=${encodeURIComponent(text)}`);
        const data = await response.json();

        if (!data || !data.data) {
            throw new Error('Invalid API response');
        }

        const userData = data.data;
        
        const username = userData.username || 'N/A';
        const nickname = userData.nickname || 'N/A';
        const bio = userData.bio || 'No bio available';
        const profilePic = userData.profile_pic;
        const url = userData.url || 'N/A';
        const type = userData.type || 'N/A';
        const isAdmin = userData.admin ? 'Yes' : 'No';
        const company = userData.company || 'Not specified';
        const blog = userData.blog || 'Not specified';
        const location = userData.location || 'Not specified';
        const publicRepos = userData.public_repo || 0;
        const publicGists = userData.public_gists || 0;
        const followers = userData.followers || 0;
        const following = userData.following || 0;
        const createdAt = userData.ceated_at || 'N/A'; // Note: API has typo "ceated_at"
        const updatedAt = userData.updated_at || 'N/A';

        // Format the message
        const message = `🐙 *GITHUB USER PROFILE*\n\n` +
            `*Username:* ${username}\n` +
            `*Nickname:* ${nickname}\n` +
            `*Type:* ${type}\n` +
            `*Admin:* ${isAdmin}\n\n` +
            `*Bio:* ${bio}\n\n` +
            `*Location:* ${location}\n` +
            `*Company:* ${company}\n` +
            `*Blog:* ${blog}\n\n` +
            `*📊 Statistics*\n` +
            `• *Repositories:* ${publicRepos}\n` +
            `• *Gists:* ${publicGists}\n` +
            `• *Followers:* ${followers}\n` +
            `• *Following:* ${following}\n\n` +
            `*Profile:* ${url}\n\n` +
            `*📅 Dates*\n` +
            `• *Created:* ${createdAt}\n` +
            `• *Updated:* ${updatedAt}\n\n` +
            `─ MAD-MAX BOT`;

        // Delete processing message
        await client.sendMessage(chatId, { delete: processingMsg.key });

        // Send the profile image with info
        if (profilePic) {
            await client.sendMessage(chatId, { 
                image: { url: profilePic }, 
                caption: message
            }, { quoted: m });
        } else {
            await client.sendMessage(chatId, { 
                text: message
            }, { quoted: m });
        }

        // Success reaction
        await client.sendMessage(chatId, { 
            react: { text: '✅', key: m.key } 
        });

    } catch (error) {
        console.error('GitHub stalk error:', error);

        // Error reaction
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: m.key } 
        });

        await client.sendMessage(chatId, {
            text: `🐙 *GITHUB USER STALK*\n\n❌ Unable to fetch data for *${args.join(' ')}*\n\nError: ${error.message}`
        }, { quoted: m });
    }
};

module.exports = {
    githubstalkCommand
};