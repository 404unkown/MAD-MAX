const fetch = require("node-fetch");

const pndlCommand = async (client, chatId, m, args, sender, pushName, isOwner) => {
    try {
        const query = args.join(' ').trim();

        if (!query) {
            return await client.sendMessage(chatId, { 
                text: `📌 *pndl IMAGE SEARCH*\n\nPlease provide a search term.\n\nExample: .pndl nature wallpaper\nExample: .pin anime girl` 
            }, { quoted: m });
        }

        // Send loading reaction
        await client.sendMessage(chatId, { 
            react: { text: '📌', key: m.key } 
        });

        // Send processing message
        const processingMsg = await client.sendMessage(chatId, {
            text: `📌 *pndl IMAGE SEARCH*\n\nSearching for "${query}"...\n\nPlease wait.`
        }, { quoted: m });

        const apiUrl = `https://api-faa.my.id/faa/pndl?q=${encodeURIComponent(query)}`;
        const res = await fetch(apiUrl);
        const data = await res.json();

        // Delete processing message
        await client.sendMessage(chatId, { delete: processingMsg.key });

        if (!data.status || !data.result || data.result.length === 0) {
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: m.key } 
            });
            return await client.sendMessage(chatId, { 
                text: `📌 *pndl IMAGE SEARCH*\n\nNo images found for "${query}". Try a different search term.` 
            }, { quoted: m });
        }

        // Get up to 5 images
        const images = data.result.slice(0, 5);
        
        // Send first image with caption
        for (const [i, imgUrl] of images.entries()) {
            try {
                const response = await fetch(imgUrl);
                const arrayBuffer = await response.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);

                // First image gets caption, subsequent images no caption
                if (i === 0) {
                    await client.sendMessage(chatId, {
                        image: buffer,
                        caption: `📌 *pndl IMAGES*\n\n🔍 *Search:* ${query}\n📊 *Found:* ${data.result.length} images\n🖼️ *Showing:* 1-${Math.min(5, images.length)}\n\n─ MAD-MAX BOT`
                    }, { quoted: m });
                } else {
                    await client.sendMessage(chatId, {
                        image: buffer
                    });
                }
                
                // Add delay between images to avoid rate limiting
                if (i < images.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
                
            } catch (imgError) {
                console.log(`Error downloading image ${i+1}:`, imgError);
            }
        }

        // Success reaction
        await client.sendMessage(chatId, { 
            react: { text: '✅', key: m.key } 
        });

        // Send summary
        if (images.length > 0) {
            await client.sendMessage(chatId, { 
                text: `📌 *pndl IMAGE SEARCH*\n\n✅ Found ${data.result.length} images for "${query}". Showing ${images.length} results.` 
            }, { quoted: m });
        }

    } catch (error) {
        console.error('pndl error:', error);

        // Error reaction
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: m.key } 
        });

        await client.sendMessage(chatId, {
            text: `📌 *pndl IMAGE SEARCH*\n\n❌ Search failed.\n\nError: ${error.message}`
        }, { quoted: m });
    }
};

module.exports = {
    pndlCommand
};