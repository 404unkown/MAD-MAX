const fs = require('fs');
const path = require('path');

const dataFilePath = path.join(__dirname, '..', 'data', 'messageCount.json');

// Global channel info
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

function loadMessageCounts() {
    try {
        if (fs.existsSync(dataFilePath)) {
            const data = fs.readFileSync(dataFilePath, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error loading message counts:', error);
    }
    return {};
}

function saveMessageCounts(messageCounts) {
    try {
        // Ensure data directory exists
        const dataDir = path.join(__dirname, '..', 'data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        fs.writeFileSync(dataFilePath, JSON.stringify(messageCounts, null, 2));
    } catch (error) {
        console.error('Error saving message counts:', error);
    }
}

function incrementMessageCount(groupId, userId) {
    try {
        const messageCounts = loadMessageCounts();

        if (!messageCounts[groupId]) {
            messageCounts[groupId] = {};
        }

        if (!messageCounts[groupId][userId]) {
            messageCounts[groupId][userId] = 0;
        }

        messageCounts[groupId][userId] += 1;

        saveMessageCounts(messageCounts);
    } catch (error) {
        console.error('Error incrementing message count:', error);
    }
}

async function topMembers(client, chatId, message, args, sender, pushName, isOwner) {
    try {
        // Check if in group
        if (!chatId.endsWith('@g.us')) {
            await client.sendMessage(chatId, { 
                text: '❌ This command can only be used in groups!',
                ...channelInfo
            }, { quoted: message });
            return;
        }

        const messageCounts = loadMessageCounts();
        const groupCounts = messageCounts[chatId] || {};

        const sortedMembers = Object.entries(groupCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10); // Get top 10 members

        if (sortedMembers.length === 0) {
            await client.sendMessage(chatId, { 
                text: 'ℹ️ No message activity recorded yet in this group.',
                ...channelInfo
            }, { quoted: message });
            return;
        }

        // Calculate total messages
        const totalMessages = Object.values(groupCounts).reduce((sum, count) => sum + count, 0);

        // Create message with emojis for top 3
        let messageText = `╭─❖ *TOP MEMBERS* ❖─
│
├─ *Total Messages:* ${totalMessages}
│
├─ *Leaderboard:*
`;

        sortedMembers.forEach(([userId, count], index) => {
            let rankEmoji = '';
            if (index === 0) rankEmoji = '🥇';
            else if (index === 1) rankEmoji = '🥈';
            else if (index === 2) rankEmoji = '🥉';
            else rankEmoji = '📊';
            
            messageText += `├─ ${rankEmoji} ${index + 1}. @${userId.split('@')[0]} - ${count} msg\n`;
        });

        messageText += `│
╰─➤ _Requested by: ${pushName}_`;

        // Send message with mentions
        await client.sendMessage(chatId, { 
            text: messageText,
            mentions: sortedMembers.map(([userId]) => userId),
            ...channelInfo
        }, { quoted: message });

        // Add success reaction
        await client.sendMessage(chatId, {
            react: { text: '✅', key: message.key }
        });

    } catch (error) {
        console.error('Error in topmembers command:', error);
        await client.sendMessage(chatId, { 
            text: '❌ Failed to fetch top members!',
            ...channelInfo
        }, { quoted: message });
        
        await client.sendMessage(chatId, {
            react: { text: '❌', key: message.key }
        });
    }
}

module.exports = { incrementMessageCount, topMembers };