const axios = require("axios");

const tempinboxCommand = async (client, chatId, m, args, sender, pushName, isOwner) => {
    try {
        // Send loading reaction
        await client.sendMessage(chatId, { 
            react: { text: '📥', key: m.key } 
        });

        // Check if email and token are provided
        if (!args || args.length === 0) {
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: m.key } 
            });
            return await client.sendMessage(chatId, { 
                text: `📥 *CHECK INBOX*\n\nPlease provide your email and token.\n\nFormat: .tempinbox email|token\nExample: .tempinbox abc@domain.com|eyJ...` 
            }, { quoted: m });
        }

        const input = args.join(' ').trim();
        
        // Parse email and token (format: email|token)
        let email, token;
        if (input.includes('|')) {
            [email, token] = input.split('|');
        } else {
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: m.key } 
            });
            return await client.sendMessage(chatId, { 
                text: `❌ Invalid format. Use: email|token` 
            }, { quoted: m });
        }

        email = email.trim();
        token = token.trim();

        // Send processing message
        const processingMsg = await client.sendMessage(chatId, {
            text: `📥 *CHECKING INBOX*\n\nFetching messages for ${email}...\n\nPlease wait.`
        }, { quoted: m });

        // Get messages from mail.tm API
        const response = await axios.get('https://api.mail.tm/messages', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            },
            params: {
                page: 1
            },
            timeout: 15000
        });

        // Delete processing message
        await client.sendMessage(chatId, { delete: processingMsg.key });

        const messages = response.data['hydra:member'] || [];

        if (messages.length === 0) {
            await client.sendMessage(chatId, { 
                react: { text: '📭', key: m.key } 
            });
            return await client.sendMessage(chatId, { 
                text: `📥 *INBOX*\n\nNo messages found for ${email}.` 
            }, { quoted: m });
        }

        // Format message list
        let inboxText = `📥 *INBOX (${messages.length})*\n\n`;
        inboxText += `📧 *Email:* ${email}\n\n`;

        messages.slice(0, 10).forEach((msg, index) => {
            const date = new Date(msg.createdAt).toLocaleString();
            inboxText += `*${index + 1}. ${msg.subject || 'No Subject'}*\n`;
            inboxText += `   👤 From: ${msg.from?.name || msg.from?.address || 'Unknown'}\n`;
            inboxText += `   📅 ${date}\n`;
            inboxText += `   🆔 ID: ${msg.id}\n\n`;
        });

        if (messages.length > 10) {
            inboxText += `*...and ${messages.length - 10} more messages*\n\n`;
        }

        inboxText += `To read a specific message: .readmsg email|token|messageId\n`;
        inboxText += `─ MAD-MAX BOT`;

        await client.sendMessage(chatId, { 
            react: { text: '✅', key: m.key } 
        });

        await client.sendMessage(chatId, {
            text: inboxText
        }, { quoted: m });

    } catch (error) {
        console.error('TempInbox error:', error);

        // Delete processing message if it exists
        if (processingMsg) {
            await client.sendMessage(chatId, { delete: processingMsg.key }).catch(() => {});
        }

        await client.sendMessage(chatId, { 
            react: { text: '❌', key: m.key } 
        });

        let errorMsg = 'Failed to fetch inbox.';
        
        if (error.response?.status === 401) {
            errorMsg = 'Invalid or expired token. Please create a new temp mail with .tempmail';
        } else if (error.response?.status === 404) {
            errorMsg = 'Inbox not found. Token may be invalid.';
        } else if (error.message.includes('timeout')) {
            errorMsg = 'Request timeout. Please try again.';
        }

        await client.sendMessage(chatId, {
            text: `📥 *CHECK INBOX*\n\n❌ ${errorMsg}`
        }, { quoted: m });
    }
};

module.exports = {
    tempinboxCommand
};