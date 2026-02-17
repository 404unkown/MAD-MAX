module.exports = async (client, chatId, m) => {
    const config = require('../set');
    
    // Get sender's name
    const senderName = m.pushName || 'User';
    
    // Get current hour
    const now = new Date();
    const hours = now.getHours();
    
    // Determine greeting based on time
    let greeting = '';
    if (hours >= 5 && hours < 12) {
        greeting = 'Good Morning';
    } else if (hours >= 12 && hours < 17) {
        greeting = 'Good Afternoon';
    } else if (hours >= 17 && hours < 21) {
        greeting = 'Good Evening';
    } else {
        greeting = 'Good Night';
    }
    
    await client.sendMessage(chatId, { 
        text: `🤖 *I'm alive!*\n\n👋 ${greeting}, *${senderName}*!\n\n📱 Bot: ${config.botname || 'MAD-MAX'}\n✅ Status: Online\n⚡ Prefix: ${config.prefix}\n👤 Owner: ${config.ownername || 'NUCH'}\n\n✨ *Always ready to serve you!*` 
    }, { quoted: m });
};