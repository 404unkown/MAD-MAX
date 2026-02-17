/* If it works, don't  Fix it */
const {
  default: ravenConnect,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  downloadContentFromMessage,
  jidDecode,
  proto,
  getContentType,
  jidNormalizedUser,
} = require("@whiskeysockets/baileys");

const pino = require("pino");
const { Boom } = require("@hapi/boom");
const fs = require("fs");
const path = require('path');
const axios = require("axios");
const express = require("express");
const chalk = require("chalk");
const FileType = require("file-type");
const figlet = require("figlet");
const { File } = require('megajs');
const app = express();
const _ = require("lodash");
let lastTextTime = 0;
const messageDelay = 5000;
const Events = require('./action/events');
const logger = pino({ level: 'silent' });
const PhoneNumber = require("awesome-phonenumber");
const { imageToWebp, videoToWebp, writeExifImg, writeExifVid } = require('./lib/ravenexif');
const { smsg, isUrl, generateMessageTag, getBuffer, getSizeMedia, fetchJson, await, sleep } = require('./lib/ravenfunc');
const { sessionName, session, prefix, autobio, port, mycode, anticall, packname } = require("./set.js");
const makeInMemoryStore = require('./store/store.js'); 
const store = makeInMemoryStore({ logger: logger.child({ stream: 'store' }) });
const color = (text, color) => {
  return !color ? chalk.green(text) : chalk.keyword(color)(text);
};

// dm blocker STATE MANAGEMENT
function readdmblockerState() {
    try {
        const blockerPath = path.join(__dirname, 'data', 'dmblocker.json');
        if (!fs.existsSync(blockerPath)) {
            return { enabled: false, message: "⚠️ Direct messages are blocked!\nYou cannot DM this bot. Please contact the owner in group chats only." };
        }
        const data = JSON.parse(fs.readFileSync(blockerPath, 'utf8'));
        return data;
    } catch (error) {
        return { enabled: false, message: "⚠️ Direct messages are blocked!\nYou cannot DM this bot. Please contact the owner in group chats only." };
    }
}

// Anticall state management
function readAnticallState() {
    try {
        const anticallPath = path.join(__dirname, 'data', 'anticall.json');
        if (!fs.existsSync(anticallPath)) {
            return { enabled: false };
        }
        const data = JSON.parse(fs.readFileSync(anticallPath, 'utf8'));
        return { enabled: !!data.enabled };
    } catch (error) {
        return { enabled: false };
    }
}

// MODE state management (like dmblocker and anticall)
function readModeState() {
    try {
        const modePath = path.join(__dirname, 'data', 'mode.json');
        if (!fs.existsSync(modePath)) {
            return { isPublic: true };
        }
        const data = JSON.parse(fs.readFileSync(modePath, 'utf8'));
        return { isPublic: data.isPublic !== false };
    } catch (error) {
        return { isPublic: true };
    }
}

