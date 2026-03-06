const { python } = require('compile-run');

const compilepyCommand = async (client, chatId, m, args, sender, pushName, isOwner) => {
    try {
        // Check if there's a quoted message
        if (!m.quoted) {
            return await client.sendMessage(chatId, { 
                text: `🐍 *PYTHON CODE COMPILER*\n\nPlease quote a Python code message to execute.\n\nExample:\n1. Send Python code\n2. Reply to it with .py` 
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
            react: { text: '🐍', key: m.key } 
        });

        // Send processing message
        const processingMsg = await client.sendMessage(chatId, {
            text: `🐍 *Executing Python Code...*\n\nPlease wait while I run your Python code.`
        }, { quoted: m });

        try {
            // Run the Python code
            let result = await python.runSource(code);

            // Delete processing message
            await client.sendMessage(chatId, { 
                delete: processingMsg.key 
            });

            // Format output
            let output = `🐍 *PYTHON EXECUTION RESULT*\n\n`;

            if (result.stdout) {
                output += `📤 *Output:*\n\`\`\`python\n${result.stdout}\n\`\`\`\n`;
            }
            
            if (result.stderr) {
                output += `⚠️ *Errors:*\n\`\`\`python\n${result.stderr}\n\`\`\`\n`;
            }

            if (result.error) {
                output += `❌ *Error:*\n\`\`\`python\n${result.error}\n\`\`\`\n`;
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

            console.log(`✅ Successfully executed Python code`);

        } catch (compileError) {
            console.error('Python execution error:', compileError);
            
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
        console.error('Python compile command error:', error);
        
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
    compilepyCommand
};