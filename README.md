# 🤖 MAD-MAX WhatsApp Bot

<div align="center">
  <img src="https://files.catbox.moe/4gjzv5.png" alt="MAD-MAX Logo" width="300"/>
  <br>
  <strong>A powerful multi-device WhatsApp bot with 250+ commands</strong>
</div>

<p align="center">
  <a href="https://github.com/404unkown/MAD-MAX/stargazers">
    <img src="https://img.shields.io/github/stars/404unkown/MAD-MAX?style=for-the-badge&color=red"/>
  </a>
  <a href="https://github.com/404unkown/MAD-MAX/network/members">
    <img src="https://img.shields.io/github/forks/404unkown/MAD-MAX?style=for-the-badge&color=red"/>
  </a>
  <a href="https://github.com/404unkown/MAD-MAX/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/404unkown/MAD-MAX?style=for-the-badge&color=red"/>
  </a>
  <a href="https://github.com/404unkown/MAD-MAX/issues">
    <img src="https://img.shields.io/github/issues/404unkown/MAD-MAX?style=for-the-badge&color=red"/>
  </a>
</p>

<p align="center">
  <a href="https://whatsapp.com/channel/120363401269012709">
    <img src="https://img.shields.io/badge/Join-Channel-25D366?style=for-the-badge&logo=whatsapp"/>
  </a>
  <a href="https://wa.me/254104158915">
    <img src="https://img.shields.io/badge/Contact-Owner-25D366?style=for-the-badge&logo=whatsapp"/>
  </a>
</p>

---

## 📋 Features

- ✅ **250+ Commands** - Group management, downloads, AI, games, and more
- ✅ **Multi-Device Support** - Works with WhatsApp multi-device
- ✅ **Auto Status View** - Automatically views status updates (toggle with `.autostatus`)
- ✅ **Anti-Link Protection** - Remove links from groups
- ✅ **Anti-Bad Word** - Filter inappropriate language
- ✅ **Downloader** - TikTok, Instagram, Facebook, YouTube
- ✅ **AI Integration** - GPT, Gemini, Llama, and more
- ✅ **Games** - Tic-tac-toe, hangman, trivia, quiz, rock-paper-scissors
- ✅ **Audio Effects** - Bass, nightcore, reverse, robot voice, and more
- ✅ **Sticker Maker** - Create stickers from images/videos
- ✅ **Auto Voice Reply** - Respond to keywords with voice notes
- ✅ **Real-time Status Dashboard** - Monitor bot uptime, memory, and response time

---

## 🔐 Pairing Site

Get your session ID quickly and easily with our pairing site:

<div align="center">
  <a href="https://pair-web-1.onrender.com/pair" target="_blank">
    <img src="https://img.shields.io/badge/PAIR%20SITE-Click%20Here-ff4444?style=for-the-badge&logo=whatsapp&logoColor=white"/>
  </a>
</div>

**👉 [https://pair-web-1.onrender.com/pair](https://pair-web-1.onrender.com/pair)**

Simply enter your phone number and get your session code instantly!

---

## 📊 Bot Status Dashboard

Monitor your bot in real-time at your deployed domain:
- 🔴 **Online/Offline Status**
- ⏱️ **Uptime** (with milliseconds precision)
- ⚡ **Response Time**
- 💾 **Memory Usage**

Access it at: `https://your-bot-domain.com`

---

## 🚀 One-Click Heroku Deployment

Deploy your own MAD-MAX bot instantly with one click!

<div align="center">
  <a href="https://dashboard.heroku.com/new?template=https://github.com/404unkown/MAD-MAX">
    <img src="https://www.herokucdn.com/deploy/button.svg" alt="Deploy to Heroku" width="200"/>
  </a>
</div>

### What you'll need:
- A Heroku account (free)
- WhatsApp account
- 2 minutes of your time

### Steps:
1. Click the button above
2. Enter your `SESSION` ID (get it from our [pairing site](https://pair-web-1.onrender.com/pair))
3. Click "Deploy App"
4. Wait for deployment to finish
5. Open the app and your bot is live!

---

## 🚀 Deployment Options

### Option 1: Heroku (One-Click)

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://dashboard.heroku.com/new?template=https://github.com/404unkown/MAD-MAX)

**Environment Variables for Heroku:**
| Variable | Description | Required |
|----------|-------------|----------|
| `SESSION` | WhatsApp session ID (get from [pair site](https://pair-web-1.onrender.com/pair)) | ✅ |
| `OWNER` | Owner phone number | ✅ |
| `PREFIX` | Command prefix | ❌ (default: `.`) |
| `MODE` | Bot mode (public/private) | ❌ (default: `public`) |
| `BOT_NAME` | Bot display name | ❌ (default: `MAD-MAX`) |

### Option 2: Panel/VPS Deployment

#### Prerequisites
- Node.js v16+
- Git
- FFmpeg

#### Installation

```bash
# Clone repository
git clone https://github.com/404unkown/MAD-MAX.git
cd MAD-MAX

# Install dependencies
npm install

# Create config file
cp set.env set.js
nano set.js  # Edit your settings

# Start the bot
npm start