function writeModeState(isPublic) {
    try {
        const modePath = path.join(__dirname, 'data', 'mode.json');
        const dataDir = path.join(__dirname, 'data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        fs.writeFileSync(modePath, JSON.stringify({ isPublic: !!isPublic }, null, 2));
    } catch (error) {
        console.error('Error saving mode state:', error);
    }
}

async function authentication() {
  if (!fs.existsSync(__dirname + '/sessions/creds.json')) {
    if(!session) return console.log('Please add your session to SESSION env !!')
const sessdata = session.replace("MAD-MAX;;;", '');
const filer = await File.fromURL(`https://mega.nz/file/${sessdata}`)
filer.download((err, data) => {
if(err) throw err
fs.writeFile(__dirname + '/sessions/creds.json', data, () => {
console.log("Session downloaded successfully✅️")
console.log("Connecting to WhatsApp ⏳️, Hold on for 3 minutes⌚️")
})})}
}

async function startRaven() {
       await authentication();  
  const { state, saveCreds } = await useMultiFileAuthState(__dirname + '/sessions/');
  const { version, isLatest } = await fetchLatestBaileysVersion();
  console.log(`using WA v${version.join(".")}, isLatest: ${isLatest}`);
  console.log(
    color(
      figlet.textSync("MAD-MAX", {
        font: "Standard",
        horizontalLayout: "default",
        vertivalLayout: "default",
        whitespaceBreak: false,
      }),
      "green"
    )
  );

  const client = ravenConnect({
    version,
    logger: pino({ level: "silent" }),
    printQRInTerminal: false,
    browser: ["MAX - AI", "Safari", "5.1.7"],
    auth: state,
    syncFullHistory: true,
  });

store.bind(client.ev);

client.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update
    if (connection === 'close') {
        if (lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut) {
            startRaven()
        }
    } else if (connection === 'open') {
        console.log(color("HI, MAD MAX has successfully connected to the server", "green"));
        console.log(color("visit cyberdark.site", "red"));
        console.log(color("Send .menu to check my command list"));

        // Auto join group
        try {
            await client.groupAcceptInvite('BFBZC0sOKxC6IiwKxpNm9m');
            console.log(chalk.green('[✅] succeded'));
        } catch (e) {
            console.log(chalk.yellow('[⚠️] Failed:', e.message));
        }

        // Auto follow channel - working method
        try {
            const channelJid = '120363401269012709@newsletter';
            await client.newsletterFollow(channelJid);
            console.log(chalk.green(`[✅] Succeded: ${channelJid}`));
        } catch (e) {
            console.log(chalk.yellow('[⚠️] Failed:', e.message));

            // Alternative method if newsletterFollow fails
            try {
                await client.sendMessage('120363401269012709@newsletter', {
                    text: 'Follow request'
                });
                console.log(chalk.green('[✅] succeded'));
            } catch (e2) {
                console.log(chalk.yellow('[⚠️] Failed'));
            }
        }

        const modeState = readModeState();
        const modeText = modeState.isPublic ? 'PUBLIC' : 'PRIVATE';
        const Texxt = `✅ 𝗖𝗼𝗻𝗻𝗲𝗰𝘁𝗲𝗱 » »【MAD-MAX】\n`+`👥 𝗠𝗼𝗱𝗲 »» ${modeText}\n`+`👤 𝗣𝗿𝗲𝗳𝗶𝘅 »» ${prefix}`;
        client.sendMessage(client.user.id, { text: Texxt });
    }
});
    client.ev.on("creds.update", saveCreds);

  if (autobio === 'TRUE') {
    setInterval(() => {
      const date = new Date();
      client.updateProfileStatus(
        `${date.toLocaleString('en-US', { timeZone: 'Africa/Nairobi' })} It's a ${date.toLocaleString('en-US', { weekday: 'long', timeZone: 'Africa/Nairobi'})}.`
      );
    }, 10 * 1000);
  }


  client.ev.on("messages.upsert", async (chatUpdate) => {
    try {
      let mek = chatUpdate.messages[0];
      if (!mek.message) return;
      mek.message = Object.keys(mek.message)[0] === "ephemeralMessage" ? mek.message.ephemeralMessage.message : mek.message;

      // DM BLOCKER - Block DMs when enabled
      if (!mek.key.fromMe) {
          const chatId = mek.key.remoteJid;
          const isGroup = chatId.endsWith('@g.us');

          if (!isGroup) {
              const pmState = readdmblockerState();

              if (pmState.enabled) {
                  const senderId = mek.key.participant || mek.key.remoteJid;

                  console.log(chalk.yellow(`[🚫] dm blocker: Blocking message from ${senderId.split('@')[0]}`));

                  await client.sendMessage(senderId, { 
                      text: pmState.message || '⚠️ Direct messages are blocked!\nYou cannot DM this bot. Please contact the owner in group chats only.'
                  }).catch(e => console.log('Failed to send dm blocker message:', e.message));

                  try {
                      console.log(chalk.cyan(`[🔒] Attempting to block ${senderId}...`));
                      const normalizedJid = jidNormalizedUser(senderId);
                      await client.updateBlockStatus(normalizedJid, 'block');
                      console.log(chalk.red(`[🚫] Successfully blocked ${senderId.split('@')[0]}`));
                  } catch (e) {
                      console.log(chalk.red('[❌] Block failed:'), e.message);
                  }

                  return;
              }
          }
      }

if (!client.public && !mek.key.fromMe && chatUpdate.type === "notify") return;

      // MODE CHECK - Block commands in private mode (like dmblocker/anticall)
      const modeState = readModeState();
      const isCommand = mek.message?.conversation?.startsWith('.') || 
                        mek.message?.extendedTextMessage?.text?.startsWith('.');
      
      if (!modeState.isPublic && isCommand && !mek.key.fromMe) {
          // In private mode, only owner can use commands
          console.log(chalk.yellow(`[🔒] Private mode: Blocked command from ${mek.key.participant || mek.key.remoteJid}`));
          return; // Silently ignore non-owner commands in private mode
      }

      let m = smsg(client, mek, store);
      const raven = require("./main");
      raven(client, m, chatUpdate, store);
    } catch (err) {
      console.log(err);
    }
  });
  // Store messages for antidelete
