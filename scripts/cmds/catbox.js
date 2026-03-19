const axios = require("axios");
const FormData = require("form-data");

module.exports = {
  config: {
    name: "catbox",
    aliases: ["cat"],
    version: "1.1.0",
    author: "Milon",
    countDown: 2,
    role: 0,
    usePrefix: true, 
    description: "Upload images, videos, or audio to Catbox. Admins use without prefix.",
    category: "uploader",
    guide: {
      en: "reply to an image, video, or audio file"
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

    // Admin Unprefix: Only triggers if message is exactly "cat" or "catbox"
    if (isBotAdmin && (msg === "catbox" || msg === "cat")) {
        return this.onStart({ api, event, message, commandName });
    }
  },

  onStart: async function ({ api, event }) {
    const { threadID, messageID, messageReply } = event;
    const attachments = messageReply?.attachments;

    // Silent failure for admin unprefix if no attachments are found
    if (!attachments || attachments.length === 0) {
      if (!event.body.startsWith(global.GoatBot.config.prefix)) return; 
      return api.sendMessage("❌ Error: Please reply to a file (image, video, or audio).", threadID, messageID);
    }

    api.setMessageReaction("⏳", messageID, () => {}, true);
    const uploadedLinks = [];

    try {
      for (const attachment of attachments) {
        const response = await axios.get(attachment.url, { responseType: "arraybuffer" });
        const formData = new FormData();
        
        // Setting proper file extension based on attachment type
        const ext = attachment.type === "photo" ? "jpg" : attachment.type === "audio" ? "mp3" : "mp4";
        
        formData.append("reqtype", "fileupload");
        formData.append("fileToUpload", Buffer.from(response.data, "binary"), { 
          filename: `milon_bot_${Date.now()}.${ext}` 
        });

        const res = await axios.post("https://catbox.moe/user/api.php", formData, {
          headers: formData.getHeaders()
        });

        if (res.data && typeof res.data === "string" && res.data.startsWith("http")) {
            uploadedLinks.push(res.data);
        }
      }

      api.setMessageReaction("✅", messageID, () => {}, true);
      return api.sendMessage(`✅ [ CATBOX UPLOAD SUCCESS ]\n\n${uploadedLinks.join("\n")}`, threadID, messageID);

    } catch (err) {
      console.error("CATBOX_UPLOAD_ERROR:", err.message);
      api.setMessageReaction("❌", messageID, () => {}, true);
      return api.sendMessage("❌ Critical Error: Failed to upload to Catbox server.", threadID, messageID);
    }
  }
};
