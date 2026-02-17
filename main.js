const { webzipCommand } = require('./plugins/webzip');
const { 
    bass, blown, deep, earrape, fast, fat, nightcore, reverse, robot, slow, smooth, 
    tupai, baby, chipmunk, demon, radio, audioHelpCommand 
} = require('./plugins/audio');
const { antideleteCommand, handleMessageDelete } = require('./plugins/antidelete');
const { 
    compatibilityCommand, 
    auraCommand, 
    lovetestCommand, 
    emojiCommand 
} = require('./plugins/fun');
const { aivoiceCommand, handleVoiceReply } = require('./plugins/aivoice');
const { twitterCommand, handleTwitterReply } = require('./plugins/twitter');
const yvideoCommand = require('./plugins/xvideo');
const rmbgCommand = require('./plugins/rmbg');
const { startHangman, guessLetter, isHangmanGameActive } = require('./plugins/hangman');
const flirtCommand = require('./plugins/flirt');
const insultCommand = require('./plugins/insult');
const eightBallCommand = require('./plugins/8ball');
const { piesCommand, piesAlias } = require('./plugins/pies');
const robalCommand = require('./plugins/robal');
const gifCommand = require('./plugins/gif');
const { konami } = require('./plugins/konami');
const jokeCommand = require('./plugins/joke');
const memeCommand = require('./plugins/meme');
const mediafireCommand = require('./plugins/mediafire');
const { quizCommand, handleQuizAnswer } = require('./plugins/quiz');
const quoteCommand = require('./plugins/quote');
const shipCommand = require('./plugins/ship');
const imgCommand = require('./plugins/img');
const blurCommand = require('./plugins/blur');
const movieCommand = require('./plugins/movie');
const newsCommand = require('./plugins/news');
const lyricsCommand = require('./plugins/lyrics');
const gdriveCommand = require('./plugins/gdrive');
const reminiCommand = require('./plugins/remini');
const hackCommand = require('./plugins/hack');
const pindlCommand = require('./plugins/pindl');
const seriesCommand = require('./plugins/series');
const settingsCommand = require('./plugins/settings');
const repoCommand = require('./plugins/repo');
const pairCommand = require('./plugins/pair');
const ringtoneCommand = require('./plugins/ringtone');
const gitcloneCommand = require('./plugins/gitclone');
const githubstalkCommand = require('./plugins/githubstalk');
const emojimixCommand = require('./plugins/emojimix');
const defineCommand = require('./plugins/define');
const spotifyCommand = require('./plugins/spotify');
const dareCommand = require('./plugins/dare');
const creatorCommand = require('./plugins/creator');
const soraCommand = require('./plugins/sora');
const smemeCommand = require('./plugins/smeme');
const { simpCommand } = require('./plugins/simp');
const simageCommand = require('./plugins/simage');
const setppCommand = require('./plugins/setpp');
const saveCommand = require('./plugins/save');
const squidgameCommand = require('./plugins/squidgame');
const screenshotCommand = require('./plugins/screenshot');
const sticker = require('./plugins/sticker');
const stickercropCommand = require('./plugins/stickercrop');
const countryinfoCommand = require('./plugins/countryinfo');
const { complimentCommand } = require('./plugins/compliment');
const clearCommand = require('./plugins/clear');
const { ping2Command } = require('./plugins/ping2');
const characterCommand = require('./plugins/character');
const { stupidCommand } = require('./plugins/stupid');
const takeCommand = require('./plugins/take');
const sudoCommand = require('./plugins/sudo');
const { tictactoeCommand, handleTicTacToeMove } = require('./plugins/tictactoe');
const { tiktokstalkCommand } = require('./plugins/tiktokstalk');
const topttCommand = require('./plugins/toptt');
const wastedCommand = require('./plugins/wasted');
const tovideo2Command = require('./plugins/tovideo2');
const warningsCommand = require('./plugins/warnings');
const warnCommand = require('./plugins/warn');
const wantedCommand = require('./plugins/wanted');
const videoCommand = require('./plugins/video');
const updateCommand = require('./plugins/update');
const ping = require('./plugins/ping');
const apkCommand = require('./plugins/apk');
const alive = require('./plugins/alive');
const help = require('./plugins/help');
const uptime = require('./plugins/uptime');
const owner = require('./plugins/owner');
const { modeCommand } = require('./plugins/mode');
const play = require('./plugins/play');
const tiktok = require('./plugins/tiktok');
const instagram = require('./plugins/instagram');
const facebook = require('./plugins/facebook');
const { handleAICommand, aiHelpCommand } = require('./plugins/ai');
const { animeCommand } = require('./plugins/anime');
const animequoteCommand = require('./plugins/animequote');
const attpCommand = require('./plugins/attp');
const { blockCommand, unblockCommand } = require('./plugins/block');
const bothostingCommand = require('./plugins/bothosting');
const getimageCommand = require('./plugins/getimage');
const emojiAnimations = require('./plugins/emojianimations');
const weatherCommand = require('./plugins/weather');
const stickerTelegramCommand = require('./plugins/stickertelegram');
const textmakerCommand = require('./plugins/textmaker');
const checkcountryCommand = require('./plugins/checkcountry');
const topdfCommand = require('./plugins/topdf');
const tomp3Command = require('./plugins/tomp3');
const urlimageCommand = require('./plugins/urlimage');
const { startTrivia, answerTrivia } = require('./plugins/trivia');

