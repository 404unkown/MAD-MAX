const axios = require('axios');

// Global channel info (to match your main.js)
const channelInfo = {
    contextInfo: {
        forwardingScore: 1,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363401269012709@newsletter',
            newsletterName: 'MAD-MAX',
            serverMessageId: -1
        }
    }
};

module.exports = async function weatherCommand(client, chatId, message, args, sender, pushName, isOwner) {
    try {
        const city = args.join(' ');
        
        if (!city) {
            await client.sendMessage(chatId, {
                text: '🌤️ *WEATHER COMMAND*\n\nPlease provide a city name.\n\n*Example:* `.weather London`\n*Example:* `.weather Nairobi`',
                ...channelInfo
            }, { quoted: message });
            return;
        }

        // Send processing reaction
        await client.sendMessage(chatId, { 
            react: { text: '⏳', key: message.key } 
        });

        const apiKey = '4902c0f2550f58298ad4146a92b65e10';
        const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`);
        
        const weather = response.data;
        
        // Format the weather information nicely
        const weatherText = `╭─❖ *WEATHER INFORMATION* ❖─
│
├─ 🌍 *City:* ${weather.name}, ${weather.sys.country}
├─ ☁️ *Condition:* ${weather.weather[0].description}
├─ 🌡️ *Temperature:* ${weather.main.temp}°C
├─ 🔥 *Feels like:* ${weather.main.feels_like}°C
├─ 📊 *Min Temp:* ${weather.main.temp_min}°C
├─ 📈 *Max Temp:* ${weather.main.temp_max}°C
├─ 💧 *Humidity:* ${weather.main.humidity}%
├─ 💨 *Wind Speed:* ${weather.wind.speed} m/s
│
╰─➤ _Requested by: ${pushName}_`;

        await client.sendMessage(chatId, { 
            text: weatherText,
            ...channelInfo
        }, { quoted: message });

        // Success reaction
        await client.sendMessage(chatId, { 
            react: { text: '✅', key: message.key } 
        });

    } catch (error) {
        console.error('Error fetching weather:', error);
        
        await client.sendMessage(chatId, { 
            text: '❌ Sorry, I could not fetch the weather right now. Please check the city name and try again.',
            ...channelInfo
        }, { quoted: message });
        
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: message.key } 
        });
    }
};