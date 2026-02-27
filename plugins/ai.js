const settings = require('../set');
const axios = require('axios');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const fs = require('fs-extra');
const path = require('path');

// Utility functions
async function streamToBuffer(stream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on('data', chunk => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', reject);
    });
}

async function downloadAndSaveImage(url) {
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const tempPath = path.join(__dirname, '..', 'temp', `ai_image_${Date.now()}.jpg`);
        await fs.ensureDir(path.dirname(tempPath));
        await fs.writeFile(tempPath, response.data);
        return tempPath;
    } catch (error) {
        throw new Error(`Failed to download image: ${error.message}`);
    }
}

// Enhanced API response handler
async function fetchAIResponse(url, query) {
    try {
        const response = await axios.get(url + encodeURIComponent(query), {
            timeout: 20000,
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'MAD-MAX-Bot'
            }
        });
        
        // Handle various API response formats
        const responseData = response.data;
        if (!responseData) return "No response from the API";
        
        // BK9 API format
        if (responseData.BK9) return responseData.BK9;
        
        // Maher-zubair format
        if (responseData.status === 200 && responseData.result) return responseData.result;
        
        // Standard formats
        if (responseData.response) return responseData.response;
        if (responseData.message) return responseData.message;
        if (responseData.answer) return responseData.answer;
        if (responseData.text) return responseData.text;
        if (responseData.content) return responseData.content;
        if (responseData.url) return { image: responseData.url };
        if (responseData.image) return { image: responseData.image };
        
        // If string, return directly
        if (typeof responseData === 'string') return responseData.trim();
        
        // Fallback
        return JSON.stringify(responseData);
        
    } catch (error) {
        console.error("API Error:", error.message);
        throw new Error(`API request failed: ${error.response?.status || error.message}`);
    }
}