// GROUP MANAGEMENT COMMANDS
const tagAllCommand = require('./plugins/tagall');
const tagCommand = require('./plugins/tag');
const tagNotAdminCommand = require('./plugins/tagnotadmin');
const hideTagCommand = require('./plugins/hidetag');
const kickCommand = require('./plugins/kick');
const { promoteCommand } = require('./plugins/promote');
const { demoteCommand } = require('./plugins/demote');
const muteCommand = require('./plugins/mute');
const unmuteCommand = require('./plugins/unmute');
const lockgcCommand = require('./plugins/lockgc');
const unlockgcCommand = require('./plugins/unlockgc');
const groupInfoCommand = require('./plugins/groupinfo');
const resetlinkCommand = require('./plugins/resetlink');
const staffCommand = require('./plugins/staff');
const groupRequestsCommand = require('./plugins/grouprequests');
const { handleAntilinkCommand, handleLinkDetection } = require('./plugins/antilink');
const { handleAntitagCommand, handleTagDetection } = require('./plugins/antitag');
const { welcomeCommand } = require('./plugins/welcome');
const { goodbyeCommand, handleLeaveEvent } = require('./plugins/goodbye');
const { setGroupDescription, setGroupName, setGroupPhoto } = require('./plugins/groupmanage');
const grouptimeCommand = require('./plugins/grouptime');
const vcfCommand = require('./plugins/vcf');
const viewonceCommand = require('./plugins/viewonce');
const pollCommand = require('./plugins/poll');
const onlineCommand = require('./plugins/online');
const newsletterCommand = require('./plugins/newsletter');
const { unbanCommand } = require('./plugins/unban');
const antispamCommand = require('./plugins/antispam');
const { antibadwordCommand, handleBadwordDetection } = require('./plugins/antibadword');
const { fancyCommand, handleFancyMessage } = require('./plugins/fancy');
const { miscCommand, handleHeart } = require('./plugins/misc');
const convertCommand = require('./plugins/convert');
const toVideoCommand = require('./plugins/tovideo');
const ytpostCommand = require('./plugins/ytpost');

// AUTO FEATURES IMPORTS
const { autotypingCommand, isAutotypingEnabled, handleAutotypingForMessage, handleAutotypingForCommand, showTypingAfterCommand } = require('./plugins/autotyping');
const { autoreadCommand, isAutoreadEnabled, handleAutoread, isBotMentionedInMessage } = require('./plugins/autoread');
const { autoreplyCommand, handleAutoreply } = require('./plugins/autoreply');
const { autovoiceCommand, handleAutovoice } = require('./plugins/autovoice');
const { autostickerCommand, checkAutoSticker } = require('./plugins/autosticker');
const { autotextCommand, handleAutotext } = require('./plugins/autotext');
const { autoStatusCommand, handleStatusUpdate } = require('./plugins/autostatus');
const { anticallCommand, readState: readAnticallState } = require('./plugins/anticall');
const { dmblockerCommand, readState: readdmblockerState } = require('./plugins/dmblocker');
const autorecordingCommand = require('./plugins/autorecording');
const { topMembers, incrementMessageCount } = require('./plugins/topmembers');
const { handlemadmaxResponse } = require('./plugins/madmax');
const { handleTranslateCommand } = require('./plugins/translate');


// Owner check function
const isOwner = require('./lib/isOwner');
const isAdmin = require('./lib/isAdmin');

// Message counter for activity tracking
const userMessageCount = {};

// Global channel info
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

