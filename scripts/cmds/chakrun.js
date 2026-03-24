const os = require("os");
const fs = require("fs");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
  config: {
    name: "chakrun",
    aliases: ["ckr", "chakrun"],
    version: "19.0.2",
    author: "Milon Islam",
    countDown: 5,
    role: 0,
    category: "system",
    usePrefix: false 
  },

/* --- [ 🔐 FILE_CREATOR_INFORMATION ] ---
 * 🤖 BOT NAME: MILON BOT
 * 👤 OWNER: MILON ISLAM (MILON BOSS)
 * 🔗 FB: https://www.facebook.com/share/17uGq8qVZ9/
 * 📍 LOCATION: NARAYANGANJ, BANGLADESH
 * 🛠️ PROJECT: MILON BOT PROJECT (2026)
 * --------------------------------------- */

  onChat: async function ({ api, event, message }) {
    if (!event.body) return;
    const input = event.body.toLowerCase().trim();
    if (input === "chakrun" || input === "ckr") {
      return this.onStart({ api, event, message });
    }
  },

  onStart: async function ({ api, event, message }) {
    const { threadID } = event;
    const botID = api.getCurrentUserID();
    
    const images = [
      "https://i.imgur.com/r2mksO1.jpeg",
      "https://i.imgur.com/IiQ35ge.jpeg"
    ];
    const imgURL = images[Math.floor(Math.random() * images.length)];
    const botImgURL = `https://graph.facebook.com/${botID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
    
    const cacheDir = path.join(__dirname, "cache");
    const imgPath = path.join(cacheDir, `sysinfo_${Date.now()}.png`);

    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

    const wait = await message.reply("⏳");

    try {
      let hostPlatform = "Unknown";
      const platform = os.platform();
      const arch = os.arch(); 
      const uptime = process.uptime(); 
      
      const isRender = process.env.RENDER || (process.env.HOME && process.env.HOME.includes("/opt/render"));
      const isRailway = process.env.RAILWAY_ID || process.env.RAILWAY_ENVIRONMENT;

      if (isRender) hostPlatform = "Render Cloud";
      else if (isRailway) hostPlatform = "Railway Cloud";
      else if (platform === "linux") hostPlatform = "Linux VPS";
      else if (platform === "win32") hostPlatform = "Windows";
      else if (platform === "android") hostPlatform = "Termux";

      const days = Math.floor(uptime / 86400);
      const hours = Math.floor((uptime % 86400) / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);

      const totalMem = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
      const usedMem = ((os.totalmem() - os.freemem()) / 1024 / 1024 / 1024).toFixed(2);
      const ping = Date.now() - event.timestamp;

      const baseImage = await loadImage(imgURL);
      const botAvatar = await loadImage(botImgURL);
      const canvas = createCanvas(baseImage.width, baseImage.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);

      const avatarSize = canvas.height * 0.22; 
      const avatarX = canvas.width - avatarSize - 60; 
      const avatarY = 60;

      ctx.save();
      ctx.beginPath();
      ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(botAvatar, avatarX, avatarY, avatarSize, avatarSize);
      ctx.restore();

      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
      ctx.stroke();

      const dotRadius = avatarSize * 0.12;
      const dotX = avatarX + avatarSize * 0.85;
      const dotY = avatarY + avatarSize * 0.85;
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(dotX, dotY, dotRadius + 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#31A24C"; 
      ctx.beginPath();
      ctx.arc(dotX, dotY, dotRadius, 0, Math.PI * 2);
      ctx.fill();

      const startX = canvas.width * 0.08; 
      let currentY = canvas.height * 0.12; 
      const lineSpacing = canvas.height * 0.09;
      const dataX = 180; 

      ctx.textBaseline = "top";
      ctx.strokeStyle = "#000000"; 
      ctx.lineJoin = "round";

      ctx.font = `bold ${Math.floor(canvas.height * 0.08)}px sans-serif`;
      ctx.lineWidth = 6;
      ctx.strokeText("MILON BOT SYSTEM", startX, currentY);
      ctx.fillStyle = "#ffffff";
      ctx.fillText("MILON BOT SYSTEM", startX, currentY);
      
      currentY += lineSpacing * 1.6;

      ctx.font = `bold ${Math.floor(canvas.height * 0.05)}px sans-serif`;
      ctx.lineWidth = 5;

      const stats = [
        { label: "🌐 Host:", value: `${hostPlatform}` },
        { label: "⚙️ OS:", value: `${platform} (${arch})` }, 
        { label: "⏳ Uptime:", value: `${days}d ${hours}h ${minutes}m` },
        { label: "🧠 RAM:", value: `${usedMem}GB / ${totalMem}GB` },
        { label: "📡 Ping:", value: `${ping} ms` },
        { label: "🟢 Node:", value: `${process.version}` }
      ];

      stats.forEach((item) => {
        ctx.strokeText(item.label, startX, currentY);
        ctx.fillStyle = "#ffffff";
        ctx.fillText(item.label, startX, currentY);
        ctx.strokeText(item.value, startX + dataX, currentY);
        ctx.fillStyle = "#ffffff";
        ctx.fillText(item.value, startX + dataX, currentY);
        currentY += lineSpacing; 
      });

      const footerSize = Math.floor(canvas.height * 0.045);
      ctx.font = `italic bold ${footerSize}px sans-serif`;
      ctx.fillStyle = "#ffffff"; 
      ctx.lineWidth = 6;
      
      const footerText = "Power by: Milon Islam";
      ctx.strokeText(footerText, startX, canvas.height - (lineSpacing * 1.1));
      ctx.fillText(footerText, startX, canvas.height - (lineSpacing * 1.1));

      const buffer = canvas.toBuffer("image/png");
      fs.writeFileSync(imgPath, buffer);

      api.unsendMessage(wait.messageID);
      await message.reply({ attachment: fs.createReadStream(imgPath) });
      fs.unlinkSync(imgPath);

    } catch (err) {
      console.error(err);
      if(wait) api.unsendMessage(wait.messageID);
      return message.reply(`❌ Error: ${err.message}`);
    }
  }
};
