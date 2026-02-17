const axios = require('axios');

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

module.exports = {
    async animequote(client, chatId, message, args, sender, pushName, isOwner) {
        try {
            // Send a "waiting" reaction
            await client.sendMessage(chatId, { 
                react: { text: '⏳', key: message.key } 
            });

            let quoteData;
            let apiSuccess = false;
            
            // 1. PRIMARY: Try the official Animechan API
            try {
                const response = await axios.get('https://api.animechan.io/v1/quotes/random', { timeout: 5000 });
                
                if (response.data && response.data.status === 'success') {
                    quoteData = {
                        SUCCESS: true,
                        MESSAGE: {
                            anime: response.data.data.anime.name,
                            quote: response.data.data.content,
                            author: response.data.data.character.name
                        }
                    };
                    apiSuccess = true;
                    console.log("✅ Quote fetched from Animechan.io");
                }
            } catch (primaryError) {
                console.log("⚠️  Primary API failed, trying backup...");
            }
            
            // 2. BACKUP: Try the open-source Anime-chan API
            if (!apiSuccess) {
                try {
                    const backupResponse = await axios.get('https://anime-chan.herokuapp.com/api/quotes', { timeout: 5000 });
                    
                    if (backupResponse.data) {
                        quoteData = {
                            SUCCESS: true,
                            MESSAGE: {
                                anime: backupResponse.data.anime,
                                quote: backupResponse.data.quote,
                                author: backupResponse.data.character
                            }
                        };
                        apiSuccess = true;
                        console.log("✅ Quote fetched from Anime-chan backup API");
                    }
                } catch (backupError) {
                    console.log("❌ Backup API also failed");
                }
            }

            // Handle if both APIs fail
            if (!apiSuccess || !quoteData?.SUCCESS) {
                await client.sendMessage(chatId, { 
                    text: "❌ Sorry, I couldn't connect to the quote services right now. Try again in a moment!",
                    ...channelInfo
                }, { quoted: message });
                await client.sendMessage(chatId, { 
                    react: { text: '❌', key: message.key } 
                });
                return;
            }

            // Format the quote text with nice formatting
            const quoteText = `╭─❖ *ANIME QUOTE* ❖─
│
├─ 🌸 *Anime:* ${quoteData.MESSAGE.anime || 'Unknown Anime'}
│
├─ 💬 *Quote:* 
│  "${quoteData.MESSAGE.quote}"
│
├─ ✍️ *Character:* ${quoteData.MESSAGE.author || 'Unknown Character'}
│
╰─➤ _Requested by: ${pushName}_`;

            // Send the quote
            await client.sendMessage(chatId, { 
                text: quoteText,
                ...channelInfo
            }, { quoted: message });
            
            // Try to send an optional anime image (keeps your feature)
            try {
                await client.sendMessage(chatId, {
                    image: { url: 'https://files.catbox.moe/852x91.jpeg' },
                    caption: '🎌 *Anime Quote Image*',
                    ...channelInfo
                });
            } catch (imageError) {
                // It's okay if the image fails
            }
            
            // Send a success reaction
            await client.sendMessage(chatId, { 
                react: { text: '✅', key: message.key } 
            });

        } catch (error) {
            console.error("🔥 Unexpected error in anime quote command:", error);
            await client.sendMessage(chatId, { 
                text: "❌ An unexpected error occurred. Please try the command again.",
                ...channelInfo
            }, { quoted: message });
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: message.key } 
            });
        }
    }
};