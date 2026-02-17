/* 
   MAD-MAX WhatsApp Bot - Configuration
   All variables from environment or defaults
*/

// Session Configuration
const sessionName = 'session';
const session = process.env.SESSION || '';

// Bot Identity
const prefix = process.env.PREFIX || '.';
const botname = process.env.BOT_NAME || 'MAD-MAX';
const ownername = process.env.OWNER_NAME || 'NUCH';
const owner = process.env.DEV || '';
const dev = owner;
const packname = process.env.STICKER_PACKNAME || 'MAD-MAX';
const author = process.env.STICKER_AUTHOR || 'NUCH';

// Heroku Configuration
const herokuapi = process.env.HEROKU_API || '';
const appname = process.env.HEROKU_APP_NAME || '';

// Web Server Port
const port = process.env.PORT || 3000;

// Bot Mode
const mode = process.env.MODE || 'public';

// Auto Features
const autobio = process.env.AUTOBIO || 'FALSE';
const autolike = process.env.AUTOLIKE_STATUS || 'FALSE';
const autoviewstatus = process.env.AUTOVIEW_STATUS || 'FALSE';
const anticall = process.env.AUTOREJECT_CALL || 'FALSE';
const antiforeign = process.env.ANTIFOREIGN || 'FALSE';
const autorecord = process.env.AUTORECORD || 'FALSE';

// Country Code
const mycode = process.env.CODE || '254';

// API Keys
const giphyApiKey = process.env.GIPHY_API_KEY || 'DCXQ4c4VNyLcsQZc4lV3HcRkK1W60MlK';
const omdbApiKey = process.env.OMDB_API_KEY || '742b2d09';
const newsApiKey = process.env.NEWS_API_KEY || 'dcd720a6f1914e2d9dba9790c188c08c';
const weatherApiKey = process.env.WEATHER_API_KEY || '';
const tenorApiKey = process.env.TENOR_API_KEY || 'AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ';

// Newsletter Info
const newsletterJid = process.env.NEWSLETTER_JID || '120363401269012709@newsletter';
const newsletterName = process.env.NEWSLETTER_NAME || 'MAD-MAX';

// Export all variables
module.exports = {
  // Session
  session,
  sessionName,
  
  // Bot Identity
  prefix,
  botname,
  ownername,
  owner,
  dev,
  packname,
  author,
  
  // Heroku
  herokuapi,
  appname,
  
  // Server
  port,
  
  // Bot Mode
  mode,
  
  // Auto Features
  autobio,
  autolike,
  autoviewstatus,
  anticall,
  antiforeign,
  autorecord,
  
  // Country Code
  mycode,
  
  // API Keys
  giphyApiKey,
  omdbApiKey,
  newsApiKey,
  weatherApiKey,
  tenorApiKey,
  
  // Newsletter
  newsletterJid,
  newsletterName
};