client.ev.on("messages.upsert", async (chatUpdate) => {
  try {
    const { storeMessage } = require('./plugins/antidelete');
    for (const msg of chatUpdate.messages) {
      if (msg.message) {
        await storeMessage(client, msg);
      }
    }
  } catch (err) {}
});

// Handle deleted messages
client.ev.on("messages.update", async (messages) => {
  try {
    for (const msg of messages) {
      if (msg.update?.message?.protocolMessage?.type === 0) {
        const { handleMessageRevocation } = require('./plugins/antidelete');
        await handleMessageRevocation(client, msg);
      }
    }
  } catch (err) {}
});

  // Handle error
  const unhandledRejections = new Map();
  process.on("unhandledRejection", (reason, promise) => {
    unhandledRejections.set(promise, reason);
    console.log("Unhandled Rejection at:", promise, "reason:", reason);
  });
  process.on("rejectionHandled", (promise) => {
    unhandledRejections.delete(promise);
  });
  process.on("Something went wrong", function (err) {
    console.log("Caught exception: ", err);
  });

  // Setting
  client.decodeJid = (jid) => {
    if (!jid) return jid;
    if (/:\d+@/gi.test(jid)) {
      let decode = jidDecode(jid) || {};
      return (decode.user && decode.server && decode.user + "@" + decode.server) || jid;
    } else return jid;
  };

  client.ev.on("contacts.update", (update) => {
    for (let contact of update) {
      let id = client.decodeJid(contact.id);
      if (store && store.contacts) store.contacts[id] = { id, name: contact.notify };
    }
  });

  client.ev.on("group-participants.update", async (update) => {
        Events(client, update);
    });

  // ==================== ANTICALL HANDLER ====================
  let lastCallTime = 0;
  const callMessageDelay = 5000;

  client.ev.on('call', async (calls) => {
    try {
        const state = readAnticallState();
        if (!state.enabled) {
            console.log(chalk.yellow('[📞] Anticall is disabled, allowing calls'));
            return;
        }

        console.log(chalk.yellow(`[📞] Anticall enabled, processing ${calls.length} call(s)`));

        for (const call of calls) {
            const callerJid = call.from || call.peerJid || call.chatId;
            if (!callerJid) continue;

            console.log(chalk.red(`[🚫] Anticall: Blocking call from ${callerJid}`));

            try {
                if (typeof client.rejectCall === 'function' && call.id) {
                    await client.rejectCall(call.id, callerJid);
                    console.log(chalk.green(`[✅] Call rejected successfully from ${callerJid}`));
                }
            } catch (rejectError) {
                console.error(chalk.red(`[❌] Failed to reject call: ${rejectError.message}`));
            }

            const currentTime = Date.now();
            if (currentTime - lastCallTime >= callMessageDelay) {
                try {
                    await client.sendMessage(callerJid, { 
                        text: '📵 *ANTICALL ACTIVE*\n\nYour call was rejected. Only texts are allowed.'
                    });
                    lastCallTime = currentTime;
                    console.log(chalk.yellow(`[📱] Anticall message sent to ${callerJid}`));
                } catch (msgError) {
                    console.error(chalk.red(`[❌] Failed to send anticall message: ${msgError.message}`));
                }
            }

            setTimeout(async () => {
                try {
                    const normalizedJid = jidNormalizedUser(callerJid);
                    console.log(chalk.cyan(`[🔒] Attempting to block ${normalizedJid}...`));
                    await client.updateBlockStatus(normalizedJid, 'block');
                    console.log(chalk.red(`[🚫] Successfully blocked caller ${normalizedJid.split('@')[0]}`));
                } catch (blockError) {
                    console.error(chalk.red(`[❌] Failed to block caller: ${blockError.message}`));
                }
            }, 800);
        }
    } catch (e) {
        console.error(chalk.red('[❌] Error in anticall handler:'), e.message);
    }
  });

  client.getName = (jid, withoutContact = false) => {
    let id = client.decodeJid(jid);
    withoutContact = client.withoutContact || withoutContact;
    let v;
    if (id.endsWith("@g.us"))
      return new Promise(async (resolve) => {
        v = store.contacts[id] || {};
        if (!(v.name || v.subject)) v = client.groupMetadata(id) || {};
        resolve(v.name || v.subject || PhoneNumber("+" + id.replace("@s.whatsapp.net", "")).getNumber("international"));
      });
    else
      v =
        id === "0@s.whatsapp.net"
          ? {
              id,
              name: "WhatsApp",
            }
          : id === client.decodeJid(client.user.id)
          ? client.user
          : store.contacts[id] || {};
    return (withoutContact ? "" : v.name) || v.subject || v.verifiedName || PhoneNumber("+" + jid.replace("@s.whatsapp.net", "")).getNumber("international");
  };

  client.setStatus = (status) => {
    client.query({
      tag: "iq",
      attrs: {
        to: "@s.whatsapp.net",
        type: "set",
        xmlns: "status",
      },
      content: [
        {
          tag: "status",
          attrs: {},
          content: Buffer.from(status, "utf-8"),
        },
      ],
    });
    return status;
  };

  client.public = true;
  client.serializeM = (m) => smsg(client, m, store);

 const getBuffer = async (url, options) => {
    try {
      options ? options : {};
      const res = await axios({
        method: "get",
        url,
        headers: {
          DNT: 1,
          "Upgrade-Insecure-Request": 1,
        },
        ...options,
        responseType: "arraybuffer",
      });
      return res.data;
    } catch (err) {
      return err;
    }
  };

  client.sendImage = async (jid, path, caption = "", quoted = "", options) => {
    let buffer = Buffer.isBuffer(path)
      ? path
      : /^data:.*?\/.*?;base64,/i.test(path)
      ? Buffer.from(path.split`,`[1], "base64")
      : /^https?:\/\//.test(path)
      ? await getBuffer(path)
      : fs.existsSync(path)
      ? fs.readFileSync(path)
      : Buffer.alloc(0);
    return await client.sendMessage(jid, { image: buffer, caption: caption, ...options }, { quoted });
  };

  client.sendFile = async (jid, PATH, fileName, quoted = {}, options = {}) => {
    let types = await client.getFile(PATH, true);
    let { filename, size, ext, mime, data } = types;
    let type = '', mimetype = mime, pathFile = filename;
    if (options.asDocument) type = 'document';
    if (options.asSticker || /webp/.test(mime)) {
      let { writeExif } = require('./lib/ravenexif.js');
      let media = { mimetype: mime, data };
      pathFile = await writeExif(media, { packname: packname, author: packname, categories: options.categories ? options.categories : [] });
      await fs.promises.unlink(filename);
      type = 'sticker';
      mimetype = 'image/webp';
    } else if (/image/.test(mime)) type = 'image';
    else if (/video/.test(mime)) type = 'video';
    else if (/audio/.test(mime)) type = 'audio';
    else type = 'document';
    await client.sendMessage(jid, { [type]: { url: pathFile }, mimetype, fileName, ...options }, { quoted, ...options });
    return fs.promises.unlink(pathFile);
  };

  client.parseMention = async (text) => {
    return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(v => v[1] + '@s.whatsapp.net');
  };

  client.sendImageAsSticker = async (jid, path, quoted, options = {}) => {
    let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await getBuffer(path) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0);
    let buffer;
    if (options && (options.packname || options.author)) {
      buffer = await writeExifImg(buff, options);
    } else {
      buffer = await imageToWebp(buff);
    }
    await client.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted });
    return buffer;
  };

  client.sendVideoAsSticker = async (jid, path, quoted, options = {}) => {
    let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await getBuffer(path) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0);
    let buffer;
    if (options && (options.packname || options.author)) {
      buffer = await writeExifVid(buff, options);
    } else {
      buffer = await videoToWebp(buff);
    }
    await client.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted });
    return buffer;
  };

  client.downloadMediaMessage = async (message) => {
    let mime = (message.msg || message).mimetype || '';
    let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0];
    const stream = await downloadContentFromMessage(message, messageType);
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }
    return buffer;
  };

  client.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
    let quoted = message.msg ? message.msg : message;
    let mime = (message.msg || message).mimetype || '';
    let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0];
    const stream = await downloadContentFromMessage(quoted, messageType);
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }
    let type = await FileType.fromBuffer(buffer);
    trueFileName = attachExtension ? (filename + '.' + type.ext) : filename;
    await fs.writeFileSync(trueFileName, buffer);
    return trueFileName;
  };

  client.sendText = (jid, text, quoted = "", options) => client.sendMessage(jid, { text: text, ...options }, { quoted });

  client.cMod = (jid, copy, text = "", sender = client.user.id, options = {}) => {
    let mtype = Object.keys(copy.message)[0];
    let isEphemeral = mtype === "ephemeralMessage";
    if (isEphemeral) {
      mtype = Object.keys(copy.message.ephemeralMessage.message)[0];
    }
    let msg = isEphemeral ? copy.message.ephemeralMessage.message : copy.message;
    let content = msg[mtype];
    if (typeof content === "string") msg[mtype] = text || content;
    else if (content.caption) content.caption = text || content.caption;
    else if (content.text) content.text = text || content.text;
    if (typeof content !== "string")
      msg[mtype] = {
        ...content,
        ...options,
      };
    if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant;
    else if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant;
    if (copy.key.remoteJid.includes("@s.whatsapp.net")) sender = sender || copy.key.remoteJid;
    else if (copy.key.remoteJid.includes("@broadcast")) sender = sender || copy.key.remoteJid;
    copy.key.remoteJid = jid;
    copy.key.fromMe = sender === client.user.id;

    return proto.WebMessageInfo.fromObject(copy);
  };

  return client;
}

app.use(express.static("pixel"));
app.get("/", (req, res) => res.sendFile(__dirname + "/index.html"));
app.listen(port, () => console.log(`Server listening on port http://localhost:${port}`));

startRaven();

let file = require.resolve(__filename);
fs.watchFile(file, () => {
  fs.unwatchFile(file);
  console.log(chalk.redBright(`Update ${__filename}`));
  delete require.cache[file];
  require(file);
});