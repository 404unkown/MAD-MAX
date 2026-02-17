const moment = require('moment-timezone');
const fs = require('fs');
const path = require('path');

const creator = {
    name: "NUCH",
    number: "+254769769295",
    bio: "Full Stack Developer & Bot Creator",
    from: "Kenya",
    location: "🇰🇪",
    
    social: {
        instagram: "https://instagram.com/manuwesonga",
        github: "https://github.com/404unkown", 
        youtube: "https://youtube.com/404TECH"
    },

    skills: ["JavaScript", "Node.js", "React", "Python", "MongoDB", "API Development"],
    
    services: [
        "🤖 Custom WhatsApp Bots",
        "💻 Web Development", 
        "📱 Mobile Apps",
        "⚡ API Integration",
        "🔧 Automation Tools"
    ],

    message: "Let's build something amazing together! 🚀"
};

async function creatorCommand(client, chatId, message, args, sender, pushName, isOwnerSimple) {
    try {
        // Get Kenya time
        const kenyaTime = moment().tz('Africa/Nairobi');
        const time = kenyaTime.format('HH:mm A');
        const date = kenyaTime.format('DD/MM/YYYY');
        const day = kenyaTime.format('dddd');
        const timeEmoji = getTimeEmoji(kenyaTime.hour());

        // Create profile caption
        const creatorText = `
${timeEmoji} *TIME (KENYA):* ${time}
📅 ${date} | ${day}

⸻ *CREATOR PROFILE* ⸻

👤 *Name:* ${creator.name}
📍 *Location:* ${creator.location} ${creator.from}
💼 *Bio:* ${creator.bio}

🔗 *Social Links:*
• Instagram: ${creator.social.instagram}
• GitHub: ${creator.social.github}
• YouTube: ${creator.social.youtube}

💻 *Skills:* ${creator.skills.join(' • ')}

🛠️ *Services Offered:*
${creator.services.map(service => `• ${service}`).join('\n')}

📞 *Contact:* ${creator.number}

💬 *Message:* ${creator.message}

✦─────────────────────────────✦
 ✰ Time: ${time} (KE)
✦─────────────────────────────✦
`.trim();

        // Send processing reaction
        await client.sendMessage(chatId, { 
            react: { text: '👤', key: message.key } 
        });

        // Try to use creator.png from assets folder
        const imagePath = path.join(__dirname, '../assets/creator.png');
        
        if (fs.existsSync(imagePath)) {
            const imageBuffer = fs.readFileSync(imagePath);
            
            await client.sendMessage(chatId, {
                image: imageBuffer,
                caption: creatorText
            }, { quoted: message });
        } else {
            console.error('Creator image not found at:', imagePath);
            await client.sendMessage(chatId, { 
                text: creatorText
            }, { quoted: message });
        }

        // Success reaction
        await client.sendMessage(chatId, { 
            react: { text: '✅', key: message.key } 
        });

    } catch (error) {
        console.error('Error in creator command:', error);
        await client.sendMessage(chatId, { 
            text: `👤 *Creator:* ${creator.name}\n📍 *From:* Kenya 🇰🇪\n📞 *Contact:* ${creator.number}\n💻 *GitHub:* ${creator.social.github}\n🐐 THE GOAT`
        }, { quoted: message });
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: message.key } 
        });
    }
}

// Helper function to get time-based emoji
function getTimeEmoji(hour) {
    if (hour >= 5 && hour < 12) return '🌅';
    if (hour >= 12 && hour < 17) return '☀️';
    if (hour >= 17 && hour < 20) return '🌇';
    if (hour >= 20 || hour < 5) return '🌙';
    return '🕐';
}

module.exports = creatorCommand;