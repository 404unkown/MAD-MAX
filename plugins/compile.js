const { c, cpp, node, python, java } = require('compile-run');

const compileCommand = async (client, chatId, m, args, sender, pushName, isOwner) => {
    try {
        // Check if there's a quoted message
        if (!m.quoted) {
            return await client.sendMessage(chatId, { 
                text: `⚙️ *C CODE COMPILER*\n\nPlease quote a C code message to compile.\n\nExample:\n1. Send C code\n2. Reply to it with .compile` 
            }, { quoted: m });
        }

        // Get the quoted text
        const code = m.quoted.text;
        
        if (!code) {
            return await client.sendMessage(chatId, { 
                text: `❌ No code found in quoted message.` 
            }, { quoted: m });
        }

        // Determine language from args or command
        let language = 'c'; // default
        
        if (args[0]) {
            const langArg = args[0].toLowerCase();
            if (langArg === 'cpp' || langArg === 'c++') language = 'cpp';
            else if (langArg === 'python' || langArg === 'py') language = 'python';
            else if (langArg === 'javascript' || langArg === 'js' || langArg === 'node') language = 'javascript';
            else if (langArg === 'java') language = 'java';
        }

        // Send loading reaction
        await client.sendMessage(chatId, { 
            react: { text: '⚙️', key: m.key } 
        });

        // Send processing message
        const processingMsg = await client.sendMessage(chatId, {
            text: `⚙️ *Compiling ${language.toUpperCase()} Code...*\n\nPlease wait while I compile your code.`
        }, { quoted: m });

        let result;
        
        try {
            // Run the code based on language
            switch(language) {
                case 'c':
                    result = await c.runSource(code);
                    break;
                case 'cpp':
                    result = await cpp.runSource(code);
                    break;
                case 'python':
                    result = await python.runSource(code);
                    break;
                case 'javascript':
                    result = await node.runSource(code);
                    break;
                case 'java':
                    result = await java.runSource(code);
                    break;
                default:
                    result = await c.runSource(code);
            }

            // Delete processing message
            await client.sendMessage(chatId, { 
                delete: processingMsg.key 
            });

            // Format output
            let output = `⚙️ *COMPILATION RESULT (${language.toUpperCase()})*\n\n`;

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

            console.log(`✅ Successfully compiled ${language} code`);

        } catch (compileError) {
            console.error('Compilation error:', compileError);
            
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
        console.error('Compile command error:', error);
        
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
    compileCommand
};