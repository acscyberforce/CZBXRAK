const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "pp",
    aliases: ["avt", "avatar", "dp"],
    version: "2.0.0",
    author: "Milon",
    countDown: 2,
    role: 0,
    usePrefix: true, 
    description: "Fetch high-resolution profile picture using cache logic. Admins use without prefix.",
    category: "info",
    guide: {
      en: "{pn} | {pn} @mention | reply"
    }
  },

/* --- [ 🔐 FILE_CREATOR_INFORMATION ] ---
 * 🤖 BOT NAME: MILON BOT
 * 👤 OWNER: MILON HAS AN 
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
    if (isBotAdmin && (msg === "pp" || msg === "avt" || msg === "dp")) {
        return this.onStart({ api, event, message, commandName });
    }
  },

  onStart: async function ({ api, event }) {
    const { threadID, messageID, senderID, mentions, messageReply } = event;

    // Cache directory setup
    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.ensureDirSync(cacheDir);

    let targetID = senderID;

    // Target identification logic (Mention > Reply > Sender)
    if (Object.keys(mentions).length > 0) {
      targetID = Object.keys(mentions)[0];
    } else if (messageReply) {
      targetID = messageReply.senderID;
    }

    const imgPath = path.join(cacheDir, `pp_${targetID}_${Date.now()}.png`);
    api.setMessageReaction("🔍", messageID, () => {}, true);

    try {
      // High-resolution avatar link
      const avatarURL = `https://graph.facebook.com/${targetID}/picture?width=1500&height=1500&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

      // Fetching image data
      const response = await axios({
        method: "GET",
        url: avatarURL,
        responseType: "arraybuffer",
        timeout: 15000
      });

      // Saving to cache
      fs.writeFileSync(imgPath, Buffer.from(response.data));

      api.setMessageReaction("✅", messageID, () => {}, true);
      
      return api.sendMessage({
        body: `📸 [ PROFILE PICTURE SUCCESS ]\n\nTarget UID: ${targetID}`,
        attachment: fs.createReadStream(imgPath)
      }, threadID, () => {
        // Auto-delete cache file after 5 seconds
        setTimeout(() => {
          if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
        }, 5000);
      }, messageID);

    } catch (error) {
      console.error("PP_COMMAND_ERROR:", error);
      api.setMessageReaction("❌", messageID, () => {}, true);
      return api.sendMessage(`❌ Error: Could not fetch profile picture for UID: ${targetID}`, threadID, messageID);
    }
  }
};
