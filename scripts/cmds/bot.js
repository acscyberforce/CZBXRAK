const axios = require('axios');
const http = require('http');
const https = require('https');

// সার্ভারের সাথে কানেকশন ধরে রাখার জন্য এজেন্ট
const httpAgent = new http.Agent({ keepAlive: true });
const httpsAgent = new https.Agent({ keepAlive: true });

const baseApiUrl = "https://noobs-api.top/dipto/baby";

module.exports = {
  config: {
    name: "bot",
    aliases: ["mbot", "milonbot"],
    version: "10.5.0",
    author: "Milon",
    countDown: 0,
    role: 0,
    description: "Ultra-optimized high-speed bot",
    category: "fun",
    guide: { en: "{pn} [text]" }
  },

/* --- [ 🔐 FILE_CREATOR_INFORMATION ] ---
 * 🤖 BOT NAME: MILON BOT
 * 👤 OWNER: MILON HASAN
 * 🔗 FACEBOOK: https://www.facebook.com/share/17uGq8qVZ9/
 * 📍 LOCATION: NARAYANGANJ, BANGLADESH
 * --------------------------------------- */

  onStart: async function ({ api, event, args, usersData }) {
    const { threadID, messageID, senderID } = event;

    try {
      if (!args[0]) {
        const name = await usersData.getName(senderID);
        return api.sendMessage({
          body: `「 ${name} 」\nবলুন আমি "বট" আপনাকে কিভাবে সাহায্য করতে পারি?`,
          mentions: [{ tag: name, id: senderID }]
        }, threadID, messageID);
      }

      if (args[0] === 'teach') {
        const [q, a] = args.slice(1).join(" ").split(/\s*-\s*/);
        if (!q || !a) return api.sendMessage("⚠️ Format: teach ask - reply", threadID, messageID);
        
        const { data } = await axios.get(`${baseApiUrl}?teach=${encodeURIComponent(q)}&reply=${encodeURIComponent(a)}&senderID=${senderID}`, {
          httpAgent, httpsAgent, timeout: 10000 
        });
        return api.sendMessage(`✅ Added: ${data.message}`, threadID, messageID);
      }

      // Ultra Fast Request
      const text = args.join(" ");
      const { data } = await axios.get(`${baseApiUrl}?text=${encodeURIComponent(text)}&senderID=${senderID}&font=1`, {
        httpAgent, httpsAgent, timeout: 5000 
      });

      return api.sendMessage(data.reply, threadID, (err, info) => {
        if (global.GoatBot?.onReply) global.GoatBot.onReply.set(info.messageID, { commandName: "bot", messageID: info.messageID, author: senderID });
      }, messageID);

    } catch (e) { 
      return api.sendMessage("🚀 API একটু বিজি, আবার ট্রাই করেন মামা!", threadID, messageID); 
    }
  },

  onReply: async ({ api, event }) => {
    if (api.getCurrentUserID() == event.senderID) return;
    try {
      const { data } = await axios.get(`${baseApiUrl}?text=${encodeURIComponent(event.body)}&senderID=${event.senderID}&font=1`, {
        httpAgent, httpsAgent, timeout: 5000 
      });
      api.sendMessage(data.reply, event.threadID, (err, info) => {
        if (global.GoatBot?.onReply) global.GoatBot.onReply.set(info.messageID, { commandName: "bot", messageID: info.messageID, author: event.senderID });
      }, event.messageID);
    } catch (err) {}
  },

  onChat: async ({ api, event, usersData }) => {
    const { body, senderID, threadID, messageID } = event;
    if (!body) return;

    if (body.toLowerCase().startsWith("bot") || body.startsWith("বট")) {
      const text = body.replace(/^(bot|বট)\s*/i, "").trim();

      if (!text) {
        const name = await usersData.getName(senderID);
        const randomReplies = [
          "𝗵𝗲 𝗯𝗼𝘁 𝗯𝗼𝘁 𝗰𝗵𝗶𝗹𝗹 𝗯𝗿𝗼!", "I love you 💝", "আমি মিলন বস এর সাথে বিজি আছি-😕😏",
          "আমার বস মিলন কে একটা জি GF দাও-😽🫶", "জান তোমার নানি রে আমার হাতে তুলে দিবা-🙊🙆‍♂",
          "মিলন বস'এর হবু বউ রে কেও দেকছো?😪", "জান হাঙ্গা করবা-🙊😝",
          "ইসস এতো ডাকো কেনো লজ্জা লাগে তো-🙈🖤", "তাকাই আছো কেন চুমু দিবা-🙄🐸😘",
          "বেশি Bot Bot করলে leave নিবো কিন্তু😒", "তোর বাড়ি কি মাল দিপ গ্রাম😵‍💫",
          "মেয়ে হলে বস মিলন কে 𝐊𝐈𝐒𝐒 দে 😒", "চুমু খাওয়ার বয়স টা চকলেট🍫খেয়ে উড়িয়ে দিলো মিলন বস 🥺🤗",
          "আহ শোনা আমার আমাকে এতো ডাক্তাছো কেনো আসো বুকে আশো🥱", "জান বাল ফালাইবা-🙂🥱🙆‍♂",
          "আজকে প্রপোজ করে দেখো রাজি হইয়া যামু-😌🤗😇", "দিনশেষে পরের BOW সুন্দর-☹️🤧",
          "সুন্দর মাইয়া মানেই-🥱আমার বস মিলন এর বউ-😽🫶", "হা জানু , এইদিক এ আসো কিস দেই🤭 😘",
          "আরে আমি মজা করার mood এ নাই😒", "আমাকে ডাকলে ,আমি কিন্তূ কিস করে দেবো😘",
          "আপনার সুন্দরী বান্ধুবীকে ফিতরা হিসেবে আমার বস মিলন কে দান করেন-🥱🐰🍒",
          "ও মিম ও মিম-😇-তুমি কেন চুরি করলা সাদিয়ার ফর্সা হওয়ার ক্রীম-🌚🤧", "অনুমতি দিলে কল দিতাম..!😒",
          "জান তুমি শুধু আমার আমি তোমারে ৩৬৫ দিন ভালোবাসি-💝🌺😽",
          "বস মিলন এর সাথে কথা বলবো এখন , ডিস্টার্ব করিস না 😒", "বেশি বেশি বকবক করলে তোকে ব্লক মেরে দেবো কিন্তু-🐸",
          "জানু তোমার জন্য আমার মনটা আই ঢাই করে 💖", "ওই যে দেখো মিলন বস যাচ্ছে , এক বালতি প্রেম দিয়ে দাও 🤭"
        ];
        const rand = randomReplies[Math.floor(Math.random() * randomReplies.length)];

        return api.sendMessage({
          body: `「 ${name} 」\n\n${rand}`,
          mentions: [{ tag: name, id: senderID }]
        }, threadID, (err, info) => {
          if (global.GoatBot?.onReply) global.GoatBot.onReply.set(info.messageID, { commandName: "bot", messageID: info.messageID, author: senderID });
        }, messageID);
      }

      try {
        const { data } = await axios.get(`${baseApiUrl}?text=${encodeURIComponent(text)}&senderID=${senderID}&font=1`, {
          httpAgent, httpsAgent, timeout: 5000 
        });
        api.sendMessage(data.reply, threadID, (err, info) => {
          if (global.GoatBot?.onReply) global.GoatBot.onReply.set(info.messageID, { commandName: "bot", messageID: info.messageID, author: senderID });
        }, messageID);
      } catch (err) {}
    }
  }
};
