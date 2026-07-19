module.exports = { config: { name: "tonmoy", aliases: ["tonmoyvai", "sheikhtonmoy"], version: "1.0", author: "TONMOY", countDown: 2, role: 0, shortDescription: "Tonmoy Auto Reply", category: "noprefix" },

onStart: async function () {},

onChat: async function ({ api, event }) { const body = (event.body || "").toLowerCase();

const keywords = [ "tonmoy", "tonmoy vai", "tonmoy bhai", "tonmoy vaiya", "sheikh tonmoy", "tonmoy chowdhury", "Liam Rexxy", "@Liam Rexxy" ]; if (keywords.some(k => body.includes(k))) { return api.sendMessage( { body: `👑 𝗕𝗢𝗦𝗦 𝗔𝗟𝗘𝗥𝗧 👑 

⚡ আমার বস বর্তমানে BG আছেন। 💻 গুরুত্বপূর্ণ Coding Project নিয়ে ব্যস্ত রয়েছেন।

📩 আপনার বার্তাটি সংরক্ষণ করা হয়েছে। 🕒 সময় পেলেই তিনি আপনার মেসেজের উত্তর দেবেন।

🤝 ধৈর্য ধরে অপেক্ষা করার জন্য ধন্যবাদ। ❤️ Have a Nice Day!`,

attachment: await global.utils.getStreamFromURL( "https://files.catbox.moe/6vyw8z.jpg" ) }, event.threadID, null, event.messageID ); } 

} };