const axios = require('axios');

const stickersearchCommand = async (client, chatId, m, args, sender, pushName, isOwner) => {
    try {
        const text = args.join(' ').trim();
        
        // Get botname from config
        const config = require('../set');
        const botname = config.botname || 'MAD-MAX';

        // Check for search term
        if (!text) {
            return await client.sendMessage(chatId, { 
                text: `🖼️ *STICKER SEARCH*\n\nPlease provide a search term.\n\nExample: .stickersearch cat` 
            }, { quoted: m });
        }

        // Send loading reaction
        await client.sendMessage(chatId, { 
            react: { text: '🖼️', key: m.key } 
        });

        // Send processing message
        const processingMsg = await client.sendMessage(chatId, {
            text: `🖼️ *STICKER SEARCH*\n\nSearching for "${text}" stickers...\n\nPlease wait.`
        }, { quoted: m });

        const tenorApiKey = 'AIzaSyCyouca1_KKy4W_MG1xsPzuku5oa8W358c';

        // Fetch GIFs from Tenor
        const gifResponse = await axios.get(
            `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(text)}&key=${tenorApiKey}&client_key=my_project&limit=8&media_filter=gif`
        );

        const results = gifResponse.data.results;

        // Delete processing message
        await client.sendMessage(chatId, { delete: processingMsg.key });

        if (!results || results.length === 0) {
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: m.key } 
            });
            return await client.sendMessage(chatId, { 
                text: `🖼️ *STICKER SEARCH*\n\nNo stickers found for "${text}". Try a different search term.` 
            }, { quoted: m });
        }

        // Notify in groups that stickers will be sent in DM
        if (chatId.endsWith('@g.us')) {
            await client.sendMessage(chatId, { 
                text: `🖼️ *STICKER SEARCH*\n\n@${sender.split('@')[0]}, I'll send the stickers to your private chat. 📥`,
                mentions: [sender]
            }, { quoted: m });
        }

        // Send stickers to user's DM
        const userJid = sender;
        
        await client.sendMessage(userJid, { 
            text: `🖼️ *STICKER SEARCH*\n\nHere are ${Math.min(8, results.length)} stickers for "${text}":` 
        });

        for (let i = 0; i < Math.min(8, results.length); i++) {
            try {
                const gifUrl = results[i].media_formats.gif.url;
                
                // Send as GIF instead of sticker to avoid sharp dependency
                await client.sendMessage(userJid, { 
                    video: { url: gifUrl },
                    gifPlayback: true,
                    caption: `Sticker ${i+1}/${Math.min(8, results.length)}`
                });
                
                // Small delay between sends
                await new Promise(resolve => setTimeout(resolve, 500));
                
            } catch (stickerError) {
                console.error(`Error sending sticker ${i+1}:`, stickerError);
            }
        }

        // Send completion message to DM
        await client.sendMessage(userJid, { 
            text: `✅ Done! ${Math.min(8, results.length)} stickers sent.` 
        });

        // Success reaction in group
        await client.sendMessage(chatId, { 
            react: { text: '✅', key: m.key } 
        });

        // Send confirmation in group
        if (chatId.endsWith('@g.us')) {
            await client.sendMessage(chatId, { 
                text: `✅ @${sender.split('@')[0]}, ${Math.min(8, results.length)} stickers sent to your DM.`,
                mentions: [sender]
            }, { quoted: m });
        }

    } catch (error) {
        console.error('Sticker search error:', error);

        // Error reaction
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: m.key } 
        });

        await client.sendMessage(chatId, {
            text: `🖼️ *STICKER SEARCH*\n\n❌ Failed to fetch stickers.\n\nError: ${error.message}`
        }, { quoted: m });
    }
};

module.exports = {
    stickersearchCommand
};