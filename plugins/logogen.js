const axios = require('axios');

const logogenCommand = async (client, chatId, m, args, sender, pushName, isOwner) => {
    try {
        const text = args.join(' ').trim();

        if (!text) {
            return await client.sendMessage(chatId, { 
                text: `🎨 *AI LOGO GENERATOR*\n\nPlease provide title, idea, and slogan separated by |\n\nFormat: .logogen Title|Idea|Slogan\n\n*Example:* .logogen ToxicTech|AI-Powered Services|Innovation Meets Simplicity` 
            }, { quoted: m });
        }

        const [title, idea, slogan] = text.split("|").map(item => item.trim());

        if (!title || !idea || !slogan) {
            return await client.sendMessage(chatId, { 
                text: `❌ *Incorrect format*\n\nUse: .logogen Title|Idea|Slogan\n\nExample: .logogen ToxicTech|AI-Powered Services|Innovation Meets Simplicity` 
            }, { quoted: m });
        }

        // Send loading reaction
        await client.sendMessage(chatId, { 
            react: { text: '🎨', key: m.key } 
        });

        // Send processing message
        const processingMsg = await client.sendMessage(chatId, {
            text: `🎨 *AI LOGO GENERATOR*\n\nGenerating logos for "${title}"...\n\nPlease wait 30-60 seconds.`
        }, { quoted: m });

        const payload = {
            ai_icon: [333276, 333279],
            height: 300,
            idea: idea,
            industry_index: "N",
            industry_index_id: "",
            pagesize: 4,
            session_id: "",
            slogan: slogan,
            title: title,
            whiteEdge: 80,
            width: 400,
        };

        const { data } = await axios.post("https://www.sologo.ai/v1/api/logo/logo_generate", payload, {
            timeout: 60000,
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        // Delete processing message
        await client.sendMessage(chatId, { delete: processingMsg.key });

        if (!data.data.logoList || data.data.logoList.length === 0) {
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: m.key } 
            });
            return await client.sendMessage(chatId, { 
                text: `❌ Failed to generate logos. Please try again with different details.` 
            }, { quoted: m });
        }

        // Send each generated logo
        let count = 0;
        for (const logo of data.data.logoList) {
            count++;
            await client.sendMessage(chatId, {
                image: { url: logo.logo_thumb },
                caption: `🎨 *LOGO ${count}/${data.data.logoList.length}*\n\n📝 *Title:* ${title}\n💡 *Idea:* ${idea}\n📢 *Slogan:* ${slogan}\n\n─ MAD-MAX BOT`
            }, { quoted: m });
            
            // Small delay between images
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // Success reaction
        await client.sendMessage(chatId, { 
            react: { text: '✅', key: m.key } 
        });

        // Send summary
        await client.sendMessage(chatId, {
            text: `🎨 *AI LOGO GENERATOR*\n\n✅ Successfully generated ${data.data.logoList.length} logos for "${title}"!\n\n💡 Try different combinations for more options.`
        }, { quoted: m });

    } catch (err) {
        console.error("Logo generation error:", err);

        // Error reaction
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: m.key } 
        });

        let errorMessage = "An error occurred while creating the logo.";
        
        if (err.message.includes('timeout')) {
            errorMessage = "Request timed out. Please try again later.";
        } else if (err.message.includes('400')) {
            errorMessage = "Invalid request. Please check your format.";
        } else if (err.message.includes('500')) {
            errorMessage = "Server error. The logo generation service might be down.";
        }

        await client.sendMessage(chatId, { 
            text: `🎨 *AI LOGO GENERATOR*\n\n❌ ${errorMessage}\n\nError: ${err.message}` 
        }, { quoted: m });
    }
};

module.exports = {
    logogenCommand
};