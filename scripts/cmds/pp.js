const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "pp",
    aliases: ["avt", "avatar"],
    version: "2.1.2",
    author: "Milon Hasan",
    countDown: 2,
    role: 2,
    usePrefix: false, 
    description: "Fetch high-resolution profile picture (No Text).",
    category: "info",
    guide: {
      en: "{pn} | {pn} @mention | reply"
    }
  },

/* --- [ 🔐 FILE_CREATOR_INFORMATION ] ---
 * 🤖 BOT NAME: MILON BOT
 * 👤 OWNER: MILON HASAN (MILON BOSS)
 * 🔗 FB: https://www.facebook.com/share/17uGq8qVZ9/
 * 📍 LOCATION: NARAYANGANJ, BANGLADESH
 * 🛠️ PROJECT: MILON BOT PROJECT (2026)
 * --------------------------------------- */

  onChat: async function ({ api, event, message, commandName }) {
    if (!event.body) return;
    const body = event.body.toLowerCase().trim();
    
    const adminIDs = global.GoatBot.config.adminBot || [];
    const isBotAdmin = adminIDs.includes(event.senderID);

    const triggers = ["pp", "avt", "avatar"];
    const isTrigger = triggers.some(t => body === t || body.startsWith(t + " "));

    if (isBotAdmin && isTrigger) {
      return this.onStart({ api, event, message, commandName });
    }
  },

  onStart: async function ({ api, event }) {
    const { threadID, messageID, senderID, mentions, messageReply } = event;

    const cacheDir = path.join(process.cwd(), "cache");
    if (!fs.existsSync(cacheDir)) fs.ensureDirSync(cacheDir);

    let targetID = senderID;

    if (Object.keys(mentions).length > 0) {
      targetID = Object.keys(mentions)[0];
    } else if (messageReply) {
      targetID = messageReply.senderID;
    }

    const imgPath = path.join(cacheDir, `pp_${targetID}_${Date.now()}.png`);
    
    try {
      api.setMessageReaction("🔍", messageID, () => {}, true);

      const avatarURL = `https://graph.facebook.com/${targetID}/picture?width=1500&height=1500&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

      const response = await axios({
        method: "GET",
        url: avatarURL,
        responseType: "arraybuffer",
        timeout: 20000
      });

      fs.writeFileSync(imgPath, Buffer.from(response.data));
      api.setMessageReaction("✅", messageID, () => {}, true);
      
      // বডি (body) থেকে সব টেক্সট সরিয়ে দেওয়া হয়েছে
      return api.sendMessage({
        body: "", 
        attachment: fs.createReadStream(imgPath)
      }, threadID, (err) => {
        if (!err) {
          setTimeout(() => {
            if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
          }, 5000);
        }
      }, messageID);

    } catch (error) {
      api.setMessageReaction("❌", messageID, () => {}, true);
      return api.sendMessage(`❌ Error: Could not fetch profile picture.`, threadID, messageID);
    }
  }
};
