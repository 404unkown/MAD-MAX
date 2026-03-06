// plugins/ai.js
const axios = require('axios');

// AI Command Handler
const handleAICommand = async (client, chatId, m, args, model) => {
    try {
        const query = args.join(' ');
        if (!query) {
            return await client.sendMessage(chatId, {
                text: `🤖 *AI COMMAND*\n\nPlease provide a question.\n\nExample: .gpt What is WhatsApp?`
            }, { quoted: m });
        }

        // Send typing indicator
        await client.sendPresenceUpdate('composing', chatId);

        // Send processing message
        const processingMsg = await client.sendMessage(chatId, {
            text: `🤖 *${model.toUpperCase()}*\n\nThinking... Please wait.`
        }, { quoted: m });

        let response = '';

        // Handle different AI models
        switch(model) {
            case 'gpt':
            case 'gpt4':
            case 'gpt4o':
                response = await handleGPT(query, model);
                break;
            case 'gemini':
            case 'gemini2':
                response = await handleGemini(query, model);
                break;
            case 'llama':
                response = await handleLlama(query);
                break;
            case 'blackbox':
                response = await handleBlackbox(query);
                break;
            default:
                response = await handleGPT(query, 'gpt');
        }

        // Delete processing message
        await client.sendMessage(chatId, { delete: processingMsg.key });

        // Send response
        await client.sendMessage(chatId, {
            text: `🤖 *${model.toUpperCase()}*\n\n${response}\n\n─ MAD-MAX BOT`
        }, { quoted: m });

    } catch (error) {
        console.error('AI Error:', error);
        await client.sendMessage(chatId, {
            text: `❌ *AI ERROR*\n\n${error.message}`
        }, { quoted: m });
    }
};

// GPT Handler using free API
async function handleGPT(query, model = 'gpt') {
    try {
        const apiUrl = model === 'gpt4o' 
            ? 'https://api.gpt4o.com/v1/chat/completions'
            : 'https://api.openai.com/v1/chat/completions';
        
        // Using a public API or your own key
        const response = await axios.post('https://api.guruapi.tech/ai/gpt', {
            message: query
        });
        
        return response.data.result || response.data.response || 'No response';
    } catch (error) {
        return 'Failed to get response from GPT. Please try again.';
    }
}

// Gemini Handler
async function handleGemini(query, model = 'gemini') {
    try {
        const response = await axios.get(`https://api.guruapi.tech/ai/gemini?message=${encodeURIComponent(query)}`);
        return response.data.result || response.data.response || 'No response';
    } catch (error) {
        return 'Failed to get response from Gemini. Please try again.';
    }
}

// Llama Handler
async function handleLlama(query) {
    try {
        const response = await axios.get(`https://api.guruapi.tech/ai/llama?message=${encodeURIComponent(query)}`);
        return response.data.result || response.data.response || 'No response';
    } catch (error) {
        return 'Failed to get response from Llama. Please try again.';
    }
}

// Blackbox Handler
async function handleBlackbox(query) {
    try {
        const response = await axios.get(`https://api.guruapi.tech/ai/blackbox?message=${encodeURIComponent(query)}`);
        return response.data.result || response.data.response || 'No response';
    } catch (error) {
        return 'Failed to get response from Blackbox. Please try again.';
    }
}

// AI Help Command
const aiHelpCommand = async (client, chatId, m) => {
    const helpText = `🤖 *AI COMMANDS*

*Chat Models:*
• .gpt [question] - GPT-3.5
• .gpt4 [question] - GPT-4
• .gpt4o [question] - GPT-4o
• .gemini [question] - Google Gemini
• .gemini2 [question] - Gemini 2.0
• .llama [question] - Meta Llama
• .blackbox [question] - Blackbox AI

*Image Generation:*
• .dalle [prompt] - DALL-E image
• .sd [prompt] - Stable Diffusion
• .imagine [prompt] - AI image

*Image Editing:*
• .remini - Enhance image
• .dehaze - Remove haze
• .recolor - Recolor image

*Voice:*
• .aitts [text] - AI Text to Speech

*Examples:*
.gpt What is WhatsApp?
.gemini Explain quantum physics
.imagine Beautiful sunset

─ MAD-MAX BOT`;

    await client.sendMessage(chatId, { text: helpText }, { quoted: m });
};

module.exports = {
    handleAICommand,
    aiHelpCommand
};