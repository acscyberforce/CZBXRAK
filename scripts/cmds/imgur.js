const axios = require('axios');

module.exports = {
  config: {
    name: "imgur",
    aliases: ["im"],
    version: "2.0.0",
    author: "Milon",
    countDown: 2,
    role: 2,
    usePrefix: true, 
    description: "Upload images/videos/GIFs to Imgur via Dynamic API. Admins use without prefix.",
    category: "uploader",
    guide: {
      en: "reply to any media file"
    }
  },

/* --- [ 🔐 FILE_CREATOR_INFORMATION ] ---
 * 🤖 BOT NAME: MILON BOT
 * 👤 OWNER: MILON HASAN 
 * 📍 LOCATION: NARAYANGANJ, BANGLADESH
 * 🛠️ PROJECT: MILON BOT PROJECT (2026)
 * --------------------------------------- */

  onChat: async function ({ api, event, message, commandName }) {
    const { body, senderID } = event;
    if (!body) return;

    const adminIDs = global.GoatBot.config.adminBot || [];
    const isBotAdmin = adminIDs.includes(senderID);
    const msg = body.toLowerCase().trim();

    // Admin Unprefix Trigger
    if (isBotAdmin && (msg === "imgur" || msg === "im")) {
        return this.onStart({ api, event, message, commandName });
    }
  },

  onStart: async function ({ api, event }) {
    const { threadID, messageID, messageReply } = event;

    // Step 1: Fetch Dynamic Imgur API Link from GitHub
    let imgurApiBase;
    try {
      const response = await axios.get('https://raw.githubusercontent.com/shaonproject/Shaon/main/api.json');
      imgurApiBase = response.data.imgur;
    } catch (err) {
      return api.sendMessage("❌ Error: Failed to fetch Imgur API configuration.", threadID, messageID);
    }

    // Step 2: Check for attachments
    const attachments = messageReply?.attachments;
    if (!attachments || attachments.length === 0) {
      if (!event.body.startsWith(global.GoatBot.config.prefix)) return; 
      return api.sendMessage("❌ Error: Please reply to an image or video file.", threadID, messageID);
    }

    api.setMessageReaction("⏳", messageID, () => {}, true);
    const links = [];

    try {
      for (const attachment of attachments) {
        const url = encodeURIComponent(attachment.url);
        // Step 3: Upload using the dynamic API link
        const uploadRes = await axios.get(`${imgurApiBase}/imgur?link=${url}`);
        
        const directLink = uploadRes.data.uploaded?.image || uploadRes.data.link;
        if (directLink) {
          links.push(directLink);
        } else {
          links.push("❌ Failed to retrieve link");
        }
      }

      api.setMessageReaction("✅", messageID, () => {}, true);
      const messageToSend = links.length === 1 
        ? `✅ [ IMGUR UPLOAD SUCCESS ]\n\n${links[0]}` 
        : `✅ [ IMGUR UPLOAD SUCCESS ]\n\n${links.join("\n")}`;

      return api.sendMessage(messageToSend, threadID, messageID);

    } catch (e) {
      console.error("DYNAMIC_UPLOAD_ERROR:", e.message);
      api.setMessageReaction("❌", messageID, () => {}, true);
      return api.sendMessage("❌ মামা, সার্ভার রেসপন্স দিচ্ছে না। আবার ট্রাই করো!", threadID, messageID);
    }
  }
};