// AI command handler
async function handleAICommand(client, chatId, message, args, command) {
    const PREFIX = settings.prefix || '.';
    const query = args.join(' ');

   // ============ WORKING AI API ENDPOINTS 2026 ============
const aiConfigs = {
    // === FREE APIs (No Keys Needed) ===
    'gpt': {
        url: "https://ultimetron.guruapi.tech/gpt4?prompt=",
        description: "GPT-4 AI",
        type: "text"
    },
    'gpt4': {
        url: "https://ultimetron.guruapi.tech/gpt4?prompt=",
        description: "GPT-4 AI",
        type: "text"
    },
    'gemini': {
        url: "https://ultimetron.guruapi.tech/gemini?prompt=",
        description: "Google Gemini AI",
        type: "text"
    },
    'bard': {
        url: "https://ultimetron.guruapi.tech/gemini?prompt=",
        description: "Google Bard AI",
        type: "text"
    },
    'llama': {
        url: "https://ultimetron.guruapi.tech/gpt4?prompt=",
        description: "Meta Llama AI",
        type: "text"
    },
    'blackbox': {
        url: "https://api.bk9.dev/ai/Perplexity?q=",
        description: "Blackbox AI",
        type: "text"
    },
    
    // === BK9 APIs (Working) ===
    'zoroai': {
        url: "https://api.bk9.dev/ai/BK93?BK9=you%20are%20zoro%20from%20one%20piece&q=",
        description: "Zoro-themed AI",
        type: "text"
    },
    'jeeves': {
        url: "https://api.bk9.dev/ai/jeeves-chat?q=",
        description: "Jeeves AI",
        type: "text"
    },
    'perplexity': {
        url: "https://api.bk9.dev/ai/Perplexity?q=",
        description: "Perplexity AI",
        type: "text"
    },
    'xdash': {
        url: "https://api.bk9.dev/ai/xdash?q=",
        description: "XDash AI",
        type: "text"
    },
    'aoyo': {
        url: "https://api.bk9.dev/ai/Aoyo?q=",
        description: "Naruto-themed AI",
        type: "text"
    },
    'math': {
        url: "https://api.bk9.dev/ai/mathssolve?q=",
        description: "Math Solver",
        type: "text"
    },
    
    // === Image Generation ===
    'dalle': {
        url: "https://api.maher-zubair.tech/ai/dalle?q=",
        description: "DALL-E Image Generator",
        type: "image"
    },
    'sd': {
        url: "https://api.maher-zubair.tech/ai/dalle?q=",
        description: "Stable Diffusion",
        type: "image"
    },
    'imagine': {
        url: "https://api.maher-zubair.tech/ai/dalle?q=",
        description: "AI Image Generator",
        type: "image"
    },
    
    // === AI Voice ===
    'aitts': {
        url: "https://api.maher-zubair.tech/ai/tts?text=",
        description: "AI Text to Speech",
        type: "audio"
    }
};
    // Get the command configuration
    const config = aiConfigs[command];
    if (!config) {
        return await client.sendMessage(chatId, {
            text: `🚫 Invalid AI command. Available commands: ${Object.keys(aiConfigs).join(', ')}`,
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363401269012709@newsletter',
                    newsletterName: 'MAD-MAX',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });
    }

    // Check if query is provided for text/image commands
    if (!query.trim() && config.type !== 'image_edit') {
        return await client.sendMessage(chatId, {
            text: `Please provide a query.\nExample: ${PREFIX}${command} your question here`,
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363401269012709@newsletter',
                    newsletterName: 'MAD-MAX',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });
    }

    try {
        // Send processing reaction
        await client.sendMessage(chatId, { 
            react: { text: '⏳', key: message.key } 
        });

        // Handle different response types
        if (config.type === 'image') {
            const imageUrl = config.url + encodeURIComponent(query);
            await client.sendMessage(chatId, {
                image: { url: imageUrl },
                caption: `*🎨 ${config.description}*\n\n📝 *Prompt:* ${query}\n\n─ MAD-MAX AI`,
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363401269012709@newsletter',
                        newsletterName: 'MAD-MAX',
                        serverMessageId: -1
                    }
                }
            }, { quoted: message });
        } 
        else if (config.type === 'audio') {
            const audioUrl = config.url + encodeURIComponent(query);
            await client.sendMessage(chatId, {
                audio: { url: audioUrl },
                mimetype: 'audio/mp4',
                ptt: true
            }, { quoted: message });
        }
        else if (config.type === 'image_edit') {
            // Handle image editing (requires quoted image)
            const quoted = message.quoted;
            if (!quoted || !quoted.message || !quoted.message.imageMessage) {
                return await client.sendMessage(chatId, {
                    text: `Please reply to an image with: ${PREFIX}${command}`,
                    contextInfo: {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363401269012709@newsletter',
                            newsletterName: 'MAD-MAX',
                            serverMessageId: -1
                        }
                    }
                }, { quoted: message });
            }
            
            await client.sendMessage(chatId, {
                text: `*${config.description}* will be available soon!`,
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363401269012709@newsletter',
                        newsletterName: 'MAD-MAX',
                        serverMessageId: -1
                    }
                }
            }, { quoted: message });
        }
        else {
            // Handle POST requests (like 147ai, OpenRouter, etc.)
            if (config.method === 'post') {
                try {
                    const response = await axios.post(config.url, config.body(query), {
                        headers: config.headers,
                        timeout: 30000
                    });
                    
                    let responseText = "";
                    const data = response.data;
                    
                    // Extract text from various response formats
                    if (data.choices && data.choices[0]?.message?.content) {
                        responseText = data.choices[0].message.content;
                    } else if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
                        responseText = data.candidates[0].content.parts[0].text;
                    } else if (data.content) {
                        responseText = data.content;
                    } else {
                        responseText = JSON.stringify(data);
                    }
                    
                    await client.sendMessage(chatId, {
                        text: `*🤖 ${config.description}*\n\n📝 *Query:* ${query}\n\n${responseText}\n\n─ MAD-MAX AI`,
                        contextInfo: {
                            forwardingScore: 1,
                            isForwarded: true,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: '120363401269012709@newsletter',
                                newsletterName: 'MAD-MAX',
                                serverMessageId: -1
                            }
                        }
                    }, { quoted: message });
                    
                } catch (postError) {
                    console.error('POST request error:', postError);
                    throw new Error(`API error: ${postError.message}`);
                }
            } else {
                // Handle GET requests (BK9, Maher-zubair, etc.)
                const response = await fetchAIResponse(config.url, query);
                
                await client.sendMessage(chatId, {
                    text: `*🤖 ${config.description}*\n\n📝 *Query:* ${query}\n\n${response}\n\n─ MAD-MAX AI`,
                    contextInfo: {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363401269012709@newsletter',
                            newsletterName: 'MAD-MAX',
                            serverMessageId: -1
                        }
                    }
                }, { quoted: message });
            }
        }

        // Success reaction
        await client.sendMessage(chatId, { 
            react: { text: '✅', key: message.key } 
        });

    } catch (error) {
        console.error(`AI command error (${command}):`, error);
        await client.sendMessage(chatId, {
            text: `🚫 Failed to get response from ${config.description}. Please try again.\n\nError: ${error.message}`,
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363401269012709@newsletter',
                    newsletterName: 'MAD-MAX',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });
        await client.sendMessage(chatId, { 
            react: { text: '🚫', key: message.key } 
        });
    }
}

