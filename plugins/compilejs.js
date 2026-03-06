const { node } = require('compile-run');

const compilejsCommand = async (client, chatId, m, args, sender, pushName, isOwner) => {
    try {
        // Check if there's a quoted message
        if (!m.quoted) {
            return await client.sendMessage(chatId, { 
                text: `📜 *JAVASCRIPT CODE COMPILER*\n\nPlease quote a JavaScript code message to execute.\n\nExample:\n1. Send JavaScript code\n2. Reply to it with .js` 
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
            react: { text: '📜', key: m.key } 
        });

        // Send processing message
        const processingMsg = await client.sendMessage(chatId, {
            text: `📜 *Executing JavaScript Code...*\n\nPlease wait while I run your JavaScript code.`
        }, { quoted: m });

        try {
            // Run the JavaScript code
            let result = await node.runSource(code);

            // Delete processing message
            await client.sendMessage(chatId, { 
                delete: processingMsg.key 
            });

            // Format output
            let output = `📜 *JAVASCRIPT EXECUTION RESULT*\n\n`;

            if (result.stdout) {
                output += `📤 *Output:*\n\`\`\`javascript\n${result.stdout}\n\`\`\`\n`;
            }
            
            if (result.stderr) {
                output += `⚠️ *Errors:*\n\`\`\`javascript\n${result.stderr}\n\`\`\`\n`;
            }

            if (result.error) {
                output += `❌ *Error:*\n\`\`\`javascript\n${result.error}\n\`\`\`\n`;
            }

            if (!result.stdout && !result.stderr && !result.error) {
                output += `✅ Code executed successfully with no output.\n`;
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

            console.log(`✅ Successfully executed JavaScript code`);

        } catch (compileError) {
            console.error('JavaScript execution error:', compileError);
            
            await client.sendMessage(chatId, { 
                delete: processingMsg.key 
            });
            
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: m.key } 
            });
            
            await client.sendMessage(chatId, { 
                text: `❌ *Execution Failed*\n\n${compileError.message}` 
            }, { quoted: m });
        }

    } catch (error) {
        console.error('JavaScript compile command error:', error);
        
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
    compilejsCommand
};