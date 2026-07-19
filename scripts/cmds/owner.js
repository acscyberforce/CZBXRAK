const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

/**
 * -----------------------------------------------------------------
 * 💥 SYSTEM BREACHED BY: TONMOY HACKER
 * 🤖 BOT INTEGRATION: CYBER ZONE ORACLE
 * 👤 OVERLORD: TIGER TONMOY (BD HACKER)
 * 📞 CONTACT VAULT: +880 1912603270
 * 🛡️ PROTOCOL SUITE: PREMIUM MAINBOARD TERMINAL CARD (2026)
 * -----------------------------------------------------------------
 */

module.exports = {
  config: {
    name: "owner",
    version: "16.6.6", // Cyber Upgrade
    author: "TONMOY HACKER",
    countDown: 5,
    role: 0,
    category: "cyber_info",
    description: "Generates a cyber-hacker style owner information mainframe card",
    guide: "{p}owner"
  },

  onStart: async function ({ api, event, threadsData }) {
    const { threadID, messageID } = event;

    let Canvas;
    try {
      Canvas = require("canvas");
    } catch (e) {
      return api.sendMessage("[❌] CRITICAL ERROR: 'canvas' library missing from node_modules.", threadID, messageID);
    }

    const { createCanvas, loadImage } = Canvas;

    // --- 1. System Metrics Exfiltration ---
    const globalPrefix = global.GoatBot.config.prefix;
    const threadPrefix = await threadsData.get(threadID, "data.prefix") || globalPrefix;

    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const uptimeString = `${hours}h ${minutes}m`;

    const totalCommands = global.GoatBot.commands.size;

    // Cyber Visual Elements
    const cardUrl = "https://i.imgur.com/5oG0Ohe.jpeg"; 
    const avatarUrl = "https://i.imgur.com/3ROoie7.jpeg"; 

    try {
      api.sendMessage("[🛰️] OVERRIDING GRAPHICS INTERFACE... GENERATING CYBER CARD...", threadID, messageID);

      async function getImg(url) {
        const res = await axios({
          url: url,
          method: "GET",
          responseType: "arraybuffer",
          headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
        });
        return await loadImage(Buffer.from(res.data));
      }

      const [cardImg, avatarImg] = await Promise.all([
        getImg(cardUrl),
        getImg(avatarUrl)
      ]);

      const scale = 3; 
      const canvas = createCanvas(cardImg.width * scale, cardImg.height * scale);
      const ctx = canvas.getContext("2d");

      // Background Offset (Shifted Left)
      const imageOffset = 20 * scale; 
      ctx.drawImage(cardImg, -imageOffset, 0, canvas.width, canvas.height);

      const globalLeftShift = 15 * scale; 
      const centerX = (canvas.width / 2) - globalLeftShift; 
      const centerY = 155 * scale;

      // 2. Header Design (Hacker Style)
      ctx.fillStyle = "#00FF00"; // Neon Green 
      ctx.textAlign = "center";
      ctx.font = `bold ${22 * scale}px Courier New`; 
      ctx.fillText("[ MAINFRAME OVERLORD INFO ]", centerX, 75 * scale);

      // 3. Avatar Image Border & Clip
      const radius = 62 * scale; 
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatarImg, centerX - radius, centerY - radius, radius * 2, radius * 2);
      ctx.restore();

      ctx.strokeStyle = "#00FF00"; // Neon Cyber Border
      ctx.lineWidth = 5 * scale; 
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2, true);
      ctx.stroke();

      // 4. Text & Info Overlay Design
      ctx.fillStyle = "#00FF00"; 
      ctx.shadowBlur = 12;
      ctx.shadowColor = "#000000";
      const nameY = centerY + radius + (30 * scale);

      ctx.textAlign = "center";
      ctx.font = `bold ${26 * scale}px Courier New`; 
      ctx.fillText("TONMOY HACKER", centerX, nameY); 

      const infoX = centerX - (125 * scale); 
      ctx.textAlign = "left";
      ctx.font = `bold ${16 * scale}px Courier New`; 

      // Render Encrypted Data Fields onto Canvas
      ctx.fillText(`🤖 MATRIX CORE: [ CZB ORACLE ]`, infoX, nameY + (25 * scale)); 
      ctx.fillText(`⚙️ BYPASS KEY : [ ${threadPrefix} ]`, infoX, nameY + (45 * scale)); 
      ctx.fillText(`⏳ CORE RUN   : [ ${uptimeString} ]`, infoX, nameY + (65 * scale)); 
      ctx.fillText(`📊 EXPLOITS   : [ ${totalCommands} Vectors ]`, infoX, nameY + (85 * scale)); 
      ctx.fillText(`👤 OPERATOR   : [ TIGER TONMOY ]`, infoX, nameY + (115 * scale)); 
      ctx.fillText(`📅 LEVEL      : [ ALPHA RATIO ]`, infoX, nameY + (135 * scale)); 
      ctx.fillText(`📍 SECTOR     : [ CYBER ZONE BD ]`, infoX, nameY + (155 * scale)); 
      ctx.fillText(`📝 PROTOCOL   : [ SILENCE IS MY ATTITUDE ]`, infoX, nameY + (175 * scale)); 
      ctx.fillText(`📞 ENCRYPTED  : [ +880 1912***** ]`, infoX, nameY + (195 * scale)); 

      const cacheDir = path.join(__dirname, "cache");
      fs.ensureDirSync(cacheDir);
      const outputPath = path.join(cacheDir, `cyber_mainframe_card_${Date.now()}.png`);

      fs.writeFileSync(outputPath, canvas.toBuffer("image/png"));

      // 5. Cyber Hacker Caption Output
      const caption = 
        "┌──────────────────┐\n" +
        "   ☠️ 𝘾𝙔𝘽𝙀𝙍 𝙕𝙊𝙉𝙀 𝙈𝘼𝙄𝙉𝙁𝙍𝘼𝙈𝙀 ☠️\n" +
        "└──────────────────┘\n\n" +
        "👑 𝙊𝙥𝙚𝙧𝙖𝙩𝙤𝙧: TIGER TONMOY\n" +
        "🤖 𝙈𝙖𝙩𝙧𝙞𝙦 𝘾𝙤𝙧𝙚: CYBER ZONE ORACLE\n" +
        "⚙️ 𝘽𝙮𝙥𝙖𝙨𝙨 𝙆𝙚𝙮: [ " + threadPrefix + " ]\n" +
        "⏳ 𝙐𝙥𝙩𝙞𝙢𝙚 𝙍𝙪𝙣: " + uptimeString + "\n" +
        "📊 𝙀𝙭𝙥𝙡𝙤𝙞𝙩𝙨: " + totalCommands + " Loaded\n" +
        "📞 𝙎𝙚𝙘𝙪𝙧𝙚 𝙇𝙞𝙣𝙠: +880 191*†****\n" +
        "📍 𝙎𝙚𝙘𝙩𝙤𝙧: Bangladesh // Cyber Base\n" +
        "━━━━━━━━━━━━━━━━━━━━\n" +
        "🔒 [ SYSTEM INTRUSION CARD PACKET EXFILTRATED ]\n" +
        "━━━━━━━━━━━━━━━━━━━━";

      return api.sendMessage({
        body: caption,
        attachment: fs.createReadStream(outputPath)
      }, threadID, () => {
        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
      }, messageID);

    } catch (error) {
      console.error("[CYBER DEFENSE BLOCK ERROR]", error);
      return api.sendMessage(`[❌] CRITICAL SYSTEM FAULT: ${error.message}`, threadID, messageID);
    }
  }
};