// AI help command
async function aiHelpCommand(client, chatId, message) {
    const PREFIX = settings.prefix || '.';
    
    const helpText = `🤖 *MAD-MAX AI COMMANDS (2026)*

*📝 TEXT AI MODELS:*
• ${PREFIX}gpt [query] - GPT-4 AI
• ${PREFIX}gpt4 [query] - GPT-4 AI
• ${PREFIX}gpt5 [query] - GPT-5.2 AI (requires API key)
• ${PREFIX}claude [query] - Claude Sonnet 4.5 (requires key)
• ${PREFIX}gemini [query] - Gemini 2.5 Pro (requires key)
• ${PREFIX}deepseek [query] - DeepSeek R1 (requires key)
• ${PREFIX}openrouter [query] - OpenRouter (requires key)
• ${PREFIX}zoroai [query] - Zoro-themed AI
• ${PREFIX}jeeves [query] - Jeeves AI
• ${PREFIX}perplexity [query] - Perplexity AI
• ${PREFIX}xdash [query] - XDash AI
• ${PREFIX}aoyo [query] - Naruto-themed AI
• ${PREFIX}math [query] - Math Solver
• ${PREFIX}llama [query] - AI Assistant
• ${PREFIX}bart [query] - AI Assistant
• ${PREFIX}blackbox [query] - AI Assistant

*🎨 IMAGE GENERATION:*
• ${PREFIX}dalle [prompt] - DALL-E Image Generator
• ${PREFIX}sd [prompt] - Stable Diffusion
• ${PREFIX}imagine [prompt] - AI Image Generator

*🔊 VOICE/AUDIO:*
• ${PREFIX}aitts [text] - AI Text to Speech

*🖼️ IMAGE EDITING:*
• ${PREFIX}remini - Enhance image (reply to image)

*🔑 API Keys Needed For:*
• GPT-5, Claude, Gemini, DeepSeek, OpenRouter
• Get keys from: 147ai.com, openrouter.ai, makersuite.google.com

*Examples:*
${PREFIX}gpt Explain quantum computing
${PREFIX}dalle A beautiful sunset
${PREFIX}aitts Hello world

*Powered by Multiple APIs | MAD-MAX BOT*`;

    await client.sendMessage(chatId, {
        text: helpText,
        contextInfo: {
            forwardingScore: 1,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363401269012709@newsletter',
                newsletterName: 'MAD-MAX',
                serverMessageId: -1
            }
        }
    }, { quoted: message });
}

// Export functions
module.exports = {
    handleAICommand,
    aiHelpCommand
};