const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "pp",
    aliases: ["avt", "avatar", "dp"],
    version: "2.1.0",
    author: "Milon",
    countDown: 2,
    role: 0,
    usePrefix: true, 
    description: "Fetch high-resolution profile picture. Admins use without prefix.",
    category: "info",
    guide: {
      en: "{pn} | {pn} @mention | reply"
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

    // 🔥 FIXED LOGIC: 'starts with' use করা হয়েছে যাতে মেনশন থাকলেও কাজ করে
    const triggers = ["pp", "avt", "dp", "avatar"];
    const isTrigger = triggers.some(t => msg === t || msg.startsWith(t + " "));

    if (isBotAdmin && isTrigger) {
        return this.onStart({ api, event, message, commandName });
    }
  },

  onStart: async function ({ api, event }) {
    const { threadID, messageID, senderID, mentions, messageReply } = event;

    // Cache directory setup
    const cacheDir = path.join(process.cwd(), "cache");
    if (!fs.existsSync(cacheDir)) fs.ensureDirSync(cacheDir);

    let targetID = senderID;

    // Target identification logic
    if (Object.keys(mentions).length > 0) {
      targetID = Object.keys(mentions)[0];
    } else if (messageReply) {
      targetID = messageReply.senderID;
    }

    const imgPath = path.join(cacheDir, `pp_${targetID}_${Date.now()}.png`);
    api.setMessageReaction("🔍", messageID, () => {}, true);

    try {
      const avatarURL = `https://graph.facebook.com/${targetID}/picture?width=1500&height=1500&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

      const response = await axios({
        method: "GET",
        url: avatarURL,
        responseType: "arraybuffer",
        timeout: 20000
      });

      fs.writeFileSync(imgPath, Buffer.from(response.data));
      api.setMessageReaction("✅", messageID, () => {}, true);
      
      return api.sendMessage({
        body: `📸 [ PROFILE PICTURE SUCCESS ]\n\nTarget UID: ${targetID}`,
        attachment: fs.createReadStream(imgPath)
      }, threadID, () => {
        setTimeout(() => {
          if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
        }, 5000);
      }, messageID);

    } catch (error) {
      console.error("PP_COMMAND_ERROR:", error);
      api.setMessageReaction("❌", messageID, () => {}, true);
      return api.sendMessage(`❌ Error: Could not fetch profile picture.`, threadID, messageID);
    }
  }
};
