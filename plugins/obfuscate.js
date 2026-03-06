const Obf = require("javascript-obfuscator");

const obfuscateCommand = async (client, chatId, m, args, sender, pushName, isOwner) => {
    try {
        // Check if there's a quoted message
        if (!m.quoted) {
            return await client.sendMessage(chatId, { 
                text: `🔒 *JAVASCRIPT OBFUSCATOR*\n\nPlease quote a JavaScript code message to obfuscate.\n\nExample:\n1. Send JavaScript code\n2. Reply to it with .obfuscate` 
            }, { quoted: m });
        }

        // Get the quoted text
        const forq = m.quoted.text;
        
        if (!forq) {
            return await client.sendMessage(chatId, { 
                text: `❌ No text found in quoted message.` 
            }, { quoted: m });
        }

        // Send loading reaction
        await client.sendMessage(chatId, { 
            react: { text: '🔒', key: m.key } 
        });

        // Send processing message
        const processingMsg = await client.sendMessage(chatId, {
            text: `🔒 *Obfuscating JavaScript Code...*\n\nPlease wait while I encrypt your code.`
        }, { quoted: m });

        // Obfuscate the code
        const obfuscationResult = Obf.obfuscate(forq, {
            compact: true,
            controlFlowFlattening: true,
            controlFlowFlatteningThreshold: 1,
            numbersToExpressions: true,
            simplify: true,
            stringArrayShuffle: true,
            splitStrings: true,
            stringArrayThreshold: 1
        });

        const obfuscatedCode = obfuscationResult.getObfuscatedCode();

        // Delete processing message
        await client.sendMessage(chatId, { 
            delete: processingMsg.key 
        });

        // Success reaction
        await client.sendMessage(chatId, { 
            react: { text: '✅', key: m.key } 
        });

        // Format the response
        const responseText = `🔒 *OBFUSCATED JAVASCRIPT CODE*\n\n\`\`\`javascript\n${obfuscatedCode}\n\`\`\`\n\n─ MAD-MAX BOT`;

        // Check if response is too long
        if (responseText.length > 4000) {
            // Split the obfuscated code into chunks
            const codeChunks = obfuscatedCode.match(/(.|[\r\n]){1,3500}/g) || [];
            
            await client.sendMessage(chatId, { 
                text: `🔒 *OBFUSCATED CODE (Part 1/${codeChunks.length})*\n\n\`\`\`javascript\n${codeChunks[0]}\n\`\`\``
            }, { quoted: m });

            for (let i = 1; i < codeChunks.length; i++) {
                await client.sendMessage(chatId, { 
                    text: `*Part ${i+1}/${codeChunks.length}:*\n\n\`\`\`javascript\n${codeChunks[i]}\n\`\`\``
                });
                
                // Small delay between chunks
                await new Promise(resolve => setTimeout(resolve, 500));
            }
            
            // Send footer
            await client.sendMessage(chatId, { 
                text: `─ MAD-MAX BOT`
            });
        } else {
            await client.sendMessage(chatId, { 
                text: responseText
            }, { quoted: m });
        }

        console.log("✅ Successfully obfuscated JavaScript code");

    } catch (error) {
        console.error('Obfuscate error:', error);
        
        // Error reaction
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: m.key } 
        });
        
        // Check if it's a JavaScript syntax error
        if (error.message.includes('Unexpected token')) {
            await client.sendMessage(chatId, { 
                text: `❌ *Invalid JavaScript Code*\n\nPlease make sure you're quoting valid JavaScript code.\n\nError: ${error.message}` 
            }, { quoted: m });
        } else {
            await client.sendMessage(chatId, { 
                text: `❌ An error occurred while obfuscating the code.\n\nError: ${error.message}` 
            }, { quoted: m });
        }
    }
};

module.exports = {
    obfuscateCommand
};