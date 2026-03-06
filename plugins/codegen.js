const axios = require("axios");

const codegenCommand = async (client, chatId, m, args, sender, pushName, isOwner) => {
    try {
        const text = args.join(' ').trim();
        
        if (!text) {
            return await client.sendMessage(chatId, { 
                text: "📝 *CODE GENERATOR*\n\nExample usage:\n.codegen Function to calculate triangle area|Python\n\nFormat: .codegen <prompt>|<language>" 
            }, { quoted: m });
        }

        // Parse prompt and language
        let [prompt, language] = text.split("|").map(v => v.trim());

        if (!prompt || !language) {
            return await client.sendMessage(chatId, { 
                text: "❌ *Invalid format!*\n\nUse the format:\n.codegen <prompt>|<language>\n\nExample:\n.codegen Check for prime number|JavaScript" 
            }, { quoted: m });
        }

        // Send loading reaction
        await client.sendMessage(chatId, {
            react: { text: '🔄', key: m.key }
        });

        // Show typing indicator
        await client.sendPresenceUpdate('composing', chatId);

        const payload = {
            customInstructions: prompt,
            outputLang: language
        };

        const { data } = await axios.post("https://www.codeconvert.ai/api/generate-code", payload);

        if (!data || typeof data !== "string") {
            await client.sendMessage(chatId, {
                react: { text: '❌', key: m.key }
            });
            return await client.sendMessage(chatId, { 
                text: "❌ Failed to retrieve code from API. Please try again." 
            }, { quoted: m });
        }

        // Format the response
        const langLower = language.toLowerCase();
        const formattedCode = `*Generated Code (${language}):*\n\n` +
                            "```" + langLower + "\n" +
                            data.trim() +
                            "\n```";

        // Check if code is too long
        if (formattedCode.length > 4000) {
            // Split code into chunks
            const codeChunks = data.match(/(.|[\r\n]){1,3500}/g) || [];
            
            await client.sendMessage(chatId, { 
                text: `📝 *CODE GENERATOR*\n\n*Language:* ${language}\n*Prompt:* ${prompt}\n\n*Code (part 1/${codeChunks.length}):*\n\n${'```' + langLower}\n${codeChunks[0]}\n${'```'}`
            }, { quoted: m });

            for (let i = 1; i < codeChunks.length; i++) {
                await client.sendMessage(chatId, { 
                    text: `*Part ${i+1}/${codeChunks.length}:*\n\n${'```' + langLower}\n${codeChunks[i]}\n${'```'}`
                });
                
                // Small delay between chunks
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        } else {
            await client.sendMessage(chatId, { 
                text: formattedCode
            }, { quoted: m });
        }

        // Send success reaction
        await client.sendMessage(chatId, {
            react: { text: '✅', key: m.key }
        });

    } catch (error) {
        console.error('Error in codegen command:', error);
        
        // Send error reaction
        await client.sendMessage(chatId, {
            react: { text: '❌', key: m.key }
        });
        
        await client.sendMessage(chatId, { 
            text: "❌ *An error occurred while generating code.*\n\nPlease try again later.\n\nError: " + error.message 
        }, { quoted: m });
    }
};

module.exports = {
    codegenCommand
};