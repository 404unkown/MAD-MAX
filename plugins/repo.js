const moment = require('moment-timezone');
const fs = require('fs');
const path = require('path');

async function repoCommand(client, chatId, message, args, sender, pushName, isOwnerSimple) {
  try {
    // Repository information
    const repoUrl = 'https://github.com/404unkown/MAD-MAX';
    const repoName = 'MAD-MAX';
    const owner = '404unkown';
    const description = 'Advanced WhatsApp Bot with Multiple Features';
    
    let txt = `*📦  REPOSITORY INFO  📦*\n\n`;
    txt += `✩  *Name* : ${repoName}\n`;
    txt += `✩  *Owner* : ${owner}\n`;
    txt += `✩  *Description* : ${description}\n`;
    txt += `✩  *Status* : 🟢 Active\n`;
    txt += `✩  *Last Updated* : ${moment().tz('Africa/Nairobi').format('DD/MM/YY - HH:mm:ss')}\n`;
    txt += `✩  *URL* : ${repoUrl}\n`;
    txt += `✩  *Stars* : ⭐ 50+\n`;
    txt += `✩  *Forks* : 🍴 20+\n\n`;
    txt += `🔗 *Clone Repository:*\n`;
    txt += `git clone ${repoUrl}.git\n\n`;
    txt += `🤖 *Powered by MAD-MAX*`;

    // Send processing reaction
    await client.sendMessage(chatId, { 
      react: { text: '📦', key: message.key } 
    });

    // Try to send with image first, fallback to text only if image fails
    try {
      const imgPath = path.join(__dirname, '../assets/repo.jpg');
      
      if (fs.existsSync(imgPath)) {
        const imgBuffer = fs.readFileSync(imgPath);
        await client.sendMessage(chatId, { 
          image: imgBuffer, 
          caption: txt 
        }, { quoted: message });
      } else {
        // If image doesn't exist, send text with repo preview
        await client.sendMessage(chatId, { 
          text: txt,
          contextInfo: {
            externalAdReply: {
              title: repoName,
              body: `by ${owner}`,
              mediaType: 1,
              thumbnailUrl: "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png",
              sourceUrl: repoUrl
            }
          }
        }, { quoted: message });
      }
    } catch (imageError) {
      console.error('Image error, sending text only:', imageError);
      // Fallback to simple text message
      await client.sendMessage(chatId, { 
        text: txt 
      }, { quoted: message });
    }

    // Success reaction
    await client.sendMessage(chatId, { 
      react: { text: '✅', key: message.key } 
    });
    
  } catch (error) {
    console.error('Error in repo command:', error);
    
    // Simple fallback
    await client.sendMessage(chatId, { 
      text: `📦 *Repository*\n\n` +
            `https://github.com/404unkown/MAD-MAX` 
    }, { quoted: message });

    await client.sendMessage(chatId, { 
      react: { text: '❌', key: message.key } 
    });
  }
}

module.exports = repoCommand;