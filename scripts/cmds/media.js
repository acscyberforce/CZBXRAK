const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

/**
 * -------------------------------------
 * 🛠️ FILE CREATED BY: MILON HASAN
 * 🤖 BOT NAME: MILON BOT
 * 👤 OWNER: MILON HASAN 
 * 📍 LOCATION: NARAYANGANJ, BD
 * 🛠️ PROJECT: MILON BOT PROJECT (2026)
 * -------------------------------------
 */

module.exports = {
  config: {
    name: "media",
    aliases: ["audio1", "audio2", "watch1", "watch2"],
    version: "6.5.0",
    author: "MILON HASAN",
    countDown: 5,
    role: 0,
    category: "media",
    usePrefix: false 
  },

  onChat: async function ({ api, event, message }) {
    if (!event.body) return;
    const body = event.body.toLowerCase().trim();
    
    // ট্রিগার ডিটেকশন
    const isAudio = body.startsWith("audio1") || body.startsWith("audio2");
    const isVideo = body.startsWith("watch1") || body.startsWith("watch2");

    if (isAudio || isVideo) {
      let query = "";
      const args = event.body.split(/\s+/);
      const trigger = args.shift().toLowerCase();
      
      // রিপ্লাই লজিক
      if (event.messageReply && event.messageReply.body) {
        query = event.messageReply.body;
      } else {
        query = args.join(" ");
      }

      if (!query) return message.reply(`❌ Provide a name or reply to a message with ${trigger}!`);

      const waitMsg = await message.reply(`🔍 Searching for "${query}"...\n⚡ Processing your request, Milon Boss...`);

      try {
        // --- [ 🌐 STEP 1: SEARCHING VIA BETADASH ] ---
        const searchRes = await axios.get(`https://betadash-search-download.vercel.app/yt?search=${encodeURIComponent(query)}`);
        const videoData = searchRes.data[0];

        if (!videoData || !videoData.url) return api.editMessage("⚠️ No results found on YouTube.", waitMsg.messageID);

        const ytUrl = videoData.url;
        const title = videoData.title;
        await api.editMessage(`🎬 Found: ${title}\n⬇️ Downloading ${isAudio ? 'Audio' : 'Video'} file...`, waitMsg.messageID);

        const cacheDir = path.join(process.cwd(), "cache");
        if (!fs.existsSync(cacheDir)) fs.ensureDirSync(cacheDir);
        const filePath = path.join(cacheDir, `${isAudio ? 'audio' : 'video'}_${Date.now()}.${isAudio ? 'mp3' : 'mp4'}`);

        let downloadUrl = null;

        // --- [ 🚀 STEP 2: MULTI-API FALLBACK LOGIC ] ---
        if (isAudio) {
          try {
            // ইমরান এপিআই (অডিওর জন্য)
            const res = await axios.get(`https://yt-mp3-imran.vercel.app/api?url=${encodeURIComponent(ytUrl)}`);
            downloadUrl = res.data.downloadUrl;
          } catch (e) {
            // মাহবুব এপিআই ব্যাকআপ
            const res = await axios.get(`https://mahabub-apis.fun/mahabub/ytmp3v2?url=${encodeURIComponent(ytUrl)}`);
            downloadUrl = res.data.data.link;
          }
        } else {
          try {
            // ইমরান এপিআই (ভিডিওর জন্য)
            const res = await axios.get(`https://yt-api-imran.vercel.app/api?url=${encodeURIComponent(ytUrl)}`);
            downloadUrl = res.data.downloadUrl;
          } catch (e) {
            // মাহবুব এপিআই ব্যাকআপ
            const res = await axios.get(`https://mahabub-apis.fun/mahabub/ytmp4?url=${encodeURIComponent(ytUrl)}`);
            downloadUrl = res.data.formats.find(f => f.quality === "360p")?.url || res.data.formats[0].url;
          }
        }

        if (!downloadUrl) throw new Error("Could not fetch a valid download link.");

        // --- [ ⬇️ STEP 3: STABLE STREAM DOWNLOAD ] ---
        const response = await axios({
          method: "get",
          url: downloadUrl,
          responseType: "stream",
          headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        // ফাইল সাইজ চেক (৮৫ এমবি লিমিট)
        const size = response.headers['content-length'];
        if (size && parseInt(size) > 85 * 1024 * 1024) {
          return api.editMessage("❌ File is too large (>85MB). Choose a shorter video.", waitMsg.messageID);
        }

        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);

        writer.on("finish", async () => {
          await api.unsendMessage(waitMsg.messageID).catch(() => {});
          await message.reply({
            body: `━━━━━━━━━━━━━━━━━━\n✅ ${isAudio ? '𝘼𝙐𝘿𝙄𝙊' : '𝙑𝙄𝘿𝙀𝙊'} 𝙍𝙀𝘼𝘿𝙔\n━━━━━━━━━━━━━━━━━━\n📌 𝙏𝙞𝙩𝙡𝙚: ${title}\n⏱ 𝘿𝙪𝙧𝙖𝙩𝙞𝙤𝙣: ${videoData.time || 'N/A'}\n⚡ 𝙋𝙊𝙒𝙀𝙍 𝘽𝙔: 𝙈𝙄𝙇𝙊𝙉 𝙋𝙍𝙊\n━━━━━━━━━━━━━━━━━━`,
            attachment: fs.createReadStream(filePath),
          });
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        });

        writer.on("error", (err) => { throw err; });

      } catch (err) {
        console.error(err);
        api.editMessage(`❌ System Error! The API might be restricted or the file is too big.`, waitMsg.messageID);
      }
    }
  },

  onStart: async function () {} 
};
