const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

/**
 * -----------------------------------------------------------------
 *  SYSTEM BREACHED BY: TONMOY HACKER
 * 🤖 BOT OPERATOR: CYBER ZONE ORACLE
 * 👤 MASTERMIND: TIGER TONMOY (BD HACKER)
 * 📍 DEPLOYMENT CORE: MAINBOARD OVERLAY
 * 🛠️ PROJECT CORE: SECURE MEDIA INTRUSION PROTOCOL (2026)
 * -----------------------------------------------------------------
 */

module.exports = {
  config: {
    name: "media",
    aliases: ["audio1", "audio2", "watch1", "watch2"],
    version: "6.6.6", // Cyber Upgrade
    author: "TONMOY HACKER",
    countDown: 5,
    role: 0,
    category: "cyber_media",
    usePrefix: false 
  },

  onChat: async function ({ api, event, message }) {
    if (!event.body) return;
    const body = event.body.toLowerCase().trim();
    
    // INTRUSION VECTOR DETECTION
    const isAudio = body.startsWith("audio1") || body.startsWith("audio2");
    const isVideo = body.startsWith("watch1") || body.startsWith("watch2");

    if (isAudio || isVideo) {
      let query = "";
      const args = event.body.split(/\s+/);
      const trigger = args.shift().toLowerCase();
      
      // TARGET PARSING
      if (event.messageReply && event.messageReply.body) {
        query = event.messageReply.body;
      } else {
        query = args.join(" ");
      }

      if (!query) return message.reply(`[☠️] INSUFFICIENT TARGET DATA! Define parameter name or reply with ${trigger}!`);

      const waitMsg = await message.reply(`[🛰️] INJECTING SEARCH PACKETS FOR: "${query}"...\n[⚡] OVERRIDING MAINFRAME, STANDBY BOSS TONMOY...`);

      try {
        // --- [ 🌐 STAGE 01: DATA EXTRACTION VIA YOUTUBE CORE ] ---
        const searchRes = await axios.get(`https://betadash-search-download.vercel.app/yt?search=${encodeURIComponent(query)}`);
        const videoData = searchRes.data[0];

        if (!videoData || !videoData.url) return api.editMessage("[⚠] ACCESS DENIED: No matching nodes found on YouTube network.", waitMsg.messageID);

        const ytUrl = videoData.url;
        const title = videoData.title;
        await api.editMessage(`[🎯] TARGET FOUND: ${title}\n[⬇️] EXFILTRATING ${isAudio ? 'AUDIO' : 'VIDEO'} PAYLOAD BUFFER...`, waitMsg.messageID);

        const cacheDir = path.join(process.cwd(), "cache");
        if (!fs.existsSync(cacheDir)) fs.ensureDirSync(cacheDir);
        const filePath = path.join(cacheDir, `${isAudio ? 'audio' : 'video'}_${Date.now()}.${isAudio ? 'mp3' : 'mp4'}`);

        let downloadUrl = null;

        // --- [ 🚀 STAGE 02: MULTI-GATEWAY FALLBACK BYPASS ] ---
        if (isAudio) {
          try {
            // Primary Gateway
            const res = await axios.get(`https://yt-mp3-imran.vercel.app/api?url=${encodeURIComponent(ytUrl)}`);
            downloadUrl = res.data.downloadUrl;
          } catch (e) {
            // Backup Gateway
            const res = await axios.get(`https://mahabub-apis.fun/mahabub/ytmp3v2?url=${encodeURIComponent(ytUrl)}`);
            downloadUrl = res.data.data.link;
          }
        } else {
          try {
            // Primary Gateway
            const res = await axios.get(`https://yt-api-imran.vercel.app/api?url=${encodeURIComponent(ytUrl)}`);
            downloadUrl = res.data.downloadUrl;
          } catch (e) {
            // Backup Gateway
            const res = await axios.get(`https://mahabub-apis.fun/mahabub/ytmp4?url=${encodeURIComponent(ytUrl)}`);
            downloadUrl = res.data.formats.find(f => f.quality === "360p")?.url || res.data.formats[0].url;
          }
        }

        if (!downloadUrl) throw new Error("All proxy download links failed to authenticate.");

        // --- [ ⬇️ STAGE 03: STREAM DOWNLOADING BLOCK ] ---
        const response = await axios({
          method: "get",
          url: downloadUrl,
          responseType: "stream",
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0' }
        });

        // BUFFER SIZE VERIFICATION (85 MB MAXIMUM OVERLAY)
        const size = response.headers['content-length'];
        if (size && parseInt(size) > 85 * 1024 * 1024) {
          return api.editMessage("[❌] OVERFLOW ERROR: Payload size exceeds secure proxy limitations (>85MB).", waitMsg.messageID);
        }

        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);

        writer.on("finish", async () => {
          await api.unsendMessage(waitMsg.messageID).catch(() => {});
          await message.reply({
            body: `┌──────────────┐\n   💥 𝘾𝙔𝘽𝙀𝙍 𝙋𝘼𝙔𝙇𝙊𝘼𝘿 𝙍𝙀𝘼𝘿𝙔 💥\n└──────────────┘\n⚡ 𝙏𝙖𝙧𝙜𝙚𝙩: ${title}\n⏱️ 𝘿𝙪𝙧𝙖𝙩𝙞𝙤𝙣: ${videoData.time || 'UNKNOWN'}\n📂 𝙈𝙤𝙙𝙚: ${isAudio ? '𝘼𝙐𝘿𝙄𝙊 𝙈𝘼𝙏𝙍𝙄𝙓' : '𝙑𝙄𝘿𝙀𝙊 𝙎𝙏𝙍𝙀𝘼𝙈'}\n👑 𝙊𝙬𝙣𝙚𝙧: 𝙏𝙊𝙉𝙈𝙊𝙔 𝙃𝘼𝘾𝙆𝙀𝙍\n━━━━━━━━━━━━━━━━━━━━`,
            attachment: fs.createReadStream(filePath),
          });
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        });

        writer.on("error", (err) => { throw err; });

      } catch (err) {
        console.error("[CYBER ERROR]", err);
        api.editMessage(`[❌] CRITICAL ERROR: Intrusive pipeline terminated by remote mainframe protection shields.`, waitMsg.messageID);
      }
    }
  },

  onStart: async function () {} 
};