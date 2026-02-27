const axios = require('axios');

// Voice model definitions
const voiceModels = [
    { number: "1", name: "Hatsune Miku", model: "miku" },
    { number: "2", name: "Nahida (Exclusive)", model: "nahida" },
    { number: "3", name: "Nami", model: "nami" },
    { number: "4", name: "Ana (Female)", model: "ana" },
    { number: "5", name: "Optimus Prime", model: "optimus_prime" },
    { number: "6", name: "Goku", model: "goku" },
    { number: "7", name: "Taylor Swift", model: "taylor_swift" },
    { number: "8", name: "Elon Musk", model: "elon_musk" },
    { number: "9", name: "Mickey Mouse", model: "mickey_mouse" },
    { number: "10", name: "Kendrick Lamar", model: "kendrick_lamar" },
    { number: "11", name: "Angela Adkinsh", model: "angela_adkinsh" },
    { number: "12", name: "Eminem", model: "eminem" }
];

// Store active voice sessions
if (!global.voiceSessions) global.voiceSessions = {};

async function aivoiceCommand(client, chatId, message, args, sender, pushName, isOwnerSimple) {
    try {
        // Check if user provided text
        if (!args || args.length === 0) {
            await client.sendMessage(chatId, { 
                text: "🔊 *AI Voice Generator*\n\nPlease provide text after the command.\n\n*Usage:* .aivoice <text>\n*Example:* .aivoice Hello, how are you?\n\n*Aliases:* .vai, .voicex, .voiceai"
            }, { quoted: message });
            return;
        }

        // Get the full input text
        const inputText = args.join(' ');

        // Send processing reaction
        await client.sendMessage(chatId, { 
            react: { text: '⏳', key: message.key } 
        });

        // Create menu text
        let menuText = "╭━━━〔 *AI VOICE MODELS* 〕━━━⊷\n";
        voiceModels.forEach(model => {
            menuText += `┃▸ ${model.number}. ${model.name}\n`;
        });
        menuText += "╰━━━⪼\n\n";
        menuText += `📌 *Reply with the number to select voice model for:*\n"${inputText}"\n\n`;
        menuText += `👤 *Requested by:* @${sender.split('@')[0]}\n`;
        menuText += `⏱️ *Time limit:* 2 minutes`;

        // Send menu message with image
        const sentMsg = await client.sendMessage(chatId, {  
            image: { url: "https://files.catbox.moe/r3elaj.png" },
            caption: menuText,
            mentions: [sender]
        }, { quoted: message });

        // Store session data
        const messageID = sentMsg.key.id;
        global.voiceSessions[messageID] = {
            chatId,
            sender,
            inputText,
            timestamp: Date.now(),
            active: true
        };

        // Success reaction
        await client.sendMessage(chatId, { 
            react: { text: '✅', key: message.key } 
        });

        // Set timeout to clean up session after 2 minutes
        setTimeout(() => {
            if (global.voiceSessions[messageID]) {
                delete global.voiceSessions[messageID];
            }
        }, 120000);

    } catch (error) {
        console.error("AI Voice Command Error:", error);
        await client.sendMessage(chatId, { 
            text: "🚫 An error occurred. Please try again." 
        }, { quoted: message });
        await client.sendMessage(chatId, { 
            react: { text: '🚫', key: message.key } 
        });
    }
}

async function handleVoiceReply(client, message, replyId, choice, sender) {
    try {
        // Check if session exists
        if (!global.voiceSessions || !global.voiceSessions[replyId]) return false;
        
        const session = global.voiceSessions[replyId];
        
        // Check if session is still active
        if (!session.active) return false;
        
        // Check if the replier is the original sender
        if (sender !== session.sender) {
            await client.sendMessage(session.chatId, { 
                text: `🚫 Only @${session.sender.split('@')[0]} can select the voice model!`,
                mentions: [session.sender]
            }, { quoted: message });
            return true;
        }

        // Mark session as inactive
        session.active = false;

        // Send processing reaction
        await client.sendMessage(session.chatId, { 
            react: { text: '⬇️', key: message.key } 
        });

        const selectedNumber = choice.trim();
        const selectedModel = voiceModels.find(model => model.number === selectedNumber);

        if (!selectedModel) {
            await client.sendMessage(session.chatId, { 
                text: "🚫 Invalid option! Please reply with a number from the menu." 
            }, { quoted: message });
            
            // Clean up session
            delete global.voiceSessions[replyId];
            return true;
        }

        // Show processing message
        await client.sendMessage(session.chatId, {  
            text: `🔊 Generating audio with ${selectedModel.name} voice...`  
        }, { quoted: message });

        // Try multiple API endpoints
        const apis = [
            `https://api.agatz.xyz/api/voiceover?text=${encodeURIComponent(session.inputText)}&model=${selectedModel.model}`,
            `https://api.siputzx.my.id/api/ai/voiceover?text=${encodeURIComponent(session.inputText)}&model=${selectedModel.model}`,
            `https://api.lolhuman.xyz/api/voiceover?text=${encodeURIComponent(session.inputText)}&apikey=your_key_here`
        ];

        let audioUrl = null;
        let errorMsg = '';

        for (const apiUrl of apis) {
            try {
                console.log(`Trying API: ${apiUrl}`);
                const response = await axios.get(apiUrl, {
                    timeout: 15000 // 15 seconds timeout per API
                });
                
                const data = response.data;
                
                // Handle different API response formats
                if (data.status === 200 && data.data?.oss_url) {
                    audioUrl = data.data.oss_url;
                    break;
                } else if (data.result?.url) {
                    audioUrl = data.result.url;
                    break;
                } else if (data.url) {
                    audioUrl = data.url;
                    break;
                } else if (data.audio) {
                    audioUrl = data.audio;
                    break;
                } else if (data.data?.url) {
                    audioUrl = data.data.url;
                    break;
                }
            } catch (err) {
                errorMsg = err.message;
                console.log(`API failed: ${apiUrl} - ${err.message}`);
                // Continue to next API
            }
        }

        if (audioUrl) {
            await client.sendMessage(session.chatId, {  
                audio: { url: audioUrl },  
                mimetype: "audio/mpeg",
                caption: `🔊 *Voice Generated*\n\n🎤 *Voice:* ${selectedModel.name}\n📝 *Text:* ${session.inputText}\n👤 *Requested by:* @${session.sender.split('@')[0]}`,
                mentions: [session.sender]
            }, { quoted: message });
        } else {
            console.error("All APIs failed:", errorMsg);
            
            // Try fallback to StreamElements TTS (free, no API key needed)
            try {
                const fallbackUrl = `https://api.streamelements.com/kappa/v2/speech?voice=Joanna&text=${encodeURIComponent(session.inputText)}`;
                await client.sendMessage(session.chatId, {  
                    audio: { url: fallbackUrl },  
                    mimetype: "audio/mpeg",
                    caption: `🔊 *Voice Generated (Fallback)*\n\n📝 *Text:* ${session.inputText}\n👤 *Requested by:* @${session.sender.split('@')[0]}`,
                    mentions: [session.sender]
                }, { quoted: message });
            } catch (fallbackErr) {
                await client.sendMessage(session.chatId, { 
                    text: "🚫 Error generating audio. All voice APIs are currently unavailable. Please try again later." 
                }, { quoted: message });
            }
        }

        // Clean up session
        delete global.voiceSessions[replyId];
        return true;

    } catch (error) {
        console.error("Voice Reply Error:", error);
        return false;
    }
}

module.exports = { 
    aivoiceCommand, 
    handleVoiceReply 
};