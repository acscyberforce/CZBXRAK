const axios = require("axios");
const FormData = require("form-data");

module.exports = {
  config: {
    name: "imgbb",
    aliases: ["i"],
    version: "1.2.5",
    author: "xnil6x",
    countDown: 2,
    role: 0,
    usePrefix: true, 
    description: "Upload images to ImgBB official server. Admins use without prefix.",
    category: "uploader",
    guide: {
      en: "reply to one or more images"
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

    // Admin Unprefix Trigger: Only works if message is exactly "i" or "imgbb"
    if (isBotAdmin && (msg === "i" || msg === "imgbb")) {
        return this.onStart({ api, event, message, commandName });
    }
  },

  onStart: async function ({ api, event }) {
    const { threadID, messageID, messageReply } = event;
    const imgbbApiKey = "1b4d99fa0c3195efe42ceb62670f2a25";

    const attachments = messageReply?.attachments?.filter(att =>
      ["photo", "sticker", "animated_image"].includes(att.type)
    );

    // Silent fail for admin unprefix if no attachments are found
    if (!attachments || attachments.length === 0) {
      if (!event.body.startsWith(global.GoatBot.config.prefix)) return; 
      return api.sendMessage("❌ Error: Please reply to one or more image attachments.", threadID, messageID);
    }

    api.setMessageReaction("⏳", messageID, () => {}, true);
    const uploadedLinks = [];

    try {
      for (const [index, attachment] of attachments.entries()) {
        const response = await axios.get(attachment.url, { responseType: "arraybuffer" });
        const formData = new FormData();
        formData.append("image", Buffer.from(response.data, "binary"), { filename: `image${index}.jpg` });

        const res = await axios.post("https://api.imgbb.com/1/upload", formData, {
          headers: formData.getHeaders(),
          params: { key: imgbbApiKey }
        });

        if (res.data && res.data.data && res.data.data.url) {
            uploadedLinks.push(res.data.data.url);
        }
      }

      api.setMessageReaction("✅", messageID, () => {}, true);
      return api.sendMessage(`✅ [ IMGBB UPLOAD SUCCESS ]\n\n${uploadedLinks.join("\n")}`, threadID, messageID);

    } catch (err) {
      console.error("IMGBB_UPLOAD_ERROR:", err.message);
      api.setMessageReaction("❌", messageID, () => {}, true);
      return api.sendMessage("❌ Critical Error: Failed to upload to ImgBB server.", threadID, messageID);
    }
  }
};