module.exports = async (client, m) => {
// ============ INITIALIZE HACK MODULE ============
try {
    const hackInit = require('./plugins/hack').init;
    if (hackInit) {
        hackInit(client);
        console.log('✅ Hack module initialized');
    }
} catch (error) {
    console.error('❌ Failed to initialize hack module:', error);
}
    try {
        // Parse message
        const body = m.mtype === "conversation" ? m.message.conversation :
                    m.mtype === "extendedTextMessage" ? m.message.extendedTextMessage.text : "";
        if (!body) return;
        
        const config = require('./set');
        const prefix = config.prefix || '.';
        const chatId = m.chat;
        const sender = m.sender;
        const pushName = m.pushName || 'User';
        const isOwnerSimple = sender === config.owner + '@s.whatsapp.net' || sender === client.user.id;
        const isGroup = chatId.endsWith('@g.us');
        
        // Track message count for activity
        if (!userMessageCount[sender]) userMessageCount[sender] = 0;
        userMessageCount[sender]++;
        
        // Increment message count for topmembers feature
        if (isGroup && !m.key.fromMe) {
            incrementMessageCount(chatId, sender);
        }
        
        // ============ READ BOT MODE (PUBLIC/PRIVATE) ============
// Use the readModeState function from index.js (available globally)
let isPublic = true;
try {
    // This function is defined in index.js and available globally
    if (typeof readModeState === 'function') {
        const modeState = readModeState();
        isPublic = modeState.isPublic;
    } else {
        // Fallback to direct file read if function not available
        const modePath = './data/mode.json';
        const fs = require('fs');
        if (fs.existsSync(modePath)) {
            const modeData = JSON.parse(fs.readFileSync(modePath, 'utf8'));
            isPublic = modeData.isPublic !== false;
        }
    }
} catch (error) {
    console.error('Error reading bot mode:', error);
}
    // ============ AUTO FEATURES (for non-command messages) ============
if (!body.startsWith(prefix)) {
    
if (chatId === 'status@broadcast') {
    await handleStatusUpdate(client, m);
    return;
}
    const replyContext = m.message?.extendedTextMessage?.contextInfo;
    if (replyContext && replyContext.stanzaId && global.voiceSessions) {
        const repliedToId = replyContext.stanzaId;
        if (global.voiceSessions[repliedToId]) {
            const choice = body.trim();
            // Check if it's a number between 1-12
            if (/^[1-9]|1[0-2]$/.test(choice)) {
                const handled = await handleVoiceReply(client, m, repliedToId, choice, sender);
                if (handled) return;
            }
        }
    }
    // ===== END VOICE HANDLER =====
    
    // Apply fancy font to user messages
    const fancyText = await handleFancyMessage(client, chatId, m, body, sender);
    if (fancyText) {
        await client.sendMessage(chatId, {
            text: fancyText,
            edit: m.key
        });
        return;
    }
    
    // Auto-recording feature
    const { isAutorecordingEnabled, showRecordingIndicator } = require('./plugins/autorecording');
    if (isAutorecordingEnabled()) {
        await showRecordingIndicator(client, chatId);
    }
    
    // Auto-typing feature
    await handleAutotypingForMessage(client, chatId, body);
    
    // Auto-sticker check
    if (body.trim()) await checkAutoSticker(client, chatId, m, body);
    
    // Auto-read feature
    await handleAutoread(client, m);
    
    // Handle autoreply for private messages
    if (!isGroup) {
        await handleAutoreply(client, chatId, sender, body, m);
        await handleAutovoice(client, chatId, sender, body, m);
    }
    
    // Handle autotext
    await handleAutotext(client, chatId, sender, body, m);
    
    // Handle group features
if (isGroup) {
    await handleBadwordDetection(client, chatId, m, body, sender);
    await handleTagDetection(client, chatId, m, sender);
    await handlemadmaxResponse(client, chatId, m, body, sender);
    
    // ===== ANTILINK CHECK =====
    await handleLinkDetection(client, chatId, m, body, sender);
}
    return;
}
        
        // ============ COMMAND PROCESSING ============
        const args = body.slice(prefix.length).trim().split(/ +/);
        const command = args.shift().toLowerCase();
        
        // Auto-typing for commands
        await handleAutotypingForCommand(client, chatId, command);
if (global.voiceSessions) {
    const replyContext = m.message?.extendedTextMessage?.contextInfo;
    if (replyContext && replyContext.stanzaId && global.voiceSessions[replyContext.stanzaId]) {
        const choice = body.trim();
        if (['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].includes(choice)) {
            const handled = await handleVoiceReply(client, m, replyContext.stanzaId, choice, sender);
            if (handled) return;
        }
    }
}
       
if (isHangmanGameActive(chatId) && body.length === 1 && body.match(/[a-z]/i)) {
    const handled = await guessLetter(client, chatId, m, body, sender);
    if (handled) return;
}
        // Check if this is an answer to an active quiz
if (command === 'answer' || command === 'ans') {
    const handled = await handleQuizAnswer(client, chatId, m, args, sender, pushName, isOwnerSimple);
    if (handled) return;
}
// OR if you want to automatically detect quiz answers (no command needed)
const quizHandled = await handleQuizAnswer(client, chatId, m, [body], sender, pushName, isOwnerSimple);
if (quizHandled) return;
        
     // Define owner-only commands
const ownerCommands = [
    'autotyping', 'autotype', 'autoread', 'autoreply', 'autovoice',
    'autosticker', 'autotext', 'autostatus', 'autorecording', 'autorecord',
    'anticall', 'dmblocker', 'mode', 'owner', 'restart',
    'antispam', 'unban'
];

// Define group admin commands
const adminCommands = [
    'tagall', 'tag', 'tagnotadmin', 'hidetag', 'kick', 'promote',
    'demote', 'mute', 'unmute', 'lockgc', 'unlockgc', 'resetlink',
    'antilink', 'antitag', 'welcome', 'goodbye', 'setgdesc',
    'setgname', 'setgpp', 'requestlist', 'acceptall', 'rejectall',
    'grouptime', 'antibadword'
];

// ============ PRIVATE MODE CHECK ============
// In PRIVATE mode, ONLY owner can use ANY command
if (!isPublic) {
    const isUserOwner = await isOwner(sender, client, chatId);
    if (!isUserOwner && !isOwnerSimple) {
        console.log(`🔒 Private mode: Blocked command ${command} from ${sender}`);
        return; // Block ALL commands from non-owners
    }
}

// ============ OWNER COMMAND CHECK ============
if (ownerCommands.includes(command)) {
    const isUserOwner = await isOwner(sender, client, chatId);
    if (!isUserOwner && !isOwnerSimple) {
        console.log(`🔒 Owner-only: Blocked command ${command} from ${sender}`);
        return;
    }
}

// ============ ADMIN CHECK FOR GROUP COMMANDS ============
if (isGroup && adminCommands.includes(command)) {
    const adminStatus = await isAdmin(client, chatId, sender);
    const isSenderAdmin = adminStatus.isSenderAdmin;
    const isBotAdmin = adminStatus.isBotAdmin;
    
    if (!isBotAdmin) {
        await client.sendMessage(chatId, { 
            text: '❌ Bot needs to be admin to use this command!',
            ...channelInfo
        }, { quoted: m });
        return;
    }
    
    if (!isSenderAdmin && !isOwnerSimple) {
        await client.sendMessage(chatId, { 
            text: '❌ Only group admins can use this command!',
            ...channelInfo
        }, { quoted: m });
        return;
    }
}
        
        // ============ COMMAND HANDLERS ============
        
        // Basic Commands
        if (command === 'ping') {
            await ping(client, chatId, m, args, sender, pushName, isOwnerSimple);
        }
        else if (command === 'alive') {
            await alive(client, chatId, m, args, sender, pushName, isOwnerSimple);
        }
        else if (command === 'help' || command === 'menu') {
            await help(client, chatId, m, args, sender, pushName, isOwnerSimple);
        }
        else if (command === 'uptime' || command === 'runtime') {
            await uptime(client, chatId, m, args, sender, pushName, isOwnerSimple);
        }
        else if (command === 'topmembers' || command === 'top') {
            await topMembers(client, chatId, m, args, sender, pushName, isOwnerSimple);
        }
        else if (command === 'owner') {
            const isUserOwner = await isOwner(sender, client, chatId);
            await owner(client, chatId, m, args, sender, pushName, isUserOwner);
        }
        else if (command === 'mode' || command === 'modeprivate' || command === 'modepublic') {
    const isUserOwner = await isOwner(sender, client, chatId);
    
    // Handle combined commands like .modeprivate
    if (command === 'modeprivate') {
        await modeCommand(client, chatId, m, ['private'], sender, pushName, isUserOwner);
    } 
    else if (command === 'modepublic') {
        await modeCommand(client, chatId, m, ['public'], sender, pushName, isUserOwner);
    }
    else {
        await modeCommand(client, chatId, m, args, sender, pushName, isUserOwner);
    }
}
        else if (command === 'restart') {
            const isUserOwner = await isOwner(sender, client, chatId);
            if (!isUserOwner && !isOwnerSimple) return;
            await client.sendMessage(chatId, { text: 'Restart feature coming soon!' }, { quoted: m });
        }
        
        // Downloader Commands
        else if (command === 'tiktok' || command === 'tt' || command === 'tikdl') {
            await tiktok(client, chatId, m, args, sender, pushName, isOwnerSimple);
        }
        else if (command === 'ig' || command === 'instagram' || command === 'igdl') {
            await instagram(client, chatId, m, args, sender, pushName, isOwnerSimple);
        }
        else if (command === 'sticker' || command === 's') {
            await sticker(client, chatId, m, args, sender, pushName, isOwnerSimple);
        }
        else if (command === 'fb' || command === 'facebook' || command === 'fbdl') {
            await facebook(client, chatId, m, args, sender, pushName, isOwnerSimple);
        }
        else if (command === 'play' || command === 'song' || command === 'music' || command === 'ytmp3') {
            await play(client, chatId, m, args, sender, pushName, isOwnerSimple);
        }
        
        // ============ GROUP MANAGEMENT COMMANDS ============
        else if (command === 'tagall') {
            await tagAllCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
        }
        else if (command === 'tag') {
            const messageText = args.join(' ');
            await tagCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
        }
        else if (command === 'tagnotadmin') {
            await tagNotAdminCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
        }
        else if (command === 'hidetag') {
            const messageText = args.join(' ');
            await hideTagCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
        }
        else if (command === 'kick') {
            await kickCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
        }
        else if (command === 'promote') {
            await promoteCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
        }
        else if (command === 'demote') {
            await demoteCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
        }
        else if (command === 'mute') {
            await muteCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
        }
        else if (command === 'unmute') {
            await unmuteCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
        }
        else if (command === 'lockgc' || command === 'lock') {
            await lockgcCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
        }
        else if (command === 'unlockgc' || command === 'unlock') {
            await unlockgcCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
        }
        else if (command === 'groupinfo' || command === 'infogp') {
            await groupInfoCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
        }
        else if (command === 'resetlink' || command === 'revoke') {
            await resetlinkCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
        }
        else if (command === 'staff' || command === 'admins' || command === 'listadmin') {
            await staffCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
        }
        else if (command === 'antilink') {
            await handleAntilinkCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
        }
        else if (command === 'antitag') {
            await handleAntitagCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
        }
        else if (command === 'welcome') {
            await welcomeCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
        }
        else if (command === 'goodbye') {
            await goodbyeCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
        }
        else if (command === 'setgdesc') {
            await setGroupDescription(client, chatId, m, args, sender, pushName, isOwnerSimple);
        }
        else if (command === 'setgname') {
            await setGroupName(client, chatId, m, args, sender, pushName, isOwnerSimple);
        }
        else if (command === 'setgpp') {
            await setGroupPhoto(client, chatId, m, args, sender, pushName, isOwnerSimple);
        }
        else if (command === 'grouptime' || command === 'gctime') {
            await grouptimeCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
        }
        else if (command === 'antibadword') {
            await antibadwordCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
        }
        else if (command === 'requestlist' || command === 'joinrequests') {
            await groupRequestsCommand.requestlist(client, chatId, m, args, sender, pushName, isOwnerSimple);
        }
        else if (command === 'acceptall') {
            await groupRequestsCommand.acceptall(client, chatId, m, args, sender, pushName, isOwnerSimple);
        }
        else if (command === 'rejectall') {
            await groupRequestsCommand.rejectall(client, chatId, m, args, sender, pushName, isOwnerSimple);
        }
        
        // ============ UTILITY COMMANDS ============
        else if (command === 'vcf') {
            await vcfCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
        }
        else if (command === 'vv' || command === 'viewonce') {
            await viewonceCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
        }
        else if (command === 'poll') {
            await pollCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
        }
        else if (command === 'online' || command === 'whosonline') {
            await onlineCommand.online(client, chatId, m, args, sender, pushName, isOwnerSimple);
        }
        else if (command === 'newsletter' || command === 'channel') {
            await newsletterCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
        }
        else if (command === 'unban') {
            await unbanCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
        }
        else if (command === 'antispam') {
            await antispamCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
        }
        
        // ============ AUTO FEATURES COMMANDS (OWNER ONLY) ============
        else if (command === 'autotyping' || command === 'autotype') {
            const isUserOwner = await isOwner(sender, client, chatId);
            await autotypingCommand(client, chatId, m, args, sender, pushName, isUserOwner);
        }
        else if (command === 'autoread') {
            const isUserOwner = await isOwner(sender, client, chatId);
            await autoreadCommand(client, chatId, m, args, sender, pushName, isUserOwner);
        }
        else if (command === 'autoreply') {
            const isUserOwner = await isOwner(sender, client, chatId);
            await autoreplyCommand(client, chatId, m, args, sender, pushName, isUserOwner);
        }
        else if (command === 'autovoice') {
            const isUserOwner = await isOwner(sender, client, chatId);
            await autovoiceCommand(client, chatId, m, args, sender, pushName, isUserOwner);
        }
        else if (command === 'autosticker') {
            const isUserOwner = await isOwner(sender, client, chatId);
            await autostickerCommand(client, chatId, m, args, sender, pushName, isUserOwner);
        }
        else if (command === 'autotext') {
            const isUserOwner = await isOwner(sender, client, chatId);
            await autotextCommand(client, chatId, m, args, sender, pushName, isUserOwner);
        }
        else if (command === 'autostatus') {
            const isUserOwner = await isOwner(sender, client, chatId);
            await autoStatusCommand(client, chatId, m, args, sender, pushName, isUserOwner);
        }
        else if (command === 'autorecording' || command === 'autorecord') {
            const isUserOwner = await isOwner(sender, client, chatId);
            await autorecordingCommand(client, chatId, m, args, sender, pushName, isUserOwner);
        }
        else if (command === 'anticall') {
            const isUserOwner = await isOwner(sender, client, chatId);
            await anticallCommand(client, chatId, m, args, sender, pushName, isUserOwner);
        }
        else if (command === 'dmblocker') {
            const isUserOwner = await isOwner(sender, client, chatId);
            await dmblockerCommand(client, chatId, m, args, sender, pushName, isUserOwner);
        }
else if (command === 'anime' || command === 'animu') {
    await animeCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
}
// Anime subcommands as direct commands
else if (command === 'nom' || command === 'poke' || command === 'cry' || 
         command === 'kiss' || command === 'pat' || command === 'hug' || 
         command === 'wink' || command === 'facepalm' || command === 'quote') {
    let animeType = command;
    if (animeType === 'facepalm') animeType = 'face-palm';
    const animeArgs = [animeType];
    await animeCommand(client, chatId, m, animeArgs, sender, pushName, isOwnerSimple);
}
        
        // ============ AI COMMANDS ============
        else if (command === 'gpt') {
            await handleAICommand(client, chatId, m, args, 'gpt');
        }
        else if (command === 'gemini') {
            await handleAICommand(client, chatId, m, args, 'gemini');
        }
        else if (command === 'llama') {
            await handleAICommand(client, chatId, m, args, 'llama');
        }
        else if (command === 'zoroai') {
            await handleAICommand(client, chatId, m, args, 'zoroai');
        }
        else if (command === 'jeeves') {
            await handleAICommand(client, chatId, m, args, 'jeeves');
        }
        else if (command === 'jeeves2') {
            await handleAICommand(client, chatId, m, args, 'jeeves2');
        }
        else if (command === 'perplexity') {
            await handleAICommand(client, chatId, m, args, 'perplexity');
        }
        else if (command === 'xdash') {
            await handleAICommand(client, chatId, m, args, 'xdash');
        }
        else if (command === 'aoyo') {
            await handleAICommand(client, chatId, m, args, 'aoyo');
        }
        else if (command === 'math') {
            await handleAICommand(client, chatId, m, args, 'math');
        }
        else if (command === 'aihelp') {
            await aiHelpCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
        }      
else if (command === 'apk') {
    await apkCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
}
else if (command === 'animequote' || command === 'aquote' || command === 'aniquote') {
    await animequoteCommand.animequote(client, chatId, m, args, sender, pushName, isOwnerSimple);
}
else if (command === 'attp') {
    await attpCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
} 
else if (command === 'block') {
    await blockCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
}
else if (command === 'unblock') {
    await unblockCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
}
else if (command === 'bothosting' || command === 'deploy' || command === 'hosting') {
    await bothostingCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
}
else if (command === 'happy') {
    await emojiAnimations.happy(client, chatId, m, args, sender, pushName, isOwnerSimple);
}
else if (command === 'heart') {
    await emojiAnimations.heart(client, chatId, m, args, sender, pushName, isOwnerSimple);
}
else if (command === 'angry') {
    await emojiAnimations.angry(client, chatId, m, args, sender, pushName, isOwnerSimple);
}
else if (command === 'sad') {
    await emojiAnimations.sad(client, chatId, m, args, sender, pushName, isOwnerSimple);
}
else if (command === 'shy') {
    await emojiAnimations.shy(client, chatId, m, args, sender, pushName, isOwnerSimple);
}
else if (command === 'moon') {
    await emojiAnimations.moon(client, chatId, m, args, sender, pushName, isOwnerSimple);
}
else if (command === 'confused') {
    await emojiAnimations.confused(client, chatId, m, args, sender, pushName, isOwnerSimple);
}
else if (command === 'hot') {
    await emojiAnimations.hot(client, chatId, m, args, sender, pushName, isOwnerSimple);
}
else if (command === 'nikal') {
    await emojiAnimations.nikal(client, chatId, m, args, sender, pushName, isOwnerSimple);
}
else if (command === 'madmax') {
    await handlemadmaxCommand(client, chatId, m, args, sender, pushName, isOwnerSimple); 
}
else if (command === 'fancy' || command === 'font' || command === 'style') {
    await fancyCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
}
else if (command === 'tg' || command === 'stickertelegram' || command === 'tgsticker' || command === 'telesticker') {
    await stickerTelegramCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
}
else if (command === 'weather') {
    await weatherCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
}
// ============ MEDIA COMMANDS ============
else if (command === 'metallic') {
    await textmakerCommand(client, chatId, m, args, sender, pushName, isOwnerSimple, 'metallic');
}
else if (command === 'ice') {
    await textmakerCommand(client, chatId, m, args, sender, pushName, isOwnerSimple, 'ice');
}
else if (command === 'snow') {
    await textmakerCommand(client, chatId, m, args, sender, pushName, isOwnerSimple, 'snow');
}
else if (command === 'impressive') {
    await textmakerCommand(client, chatId, m, args, sender, pushName, isOwnerSimple, 'impressive');
}
else if (command === 'matrix') {
    await textmakerCommand(client, chatId, m, args, sender, pushName, isOwnerSimple, 'matrix');
}
else if (command === 'light') {
    await textmakerCommand(client, chatId, m, args, sender, pushName, isOwnerSimple, 'light');
}
else if (command === 'neon') {
    await textmakerCommand(client, chatId, m, args, sender, pushName, isOwnerSimple, 'neon');
}
else if (command === 'devil') {
    await textmakerCommand(client, chatId, m, args, sender, pushName, isOwnerSimple, 'devil');
}
else if (command === 'purple') {
    await textmakerCommand(client, chatId, m, args, sender, pushName, isOwnerSimple, 'purple');
}
else if (command === 'thunder') {
    await textmakerCommand(client, chatId, m, args, sender, pushName, isOwnerSimple, 'thunder');
}
else if (command === 'leaves') {
    await textmakerCommand(client, chatId, m, args, sender, pushName, isOwnerSimple, 'leaves');
}
else if (command === '1997' || command === '1917') {
    await textmakerCommand(client, chatId, m, args, sender, pushName, isOwnerSimple, '1997');
}
else if (command === 'arena') {
    await textmakerCommand(client, chatId, m, args, sender, pushName, isOwnerSimple, 'arena');
}
else if (command === 'hacker') {
    await textmakerCommand(client, chatId, m, args, sender, pushName, isOwnerSimple, 'hacker');
}
else if (command === 'sand') {
    await textmakerCommand(client, chatId, m, args, sender, pushName, isOwnerSimple, 'sand');
}
else if (command === 'blackpink') {
    await textmakerCommand(client, chatId, m, args, sender, pushName, isOwnerSimple, 'blackpink');
}
else if (command === 'glitch') {
    await textmakerCommand(client, chatId, m, args, sender, pushName, isOwnerSimple, 'glitch');
}
else if (command === 'fire') {
    await textmakerCommand(client, chatId, m, args, sender, pushName, isOwnerSimple, 'fire');
}
else if (command === 'dragonball') {
    await textmakerCommand(client, chatId, m, args, sender, pushName, isOwnerSimple, 'dragonball');
}
else if (command === 'naruto') {
    await textmakerCommand(client, chatId, m, args, sender, pushName, isOwnerSimple, 'naruto');
}
else if (command === 'boom') {
    await textmakerCommand(client, chatId, m, args, sender, pushName, isOwnerSimple, 'boom');
}
else if (command === 'water') {
    await textmakerCommand(client, chatId, m, args, sender, pushName, isOwnerSimple, 'water');
}
else if (command === 'underwater') {
    await textmakerCommand(client, chatId, m, args, sender, pushName, isOwnerSimple, 'underwater');
}
else if (command === '4d') {
    await textmakerCommand(client, chatId, m, args, sender, pushName, isOwnerSimple, '4d');
}
else if (command === 'boken') {
    await textmakerCommand(client, chatId, m, args, sender, pushName, isOwnerSimple, 'boken');
}
else if (command === 'starnight') {
    await textmakerCommand(client, chatId, m, args, sender, pushName, isOwnerSimple, 'starnight');
}
else if (command === 'gold') {
    await textmakerCommand(client, chatId, m, args, sender, pushName, isOwnerSimple, 'gold');
}
else if (command === 'xmd') {
    await textmakerCommand(client, chatId, m, args, sender, pushName, isOwnerSimple, 'xmd');
}
else if (command === '3d') {
    await textmakerCommand(client, chatId, m, args, sender, pushName, isOwnerSimple, '3d');
}
else if (command === 'luxury') {
    await textmakerCommand(client, chatId, m, args, sender, pushName, isOwnerSimple, 'luxury');
}
else if (command === 'american') {
    await textmakerCommand(client, chatId, m, args, sender, pushName, isOwnerSimple, 'american');
}
else if (command === 'embroider') {
    await textmakerCommand(client, chatId, m, args, sender, pushName, isOwnerSimple, 'embroider');
}
else if (command === 'foggyglass') {
    await textmakerCommand(client, chatId, m, args, sender, pushName, isOwnerSimple, 'foggyglass');
}
else if (command === 'silver') {
    await textmakerCommand(client, chatId, m, args, sender, pushName, isOwnerSimple, 'silver');
}
else if (command === 'wetglass') {
    await textmakerCommand(client, chatId, m, args, sender, pushName, isOwnerSimple, 'wetglass');
}
else if (command === 'misc') {
    await miscCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
}
else if (command === 'heart') {
    await handleHeart(client, chatId, m, args, sender, pushName, isOwnerSimple);
}
else if (command === 'horny' || command === 'circle' || command === 'lgbt' || 
         command === 'lied' || command === 'lolice' || command === 'simpcard' || 
         command === 'tonikawa' || command === 'comrade' || command === 'gay' || 
         command === 'glass' || command === 'jail' || command === 'passed' || 
         command === 'triggered') {
    const miscArgs = [command];
    await miscCommand(client, chatId, m, miscArgs, sender, pushName, isOwnerSimple);
}
else if (command === 'check') {
    await checkcountryCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
}
else if (command === 'convert' || command === 'sticker2img' || command === 'stoimg' || 
         command === 'stickertoimage' || command === 's2i') {
    await convertCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
}
else if (command === 'topdf' || command === 'pdf') {
    await topdfCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
}

else if (command === 'tomp3') {
    await tomp3Command(client, chatId, m, args, sender, pushName, isOwnerSimple);
} 
else if (command === 'tovideo') {
    await toVideoCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
}
else if (command === 'ytpost' || command === 'ytc' || command === 'youtubecommunity') {
    await ytpostCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
}
else if (command === 'getimage' || command === 'tophoto' || command === 'url2image' || 
         command === 'urltoimage' || command === 'fetchimage' || command === 'imagefromurl') {
    await urlimageCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
}
else if (command === 'translate' || command === 'trt') {
    await handleTranslateCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
}
else if (command === 'webzip' || command === 'archive') {
    await webzipCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
}
else if (command === 'wasted') {
    await wastedCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
}
else if (command === 'warnings') {
    await warningsCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
}
else if (command === 'warn') {
    await warnCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
}
else if (command === 'wanted') {
    await wantedCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
}
else if (command === 'video') {
    await videoCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
}
else if (command === 'update') {
    await updateCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
}
else if (command === 'trivia') {
    await startTrivia(client, chatId, m, args, sender, pushName, isOwnerSimple);
}
else if (command === 'answer') {
    await answerTrivia(client, chatId, m, args, sender, pushName, isOwnerSimple);
}
else if (command === 'tovideo2') {
    await tovideo2Command(client, chatId, m, args, sender, pushName, isOwnerSimple);
}
else if (command === 'toptt' || command === 'toaudio') {
    await topttCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
}
else if (command === 'tiktokstalk' || command === 'ttstalk') {
    await tiktokstalkCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
}
else if (command === 'ttt' || command === 'tictactoe') {
    await tictactoeCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
}
else if (command === 'move') {
    const position = parseInt(args[0]);
    if (!isNaN(position)) {
        await handleTicTacToeMove(client, chatId, m, [position], sender, pushName, isOwnerSimple);
    }
}
else if (command === 'surrender') {
    await handleTicTacToeMove(client, chatId, m, ['surrender'], sender, pushName, isOwnerSimple);
}
else if (command === 'take' || command === 'steal') {
    await takeCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
}
else if (command === 'sudo') {
    await sudoCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
}
else if (command === 'stupid' || command === 'itssostupid' || command === 'iss') {
    await stupidCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
}
else if (command === 'ping2' || command === 'speed' || command === 'pong') {
    await ping2Command(client, chatId, m, args, sender, pushName, isOwnerSimple);
}
else if (command === 'character' || command === 'char' || command === 'analyze') {
    await characterCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
}
else if (command === 'clear') {
    await clearCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
}
  else if (command === 'compliment' || command === 'compli') {
    await complimentCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
}  
      else if (command === 'country' || command === 'countryinfo' || command === 'cinfo') {
    await countryinfoCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
}   
else if (command === 'crop' || command === 'stickercrop') {
    await stickercropCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
}

else if (command === 'ss' || command === 'screenshot' || command === 'ssweb') {
    await screenshotCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
}
else if (command === 'squidgame' || command === 'sg' || command === 'squid') {
    await squidgameCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
}
else if (command === 'spotify' || command === 'sp' || command === 'spotifydl') {
    await spotifyCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
}
else if (command === 'sora' || command === 'txt2video') {
    await soraCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
}
else if (command === 'smeme' || command === 'memesticker') {
    await smemeCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
}
else if (command === 'simp' || command === 'simpcard') {
    await simpCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
}
else if (command === 'simage' || command === 's2img' || command === 'stoimg' || command === 'sticker2image') {
    await simageCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
}
else if (command === 'setpp' || command === 'setprofile') {
    await setppCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
}
else if (command === 'save' || command === 'dl') {
    await saveCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
}
else if (command === 'creator' || command === 'developer' || command === 'dev') {
    await creatorCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
}
else if (command === 'dare') {
    await dareCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
}
else if (command === 'define' || command === 'dictionary' || command === 'meaning') {
    await defineCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
}
else if (command === 'emojimix' || command === 'mix') {
    await emojimixCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
}
else if (command === 'gitclone' || command === 'clone' || command === 'ghdl') {
    await gitcloneCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
}
else if (command === 'getimage' || command === 'imgurl' || command === 'imageurl') {
    await getimageCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
}
else if (command === 'githubstalk' || command === 'ghstalk' || command === 'gitstalk') {
    await githubstalkCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
}
else if (command === 'repo' || command === 'repository' || command === 'github') {
    await repoCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
}
else if (command === 'ringtone' || command === 'rt' || command === 'ringtonedl') {
    await ringtoneCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
}
else if (command === 'pair') {
    await pairCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
}
else if (command === 'settings' || command === 'botsettings') {
    await settingsCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
}
else if (command === 'series' || command === 'episode') {
    await seriesCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
}
else if (command === 'remini' || command === 'enhance' || command === 'hd') {
    await reminiCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
}
else if (command === 'pindl' || command === 'pinterest' || command === 'pin') {
    await pindlCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
}
else if (command === 'hack') {
    await hackCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
}
else if (command === 'gdrive' || command === 'gd' || command === 'googledrive') {
    await gdriveCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
}
else if (command === 'lyrics' || command === 'lyric' || command === 'songlyrics') {
    await lyricsCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
}
else if (command === 'news' || command === 'headlines') {
    await newsCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
}
else if (command === 'movie' || command === 'film' || command === 'imdb') {
    await movieCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
}
else if (command === 'blur') {
    await blurCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
}
else if (command === 'img' || command === 'image' || command === 'imagesearch') {
    await imgCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
}
else if (command === 'ship' || command === 'match') {
    await shipCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
}
else if (command === 'quote' || command === 'quotes') {
    await quoteCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
}
else if (command === 'quiz' || command === 'trivia') {
    await quizCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
}
else if (command === 'konami' || command === 'match' || command === 'versus') {
    await konami(client, chatId, m, args, sender, pushName, isOwnerSimple);
}
else if (command === 'mediafire' || command === 'mf' || command === 'mfire') {
    await mediafireCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
}
else if (command === 'compatibility' || command === 'compat') {
    await compatibilityCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
}
else if (command === 'aura') {
    await auraCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
}
else if (command === '8ball' || command === 'eightball') {
    await eightBallCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
}

else if (command === 'lovetest' || command === 'love') {
    await lovetestCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
}
else if (command === 'emoji' || command === 'emojify') {
    await emojiCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
}
else if (command === 'meme') {
    await memeCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
}
else if (command === 'joke' || command === 'dadjoke') {
    await jokeCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
}
else if (command === 'misc') {
    await miscCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
}
else if (command === 'heart') {
    await handleHeart(client, chatId, m, args, sender, pushName, isOwnerSimple);
}
else if (command === 'horny' || command === 'circle' || command === 'lgbt' || 
         command === 'lied' || command === 'lolice' || command === 'simpcard' || 
         command === 'tonikawa' || command === 'comrade' || command === 'gay' || 
         command === 'glass' || command === 'jail' || command === 'passed' || 
         command === 'triggered') {
    // Create args array with the command as first argument
    const miscArgs = [command];
    await miscCommand(client, chatId, m, miscArgs, sender, pushName, isOwnerSimple);
}
else if (command === 'gif') {
    await gifCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
}
else if (command === 'robal' || command === 'repack' || command === 'stickerpack') {
    await robalCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
}
// Pies command with country argument
else if (command === 'pies') {
    await piesCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
}

// Direct country aliases
else if (command === 'china' || command === 'indonesia' || command === 'japan' || 
         command === 'korea' || command === 'hijab') {
    await piesAlias(client, chatId, m, args, sender, pushName, isOwnerSimple, command);
}
else if (command === 'insult' || command === 'roast') {
    await insultCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
}
else if (command === 'flirt' || command === 'pickup' || command === 'pickupline') {
    await flirtCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
}
else if (command === 'hangman' || command === 'hm') {
    await startHangman(client, chatId, m, args, sender, pushName, isOwnerSimple);
}
else if (command === 'rmbg' || command === 'removebg') {
    await rmbgCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
}
else if (command === 'xvideo' || command === 'hentai' || command === 'xnxx' || command === 'xxx') {
    await yvideoCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
}
else if (command === 'twitter' || command === 'tweet' || command === 'twdl') {
    await twitterCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
}
else if (command === 'aivoice' || command === 'vai' || command === 'voicex' || command === 'voiceai') {
    await aivoiceCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
}
else if (command === 'antidelete' || command === 'antidel' || command === 'anti-delete') {
    await antideleteCommand(client, chatId, m, args, sender, pushName, isOwnerSimple);
}
// ============ AUDIO EFFECTS COMMANDS ============
else if (command === 'bass') {
    await bass(client, chatId, m, message);
}
else if (command === 'blown') {
    await blown(client, chatId, m, message);
}
else if (command === 'deep') {
    await deep(client, chatId, m, message);
}
else if (command === 'earrape') {
    await earrape(client, chatId, m, message);
}
else if (command === 'fast') {
    await fast(client, chatId, m, message);
}
else if (command === 'fat') {
    await fat(client, chatId, m, message);
}
else if (command === 'nightcore') {
    await nightcore(client, chatId, m, message);
}
else if (command === 'reverse') {
    await reverse(client, chatId, m, message);
}
else if (command === 'robot') {
    await robot(client, chatId, m, message);
}
else if (command === 'slow') {
    await slow(client, chatId, m, message);
}
else if (command === 'smooth') {
    await smooth(client, chatId, m, message);
}
else if (command === 'tupai') {
    await tupai(client, chatId, m, message);
}
else if (command === 'baby') {
    await baby(client, chatId, m, message);
}
else if (command === 'chipmunk') {
    await chipmunk(client, chatId, m, message);
}
else if (command === 'demon') {
    await demon(client, chatId, m, message);
}
else if (command === 'radio') {
    await radio(client, chatId, m, message);
}
else if (command === 'audiohelp' || command === 'ahelp' || command === 'effects') {
    await audioHelpCommand(client, chatId, m, message);
}
// Show typing after command execution
        await showTypingAfterCommand(client, chatId);
        
    } catch (error) {
        console.error('Error in main handler:', error);
    }
};