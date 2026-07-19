const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
  config: {
    name: "chipay",
    aliases: ["corner", "muri"],
    version: "2.5.0",
    author: "Tonmoy", // Updated author name
    countDown: 5,
    role: 0,
    shortDescription: "Fun command with image and stylish caption",
    category: "fun",
    guide: { en: "{pn} @mention or reply" }
  },

  onStart: async function ({ api, event }) {
    const { threadID, messageID, senderID, mentions, messageReply } = event;

    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.ensureDirSync(cacheDir);

    let targetID;
    if (Object.keys(mentions).length > 0) {
      targetID = Object.keys(mentions)[0];
    } else if (messageReply) {
      targetID = messageReply.senderID;
    } else {
      return api.sendMessage("🤖 | আরে ভাই! চিপায় কারে নিবেন? কাউরে তো মেনশন বা রিপ্লাই করলেন না! 🤷‍♂️", threadID, messageID);
    }

/* --- [ 🔐 INTERNAL_SECURE_METADATA ] ---
 * 🤖 BOT NAME: TONMOY BOT
 * 👤 OWNER: TONMOY
 * --------------------------------------- */

    const imgPath = path.join(cacheDir, `chipay_${Date.now()}.png`);

    try {
      const userInfo = await api.getUserInfo(targetID);
      const targetName = userInfo[targetID]?.name || "User";

      // Preparation Message 
      api.sendMessage("✨ | একটু অপেক্ষা করুন... চিপায় নিয়ে স্পেশাল ঝালমুড়ি মাখানো হচ্ছে! 🌶️🤤", threadID, messageID);

      const backgroundUrl = "https://i.imgur.com/PlmZXfJ.jpeg";
      const accessToken = "6628568379|c1e620fa708a1d5696fb991c1bde5662"; 
      const avtMentionUrl = `https://graph.facebook.com/${targetID}/picture?width=720&height=720&access_token=${accessToken}`;
      const avtSenderUrl = `https://graph.facebook.com/${senderID}/picture?width=720&height=720&access_token=${accessToken}`;

      const [bgImg, avtLeft, avtRight] = await Promise.all([
        loadImage(backgroundUrl),
        loadImage(avtMentionUrl),
        loadImage(avtSenderUrl)
      ]);

      const canvas = createCanvas(bgImg.width, bgImg.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

      // --- Draw Unique Rounded Box and Name inside Image ---
      ctx.font = "bold 20px 'Segoe UI', Arial, sans-serif"; 
      const textWidth = ctx.measureText(targetName).width;
      
      const paddingX = 15;
      const paddingY = 8;
      const boxWidth = textWidth + paddingX * 2;
      const boxHeight = 35;
      
      // Position calculation for bottom right corner
      const boxX = canvas.width - boxWidth - 30; 
      const boxY = canvas.height - 120;

      // Draw Beautiful Rounded Background Box
      ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 8) : ctx.rect(boxX, boxY, boxWidth, boxHeight);
      ctx.fill();

      // Draw White Border
      ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Draw Mention Name
      ctx.fillStyle = "#FFFFFF"; 
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(targetName, boxX + paddingX, boxY + (boxHeight / 2));

      // --- Avatar Configurations ---
      const avatarSizeLeft = 110; 
      const avatarSizeUser = 95; 

      // --- Left Side (Target Avatar) ---
      const xLeft = 85, yLeft = 85; 
      ctx.save();
      ctx.beginPath();
      ctx.arc(xLeft + avatarSizeLeft / 2, yLeft + avatarSizeLeft / 2, avatarSizeLeft / 2, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avtLeft, xLeft, yLeft, avatarSizeLeft, avatarSizeLeft);
      ctx.restore();

      // --- Right Side (Sender Avatar) ---
      const xRight = 350, yRight = 100; 
      ctx.save();
      ctx.beginPath();
      ctx.arc(xRight + avatarSizeUser / 2, yRight + avatarSizeUser / 2, avatarSizeUser / 2, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avtRight, xRight, yRight, avatarSizeUser, avatarSizeUser);
      ctx.restore();

      const buffer = canvas.toBuffer("image/png");
      fs.writeFileSync(imgPath, buffer);

      // Unique Stylized Caption (Edit by Tonmoy)
      const caption = `🎭 ⎯͢⎯⃝✨ ❝চিপায় আয় ঝালমুড়ি খাই, তোর মতো ফ্রেন্ড আর কোথাও নাই!❞ 🤭🌾\n\n🥵 শুনো ${targetName}, বেশি কথা না বলে চিপায় আসো! 🫣🔥`;

      return api.sendMessage({
        body: caption,
        mentions: [{ tag: targetName, id: targetID }],
        attachment: fs.createReadStream(imgPath)
      }, threadID, () => {
        if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
      }, messageID);

    } catch (error) {
      console.log("CHIPAY ERROR:", error);
      return api.sendMessage("❌ | দুঃখিত! ইমেজ প্রসেস করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।", threadID, messageID);
    }
  }
};