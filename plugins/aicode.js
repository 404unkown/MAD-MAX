const axios = require("axios");

/*
=====================================
 PUT YOUR NEW GEMINI API KEY BELOW
=====================================
*/
const GEMINI_API_KEY = "AIzaSyCxhyh2oLSMFmrXu_7LMtaKw_pxnk0bKc4";

/*
=====================================
 AI CODE GENERATOR COMMAND
=====================================
*/

const aicodeCommand = async (
  client,
  chatId,
  m,
  args,
  sender,
  pushName,
  isOwner
) => {
  try {
    const text = args.join(" ").trim();

    // No input
    if (!text) {
      return await client.sendMessage(
        chatId,
        {
          text:
            "📝 *AI CODE GENERATOR*\n\n" +
            "Usage:\n" +
            ".aicode <language> <prompt>\n\n" +
            "Example:\n" +
            ".aicode javascript function to add two numbers\n" +
            ".aicode python print hello world"
        },
        { quoted: m }
      );
    }

    // Split language + prompt
    const [language, ...rest] = text.split(" ");
    const prompt = rest.join(" ");

    if (!language || !prompt) {
      return await client.sendMessage(
        chatId,
        {
          text:
            "❌ *Invalid Format!*\n\n" +
            "Use:\n" +
            ".aicode <language> <prompt>\n\n" +
            "Example:\n" +
            ".aicode python hello world"
        },
        { quoted: m }
      );
    }

    // Loading reaction
    await client.sendMessage(chatId, {
      react: { text: "🔄", key: m.key }
    });

    // Typing
    await client.sendPresenceUpdate("composing", chatId);

    // Prompt for Gemini
    const aiPrompt = `
You are a professional software developer.

Write clean, correct ${language} code for this task:

${prompt}

Rules:
- Return ONLY code
- No explanations
- No markdown
`;

    // Gemini API URL
    const url =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" +
      GEMINI_API_KEY;

    // Send request
    const res = await axios.post(url, {
      contents: [
        {
          parts: [{ text: aiPrompt }]
        }
      ]
    });

    // Extract result
    const result =
      res.data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!result) {
      throw new Error("No response from AI");
    }

    // Format
    const output = "```" + language + "\n" + result + "\n```";

    // Send result
    await client.sendMessage(
      chatId,
      {
        text:
          "📝 *AI CODE GENERATOR*\n\n" +
          "*Language:* " +
          language +
          "\n*Prompt:* " +
          prompt +
          "\n\n" +
          output
      },
      { quoted: m }
    );

    // Success reaction
    await client.sendMessage(chatId, {
      react: { text: "✅", key: m.key }
    });

  } catch (err) {
    console.error("AICODE ERROR:", err);

    // Fail reaction
    await client.sendMessage(chatId, {
      react: { text: "❌", key: m.key }
    });

    await client.sendMessage(
      chatId,
      {
        text:
          "❌ *AI CODE ERROR*\n\n" +
          "Something went wrong.\n\n" +
          "Error: " +
          err.message
      },
      { quoted: m }
    );
  }
};

module.exports = {
  aicodeCommand
};