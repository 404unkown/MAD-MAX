const axios = require("axios");

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

async function apkCommand(client, chatId, message, args, sender, pushName, isOwner) {
    try {
        // Check if the user provided an app name
        const appName = args.join(" ");
        if (!appName) {
            await client.sendMessage(chatId, {
                text: '📱 *APK DOWNLOADER*\n\nPlease provide an app name.\n\n*Example:* `.apk whatsapp`\n*Example:* `.apk facebook`',
                ...channelInfo
            }, { quoted: message });
            return;
        }

        // Add a reaction to indicate processing
        await client.sendMessage(chatId, { 
            react: { text: '⏳', key: message.key } 
        });

        // Prepare the NexOracle API URL
        const apiUrl = `https://api.nexoracle.com/downloader/apk`;
        const params = {
            apikey: 'free_key@maher_apis',
            q: appName,
        };

        // Call the NexOracle API using GET
        const response = await axios.get(apiUrl, { params });

        // Check if the API response is valid
        if (!response.data || response.data.status !== 200 || !response.data.result) {
            await client.sendMessage(chatId, {
                text: '🚫 Unable to find the APK. Please try again later.',
                ...channelInfo
            }, { quoted: message });
            
            await client.sendMessage(chatId, { 
                react: { text: '🚫', key: message.key } 
            });
            return;
        }

        // Extract the APK details
        const { name, lastup, package: packageName, size, icon, dllink } = response.data.result;

        // Send a message with the app thumbnail and "Downloading..." text
        await client.sendMessage(chatId, {
            image: { url: icon },
            caption: `📦 *Downloading ${name}...*\n\n⏳ Please wait while we fetch the APK file.`,
            ...channelInfo
        }, { quoted: message });

        // Download the APK file
        const apkResponse = await axios.get(dllink, { responseType: 'arraybuffer' });
        if (!apkResponse.data) {
            await client.sendMessage(chatId, {
                text: '🚫 Failed to download the APK. Please try again later.',
                ...channelInfo
            }, { quoted: message });
            
            await client.sendMessage(chatId, { 
                react: { text: '🚫', key: message.key } 
            });
            return;
        }

        // Prepare the APK file buffer
        const apkBuffer = Buffer.from(apkResponse.data, 'binary');

        // Prepare the message with APK details
        const apkMessage = `╭─❖ *APK DETAILS* ❖─
│
├─ 📦 *Name:* ${name}
├─ 📅 *Last Update:* ${lastup}
├─ 📦 *Package:* ${packageName}
├─ 📏 *Size:* ${size}
│
╰─➤ _Downloaded by: ${pushName}_`;

        // Send the APK file as a document
        await client.sendMessage(chatId, {
            document: apkBuffer,
            fileName: `${name}.apk`,
            mimetype: 'application/vnd.android.package-archive',
            caption: apkMessage,
            ...channelInfo
        }, { quoted: message });

        // Success reaction
        await client.sendMessage(chatId, { 
            react: { text: '✅', key: message.key } 
        });

    } catch (error) {
        console.error('Error in apkCommand:', error);
        await client.sendMessage(chatId, {
            text: '🚫 An error occurred while processing your request. Please try again later.',
            ...channelInfo
        }, { quoted: message });
        
        await client.sendMessage(chatId, { 
            react: { text: '🚫', key: message.key } 
        });
    }
}

module.exports = apkCommand;