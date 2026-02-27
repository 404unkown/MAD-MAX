const fetch = require("node-fetch");

async function gitcloneCommand(client, chatId, message, args, sender, pushName, isOwnerSimple) {
    try {
        // Extract the GitHub URL
        const gitUrl = args[0];
        
        if (!gitUrl) {
            await client.sendMessage(chatId, {
                text: "❌ *GitHub Repository Downloader*\n\n*Usage:* .gitclone <github-url>\n\n*Example:*\n.gitclone https://github.com/username/repository"
            }, { quoted: message });
            return;
        }

        if (!/^(https:\/\/)?github\.com\/.+/.test(gitUrl)) {
            await client.sendMessage(chatId, {
                text: "⚠️ Invalid GitHub link. Please provide a valid GitHub repository URL."
            }, { quoted: message });
            return;
        }

        // Send processing reaction
        await client.sendMessage(chatId, { 
            react: { text: '⏳', key: message.key } 
        });

        const regex = /github\.com\/([^\/]+)\/([^\/]+)(?:\.git)?/i;
        const match = gitUrl.match(regex);

        if (!match) {
            throw new Error("Invalid GitHub URL.");
        }

        const [, username, repo] = match;
        const zipUrl = `https://api.github.com/repos/${username}/${repo}/zipball`;

        // Check if repository exists
        const response = await fetch(zipUrl, { method: "HEAD" });
        if (!response.ok) {
            throw new Error("Repository not found.");
        }

        const contentDisposition = response.headers.get("content-disposition");
        const fileName = contentDisposition ? contentDisposition.match(/filename=(.*)/)[1] : `${repo}.zip`;

        // Notify user of the download
        await client.sendMessage(chatId, {
            text: `📥 *Downloading repository...*\n\n*Repository:* ${username}/${repo}\n*Filename:* ${fileName}`
        }, { quoted: message });

        // Send the zip file
        await client.sendMessage(chatId, {
            document: { url: zipUrl },
            fileName: fileName,
            mimetype: 'application/zip',
            caption: `📦 *GitHub Repository Downloaded*\n\n*Repository:* ${username}/${repo}\n*Filename:* ${fileName}`
        }, { quoted: message });

        // Success reaction
        await client.sendMessage(chatId, { 
            react: { text: '✅', key: message.key } 
        });

    } catch (error) {
        console.error("Git clone error:", error);
        
        let errorMsg = "❌ Failed to download the repository.";
        if (error.message.includes("not found")) {
            errorMsg = "❌ Repository not found or is private.";
        } else if (error.message.includes("Invalid")) {
            errorMsg = "❌ Invalid GitHub URL format.";
        }

        await client.sendMessage(chatId, {
            text: errorMsg
        }, { quoted: message });

        await client.sendMessage(chatId, { 
            react: { text: '❌', key: message.key } 
        });
    }
}

module.exports = gitcloneCommand;