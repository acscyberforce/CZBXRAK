const axios = require("axios");

module.exports = {
  config: {
    name: "imgur",
    aliases: ["im"],
    version: "1.0.5",
    author: "Milon",
    countDown: 2,
    role: 0,
    usePrefix: true, // Prefix required for normal users
    description: "Upload images to Imgur. Admins use without prefix.",
    category: "uploader",
    guide: {
      en: "reply to an image or video"
    }
  },

/* --- [ 🔐 FILE_CREATOR_INFORMATION ] ---
 * 🤖 BOT NAME: MILON BOT
 * 👤 OWNER: MILON HASAN
 * 🔗 FACEBOOK: https://www.facebook.com/share/17uGq8qVZ9/
 * 📞 WHATSAPP: +880 1912603270
 * 📍 LOCATION: NARAYANGANJ, BANGLADESH
 * 🛠️ PROJECT: MILON BOT PROJECT (2026)
 * --------------------------------------- */

  onChat: async function ({ api, event, message, commandName }) {
    const { body, senderID } = event;
    if (!body) return;

    // Direct check for Admin ID from Global Config
    const adminIDs = global.GoatBot.config.adminBot || [];
    const isBotAdmin = adminIDs.includes(senderID);

    const args = body.toLowerCase().split(" ");
    
    // If Admin types the command name without prefix
    if (isBotAdmin && (args[0] === "imgur" || args[0] === "im")) {
        return this.onStart({ api, event, message, commandName });
    }
  },

  onStart: async function ({ api, event }) {
    const attachments = event.messageReply?.attachments;

    if (!attachments || attachments.length === 0) {
      return api.sendMessage("Error: Please reply to an image or video file.", event.threadID, event.messageID);
    }

    try {
      const uploadedLinks = [];
      for (const attachment of attachments) {
        const res = await axios.get(`https://api.imgbb.com/1/upload?key=1b4d99fa0c3195efe42ceb62670f2a25&image=${encodeURIComponent(attachment.url)}`);
        uploadedLinks.push(res.data.data.url);
      }

      return api.sendMessage(`✅ [ IMGUR UPLOAD SUCCESS ]\n\n${uploadedLinks.join("\n")}`, event.threadID, event.messageID);

    } catch (err) {
      console.error("Imgur Upload error:", err);
      return api.sendMessage("Critical Error: Failed to upload to Imgur server.", event.threadID, event.messageID);
    }
  }
};
