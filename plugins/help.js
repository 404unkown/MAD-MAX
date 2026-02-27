module.exports = async (client, chatId, m, args, sender, pushName) => {
    const config = require('../set');
    const prefix = config.prefix || '.';
    const ownerName = config.ownername || 'NUCH';
    const botName = config.botname || 'MAD-MAX';
    const version = config.version || '2.0.0';
    
    // Get platform info
    let platform = 'Local';
    if (process.env.RAILWAY_STATIC_URL) platform = 'Railway';
    else if (process.env.HEROKU_APP_NAME) platform = 'Heroku';
    else if (process.env.REPLIT_DB_URL) platform = 'Replit';
    else if (process.env.RENDER) platform = 'Render';
    
    // Get memory usage
    const memoryUsage = process.memoryUsage();
    const usedMemoryMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
    const totalMemoryMB = Math.round(memoryUsage.heapTotal / 1024 / 1024);
    const memoryPercent = Math.round((usedMemoryMB / totalMemoryMB) * 100);
    
    // Create memory bar
    const barLength = 10;
    const filledBars = Math.round((memoryPercent / 100) * barLength);
    const emptyBars = barLength - filledBars;
    const memoryBar = '█'.repeat(filledBars) + '░'.repeat(emptyBars);
    
    // Count plugins (approximate)
    const pluginCount = 260;
    
    // Bot info header
    const header = `╔═══❖ *${botName}* ❖═══╗
║ ✦ *Owner* : ${ownerName}
║ ✦ *Prefix* : [ ${prefix} ]
║ ✦ *Host* : ${platform}
║ ✦ *Plugins* : ${pluginCount}+
║ ✦ *Mode* : Public
║ ✦ *Version* : ${version}
║ ✦ *RAM:* [${memoryBar}] ${memoryPercent}%
╚══════════════╝\n\n`;
    
    const menu = header + `╔═══❖ *OWNER/SUDO* ❖
║ ★ .mode
║ ★ .autostatus
║ ★ .antidelete
║ ★ .setpp
║ ★ .autotyping
║ ★ .autoread
║ ★ .dmblocker
║ ★ .autosticker
║ ★ .autorecording
║ ★ .autovoice
║ ★ .anticall
║ ★ .block
║ ★ .unblock
║ ★ .autoreply
║ ★ .sudo
║ ★ .update
║ ★ .settings
║ ★ .newsletter
║ ★ .hack
║ ★ .antispam
║ ★ .autotext
║ ★ .restart
║ ★ .fancy
║ ★ .autobio
║ ★ .bio
║ ★ .areact
║ ★ .autoreaction
║ ★ .autoreact
╚══════════════╝

╔═══❖ *ADMIN* ❖═══
║ ★ .kick
║ ★ .promote
║ ★ .demote
║ ★ .mute
║ ★ .unmute
║ ★ .unban
║ ★ .tagall
║ ★ .tagnotadmin
║ ★ .hidetag
║ ★ .tag
║ ★ .antilink
║ ★ .antitag
║ ★ .antibadword
║ ★ .welcome
║ ★ .goodbye
║ ★ .setgdesc
║ ★ .setgname
║ ★ .setgpp
║ ★ .clear
║ ★ .warn
║ ★ .warnings
║ ★ .resetlink
║ ★ .staff
║ ★ .groupinfo
║ ★ .lockgc
║ ★ .unlockgc
║ ★ .poll
║ ★ .requestlist
║ ★ .acceptall
║ ★ .rejectall
║ ★ .grouptime
║ ★ .online
║ ★ .add
║ ★ .a
║ ★ .invite
║ ★ .join
║ ★ .joinme
║ ★ .f_join
║ ★ .leave
║ ★ .left
║ ★ .leftgc
║ ★ .leavegc
║ ★ .newgc
║ ★ .removemembers
║ ★ .kickall
║ ★ .endgc
║ ★ .endgroup
║ ★ .removeadmins
║ ★ .kickadmins
║ ★ .kickall3
║ ★ .deladmins
║ ★ .removeall2
║ ★ .kickall2
║ ★ .endgc2
║ ★ .endgroup2
║ ★ .antistatus
║ ★ .antistatusmention
║ ★ .antisticker
║ ★ .antistick
╚══════════════╝

╔═══❖ *AI* ❖═══
║ ★ .gpt
║ ★ .gpt4
║ ★ .gemini
║ ★ .bard
║ ★ .llama
║ ★ .blackbox
║ ★ .zoroai
║ ★ .jeeves
║ ★ .jeeves2
║ ★ .perplexity
║ ★ .xdash
║ ★ .aoyo
║ ★ .math
║ ★ .aihelp
║ ★ .metaai
╚══════════╝

╔═══❖ *AI IMAGE* ❖
║ ★ .dalle
║ ★ .dall
║ ★ .sd
║ ★ .stablediffusion
║ ★ .imagine
║ ★ .imagine2
╚══════════════╝

╔═══❖ *AI VOICE* ❖
║ ★ .aitts
║ ★ .ttsai
║ ★ .speak
║ ★ .remini
║ ★ .enhance
║ ★ .dehaze
║ ★ .recolor
╚══════════════╝

╔═══❖ *DOWNLOAD* ❖═══
║ ★ .song
║ ★ .play
║ ★ .music
║ ★ .ytmp3
║ ★ .video
║ ★ .tiktok
║ ★ .tt
║ ★ .tikdl
║ ★ .ytpost
║ ★ .ytc
║ ★ .movie
║ ★ .series
║ ★ .episode
║ ★ .instagram
║ ★ .ig
║ ★ .igdl
║ ★ .facebook
║ ★ .fb
║ ★ .fbdl
║ ★ .fb2
║ ★ .facebook2
║ ★ .fb3
║ ★ .facebook3
║ ★ .spotify
║ ★ .pindl
║ ★ .pinterest
║ ★ .pin
║ ★ .tiktokstalk
║ ★ .ttstalk
║ ★ .mediafire
║ ★ .gdrive
║ ★ .gd
║ ★ .googledrive
║ ★ .apk
║ ★ .githubstalk
║ ★ .ghstalk
║ ★ .gitstalk
║ ★ .gitclone
║ ★ .repo
║ ★ .ringtone
║ ★ .rt
║ ★ .ringtonedl
║ ★ .twitter
║ ★ .tweet
║ ★ .twdl
╚══════════════╝

╔═══❖ *IMAGE* ❖══
║ ★ .img
║ ★ .image
║ ★ .imagesearch
║ ★ .getimage
║ ★ .tophoto
║ ★ .url2image
║ ★ .urltoimage
║ ★ .fetchimage
║ ★ .imagefromurl
║ ★ .urlimage
║ ★ .simage
╚══════════╝

╔═══❖ *SEARCH* ❖═══
║ ★ .wallpaper [query]
║ ★ .wp [query]
║ ★ .wall [query]
║ ★ .searchwall [query]
╚══════════════╝

╔═══❖ *MEDIA* ❖═══
║ ★ .sticker
║ ★ .s
║ ★ .stickercrop
║ ★ .take
║ ★ .steal
║ ★ .emojimix
║ ★ .mix
║ ★ .removebg
║ ★ .rmbg
║ ★ .remini
║ ★ .enhance
║ ★ .hd
║ ★ .blur
║ ★ .attp
║ ★ .screenshot
║ ★ .ss
║ ★ .ssweb
║ ★ .tg
║ ★ .stickertelegram
║ ★ .tgsticker
║ ★ .telesticker
║ ★ .vcf
║ ★ .tovideo
║ ★ .tovideo2
║ ★ .tomp3
║ ★ .toptt
║ ★ .toaudio
║ ★ .convert
║ ★ .sticker2img
║ ★ .stoimg
║ ★ .stickertoimage
║ ★ .s2i
║ ★ .topdf
║ ★ .pdf
║ ★ .smeme
║ ★ .memesticker
║ ★ .viewonce
║ ★ .vv
║ ★ .webzip
║ ★ .archive
╚══════════════╝

╔═══❖ *AUDIO EFFECTS* ❖
║ ★ .bass
║ ★ .blown
║ ★ .deep
║ ★ .earrape
║ ★ .fast
║ ★ .fat
║ ★ .nightcore
║ ★ .reverse
║ ★ .robot
║ ★ .slow
║ ★ .smooth
║ ★ .tupai
║ ★ .baby
║ ★ .chipmunk
║ ★ .demon
║ ★ .radio
║ ★ .audiohelp
║ ★ .ahelp
║ ★ .effects
╚══════════╝

╔═══❖ *TEXT EFFECTS* ❖
║ ★ .metallic
║ ★ .ice
║ ★ .snow
║ ★ .impressive
║ ★ .matrix
║ ★ .light
║ ★ .neon
║ ★ .devil
║ ★ .purple
║ ★ .thunder
║ ★ .leaves
║ ★ .1997
║ ★ .1917
║ ★ .arena
║ ★ .hacker
║ ★ .sand
║ ★ .blackpink
║ ★ .glitch
║ ★ .fire
║ ★ .fancy
║ ★ .font
║ ★ .style
║ ★ .dragonball
║ ★ .naruto
║ ★ .boom
║ ★ .water
║ ★ .underwater
║ ★ .4d
║ ★ .boken
║ ★ .starnight
║ ★ .gold
║ ★ .xmd
║ ★ .3d
║ ★ .luxury
║ ★ .american
║ ★ .embroider
║ ★ .foggyglass
║ ★ .silver
║ ★ .wetglass
╚══════════════╝

╔═══❖ *GAMES* ❖═══
║ ★ .tictactoe
║ ★ .ttt
║ ★ .hangman
║ ★ .hm
║ ★ .trivia
║ ★ .answer
║ ★ .squidgame
║ ★ .sg
║ ★ .squid
║ ★ .konami
║ ★ .match
║ ★ .versus
║ ★ .quiz
║ ★ .q
║ ★ .move
║ ★ .surrender
║ ★ .chifumi
║ ★ .quizz
╚══════════╝

╔═══❖ *FUN* ❖═══
║ ★ .dare
║ ★ .truth
║ ★ .8ball
║ ★ .eightball
║ ★ .compliment
║ ★ .compli
║ ★ .insult
║ ★ .roast
║ ★ .flirt
║ ★ .pickup
║ ★ .pickupline
║ ★ .character
║ ★ .char
║ ★ .analyze
║ ★ .wasted
║ ★ .ship
║ ★ .match
║ ★ .simp
║ ★ .simpcard
║ ★ .stupid
║ ★ .itssostupid
║ ★ .iss
║ ★ .lovetest
║ ★ .love
║ ★ .aura
║ ★ .compatibility
║ ★ .compat
║ ★ .animu
║ ★ .anime
║ ★ .nom
║ ★ .poke
║ ★ .cry
║ ★ .kiss
║ ★ .pat
║ ★ .hug
║ ★ .wink
║ ★ .facepalm
║ ★ .quote
║ ★ .animequote
║ ★ .aquote
║ ★ .aniquote
║ ★ .emoji
║ ★ .emojify
║ ★ .pair
║ ★ .link
║ ★ .code
║ ★ .gif
║ ★ .robal
║ ★ .repack
║ ★ .stickerpack
║ ★ .xvideo
║ ★ .hentai
║ ★ .xnn
║ ★ .xxx
╚══════════════

╔═══❖ *ANIMATIONS* ❖
║ ★ .happy
║ ★ .heart
║ ★ .angry
║ ★ .sad
║ ★ .shy
║ ★ .moon
║ ★ .confused
║ ★ .hot
║ ★ .nikal
╚══════════╝

╔═══❖ *NOTES* ❖
║ ★ .notes
║ ★ .notes add title|content
║ ★ .notes list
║ ★ .notes view [id]
║ ★ .notes delete [id]
║ ★ .notes search [keyword]
║ ★ .notes clear (owner only)
╚══════════════╝

╔═══❖ *INFORMATION* ❖
║ ★ .ping
║ ★ .ping2
║ ★ .speed
║ ★ .pong
║ ★ .alive
║ ★ .owner
║ ★ .creator
║ ★ .dev
║ ★ .uptime
║ ★ .runtime
║ ★ .quote
║ ★ .quotes
║ ★ .joke
║ ★ .dadjoke
║ ★ .weather
║ ★ .news
║ ★ .headlines
║ ★ .lyrics
║ ★ .lyric
║ ★ .songlyrics
║ ★ .define
║ ★ .dictionary
║ ★ .meaning
║ ★ .check
║ ★ .country
║ ★ .countryinfo
║ ★ .cinfo
║ ★ .topmembers
║ ★ .top
║ ★ .meme
║ ★ .save
║ ★ .dl
║ ★ .bothosting
║ ★ .deploy
║ ★ .hosting
║ ★ .bible
║ ★ .quran
║ ★ .surah
╚══════════════╝

╔═══❖ *IMAGE TOOlS* ❖
║ ★ .horny
║ ★ .circle
║ ★ .lgbt
║ ★ .lied
║ ★ .lolice
║ ★ .simpcard
║ ★ .tonikawa
║ ★ .comrade
║ ★ .gay
║ ★ .glass
║ ★ .jail
║ ★ .passed
║ ★ .triggered
║ ★ .wanted
║ ★ .robal
║ ★ .misc
╚══════════════╝

╔═══❖ *PIES & ANIME* ❖
║ ★ .pies
║ ★ .china
║ ★ .indonesia
║ ★ .japan
║ ★ .korea
║ ★ .hijab
╚══════════

╔═══❖ *AUTO FEATURES* ❖
║ ★ .autotyping
║ ★ .autotype
║ ★ .autoread
║ ★ .autoreply
║ ★ .autovoice
║ ★ .autosticker
║ ★ .autotext
║ ★ .autostatus
║ ★ .autostatusreact
║ ★ .setemoji
║ ★ .statusdelay
║ ★ .statusbl
║ ★ .autorecording
║ ★ .autorecord
║ ★ .anticall
║ ★ .dmblocker
║ ★ .antispam
║ ★ .antidelete
║ ★ .antidel
║ ★ .anti-delete
║ ★ .areact
║ ★ .autoreaction
║ ★ .autoreact
║ ★ .autobio
║ ★ .bio
╚════════════`;

    // Send as text only
    await client.sendMessage(chatId, { 
        text: menu,
        contextInfo: {
            mentionedJid: [sender],
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363401269012709@newsletter',
                newsletterName: botName,
                serverMessageId: 143
            }
        }
    }, { quoted: m });
};