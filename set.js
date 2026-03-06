/* 
   MAD-MAX WhatsApp Bot - Configuration
   VALUES COME DIRECTLY FROM HTML WHEN USER PAIRS
*/

const fs = require('fs');
const path = require('path');

// These will be OVERWRITTEN when user pairs from HTML
let ownerName = 'NUCH';           // Default until someone pairs
let ownerNumber = '254104158915'; // Default until someone pairs
let pairNumber = '';              // Default until someone pairs

// File to store the latest values
const CONFIG_FILE = path.join(__dirname, 'current-config.json');

// Load saved values on startup
if (fs.existsSync(CONFIG_FILE)) {
    try {
        const saved = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
        ownerName = saved.ownerName || ownerName;
        ownerNumber = saved.ownerNumber || ownerNumber;
        pairNumber = saved.pairNumber || pairNumber;
        console.log('📂 Loaded saved config:', { ownerName, ownerNumber, pairNumber });
    } catch (e) {}
}

// Bot Identity (static)
const prefix = process.env.PREFIX || '.';
const botname = process.env.BOT_NAME || 'MAD-MAX';
const packname = process.env.STICKER_PACKNAME || 'MAD-MAX';
const author = process.env.STICKER_AUTHOR || 'NUCH';
const version = process.env.VERSION || '2.0.0';
const autoVoicereply = process.env.AUTO_VOICE_REPLY || 'false';
const warnCount = process.env.WARN_COUNT || 3;
const herokuapi = process.env.HEROKU_API_KEY || '';
const appname = process.env.HEROKU_APP_NAME || '';
const githubUser = process.env.GITHUB_USER || '404unkown';
const githubRepo = process.env.GITHUB_REPO || 'MADAX';
const githubBranch = process.env.GITHUB_BRANCH || 'main';
const port = process.env.PORT || 3000;
const mode = process.env.MODE || 'public';
const autobio = process.env.AUTOBIO || 'FALSE';
const autolike = process.env.AUTOLIKE_STATUS || 'FALSE';
const autoviewstatus = process.env.AUTOVIEW_STATUS || 'FALSE';
const anticall = process.env.AUTOREJECT_CALL || 'FALSE';
const antiforeign = process.env.ANTIFOREIGN || 'FALSE';
const autorecord = process.env.AUTORECORD || 'FALSE';
const mycode = process.env.CODE || '254';
const giphyApiKey = process.env.GIPHY_API_KEY || 'DCXQ4c4VNyLcsQZc4lV3HcRkK1W60MlK';
const omdbApiKey = process.env.OMDB_API_KEY || '742b2d09';
const newsApiKey = process.env.NEWS_API_KEY || 'dcd720a6f1914e2d9dba9790c188c08c';
const weatherApiKey = process.env.WEATHER_API_KEY || '';
const tenorApiKey = process.env.TENOR_API_KEY || 'AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ';
const newsletterJid = process.env.NEWSLETTER_JID || '120363401269012709@newsletter';
const newsletterName = process.env.NEWSLETTER_NAME || 'MAD-MAX';
const updateZipUrl = process.env.UPDATE_ZIP_URL || `https://github.com/${githubUser}/${githubRepo}/archive/refs/heads/${githubBranch}.zip`;

// Owner JID (formatted from ownerNumber)
const ownerJid = ownerNumber.includes('@s.whatsapp.net') ? ownerNumber : ownerNumber + '@s.whatsapp.net';
const dev = ownerNumber;

// FUNCTION TO UPDATE CONFIG FROM HTML (called in /api/pair)
function updateConfigFromHTML(newOwnerName, newOwnerNumber, newPairNumber) {
    console.log('📥 RECEIVED FROM HTML:', { newOwnerName, newOwnerNumber, newPairNumber });
    
    ownerName = newOwnerName;
    ownerNumber = newOwnerNumber;
    pairNumber = newPairNumber;
    
    // Save to file
    fs.writeFileSync(CONFIG_FILE, JSON.stringify({
        ownerName,
        ownerNumber,
        pairNumber
    }, null, 2));
    
    console.log('✅ CONFIG UPDATED FROM HTML:');
    console.log(`   👑 Owner Name: ${ownerName}`);
    console.log(`   📞 Owner Number: ${ownerNumber}`);
    console.log(`   🔗 Pair Number: ${pairNumber}`);
}

// EXPORT EVERYTHING
module.exports = {
  // FROM HTML (UPDATED EVERY TIME SOMEONE PAIRS)
  ownerName,
  ownerNumber,
  ownerJid,
  dev,
  pairNumber,
  
  // Static config
  prefix,
  botname,
  packname,
  author,
  version,
  autoVoicereply,
  warnCount,
  herokuapi,
  appname,
  githubUser,
  githubRepo,
  githubBranch,
  port,
  mode,
  autobio,
  autolike,
  autoviewstatus,
  anticall,
  antiforeign,
  autorecord,
  mycode,
  giphyApiKey,
  omdbApiKey,
  newsApiKey,
  weatherApiKey,
  tenorApiKey,
  newsletterJid,
  newsletterName,
  updateZipUrl,
  
  // Function to update config
  updateConfigFromHTML
};