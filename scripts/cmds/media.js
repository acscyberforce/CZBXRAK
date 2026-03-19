const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

module.exports = {
  config: {
    name: "media",
    aliases: ["audio1", "audio2", "watch1", "watch2"],
    version: "6.0.0",
    author: "Milon Hasan",
    countDown: 5,
    role: 2, 
    category: "media",
    usePrefix: false 
  },

/* --- [ 🔐 FILE_CREATOR_INFORMATION ] ---
 * 🤖 BOT NAME: MILON BOT
 * 👤 OWNER: MILON HASAN (MILON BOSS)
 * 🔗 FACEBOOK: https://www.facebook.com/share/17uGq8qVZ9/
 * 📍 LOCATION: NARAYANGANJ, BANGLADESH
 * 🛠️ PROJECT: MILON BOT PROJECT (2026)
 * --------------------------------------- */

  onChat: async function ({ api, event, message }) {
    if (!event.body) return;
    const body = event.body.toLowerCase().trim();
    
    // --- [ 🔐 ADMIN ONLY CHECK ] ---
    const adminIDs = global.GoatBot.config.adminBot || [];
    const isBotAdmin = adminIDs.includes(event.senderID);
    
    // ট্রিগার চেক
    const isAudio = body.startsWith("audio1") || body.startsWith("audio2");
    const isVideo = body.startsWith("watch1") || body.startsWith("watch2");

    if (isAudio || isVideo) {
      if (!isBotAdmin) return;

      let query = "";
      const args = event.body.split(/\s+/);
      const command = args.shift(); // command name (audio1, watch2 etc)
      const inputQuery = args.join(" ");

      // রিপ্লাই লজিক
      if (event.messageReply && event.messageReply.body) {
        query = event.messageReply.body;
      } else {
        query = inputQuery;
      }

      if (!query) {
        return message.reply(`❌ Please provide a name or reply to a message with ${command}!`);
      }

      const waitMsg = await message.reply(`🔍 Searching for "${query}"...\n⏳ Please wait...`);

      try {
        const searchRes = await axios.get(`https://betadash-search-download.vercel.app/yt?search=${encodeURIComponent(query)}`);
        const data = searchRes.data[0];

        if (!data || !data.url) return api.editMessage("⚠️ No results found on YouTube.", waitMsg.messageID);

        const ytUrl = data.url;
        const title = data.title;
        await api.editMessage(`🎬 Found: ${title}\n⬇️ Downloading...`, waitMsg.messageID);

        const cacheDir = path.join(process.cwd(), "cache");
        if (!fs.existsSync(cacheDir)) fs.ensureDirSync(cacheDir);
        const filePath = path.join(cacheDir, `${isAudio ? 'audio' : 'video'}_${Date.now()}.${isAudio ? 'mp3' : 'mp4'}`);

        let downloadUrl = null;

        // সরাসরি কমান্ড অনুযায়ী এপিআই কল
        if (body.startsWith("audio1")) {
            const res = await axios.get(`https://yt-mp3-imran.vercel.app/api?url=${encodeURIComponent(ytUrl)}`);
            downloadUrl = res.data.downloadUrl;
        } else if (body.startsWith("audio2")) {
            const res = await axios.get(`https://mahabub-apis.fun/mahabub/ytmp3v2?url=${encodeURIComponent(ytUrl)}`);
            downloadUrl = res.data.data.link;
        } else if (body.startsWith("watch1")) {
            const res = await axios.get(`https://yt-api-imran.vercel.app/api?url=${encodeURIComponent(ytUrl)}`);
            downloadUrl = res.data.downloadUrl;
        } else if (body.startsWith("watch2")) {
            const res = await axios.get(`https://mahabub-apis.fun/mahabub/ytmp4?url=${encodeURIComponent(ytUrl)}`);
            downloadUrl = res.data.formats.find(f => f.quality === "360p")?.url || res.data.formats[0].url;
        }

        if (!downloadUrl) throw new Error("API is down.");

        const response = await axios({ method: "get", url: downloadUrl, responseType: "stream" });
        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);

        writer.on("finish", async () => {
          await api.unsendMessage(waitMsg.messageID).catch(() => {});
          await message.reply({
            body: `✅ Download Complete!\n📌 Title: ${title}\n🖌️ Power by: Milon Hasan`,
            attachment: fs.createReadStream(filePath),
          });
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        });

      } catch (err) {
        api.editMessage(`❌ Failed to process. API might be offline.`, waitMsg.messageID);
      }
    }
  },

  onStart: async function () {} 
};
