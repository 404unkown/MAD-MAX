const axios = require('axios');
const { channelInfo } = require('../lib/messageConfig');

async function updateCommand(client, chatId, message, args, sender, pushName, isOwnerSimple) {
    try {
        // Check if user is owner
        if (!isOwnerSimple) {
            await client.sendMessage(chatId, {
                text: "❌ Only the owner can use this command!",
                ...channelInfo
            }, { quoted: message });
            return;
        }

        // Get appname and herokuapi from environment variables
        // You need to have these in your set.js file
        const { appname, herokuapi } = require('../set');
        
        if (!appname || !herokuapi) {
            await client.sendMessage(chatId, {
                text: "❌ Heroku app name or API key is not set.\n\nPlease make sure you have set the `APP_NAME` and `HEROKU_API` environment variables in your set.js file.",
                ...channelInfo
            }, { quoted: message });
            return;
        }

        // Send processing reaction
        await client.sendMessage(chatId, { 
            react: { text: '⏳', key: message.key } 
        });

        const processingMsg = await client.sendMessage(chatId, {
            text: "🚀 *Initiating redeploy...*\n\nThis may take up to 2 minutes.",
            ...channelInfo
        }, { quoted: message });

        try {
            // Trigger Heroku redeploy
            const response = await axios.post(
                `https://api.heroku.com/apps/${appname}/builds`,
                {
                    source_blob: {
                        url: "https://github.com/404unkown/MAD-MAX/tarball/main",
                    },
                },
                {
                    headers: {
                        Authorization: `Bearer ${herokuapi}`,
                        Accept: "application/vnd.heroku+json; version=3",
                    },
                }
            );

            // Delete processing message
            await client.sendMessage(chatId, { delete: processingMsg.key });

            // Success message
            await client.sendMessage(chatId, {
                text: "✅ *Redeploy Started Successfully!*\n\nYour bot is undergoing a ruthless upgrade, hold tight for the next 2 minutes as the redeploy executes! Once done, you'll have the freshest version unleashed upon you.",
                ...channelInfo
            }, { quoted: message });

            // Success reaction
            await client.sendMessage(chatId, { 
                react: { text: '✅', key: message.key } 
            });

            console.log("Build details:", response.data);

        } catch (error) {
            // Delete processing message
            await client.sendMessage(chatId, { delete: processingMsg.key });

            const errorMessage = error.response?.data || error.message;
            
            await client.sendMessage(chatId, {
                text: `❌ *Redeploy Failed*\n\nPlease check if your Heroku API key and app name are correct.\n\nError: ${error.message}`,
                ...channelInfo
            }, { quoted: message });

            await client.sendMessage(chatId, { 
                react: { text: '❌', key: message.key } 
            });

            console.error("Error triggering redeploy:", errorMessage);
        }

    } catch (error) {
        console.error('Update command error:', error);
        
        await client.sendMessage(chatId, {
            text: "❌ Failed to execute update command.",
            ...channelInfo
        }, { quoted: message });

        await client.sendMessage(chatId, { 
            react: { text: '❌', key: message.key } 
        });
    }
}

module.exports = updateCommand;