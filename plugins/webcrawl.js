const fetch = require('node-fetch');
const cheerio = require('cheerio');

const webcrawlCommand = async (client, chatId, m, args, sender, pushName, isOwner) => {
    try {
        const text = args.join(' ').trim();

        if (!text) {
            return await client.sendMessage(chatId, { 
                text: `🕷️ *WEBSITE CRAWLER*\n\nPlease provide a valid web link to fetch.\n\nThe bot will crawl the website and fetch its HTML, CSS, JavaScript, and any media embedded in it.\n\nExample: .webcrawl https://example.com` 
            }, { quoted: m });
        }

        if (!/^https?:\/\//i.test(text)) {
            return await client.sendMessage(chatId, { 
                text: `❌ *Invalid URL*\n\nPlease provide a URL starting with http:// or https://` 
            }, { quoted: m });
        }

        // Send loading reaction
        await client.sendMessage(chatId, { 
            react: { text: '🕷️', key: m.key } 
        });

        // Send initial processing message
        const processingMsg = await client.sendMessage(chatId, {
            text: `🕷️ *WEBSITE CRAWLER*\n\nCrawling *${text}*...\n\nFetching HTML, CSS, JavaScript, and media files.\n\nPlease wait, this may take a moment.`
        }, { quoted: m });

        // Fetch the website
        const response = await fetch(text, { timeout: 30000 });
        const html = await response.text();
        const $ = cheerio.load(html);

        // Collect media files (images, videos, audio)
        const mediaFiles = [];
        $('img[src], video[src], audio[src]').each((i, element) => {
            let src = $(element).attr('src');
            if (src) {
                // Convert relative URLs to absolute
                try {
                    src = new URL(src, text).href;
                } catch (e) {
                    // Keep as is if invalid
                }
                mediaFiles.push(src);
            }
        });

        // Collect CSS files
        const cssFiles = [];
        $('link[rel="stylesheet"]').each((i, element) => {
            let href = $(element).attr('href');
            if (href) {
                try {
                    href = new URL(href, text).href;
                } catch (e) {}
                cssFiles.push(href);
            }
        });

        // Collect JavaScript files
        const jsFiles = [];
        $('script[src]').each((i, element) => {
            let src = $(element).attr('src');
            if (src) {
                try {
                    src = new URL(src, text).href;
                } catch (e) {}
                jsFiles.push(src);
            }
        });

        // Update processing message
        await client.sendMessage(chatId, {
            edit: processingMsg.key,
            text: `🕷️ *WEBSITE CRAWLER*\n\n✅ Crawling complete!\n\n📊 *Summary:*\n• HTML: Fetched\n• CSS Files: ${cssFiles.length}\n• JS Files: ${jsFiles.length}\n• Media Files: ${mediaFiles.length}\n\nSending content in parts...`
        });

        // Send HTML content (first 4000 chars)
        const htmlPreview = html.length > 3500 ? html.substring(0, 3500) + '...\n\n_HTML truncated due to length_' : html;
        await client.sendMessage(chatId, { 
            text: `📄 *HTML CONTENT*\n\n${htmlPreview}`
        }, { quoted: m });

        await new Promise(resolve => setTimeout(resolve, 1000));

        // Send CSS files
        if (cssFiles.length > 0) {
            await client.sendMessage(chatId, { 
                text: `🎨 *CSS FILES FOUND (${cssFiles.length})*\n\n${cssFiles.join('\n\n')}`
            }, { quoted: m });

            // Fetch and send first CSS file content (if any)
            try {
                const cssResponse = await fetch(cssFiles[0], { timeout: 10000 });
                const cssContent = await cssResponse.text();
                const cssPreview = cssContent.length > 3500 ? cssContent.substring(0, 3500) + '...' : cssContent;
                await client.sendMessage(chatId, { 
                    text: `🎨 *FIRST CSS FILE CONTENT*\n\n${cssPreview}`
                }, { quoted: m });
            } catch (cssError) {
                console.log('Error fetching CSS:', cssError);
            }
        } else {
            await client.sendMessage(chatId, { 
                text: `🎨 *CSS FILES*\n\nNo external CSS files found.`
            }, { quoted: m });
        }

        await new Promise(resolve => setTimeout(resolve, 1000));

        // Send JS files
        if (jsFiles.length > 0) {
            await client.sendMessage(chatId, { 
                text: `📜 *JAVASCRIPT FILES FOUND (${jsFiles.length})*\n\n${jsFiles.join('\n\n')}`
            }, { quoted: m });

            // Fetch and send first JS file content (if any)
            try {
                const jsResponse = await fetch(jsFiles[0], { timeout: 10000 });
                const jsContent = await jsResponse.text();
                const jsPreview = jsContent.length > 3500 ? jsContent.substring(0, 3500) + '...' : jsContent;
                await client.sendMessage(chatId, { 
                    text: `📜 *FIRST JAVASCRIPT FILE CONTENT*\n\n${jsPreview}`
                }, { quoted: m });
            } catch (jsError) {
                console.log('Error fetching JS:', jsError);
            }
        } else {
            await client.sendMessage(chatId, { 
                text: `📜 *JAVASCRIPT FILES*\n\nNo external JavaScript files found.`
            }, { quoted: m });
        }

        await new Promise(resolve => setTimeout(resolve, 1000));

        // Send media files
        if (mediaFiles.length > 0) {
            const mediaList = mediaFiles.slice(0, 20).join('\n'); // Limit to 20
            await client.sendMessage(chatId, { 
                text: `🖼️ *MEDIA FILES FOUND (${mediaFiles.length})*\n\n${mediaList}${mediaFiles.length > 20 ? `\n\n...and ${mediaFiles.length - 20} more` : ''}`
            }, { quoted: m });
        } else {
            await client.sendMessage(chatId, { 
                text: `🖼️ *MEDIA FILES*\n\nNo media files (images, videos, audio) found.`
            }, { quoted: m });
        }

        // Success reaction
        await client.sendMessage(chatId, { 
            react: { text: '✅', key: m.key } 
        });

        // Final summary
        await client.sendMessage(chatId, {
            text: `🕷️ *WEBSITE CRAWLER*\n\n✅ Crawling of *${text}* complete!\n\n📊 *Final Summary:*\n• HTML: Sent\n• CSS Files: ${cssFiles.length}\n• JS Files: ${jsFiles.length}\n• Media Files: ${mediaFiles.length}\n\n─ MAD-MAX BOT`
        }, { quoted: m });

    } catch (error) {
        console.error('Web crawl error:', error);

        // Error reaction
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: m.key } 
        });

        await client.sendMessage(chatId, {
            text: `🕷️ *WEBSITE CRAWLER*\n\n❌ An error occurred while fetching the website content.\n\nError: ${error.message}`
        }, { quoted: m });
    }
};

module.exports = {
    webcrawlCommand
};