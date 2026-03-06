const axios = require("axios");

const tempmailCommand = async (client, chatId, m, args, sender, pushName, isOwner) => {
    try {
        const prefix = '.'; // or get from config

        // Send loading reaction
        await client.sendMessage(chatId, { 
            react: { text: '📧', key: m.key } 
        });

        // Send processing message
        const processingMsg = await client.sendMessage(chatId, {
            text: `📧 *TEMPORARY EMAIL*\n\nCreating a temporary email address...\n\nPlease wait.`
        }, { quoted: m });

        // Get available domains first
        const domainsResponse = await axios.get('https://api.mail.tm/domains', {
            timeout: 10000
        });

        if (!domainsResponse.data || !domainsResponse.data['hydra:member'] || domainsResponse.data['hydra:member'].length === 0) {
            throw new Error('No domains available');
        }

        // Use the first available domain
        const domain = domainsResponse.data['hydra:member'][0].domain;
        
        // Generate random username
        const randomString = Math.random().toString(36).substring(2, 10);
        const email = `${randomString}@${domain}`;
        const password = Math.random().toString(36).substring(2, 15);

        // Create account
        const createResponse = await axios.post('https://api.mail.tm/accounts', {
            address: email,
            password: password
        }, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 10000
        });

        if (!createResponse.data || !createResponse.data.id) {
            throw new Error('Failed to create account');
        }

        const accountId = createResponse.data.id;

        // Get token
        const tokenResponse = await axios.post('https://api.mail.tm/token', {
            address: email,
            password: password
        }, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 10000
        });

        if (!tokenResponse.data || !tokenResponse.data.token) {
            throw new Error('Failed to get token');
        }

        const token = tokenResponse.data.token;

        // Delete processing message
        await client.sendMessage(chatId, { delete: processingMsg.key });

        // Success reaction
        await client.sendMessage(chatId, { 
            react: { text: '✅', key: m.key } 
        });

        // Format the response
        const message = `📧 *TEMPORARY EMAIL*\n\n` +
            `✅ *Email Created Successfully!*\n\n` +
            `📧 *Email:* ${email}\n` +
            `🔑 *Password:* ${password}\n` +
            `🔑 *Token:* ${token.substring(0, 20)}...\n` +
            `⏰ *Expires:* 7 days\n\n` +
            `📋 *To check inbox:*\n` +
            `${prefix}tempinbox ${email}|${token}\n\n` +
            `*Save these details to access your inbox later!*\n\n` +
            `─ MAD-MAX BOT`;

        await client.sendMessage(chatId, { 
            text: message
        }, { quoted: m });

        // Also send copy-friendly version
        await client.sendMessage(chatId, { 
            text: `📧 *COPY DETAILS*\n\nEmail: ${email}\nPassword: ${password}\nToken: ${token}`
        });

    } catch (error) {
        console.error('TempMail error:', error);

        // Error reaction
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: m.key } 
        });

        let errorMessage = `Failed to create temporary email. `;
        
        if (error.message.includes('timeout')) {
            errorMessage += "Request timeout. Please try again later.";
        } else if (error.message.includes('Network')) {
            errorMessage += "Network error. Check your internet connection.";
        } else {
            errorMessage += `Error: ${error.message}`;
        }

        await client.sendMessage(chatId, {
            text: `📧 *TEMPORARY EMAIL*\n\n❌ ${errorMessage}`
        }, { quoted: m });
    }
};

module.exports = {
    tempmailCommand
};