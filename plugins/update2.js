const axios = require("axios");
const { generateWAMessageFromContent } = require('@whiskeysockets/baileys');

const update2Command = async (client, chatId, m, args, sender, pushName, isOwner) => {
    // Check if user is owner - ONLY THIS CHECK, no double-checking
    if (!isOwner) {
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: m.key } 
        });
        return await client.sendMessage(chatId, {
            text: `❌ *OWNER ONLY*\n\nThis command is only for bot owners.`
        }, { quoted: m });
    }
    
    try {
        const config = require('../set');
        const prefix = config.prefix || '.';
        
        // Get Heroku credentials from config
        const HEROKU_API_KEY = config.herokuapi || process.env.HEROKU_API_KEY;
        const HEROKU_APP_NAME = config.appname || process.env.HEROKU_APP_NAME;

        // Send loading reaction
        await client.sendMessage(chatId, { 
            react: { text: '🔂', key: m.key } 
        });

        // Check Heroku credentials
        if (!HEROKU_API_KEY || !HEROKU_APP_NAME) {
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: m.key } 
            });
            return await client.sendMessage(chatId, {
                text: `⚠️ *HEROKU CONFIG MISSING*\n\nYou forgot to set *HEROKU_API_KEY* or *HEROKU_APP_NAME* in your set.js file.\n\nExample:\nherokuapi: 'your-api-key-here',\nappname: 'your-app-name-here'`
            }, { quoted: m });
        }

        // Send processing message
        const processingMsg = await client.sendMessage(chatId, {
            text: `🔄 *CHECKING FOR UPDATES*\n\nPlease wait while I check for updates...`
        }, { quoted: m });

        try {
            // Get latest commit from GitHub
            const githubRes = await axios.get(
                "https://api.github.com/repos/404unkoen/MAD-MAX/commits/main"
            );

            const latestCommit = githubRes.data;
            const latestSha = latestCommit.sha;

            // Get Heroku build info
            const herokuRes = await axios.get(
                `https://api.heroku.com/apps/${HEROKU_APP_NAME}/builds`,
                {
                    headers: {
                        Authorization: `Bearer ${HEROKU_API_KEY}`,
                        Accept: "application/vnd.heroku+json; version=3",
                    },
                }
            );

            const lastBuild = herokuRes.data[0];
            const deployedSha = lastBuild?.source_blob?.url || "";
            const alreadyDeployed = deployedSha.includes(latestSha);

            // Delete processing message
            await client.sendMessage(chatId, { delete: processingMsg.key });

            if (alreadyDeployed) {
                // Bot is already up to date
                const msg = generateWAMessageFromContent(
                    chatId,
                    {
                        viewOnceMessage: {
                            message: {
                                interactiveMessage: {
                                    body: {
                                        text: "✅ Your bot is already on the latest version!"
                                    },
                                    footer: {
                                        text: "─ MAD-MAX BOT"
                                    },
                                    nativeFlowMessage: {
                                        buttons: [
                                            {
                                                name: "single_select",
                                                buttonParamsJson: JSON.stringify({
                                                    title: "What would you like to do?",
                                                    sections: [
                                                        {
                                                            rows: [
                                                                { title: "📱 Menu", description: "Get command list", id: `${prefix}menu` },
                                                                { title: "⚙ Settings", description: "Bot settings", id: `${prefix}settings` },
                                                            ],
                                                        },
                                                    ],
                                                }),
                                            },
                                        ],
                                    },
                                }
                            }
                        }
                    },
                    { quoted: m }
                );

                await client.relayMessage(chatId, msg.message, { messageId: msg.key.id });
                
            } else {
                // Update available
                const msg = generateWAMessageFromContent(
                    chatId,
                    {
                        viewOnceMessage: {
                            message: {
                                interactiveMessage: {
                                    body: {
                                        text: `🆕 *UPDATE AVAILABLE*\n\nNew version found!\n\n📌 *Commit:* ${latestCommit.commit.message}\n👤 *Author:* ${latestCommit.commit.author.name}\n🕒 *Date:* ${new Date(latestCommit.commit.author.date).toLocaleString()}\n\nTo update your bot, tap the button below.`
                                    },
                                    footer: {
                                        text: "─ MAD-MAX BOT"
                                    },
                                    nativeFlowMessage: {
                                        buttons: [
                                            {
                                                name: "single_select",
                                                buttonParamsJson: JSON.stringify({
                                                    title: "UPDATE OPTIONS",
                                                    sections: [
                                                        {
                                                            title: "Choose an action",
                                                            rows: [
                                                                { title: "🚀 Trigger Update", description: "Update now", id: `${prefix}triggerupdate` },
                                                                { title: "📱 Menu", description: "Back to command list", id: `${prefix}menu` },
                                                            ],
                                                        },
                                                    ],
                                                }),
                                            },
                                        ],
                                    },
                                }
                            }
                        }
                    },
                    { quoted: m }
                );

                await client.relayMessage(chatId, msg.message, { messageId: msg.key.id });
            }

            // Success reaction
            await client.sendMessage(chatId, { 
                react: { text: '✅', key: m.key } 
            });

        } catch (apiError) {
            console.error('API Error:', apiError);
            
            await client.sendMessage(chatId, { delete: processingMsg.key });
            
            const errorMessage = apiError.response?.data?.message || apiError.message;
            let userMessage = '';

            if (errorMessage.includes("API key")) {
                userMessage = "❌ Your Heroku API key is invalid.\nFix *HEROKU_API_KEY* in your set.js file.";
            } else if (errorMessage.includes("not found")) {
                userMessage = "❌ Heroku app not found.\nAre you sure *HEROKU_APP_NAME* is correct?";
            } else {
                userMessage = `❌ Update check failed:\n${errorMessage}`;
            }

            await client.sendMessage(chatId, { 
                react: { text: '❌', key: m.key } 
            });

            await client.sendMessage(chatId, {
                text: userMessage
            }, { quoted: m });
        }

    } catch (error) {
        console.error('Update2 command error:', error);

        // Error reaction
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: m.key } 
        });

        await client.sendMessage(chatId, {
            text: `❌ *UPDATE CHECK FAILED*\n\nError: ${error.message}`
        }, { quoted: m });
    }
};

module.exports = {
    update2Command
};