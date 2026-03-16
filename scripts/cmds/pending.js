const axios = require("axios");

module.exports = {
	config: {
		name: "pending",
		version: "1.0.8",
		author: "ryuko/updated by Gemini",
		countDown: 5,
		role: 2, // Admin only
		shortDescription: {
			en: "Approve groups without prefix"
		},
		longDescription: {
			en: "Manage and approve pending group threads without prefix"
		},
		category: "admin",
		guide: {
			en: "pending (to see list)\nReply with number to approve\nReply with 'c' + number to cancel"
		}
	},

	langs: {
		"en": {
			"invaildNumber": "❌ %1 is not a valid number",
			"cancelSuccess": "✅ Refused %1 thread(s) successfully!",
			"notiBox": "✅ 𝗚𝗿𝗼𝘂𝗽 𝗔𝗽𝗽𝗿𝗼𝘃𝗲𝗱 𝗦𝘂𝗰𝗰𝗲𝘀𝘀𝗳𝘂𝗹𝗹𝘆! ✅\n\n━━━━━━━━━━━━━━━━━━\n👑 𝗔𝗽𝗽𝗿𝗼𝘃𝗲𝗱 𝗕𝘆: %1\n🔗 𝗙𝗮𝗰𝗲𝗯𝗼𝗼𝗸: https://facebook.com/%2\n━━━━━━━━━━━━━━━━━━\n\n⚙️ 𝗔𝗹𝗹 𝗽𝗿𝗲𝗺𝗶𝘂𝗺 𝗯𝗼𝘁 𝗳𝗲𝗮𝘁𝘂𝗿𝗲𝘀 𝗮𝗿𝗲 𝗻𝗼𝘄 𝘂𝗻𝗹𝗼𝗰𝗸𝗲𝗱!\n🎉 𝗘𝗻𝗷𝗼𝘆 𝘁𝗵𝗲 𝗳𝘂𝗹𝗹 𝗽𝗼𝘄𝗲𝗿 𝗼𝗳 𝗠𝗜𝗟𝗢𝗡✔𝗕𝗢𝗧🤖",
			"approveSuccess": "✅ Approved %1 thread(s) successfully!",
			"cantGetPendingList": "❌ Can't get the pending list!",
			"returnListPending": "📝 Total groups to approve: %1\n\n%2\n\n👉 Reply with number to approve or 'c' + number to cancel.",
			"returnListClean": "Empty! No group is currently in the pending list."
		}
	},

	// এই অংশটি প্রিফিক্স ছাড়া কাজ নিশ্চিত করবে
	onChat: async function ({ api, event, getLang }) {
		const { body, threadID, messageID } = event;
		if (body && body.toLowerCase() === "pending") {
			return this.onStart({ api, event, getLang });
		}
	},

	onReply: async function ({ api, event, Reply, getLang }) {
		if (String(event.senderID) !== String(Reply.author)) return;
		const { body, threadID, messageID, senderID } = event;
		let count = 0;

		let name;
		try {
			const userInfo = await api.getUserInfo(senderID);
			name = userInfo[senderID]?.name || "Admin";
		} catch (e) {
			name = "Admin";
		}

		if (body.toLowerCase().startsWith("c") || body.toLowerCase().startsWith("cancel")) {
			const index = (body.toLowerCase().startsWith("c") ? body.slice(1) : body.slice(6)).trim().split(/\s+/);
			for (const singleIndex of index) {
				if (isNaN(singleIndex) || singleIndex <= 0 || singleIndex > Reply.pending.length) {
					return api.sendMessage(getLang("invaildNumber", singleIndex), threadID, messageID);
				}
				await api.removeUserFromGroup(api.getCurrentUserID(), Reply.pending[singleIndex - 1].threadID);
				count += 1;
			}
			return api.sendMessage(getLang("cancelSuccess", count), threadID, messageID);
		} else {
			const index = body.trim().split(/\s+/);
			for (const singleIndex of index) {
				if (isNaN(singleIndex) || singleIndex <= 0 || singleIndex > Reply.pending.length) {
					return api.sendMessage(getLang("invaildNumber", singleIndex), threadID, messageID);
				}
				const notiMsg = getLang("notiBox", name, senderID);
				await api.sendMessage(notiMsg, Reply.pending[singleIndex - 1].threadID);
				count += 1;
			}
			return api.sendMessage(getLang("approveSuccess", count), threadID, messageID);
		}
	},

	onStart: async function ({ api, event, getLang }) {
		const { threadID, messageID, senderID } = event;

		// এটি শুধুমাত্র অ্যাডমিনদের জন্য (Role 2)
		// যদি আপনার রোলে সমস্যা হয় তবে এই চেকটি সরিয়ে দিতে পারেন
		try {
			const spam = await api.getThreadList(100, null, ["OTHER"]) || [];
			const pending = await api.getThreadList(100, null, ["PENDING"]) || [];
			const list = [...spam, ...pending].filter(group => group.isSubscribed && group.isGroup);

			let msg = "";
			let index = 1;
			for (const single of list) {
				msg += `${index++}/ ${single.name} (${single.threadID})\n`;
			}

			if (list.length !== 0) {
				return api.sendMessage(getLang("returnListPending", list.length, msg), threadID, (error, info) => {
					global.GoatBot.onReply.set(info.messageID, {
						commandName: this.config.name,
						messageID: info.messageID,
						author: senderID,
						pending: list
					});
				}, messageID);
			} else {
				return api.sendMessage(getLang("returnListClean"), threadID, messageID);
			}
		} catch (e) {
			console.error(e);
			return api.sendMessage(getLang("cantGetPendingList"), threadID, messageID);
		}
	}
};
