const axios = require("axios");
const FormData = require("form-data");

module.exports = {
  config: {
    name: "catbox",
    aliases: ["cat"],
    version: "1.0.0",
    author: "Milon",
    countDown: 5,
    role: 0,
    usePrefix: true, 
    description: "Upload any file to Catbox. Admins use without prefix.",
    category: "uploader",
    guide: {
      en: "reply to an image, video, or audio file"
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

    const adminIDs = global.GoatBot.config.adminBot || [];
    const isBotAdmin = adminIDs.includes(senderID);
    const args = body.toLowerCase().split(" ");

    if (isBotAdmin && (args[0] === "catbox" || args[0] === "cat")) {
        return this.onStart({ api, event, message, commandName });
    }
  },

  onStart: async function ({ api, event }) {
    const attachments = event.messageReply?.attachments;

    if (!attachments || attachments.length === 0) {
      return api.sendMessage("Error: Please reply to a file (image, video, or audio).", event.threadID, event.messageID);
    }

    try {
      const uploadedLinks = await Promise.all(
        attachments.map(async (attachment) => {
          const response = await axios.get(attachment.url, { responseType: "arraybuffer" });
          const formData = new FormData();
          
          formData.append("reqtype", "fileupload");
          formData.append("fileToUpload", Buffer.from(response.data, "binary"), { 
            filename: `file_${Date.now()}.${attachment.type === "photo" ? "jpg" : attachment.type === "audio" ? "mp3" : "mp4"}` 
          });

          const res = await axios.post("https://catbox.moe/user/api.php", formData, {
            headers: formData.getHeaders()
          });

          return res.data;
        })
      );

      return api.sendMessage(`✅ [ CATBOX UPLOAD SUCCESS ]\n\n${uploadedLinks.join("\n")}`, event.threadID, event.messageID);

    } catch (err) {
      console.error("Catbox Upload error:", err);
      return api.sendMessage("Critical Error: Failed to upload to Catbox.", event.threadID, event.messageID);
    }
  }
};
