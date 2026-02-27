const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

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

async function viewonceCommand(client, chatId, message, args, sender, pushName, isOwner) {
    try {
        // Send processing reaction
        await client.sendMessage(chatId, { 
            react: { text: '⏳', key: message.key } 
        });

        // Extract quoted message
        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const quotedImage = quoted?.imageMessage;
        const quotedVideo = quoted?.videoMessage;

        if (quotedImage && quotedImage.viewOnce) {
            try {
                // Download the image
                const stream = await downloadContentFromMessage(quotedImage, 'image');
                let buffer = Buffer.from([]);
                for await (const chunk of stream) {
                    buffer = Buffer.concat([buffer, chunk]);
                }
                
                // Send the image
                await client.sendMessage(chatId, { 
                    image: buffer, 
                    caption: quotedImage.caption || '📸 *View-Once Image*',
                    ...channelInfo
                }, { quoted: message });
                
                // Success reaction
                await client.sendMessage(chatId, { 
                    react: { text: '✅', key: message.key } 
                });
                
                console.log(`[VIEWONCE] Image saved from ${sender}`);
                
            } catch (error) {
                console.error('Error downloading view-once image:', error);
                await client.sendMessage(chatId, { 
                    text: '❌ Failed to download view-once image.',
                    ...channelInfo
                }, { quoted: message });
                await client.sendMessage(chatId, { 
                    react: { text: '❌', key: message.key } 
                });
            }
            
        } else if (quotedVideo && quotedVideo.viewOnce) {
            try {
                // Download the video
                const stream = await downloadContentFromMessage(quotedVideo, 'video');
                let buffer = Buffer.from([]);
                for await (const chunk of stream) {
                    buffer = Buffer.concat([buffer, chunk]);
                }
                
                // Send the video
                await client.sendMessage(chatId, { 
                    video: buffer, 
                    caption: quotedVideo.caption || '🎥 *View-Once Video*',
                    ...channelInfo
                }, { quoted: message });
                
                // Success reaction
                await client.sendMessage(chatId, { 
                    react: { text: '✅', key: message.key } 
                });
                
                console.log(`[VIEWONCE] Video saved from ${sender}`);
                
            } catch (error) {
                console.error('Error downloading view-once video:', error);
                await client.sendMessage(chatId, { 
                    text: '❌ Failed to download view-once video.',
                    ...channelInfo
                }, { quoted: message });
                await client.sendMessage(chatId, { 
                    react: { text: '❌', key: message.key } 
                });
            }
            
        } else {
            await client.sendMessage(chatId, { 
                text: '❌ *VIEW-ONE COMMAND*\n\nPlease reply to a view-once image or video with .vv',
                ...channelInfo
            }, { quoted: message });
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: message.key } 
            });
        }
        
    } catch (error) {
        console.error('Error in viewonce command:', error);
        await client.sendMessage(chatId, { 
            text: '❌ An error occurred while processing the command.',
            ...channelInfo
        }, { quoted: message });
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: message.key } 
        });
    }
}

module.exports = viewonceCommand;