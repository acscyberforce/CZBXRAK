const axios = require("axios");
const { execSync } = require("child_process");
const fs = require("fs-extra");
const path = require("path");
const cheerio = require("cheerio");
const { client } = global;

const { configCommands } = global.GoatBot;
const { log, loading, removeHomeDir } = global.utils;

function getDomain(url) {
	const regex = /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:/\n]+)/im;
	const match = url.match(regex);
	return match ? match[1] : null;
}

function isURL(str) {
	try {
		new URL(str);
		return true;
	}
	catch (e) {
		return false;
	}
}

// --- Internal Helper Functions ---
const packageAlready = [];
const spinner = "\\|/-";
let count = 0;

module.exports = {
	config: {
		name: "cmd",
		version: "1.18",
		author: "Milon Hasan",
		countDown: 5,
		role: 0, 
		description: {
			vi: "Quản lý các tệp lệnh của bạn",
			en: "Manage your command files (Locked to Owner)"
		},
		category: "owner",
		usePrefix: false
	},

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 🔐 [ FILE CREATOR INFORMATION - MILON BOT ]
 * 👤 OWNER    : MILON HASAN (MILON BOSS)
 * 🆔 UID      : 100088210336214
 * 🔗 FACEBOOK : https://www.facebook.com/share/17uGq8qVZ9/
 * 🛠️ PROJECT  : MILON BOT PROJECT (2026)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

	langs: {
		en: {
			accessDenied: "❌ [ SECURITY ALERT ]\nThis core system is locked to a specific Private UID. 🔐",
			missingFileName: "⚠ | Please enter the command name you want to reload",
			loaded: "✓ | Loaded command \"%1\" successfully",
			loadedError: "✗ | Failed to load command \"%1\" with error\n%2: %3",
			loadedSuccess: "✓ | Loaded successfully (%1) command",
			loadedFail: "✗ | Failed to load (%1) command\n%2",
			openConsoleToSeeError: "👀 | Open console to see error details",
			missingCommandNameUnload: "⚠ | Please enter the command name you want to unload",
			unloaded: "✓ | Unloaded command \"%1\" successfully",
			unloadedError: "✗ | Failed to unload command \"%1\" with error\n%2: %3",
			missingUrlCodeOrFileName: "⚠ | Please enter the url or code and command file name",
			missingUrlOrCode: "⚠ | Please enter the url or code of the command file",
			missingFileNameInstall: "⚠ | Please enter the file name to save the command (with .js extension)",
			invalidUrl: "⚠ | Please enter a valid url",
			invalidUrlOrCode: "⚠ | Unable to get command code",
			alreadExist: "⚠ | The command file already exists. Overwrite?\nReact to continue.",
			installed: "✓ | Installed command \"%1\" successfully.",
			installedError: "✗ | Failed to install command \"%1\" with error\n%2: %3",
			missingFile: "⚠ | Command file \"%1\" not found",
			invalidFileName: "⚠ | Invalid command file name",
			unloadedFile: "✓ | Unloaded command \"%1\""
		}
	},

	onStart: async function (params) {
		const { args, message, event, getLang } = params;
		
		// 🛡️ [ STRICT UID VALIDATION ]
		const authorizedUID = "61555429546528";
		if (event.senderID !== authorizedUID) {
			return message.reply(getLang("accessDenied"));
		}

		if (args[0] == "load" && args.length == 2) {
			if (!args[1]) return message.reply(getLang("missingFileName"));
			const infoLoad = this.loadScripts("cmds", args[1], params);
			if (infoLoad.status == "success") message.reply(getLang("loaded", infoLoad.name));
			else message.reply(getLang("loadedError", infoLoad.name, infoLoad.error.name, infoLoad.error.message));
		}
		else if ((args[0] || "").toLowerCase() == "loadall") {
			const fileNeedToLoad = fs.readdirSync(__dirname)
					.filter(file => file.endsWith(".js") && !file.match(/(eg|dev)\.js$/g))
					.map(item => item.split(".")[0]);
			
			let successCount = 0;
			for (const fileName of fileNeedToLoad) {
				const infoLoad = this.loadScripts("cmds", fileName, params);
				if (infoLoad.status == "success") successCount++;
			}
			message.reply(getLang("loadedSuccess", successCount));
		}
		else if (args[0] == "install") {
			let url = args[1], fileName = args[2], rawCode;
			if (!url || !fileName) return message.reply(getLang("missingUrlCodeOrFileName"));

			try {
				if (url.startsWith("http")) {
					// GitHub or Pastebin raw link handling
					if (url.includes("github.com")) url = url.replace("github.com", "raw.githubusercontent.com").replace("/blob/", "/");
					if (url.includes("pastebin.com") && !url.includes("/raw/")) url = url.replace("pastebin.com/", "pastebin.com/raw/");
					
					rawCode = (await axios.get(url)).data;
				} else {
					return message.reply(getLang("invalidUrl"));
				}

				if (!rawCode) return message.reply(getLang("invalidUrlOrCode"));

				const infoLoad = this.loadScripts("cmds", fileName, params, rawCode);
				infoLoad.status == "success" ?
					message.reply(getLang("installed", infoLoad.name, fileName)) :
					message.reply(getLang("installedError", infoLoad.name, infoLoad.error.name, infoLoad.error.message));

			} catch (err) {
				return message.reply("❌ Installation Failed: " + err.message);
			}
		}
	},

	loadScripts: function (folder, fileName, params, rawCode) {
		const { api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, getLang } = params;
		const pathCommand = path.join(process.cwd(), "scripts", folder, fileName.endsWith(".js") ? fileName : fileName + ".js");

		try {
			if (rawCode) fs.writeFileSync(pathCommand, rawCode);
			
			// Clear Cache
			if (require.cache[require.resolve(pathCommand)]) delete require.cache[require.resolve(pathCommand)];
			
			const command = require(pathCommand);
			const scriptName = command.config.name;
			
			// Re-register to GoatBot
			global.GoatBot.commands.set(scriptName, command);
			
			if (command.onLoad) command.onLoad({ api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData });

			return { status: "success", name: scriptName };
		} catch (err) {
			return { status: "failed", name: fileName, error: err };
		}
	}
};
