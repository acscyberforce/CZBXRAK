const fs = require("fs-extra");
const axios = require("axios"); // ইমেজ স্ট্রিম করার জন্য axios রিকোয়ার্ড করা হলো
const { utils } = global;

/**
 * -----------------------------------------------------------------
 * 💥 CONFIG BREACHED BY: TONMOY HACKER
 * 🤖 BOT SYSTEM OPERACLE: SYSTEM PREFIX OVERRIDER (VISUAL CORE)
 * 👤 MASTERMIND: TIGER TONMOY (BD HACKER)
 * 📍 TARGET CORE: GLOBAL & LOCAL STORAGE DEPLOYMENT (2026)
 * -----------------------------------------------------------------
 */

module.exports = {
  config: {
    name: "prefix",
    version: "1.7.0", // Visual Cyber Upgrade
    author: "TONMOY HACKER",
    countDown: 5,
    role: 2,
    description: "Alters the command execution bypass key (prefix) for a single cell or entire mainframe infrastructure.",
    category: "cyber_config",
    guide: {
      vi: "   {pn} <new prefix>: Thay đổi khóa truy cập (prefix) trong nhóm chat của bạn\nVí dụ:\n    {pn} #\n\n   {pn} <new prefix> -g: Ghi đè khóa truy cập trên toàn bộ hệ thống (Chỉ ROOT Admin)\nVí dụ:\n    {pn} # -g\n\n   {pn} reset: Khôi phục khóa truy cập mặc định của nhóm.",
      en: "   {pn} <new prefix>: Override bypass key (prefix) for this localized mainframe cell.\nExample:\n    {pn} #\n\n   {pn} <new prefix> -g: Force inject global prefix across entire infrastructure (ROOT Admin Only).\nExample:\n    {pn} # -g\n\n   {pn} reset: Restore cell configuration back to default prefix."
    }
  },

  langs: {
    vi: {
      reset: "[🔄] Khôi phục cấu hình hệ thống! Prefix mặc định được nạp lại: %1",
      onlyAdmin: "[❌] TRUY CẬP BỊ TỪ CHỐI: Yêu cầu quyền ROOT Admin để thay đổi prefix toàn cục!",
      confirmGlobal: "[🛰️] CẢNH BÁO BẢO MẬT: Thả cảm xúc bất kỳ để XÁC NHẬN ghi đè khóa hệ thống TOÀN CỤC!",
      confirmThisThread: "[🔒] XÁC THỰC: Thả cảm xúc bất kỳ để XÁC NHẬN thay đổi khóa truy cập cục bộ của nhóm!",
      successGlobal: "[⚙️] HỆ THỐNG ĐÃ BỊ GHI ĐÈ: Khóa truy cập toàn cục chuyển sang: %1",
      successThisThread: "[⚙️] CẤU HÌNH TẾ BÀO ĐÃ THAY ĐỔI: Khóa truy cập cục bộ nhóm chuyển sang: %1",
      myPrefix: "┌──────────────────┐\n   ☠️ 𝘾𝙔𝘽𝙀𝙍 𝙋𝙍𝙀𝙁𝙄𝙓 𝙄𝙉𝙏𝙍𝙐𝙎𝙄𝙊𝙉 ☠️\n└──────────────────┘\n👋 Hey %1, Cần truy cập mã lệnh?\n➥ 🌐 Global core: %2\n➥ 💬 Cell net   : %3\n[🛰️] System matrix: %4 ready to execute 🫡"
    },
    en: {
      reset: "[🔄] Mainframe restore complete! Local bypass key reloaded to default: %1",
      onlyAdmin: "[❌] ACCESS DENIED: Requires ROOT administrator privileges to inject global core modifications!",
      confirmGlobal: "[🛰️] SYSTEM WARNING: React to this packet to CONFIRM global override of the mainframe encryption key!",
      confirmThisThread: "[🔒] PRIVACY AUTHENTICATION: React to this packet to CONFIRM localized cell prefix configuration modification!",
      successGlobal: "[⚙️] MAINFRAME RE-CONFIGURED: Global system execution key mutated to: %1",
      successThisThread: "[⚙️] LOCAL PROTOCOL ALTERED: Local cell network execution key changed to: %1",
      myPrefix: "┌──────────────────┐\n   ☠️ 𝘾𝙔𝘽𝙀𝙍 𝙋𝙍𝙀𝙁𝙄𝙓 𝙄𝙉𝙏𝙍𝙐𝙎𝙄𝙊𝙉 ☠️\n└──────────────────┘\n👋 Hey %1, requesting mainframe access parameters?\n➥ 🌐 Global core: %2\n➥ 💬 Cell net   : %3\n[🛰️] System matrix: %4 ready to execute 🫡"
    }
  },

  onStart: async function ({ message, role, args, commandName, event, threadsData, getLang }) {
    if (!args[0]) return message.SyntaxError();

    if (args[0] == 'reset') {
      await threadsData.set(event.threadID, null, "data.prefix");
      return message.reply(getLang("reset", global.GoatBot.config.prefix));
    }

    const newPrefix = args[0];
    const formSet = {
      commandName,
      author: event.senderID,
      newPrefix
    };

    if (args[1] === "-g") {
      if (role < 2) return message.reply(getLang("onlyAdmin"));
      else formSet.setGlobal = true;
    } else {
      formSet.setGlobal = false;
    }

    return message.reply(args[1] === "-g" ? getLang("confirmGlobal") : getLang("confirmThisThread"), (err, info) => {
      formSet.messageID = info.messageID;
      global.GoatBot.onReaction.set(info.messageID, formSet);
    });
  },

  onReaction: async function ({ message, threadsData, event, Reaction, getLang }) {
    const { author, newPrefix, setGlobal } = Reaction;
    if (event.userID !== author) return;

    if (setGlobal) {
      global.GoatBot.config.prefix = newPrefix;
      fs.writeFileSync(global.client.dirConfig, JSON.stringify(global.GoatBot.config, null, 2));
      return message.reply(getLang("successGlobal", newPrefix));
    } else {
      await threadsData.set(event.threadID, newPrefix, "data.prefix");
      return message.reply(getLang("successThisThread", newPrefix));
    }
  },

  onChat: async function ({ event, message, getLang, usersData }) {
    if (event.body && event.body.toLowerCase() === "prefix") {
      const userName = await usersData.getName(event.senderID);
      const botName = global.GoatBot.config.nickNameBot || "Oracle Bot";
      
      // 📷 এখানে আপনার পছন্দের যেকোনো হ্যাকিং বা সাইবার ইমেজের ডিরেক্ট ইউআরএল দিন
      const cyberImageUrl = "https://i.imgur.com/5oG0Ohe.jpeg"; 

      try {
        const response = await axios({
          url: cyberImageUrl,
          method: "GET",
          responseType: "stream"
        });

        // ইমেজ অ্যাটাচমেন্টসহ মেসেজ পাঠানো
        return message.reply({
          body: getLang("myPrefix", userName, global.GoatBot.config.prefix, utils.getPrefix(event.threadID), botName),
          attachment: response.data
        });
      } catch (err) {
        // ইমেজ লোড হতে সমস্যা হলে যেন শুধু টেক্সট চলে যায় তার ফলব্যাক ব্যাকআপ
        return message.reply(getLang("myPrefix", userName, global.GoatBot.config.prefix, utils.getPrefix(event.threadID), botName));
      }
    }
  }
};