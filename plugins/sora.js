const fetch = require('node-fetch');

const soraCommand = async (client, chatId, m, args, sender, pushName, isOwner) => {
    try {
        const prompt = args.join(' ').trim();
        
        if (!prompt) {
            return await client.sendMessage(chatId, { 
                text: `🎬 *SORA VIDEO GENERATOR*\n\n❌ You forgot the prompt!\n\nExample: .sora a cat dancing in space\nExample: .sora a robot playing football` 
            }, { quoted: m });
        }

        // Send loading reaction
        await client.sendMessage(chatId, { 
            react: { text: '⌛', key: m.key } 
        });

        // Send initial status message
        const statusMsg = await client.sendMessage(chatId, {
            text: `🎬 *Generating Sora Video...*\n\n📝 *Prompt:* ${prompt}\n⏳ Status: Initializing...\n\nPlease wait 30-60 seconds...`
        }, { quoted: m });

        const params = new URLSearchParams({
            apikey: 'fgsiapi-2dcdfa06-6d',
            prompt: prompt,
            ratio: 'landscape',
            enhancePrompt: 'true'
        });

        const response = await fetch(`https://fgsi.dpdns.org/api/ai/sora2?${params.toString()}`, {
            headers: { 'accept': 'application/json' }
        });

        const data = await response.json();
        
        if (!data.status || !data.data?.pollUrl) {
            throw new Error('Failed to start video generation');
        }

        const pollUrl = data.data.pollUrl;
        let videoUrl = null;
        let attempts = 0;
        const maxAttempts = 60;

        while (attempts < maxAttempts && !videoUrl) {
            attempts++;
            await new Promise(resolve => setTimeout(resolve, 3000));

            try {
                const pollResponse = await fetch(pollUrl, {
                    headers: { 'accept': 'application/json' }
                });
                const pollData = await pollResponse.json();

                // Update status message
                await client.sendMessage(chatId, {
                    edit: statusMsg.key,
                    text: `🎬 *Generating Sora Video...*\n\n📝 *Prompt:* ${prompt}\n⏳ Status: ${pollData.data?.status || 'Processing'}\n🔁 Attempt: ${attempts}/${maxAttempts}\n\nPlease wait...`
                });

                if (pollData.data?.status === 'Completed' && pollData.data?.result) {
                    videoUrl = pollData.data.result;
                    break;
                } else if (pollData.data?.status === 'Failed') {
                    throw new Error('Video generation failed on server');
                }
            } catch (pollError) {
                console.log(`Poll attempt ${attempts} failed:`, pollError.message);
            }
        }

        if (!videoUrl) {
            throw new Error('Video generation timed out after 3 minutes');
        }

        // Delete status message
        await client.sendMessage(chatId, { 
            delete: statusMsg.key 
        });

        // Success reaction
        await client.sendMessage(chatId, { 
            react: { text: '✅', key: m.key } 
        });

        // Send the video
        await client.sendMessage(chatId, {
            video: { url: videoUrl },
            caption: `🎬 *Sora AI Video Generated*\n\n📝 *Prompt:* ${prompt}\n⏱️ *Generation time:* ${attempts * 3} seconds\n\n⚡ _Powered by MAD-MAX_`,
            gifPlayback: false
        }, { quoted: m });

    } catch (error) {
        console.error('Sora error:', error);
        
        // Error reaction
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: m.key } 
        });
        
        await client.sendMessage(chatId, {
            text: `🎬 *SORA VIDEO GENERATOR*\n\n❌ Video generation failed!\n\n*Error:* ${error.message}\n\nTry a different prompt or try again later.`
        }, { quoted: m });
    }
};

module.exports = {
    soraCommand
};