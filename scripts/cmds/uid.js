const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "uid",
    version: "35.5.0",
    author: "Milon",
    countDown: 2,
    role: 0,
    usePrefix: true, 
    description: "Generate a professional UID card with Name and UID. Admins use without prefix.",
    category: "utility",
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
    const { body, senderID, mentions } = event;
    if (!body) return;

    const adminIDs = global.GoatBot.config.adminBot || [];
    const isBotAdmin = adminIDs.includes(senderID);
    const msg = body.toLowerCase().trim();

    if (isBotAdmin) {
        // Strict Match: Just "uid" or "uid @mention"
        if (msg === "uid") {
            return this.onStart({ api, event, message, commandName });
        }
        if (msg.startsWith("uid ") && Object.keys(mentions).length > 0) {
            return this.onStart({ api, event, message, commandName });
        }
    }
  },

  onStart: async function ({ api, event }) {
    const { threadID, messageID, senderID, mentions, messageReply } = event;

    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.ensureDirSync(cacheDir);

    let targetID = senderID;
    if (Object.keys(mentions).length > 0) {
      targetID = Object.keys(mentions)[0];
    } else if (messageReply) {
      targetID = messageReply.senderID;
    }

    const imgPath = path.join(cacheDir, `uid_${targetID}_${Date.now()}.png`);
    api.setMessageReaction("⏳", messageID, () => {}, true);

    try {
      // Fetching User Information
      const userInfo = await api.getUserInfo(targetID);
      const userName = userInfo[targetID]?.name || "Facebook User";

      const realAvatar = `https://graph.facebook.com/${targetID}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

      // Card setup with Name and UID
      const text1 = encodeURIComponent(`USER: ${userName}`); 
      const text2 = encodeURIComponent(`UID: ${targetID}`); 
      const text3 = encodeURIComponent("AUTHOR: MILON"); 

      const cardApi = `https://api.popcat.xyz/welcomecard?background=${encodeURIComponent(realAvatar)}&text1=${text1}&text2=${text2}&text3=${text3}&avatar=${encodeURIComponent(realAvatar)}&color=800080`;

      const response = await axios({
        method: "GET",
        url: cardApi,
        responseType: "arraybuffer",
        timeout: 25000
      });

      fs.writeFileSync(imgPath, Buffer.from(response.data));
      api.setMessageReaction("✅", messageID, () => {}, true);

      return api.sendMessage({
        body: `${targetID}`,
        attachment: fs.createReadStream(imgPath)
      }, threadID, () => {
        setTimeout(() => {
          if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
        }, 5000);
      }, messageID);

    } catch (error) {
      console.error("UID_CARD_ERROR:", error);
      api.setMessageReaction("❌", messageID, () => {}, true);
      return api.sendMessage(`UID: ${targetID}`, threadID, messageID);
    }
  }
};
