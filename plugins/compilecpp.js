const { cpp } = require('compile-run');

const compilecppCommand = async (client, chatId, m, args, sender, pushName, isOwner) => {
    try {
        // Check if there's a quoted message
        if (!m.quoted) {
            return await client.sendMessage(chatId, { 
                text: `⚙️ *C++ CODE COMPILER*\n\nPlease quote a C++ code message to compile.\n\nExample:\n1. Send C++ code\n2. Reply to it with .cpp` 
            }, { quoted: m });
        }

        // Get the quoted text
        const code = m.quoted.text;
        
        if (!code) {
            return await client.sendMessage(chatId, { 
                text: `❌ No code found in quoted message.` 
            }, { quoted: m });
        }

        // Send loading reaction
        await client.sendMessage(chatId, { 
            react: { text: '⚙️', key: m.key } 
        });

        // Send processing message
        const processingMsg = await client.sendMessage(chatId, {
            text: `⚙️ *Compiling C++ Code...*\n\nPlease wait while I compile your C++ code.`
        }, { quoted: m });

        try {
            // Run the C++ code
            let result = await cpp.runSource(code);

            // Delete processing message
            await client.sendMessage(chatId, { 
                delete: processingMsg.key 
            });

            // Format output
            let output = `⚙️ *C++ COMPILATION RESULT*\n\n`;

            if (result.stdout) {
                output += `📤 *Output:*\n\`\`\`\n${result.stdout}\n\`\`\`\n`;
            }
            
            if (result.stderr) {
                output += `⚠️ *Errors:*\n\`\`\`\n${result.stderr}\n\`\`\`\n`;
            }

            if (result.error) {
                output += `❌ *Error:*\n\`\`\`\n${result.error}\n\`\`\`\n`;
            }

            if (!result.stdout && !result.stderr && !result.error) {
                output += `✅ Code compiled successfully with no output.\n`;
            }

            output += `\n💡 *Exit Code:* ${result.exitCode || 0}`;
            output += `\n\n─ MAD-MAX BOT`;

            // Success reaction
            await client.sendMessage(chatId, { 
                react: { text: '✅', key: m.key } 
            });

            // Check if output is too long
            if (output.length > 4000) {
                const chunks = output.match(/(.|[\r\n]){1,3500}/g) || [];
                
                for (let i = 0; i < chunks.length; i++) {
                    await client.sendMessage(chatId, { 
                        text: i === 0 ? chunks[i] : `*Part ${i+1}/${chunks.length}*\n\n${chunks[i]}`
                    }, { quoted: i === 0 ? m : null });
                    
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            } else {
                await client.sendMessage(chatId, { 
                    text: output
                }, { quoted: m });
            }

            console.log(`✅ Successfully compiled C++ code`);

        } catch (compileError) {
            console.error('C++ compilation error:', compileError);
            
            await client.sendMessage(chatId, { 
                delete: processingMsg.key 
            });
            
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: m.key } 
            });
            
            await client.sendMessage(chatId, { 
                text: `❌ *Compilation Failed*\n\nError: ${compileError.message}` 
            }, { quoted: m });
        }

    } catch (error) {
        console.error('C++ compile command error:', error);
        
        // Error reaction
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: m.key } 
        });
        
        await client.sendMessage(chatId, { 
            text: `❌ An error occurred: ${error.message}` 
        }, { quoted: m });
    }
};

module.exports = {
    compilecppCommand
};