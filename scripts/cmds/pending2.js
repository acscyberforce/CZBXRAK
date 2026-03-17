module.exports = {
  config: {
    name: "pending2",
    aliases: ["pen2"],
    version: "2.8.0",
    author: "Milon Pro",
    countDown: 5,
    role: 0, 
    description: "Approve pending groups silently using invisible trigger.",
    category: "admin",
    usePrefix: false,
    guide: {
      en: "pending2 | pen2 (to see list)\nReply with number to approve silently"
    }
  },

/* --- [ 🔐 FILE_CREATOR_INFORMATION ] ---
 * 🤖 BOT NAME: MILON BOT
 * 👤 OWNER: MILON HASAN 
 * 📍 LOCATION: NARAYANGANJ, BANGLADESH
 * 🛠️ PROJECT: MILON BOT PROJECT (2026)
 * --------------------------------------- */

  onChat: async function ({ api, event, message }) {
    const body = event.body ? event.body.toLowerCase() : "";
    if (body === "pending2" || body === "pen2") {
      return this.onStart({ api, event, message });
    }
  },

  onStart: async function ({ api, event, message }) {
    const { threadID, messageID, senderID } = event;
    const adminUIDs = ["61555429546528"]; 

    if (!adminUIDs.includes(senderID)) {
      return message.reply("❌ | Access Denied: Admin only.");
    }

    try {
      const spam = await api.getThreadList(100, null, ["OTHER"]) || [];
      const pending = await api.getThreadList(100, null, ["PENDING"]) || [];
      const list = [...spam, ...pending].filter(group => group.isGroup);

      if (list.length === 0) {
        return message.reply("✅ | Information: No pending groups found.");
      }

      let msg = "📥 𝐏𝐞𝐧𝐝𝐢𝐧𝐠 𝐑𝐞𝐪𝐮𝐞𝐬𝐭 𝐋𝐢𝐬𝐭 📥\n━━━━━━━━━━━━━━━━━\n";
      list.forEach((item, index) => {
        msg += `${index + 1}. ${item.name || "Unknown Group"}\n🆔 ID: ${item.threadID}\n\n`;
      });
      msg += "━━━━━━━━━━━━━━━━━\n👉 Reply with serial number to approve silently.";

      return api.sendMessage(msg, threadID, (error, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: this.config.name,
          messageID: info.messageID,
          author: senderID,
          pending: list
        });
      }, messageID);

    } catch (e) {
      return message.reply("❌ | Error: Failed to load list.");
    }
  },

  onReply: async function ({ api, event, Reply, message }) {
    const { body, threadID, messageID, senderID } = event;
    if (String(senderID) !== String(Reply.author)) return;

    const index = body.trim().split(/\s+/);
    let count = 0;

    try {
      for (const singleIndex of index) {
        const i = parseInt(singleIndex) - 1;
        if (isNaN(singleIndex) || i < 0 || i >= Reply.pending.length) {
          return message.reply(`❌ | Invalid: ${singleIndex}`);
        }

        const targetID = Reply.pending[i].threadID;

        // --- [ 🤫 INVISIBLE TRIGGER ] ---
        // এই ক্যারেক্টারটি চ্যাটে দেখা যায় না কিন্তু রিকোয়েস্ট এক্সেপ্ট করার জন্য যথেষ্ট।
        await api.sendMessage("ㅤ", targetID); 
        
        count += 1;
      }

      return message.reply(`✅ | Success: ${count} group(s) approved silently. No notifications visible to members.`);
    } catch (err) {
      return message.reply("❌ | Error: Approval failed.");
    } finally {
      global.GoatBot.onReply.delete(Reply.messageID);
    }
  }
};
