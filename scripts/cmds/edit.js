const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "edit",
    aliases: ["nedit", "edit2"],
    version: "1.7.0",
    author: "Milon",
    countDown: 15,
    role: 2,
    usePrefix: true, 
    description: "Edit image using Nano AI. Admins use without prefix.",
    category: "image",
    guide: {
      en: "reply to an image with <prompt> --ratio <1:1|4:3|3:2|16:9>"
    }
  },

/* --- [ 🔐 FILE_CREATOR_INFORMATION ] ---
 * 🤖 BOT NAME: MILON BOT
 * 👤 OWNER: MILON HASAN 
 * 📍 LOCATION: NARAYANGANJ, BANGLADESH
 * 🛠️ PROJECT: MILON BOT PROJECT (2026)
 * --------------------------------------- */

  onChat: async function ({ api, event, message, commandName, args }) {
    const { body, senderID } = event;
    if (!body) return;

    const adminIDs = global.GoatBot.config.adminBot || [];
    const isBotAdmin = adminIDs.includes(senderID);
    const msg = body.toLowerCase().trim();

    // Admin Unprefix Logic: Triggers if message starts with "edit " or "nedit "
    if (isBotAdmin && (msg.startsWith("edit ") || msg.startsWith("nedit "))) {
        const unprefixArgs = body.split(/\s+/).slice(1);
        return this.onStart({ api, event, message, commandName, args: unprefixArgs });
    }
  },

  onStart: async function ({ api, event, message, args }) {
    const { threadID, messageID, messageReply, type } = event;
    const hasPhotoReply = type === "message_reply" && messageReply?.attachments?.[0]?.type === "photo";

    if (!hasPhotoReply) {
      return message.reply("❌ Please reply to an image to edit.");
    }

    const input = args.join(" ");
    if (!input) return message.reply("❌ Please provide a prompt for editing.");

    const ratioMatch = input.match(/--ratio\s+(1:1|4:3|3:2|16:9)/);
    const ratio = ratioMatch ? ratioMatch[1] : "1:1";
    const prompt = input.replace(/--ratio\s+(1:1|4:3|3:2|16:9)/, "").trim();

    const imageUrl = messageReply.attachments[0].url;
    const cacheDir = path.join(__dirname, "cache");
    const cachePath = path.join(cacheDir, `edit_${Date.now()}.png`);

    try {
      api.setMessageReaction("⏳", messageID, () => {}, true);

      const res = await axios.get("https://rifatapiv3.vercel.app/api/ai-image/nano", {
        params: { 
          url: imageUrl, 
          p: prompt,
          ratio: ratio
        },
        timeout: 180000
      });

      const resultUrl = res.data?.result;

      if (!resultUrl || res.data.status !== "success") {
        api.setMessageReaction("❌", messageID, () => {}, true);
        return message.reply("❌ Failed to edit image. Server might be busy.");
      }

      await fs.ensureDir(cacheDir);

      const imageRes = await axios.get(resultUrl, {
        responseType: 'arraybuffer',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36'
        }
      });

      await fs.writeFile(cachePath, Buffer.from(imageRes.data));
      api.setMessageReaction("✅", messageID, () => {}, true);

      await message.reply({
        body: `🎨 [ IMAGE EDITED BY NANO AI ]\n\nPrompt: ${prompt}\nRatio: ${ratio}`,
        attachment: fs.createReadStream(cachePath)
      });

    } catch (err) {
      api.setMessageReaction("❌", messageID, () => {}, true);
      console.error("EDIT_AI_ERROR:", err.message);
      return message.reply(`❌ Error: ${err.message}`);
    } finally {
      if (fs.existsSync(cachePath)) {
        setTimeout(() => fs.remove(cachePath).catch(() => {}), 10000);
      }
    }
  }
};
