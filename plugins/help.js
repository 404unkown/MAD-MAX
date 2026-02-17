module.exports = async (client, chatId, m, args, sender, pushName) => {
    const config = require('../set');
    const prefix = config.prefix || '.';
    
    const HELP_IMG = "https://files.catbox.moe/4gjzv5.png";
    
    const menu = `╭───◇ *MAD-MAX* ◇───╮

◈ *OWNER/SUDO COMMANDS*
├ .mode
├ .autostatus
├ .antidelete
├ .setpp
├ .autotyping
├ .autoread
├ .dmblocker
├ .autosticker
├ .autorecording
├ .autovoice
├ .anticall
├ .block
├ .unblock
├ .autoreply
├ .sudo
├ .update
├ .settings
├ .newsletter
├ .hack
├ .antispam
├ .autotext

◈ *GROUP ADMIN COMMANDS*
├ .kick
├ .promote
├ .demote
├ .mute
├ .unmute
├ .unban
├ .tagall
├ .tagnotadmin
├ .hidetag
├ .tag
├ .antilink
├ .antitag
├ .antibadword
├ .welcome
├ .goodbye
├ .setgdesc
├ .setgname
├ .setgpp
├ .clear
├ .warn
├ .warnings
├ .resetlink
├ .staff
├ .groupinfo
├ .lockgc
├ .unlockgc
├ .poll
├ .requestlist
├ .acceptall
├ .rejectall
├ .grouptime
├ .online

◈ *AI COMMANDS*
├ .gpt
├ .gemini
├ .llama
├ .zoroai
├ .jeeves
├ .jeeves2
├ .perplexity
├ .xdash
├ .aoyo
├ .math
├ .aihelp

◈ *MEDIA DOWNLOAD - MUSIC/AUDIO*
├ .song
├ .play
├ .music
├ .ytmp3
├ .ringtone

◈ *MEDIA DOWNLOAD - VIDEO*
├ .video
├ .tiktok
├ .tt
├ .ytpost
├ .ytc
├ .movie
├ .series
├ .episode

◈ *SOCIAL MEDIA DOWNLOAD*
├ .instagram
├ .ig
├ .facebook
├ .fb
├ .spotify
├ .pindl
├ .tiktokstalk
├ .ttstalk

◈ *FILE DOWNLOAD*
├ .mediafire
├ .gdrive
├ .apk
├ .githubstalk
├ .gitclone
├ .repo

◈ *IMAGE SEARCH & TOOLS*
├ .img
├ .image
├ .getimage
├ .tophoto
├ .url2image
├ .urltoimage
├ .fetchimage
├ .imagefromurl
├ .urlimage
├ .simage

◈ *MEDIA MANIPULATION*
├ .sticker
├ .s
├ .stickercrop
├ .take
├ .steal
├ .emojimix
├ .removebg
├ .remini
├ .enhance
├ .blur
├ .attp
├ .screenshot
├ .ss
├ .tg
├ .stickertelegram
├ .vcf
├ .tovideo
├ .tovideo2
├ .tomp3
├ .toptt
├ .toaudio
├ .convert
├ .sticker2img
├ .stoimg
├ .s2i
├ .topdf
├ .pdf
├ .smeme
├ .viewonce
├ .vv

◈ *AUDIO EFFECTS*
├ .bass
├ .blown
├ .deep
├ .earrape
├ .fast
├ .fat
├ .nightcore
├ .reverse
├ .robot
├ .slow
├ .smooth
├ .tupai
├ .baby
├ .chipmunk
├ .demon
├ .radio

◈ *TEXT MAKER & EFFECTS*
├ .metallic
├ .ice
├ .snow
├ .impressive
├ .matrix
├ .light
├ .neon
├ .devil
├ .purple
├ .thunder
├ .leaves
├ .1997
├ .1917
├ .arena
├ .hacker
├ .sand
├ .blackpink
├ .glitch
├ .fire
├ .fancy
├ .font
├ .style
├ .dragonball
├ .naruto
├ .boom
├ .water
├ .underwater
├ .4d
├ .boken
├ .starnight
├ .gold
├ .xmd
├ .3d
├ .luxury
├ .american
├ .embroider
├ .foggyglass
├ .silver
├ .wetglass

◈ *GAMES*
├ .tictactoe
├ .ttt
├ .hangman
├ .trivia
├ .answer
├ .squidgame
├ .konami
├ .quiz
├ .q
├ .move
├ .surrender

◈ *FUN & INTERACTION*
├ .dare
├ .8ball
├ .compliment
├ .insult
├ .flirt
├ .character
├ .wasted
├ .ship
├ .simp
├ .stupid
├ .itssostupid
├ .iss
├ .lovetest
├ .aura
├ .compatibility
├ .animu
├ .anime
├ .nom
├ .poke
├ .cry
├ .kiss
├ .pat
├ .hug
├ .wink
├ .facepalm
├ .quote
├ .animequote
├ .aquote
├ .aniquote
├ .emoji
├ .pair
├ .link
├ .code

◈ *EMOJI ANIMATIONS*
├ .happy
├ .heart
├ .angry
├ .sad
├ .shy
├ .moon
├ .confused
├ .hot
├ .nikal

◈ *INFORMATION & TOOLS*
├ .ping
├ .ping2
├ .speed
├ .pong
├ .alive
├ .owner
├ .creator
├ .uptime
├ .runtime
├ .quote
├ .joke
├ .weather
├ .news
├ .lyrics
├ .define
├ .check
├ .country
├ .countryinfo
├ .topmembers
├ .top
├ .meme
├ .save
├ .webzip
├ .archive
├ .bothosting
├ .deploy
├ .hosting

◈ *MISCELLANEOUS IMAGE TOOLS*
├ .horny
├ .circle
├ .lgbt
├ .lied
├ .lolice
├ .simpcard
├ .tonikawa
├ .comrade
├ .gay
├ .glass
├ .jail
├ .passed
├ .triggered
├ .wanted
├ .robal

◈ *PIES & ANIME*
├ .indonesia
├ .japan
├ .korea
├ .hijab

╰──────◇ 

╔══════════════════════════╗
║  🔍 *USE*: ${prefix}command   ║
║  ✨ *Total*: 200+ Commands  ║
╚══════════════════════════╝`;

    await client.sendMessage(chatId, { 
        image: { url: HELP_IMG },
        caption: menu,
        contextInfo: {
            mentionedJid: [sender],
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363401269012709@newsletter',
                newsletterName: 'MAD-MAX',
                serverMessageId: 143
            }
        }
    }, { quoted: m });
};