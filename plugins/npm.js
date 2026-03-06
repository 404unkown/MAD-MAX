const axios = require('axios');

const npmCommand = async (client, chatId, m, args, sender, pushName, isOwner) => {
    try {
        const query = args.join(' ').trim();
        
        if (!query) {
            return await client.sendMessage(chatId, { 
                text: `📦 *NPM PACKAGE SEARCH*\n\nPlease provide a package name.\n\nExample: .npm axios` 
            }, { quoted: m });
        }

        // Send loading reaction
        await client.sendMessage(chatId, {
            react: { text: '📦', key: m.key }
        });

        // Make the API request with proper headers
        const response = await axios.get(`https://api-faa.my.id/faa/npmjs?name=${encodeURIComponent(query)}`, {
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 10000
        });

        console.log('API Response:', response.data);

        // Check if response is valid
        if (!response.data || !response.data.status) {
            throw new Error('Invalid API response');
        }

        const results = response.data.result;
        
        if (!results || results.length === 0) {
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: m.key } 
            });
            return await client.sendMessage(chatId, { 
                text: `📦 *NPM PACKAGE SEARCH*\n\n❌ No packages found for: "${query}"` 
            }, { quoted: m });
        }

        // Format the results (limit to 10 results)
        let message = `📦 *NPM PACKAGE SEARCH RESULTS*\n\n`;
        message += `🔍 *Query:* ${query}\n`;
        message += `📊 *Results:* ${results.length}\n\n`;

        const maxResults = Math.min(results.length, 10);
        for (let i = 0; i < maxResults; i++) {
            const pkg = results[i];
            message += `*${i + 1}. ${pkg.name}* ${pkg.version ? `v${pkg.version}` : ''}\n`;
            message += `   📝 ${pkg.description || 'No description'}\n`;
            message += `   🔗 ${pkg.link || 'https://npmjs.com'}\n\n`;
        }

        if (results.length > 10) {
            message += `_...and ${results.length - 10} more results_\n\n`;
        }

        message += `─ MAD-MAX BOT`;

        await client.sendMessage(chatId, { 
            react: { text: '✅', key: m.key } 
        });

        await client.sendMessage(chatId, {
            text: message
        }, { quoted: m });

    } catch (error) {
        console.error('NPM command error:', error);
        
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: m.key } 
        });

        let errorMessage = error.message;
        if (error.response) {
            console.error('Response data:', error.response.data);
            errorMessage = `API Error: ${error.response.status}`;
        }

        await client.sendMessage(chatId, {
            text: `📦 *NPM PACKAGE SEARCH*\n\n❌ Search failed.\n\nError: ${errorMessage}`
        }, { quoted: m });
    }
};

module.exports = {
    npmCommand
};