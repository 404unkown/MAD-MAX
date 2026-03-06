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
    const pluginCount = 280;
    
    // Bot info header - your original style
    const header = `╔═══❖ *${botName}* ❖═══╗
║ ✦ *Owner* : ${ownerName}
║ ✦ *Prefix* : [ ${prefix} ]
║ ✦ *Host* : ${platform}
║ ✦ *Plugins* : ${pluginCount}+
║ ✦ *Mode* : Public
║ ✦ *Version* : ${version}
║ ✦ *RAM:* [${memoryBar}] ${memoryPercent}%
╚══════════════╝\n\n`;
    
    // Menu categories with your star format but organized like the example
    const menu = header + `╔═══❖ *OWNER/SUDO MENU* ❖═══╗
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
║ ★ .update2
║ ★ .checkupdate
║ ★ .herokuupdate
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
║ ★ .lastseen
║ ★ .statusprivacy
║ ★ .mystatus
║ ★ .storyprivacy
║ ★ .onlineprivacy
║ ★ .online
║ ★ .onlinesetting
║ ★ .profileprivacy
║ ★ .mypp
║ ★ .ppprivacy
║ ★ .groupprivacy
║ ★ .groupadd
║ ★ .addprivacy
║ ★ .bothosting
║ ★ .deploy
║ ★ .hosting
╚══════════════╝

╔═══❖ *GROUP ADMIN MENU* ❖═══╗
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

╔═══❖ *AI COMMANDS* ❖═══╗
║ ★ .gpt
║ ★ .gpt4
║ ★ .gpt4o
║ ★ .gemini
║ ★ .gemini2
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
║ ★ .groq
║ ★ .aihelp
╚══════════════╝

╔═══❖ *AI IMAGE GENERATION* ❖═══╗
║ ★ .dalle
║ ★ .dall
║ ★ .sd
║ ★ .stablediffusion
║ ★ .imagine
║ ★ .imagine2
║ ★ .img2img
║ ★ .editimage
║ ★ .aiedit
║ ★ .negro
║ ★ .black
║ ★ .blackfilter
╚══════════════╝

╔═══❖ *AI VOICE & EDITING* ❖═══╗
║ ★ .aitts
║ ★ .ttsai
║ ★ .speak
║ ★ .remini
║ ★ .enhance
║ ★ .dehaze
║ ★ .recolor
╚══════════════╝

╔═══❖ *DOWNLOAD MENU* ❖═══╗
║ ★ .play
║ ★ .song
║ ★ .music
║ ★ .ytmp3
║ ★ .video
║ ★ .tiktok
║ ★ .tt
║ ★ .tikdl
║ ★ .tiktokaudio
║ ★ .ttaudio
║ ★ .tikaudio
║ ★ .instagram
║ ★ .ig
║ ★ .igdl
║ ★ .facebook
║ ★ .fb
║ ★ .fbdl
║ ★ .twitter
║ ★ .tweet
║ ★ .twdl
║ ★ .spotify
║ ★ .sp
║ ★ .spotifydl
║ ★ .pindl
║ ★ .pinterest
║ ★ .pin
║ ★ .mediafire
║ ★ .mf
║ ★ .mfire
║ ★ .gdrive
║ ★ .gd
║ ★ .googledrive
║ ★ .apk
║ ★ .ringtone
║ ★ .rt
║ ★ .ringtonedl
║ ★ .alldl
║ ★ .download
║ ★ .get
╚══════════════╝

╔═══❖ *STALKER MENU* ❖═══╗
║ ★ .githubstalk
║ ★ .ghstalk
║ ★ .gitstalk
║ ★ .tiktokstalk
║ ★ .ttstalk
║ ★ .gitclone
║ ★ .repo
╚══════════════╝

╔═══❖ *IMAGE MENU* ❖═══╗
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
║ ★ .wallpaper
║ ★ .wp
║ ★ .wall
║ ★ .searchwall
╚══════════════╝

╔═══❖ *STICKER MENU* ❖═══╗
║ ★ .sticker
║ ★ .s
║ ★ .stickercrop
║ ★ .take
║ ★ .steal
║ ★ .emojimix
║ ★ .mix
║ ★ .stickersearch
║ ★ .ssearch
║ ★ .getsticker
║ ★ .tg
║ ★ .stickertelegram
║ ★ .tgsticker
║ ★ .telesticker
╚══════════════╝

╔═══❖ *MEDIA MANIPULATION* ❖═══╗
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
║ ★ .carbon
║ ★ .codeimg
║ ★ .carbonara
╚══════════════╝

╔═══❖ *AUDIO EFFECTS* ❖═══╗
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
╚══════════════╝

╔═══❖ *TEXT EFFECTS* ❖═══╗
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

╔═══❖ *CODE & COMPILE MENU* ❖═══╗
║ ★ .compile
║ ★ .run
║ ★ .execute
║ ★ .cpp
║ ★ .compilecpp
║ ★ .java
║ ★ .compilejava
║ ★ .js
║ ★ .compilejs
║ ★ .py
║ ★ .python
║ ★ .compilepy
║ ★ .obfuscate
║ ★ .obf
║ ★ .encryptjs
║ ★ .aicode
║ ★ .codeai
║ ★ .gencode
║ ★ .codegen
║ ★ .cgen
║ ★ .wormgpt
║ ★ .worm
║ ★ .wgpt
╚══════════════╝

╔═══❖ *GAMES MENU* ❖═══╗
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
║ ★ .quizz
║ ★ .move
║ ★ .surrender
║ ★ .chifumi
╚══════════════╝

╔═══❖ *FUN & INTERACTION* ❖═══╗
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
║ ★ .anime
║ ★ .animu
║ ★ .nom
║ ★ .poke
║ ★ .cry
║ ★ .kiss
║ ★ .pat
║ ★ .hug
║ ★ .wink
║ ★ .facepalm
║ ★ .animequote
║ ★ .aquote
║ ★ .aniquote
║ ★ .emoji
║ ★ .emojify
║ ★ .pair
║ ★ .gif
║ ★ .robal
║ ★ .repack
║ ★ .stickerpack
╚══════════════╝

╔═══❖ *EMOJI ANIMATIONS* ❖═══╗
║ ★ .happy
║ ★ .heart
║ ★ .angry
║ ★ .sad
║ ★ .shy
║ ★ .moon
║ ★ .confused
║ ★ .hot
║ ★ .nikal
╚══════════════╝

╔═══❖ *NOTES SYSTEM* ❖═══╗
║ ★ .notes
║ ★ .notes add title|content
║ ★ .notes list
║ ★ .notes view [id]
║ ★ .notes delete [id]
║ ★ .notes search [keyword]
║ ★ .notes clear
╚══════════════╝

╔═══❖ *INFORMATION MENU* ❖═══╗
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
║ ★ .bible
║ ★ .quran
║ ★ .surah
║ ★ .imdb
║ ★ .movie2
║ ★ .film
╚══════════════╝

╔═══❖ *MISC IMAGE TOOLS* ❖═══╗
║ ★ .horny
║ ★ .circle
║ ★ .lgbt
║ ★ .lied
║ ★ .lolice
║ ★ .tonikawa
║ ★ .comrade
║ ★ .gay
║ ★ .glass
║ ★ .jail
║ ★ .passed
║ ★ .triggered
║ ★ .wanted
║ ★ .misc
╚══════════════╝

╔═══❖ *PIES & ANIME* ❖═══╗
║ ★ .pies
║ ★ .china
║ ★ .indonesia
║ ★ .japan
║ ★ .korea
║ ★ .hijab
╚══════════════╝

╔═══❖ *AUTO FEATURES* ❖═══╗
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
╚══════════════╝

╔═══❖ *CURRENCY & FOREX* ❖═══╗
║ ★ .currencylist
║ ★ .currencies
║ ★ .rates
║ ★ .exchange
║ ★ .fx
║ ★ .currency
║ ★ .forex
║ ★ .forexnews
║ ★ .fxnews
║ ★ .fxexchange
║ ★ .forexexchange
║ ★ .exchangerate
║ ★ .fxpairs
║ ★ .forexpairs
║ ★ .pairforex
║ ★ .fxstatus
║ ★ .marketstatus
║ ★ .forexstatus
║ ★ .stocktickers
║ ★ .stockticks
║ ★ .tickers
╚══════════════╝

╔═══❖ *FOOTBALL LEAGUES* ❖═══╗
║ ★ .epl
║ ★ .premierleague
║ ★ .bundesliga
║ ★ .germanleague
║ ★ .bl1
║ ★ .laliga
║ ★ .pd
║ ★ .seriea
║ ★ .italianleague
║ ★ .sa
║ ★ .ligue1
║ ★ .frenchleague
║ ★ .fl1
║ ★ .matches
║ ★ .football
║ ★ .todaymatches
╚══════════════╝

╔═══❖ *UTILITY TOOLS* ❖═══╗
║ ★ .shorten
║ ★ .short
║ ★ .tinyurl
║ ★ .webcrawl
║ ★ .crawl
║ ★ .siteinfo
║ ★ .imagetoprompt
║ ★ .imgtoprompt
║ ★ .analyzeimg
║ ★ .logogen
║ ★ .createlogo
║ ★ .designlogo
║ ★ .transcribe
║ ★ .to text
║ ★ .trans
║ ★ .google
║ ★ .search
║ ★ .gsearch
║ ★ .wiki
║ ★ .wikipedia
║ ★ .searchwiki
║ ★ .npm
║ ★ .npmsearch
║ ★ .npmjs
║ ★ .musicid
║ ★ .recognize
║ ★ .whatsong
║ ★ .tempmail
║ ★ .tempemail
║ ★ .createtemp
║ ★ .tempinbox
║ ★ .checkmail
║ ★ .tempmessages
╚══════════════╝

╔═══════════════════════════════
║     ✦ *USE*: ${prefix}command ✦     
║     ✨ *Don't forget to fork* ✨           
║     👤 *Owner*: ${ownerName}              
╚═══════════════════════════════`;

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