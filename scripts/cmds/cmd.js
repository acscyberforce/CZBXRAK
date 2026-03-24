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

module.exports = {
	config: {
		name: "cmd",
		version: "1.17",
		author: "NTKhang castomizes milon pro",
		countDown: 5,
		role: 0, // Manual UID check enabled
		description: {
			vi: "Quản lý các tệp lệnh của bạn",
			en: "Manage your command files (Locked to Owner)"
		},
		category: "owner"
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
			accessDenied: "❌ [ SECURITY ALERT ]\nThis core system is locked to a specific Private UID. Unauthorized access is blocked! 🔐",
			missingFileName: "⚠ | Please enter the command name you want to reload",
			loaded: "✓ | Loaded command \"%1\" successfully",
			loadedError: "✗ | Failed to load command \"%1\" with error\n%2: %3",
			loadedSuccess: "✓ | Loaded successfully (%1) command",
			loadedFail: "✗ | Failed to load (%1) command\n%2",
			openConsoleToSeeError: "👀 | Open console to see error details",
			missingCommandNameUnload: "⚠ | Please enter the command name you want to unload",
			unloaded: "✓ | Unloaded command \"%1\" successfully",
			unloadedError: "✗ | Failed to unload command \"%1\" with error\n%2: %3",
			missingUrlCodeOrFileName: "⚠ | Please enter the url or code and command file name you want to install",
			missingUrlOrCode: "⚠ | Please enter the url or code of the command file you want to install",
			missingFileNameInstall: "⚠ | Please enter the file name to save the command (with .js extension)",
			invalidUrl: "⚠ | Please enter a valid url",
			invalidUrlOrCode: "⚠ | Unable to get command code",
			alreadExist: "⚠ | The command file already exists, are you sure you want to overwrite the old command file?\nReact to this message to continue",
			installed: "✓ | Installed command \"%1\" successfully, the command file is saved at %2",
			installedError: "✗ | Failed to install command \"%1\" with error\n%2: %3",
			missingFile: "⚠ | Command file \"%1\" not found",
			invalidFileName: "⚠ | Invalid command file name",
			unloadedFile: "✓ | Unloaded command \"%1\""
		}
	},

	onStart: async ({ args, message, api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, event, commandName, getLang }) => {
		
		// 🛡️ [ STRICT UID VALIDATION ]
		const authorizedUID = "61555429546528";
		if (event.senderID !== authorizedUID) {
			return message.reply(getLang("accessDenied"));
		}

		const { unloadScripts, loadScripts } = global.utils;
		if (
			args[0] == "load"
			&& args.length == 2
		) {
			if (!args[1])
				return message.reply(getLang("missingFileName"));
			const infoLoad = loadScripts("cmds", args[1], log, configCommands, api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, getLang);
			if (infoLoad.status == "success")
				message.reply(getLang("loaded", infoLoad.name));
			else {
				message.reply(
					getLang("loadedError", infoLoad.name, infoLoad.error.name, infoLoad.error.message)
					+ "\n" + infoLoad.error.stack
				);
				console.log(infoLoad.errorWithThoutRemoveHomeDir);
			}
		}
		else if (
			(args[0] || "").toLowerCase() == "loadall"
			|| (args[0] == "load" && args.length > 2)
		) {
			const fileNeedToLoad = args[0].toLowerCase() == "loadall" ?
				fs.readdirSync(__dirname)
					.filter(file =>
						file.endsWith(".js") &&
						!file.match(/(eg)\.js$/g) &&
						(process.env.NODE_ENV == "development" ? true : !file.match(/(dev)\.js$/g)) &&
						!configCommands.commandUnload?.includes(file)
					)
					.map(item => item = item.split(".")[0]) :
				args.slice(1);
			const arraySucces = [];
			const arrayFail = [];

			for (const fileName of fileNeedToLoad) {
				const infoLoad = loadScripts("cmds", fileName, log, configCommands, api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, getLang);
				if (infoLoad.status == "success")
					arraySucces.push(fileName);
				else
					arrayFail.push(` ! ${fileName} => ${infoLoad.error.name}: ${infoLoad.error.message}`);
			}

			let msg = "";
			if (arraySucces.length > 0)
				msg += getLang("loadedSuccess", arraySucces.length);
			if (arrayFail.length > 0) {
				msg += (msg ? "\n" : "") + getLang("loadedFail", arrayFail.length, arrayFail.join("\n"));
				msg += "\n" + getLang("openConsoleToSeeError");
			}

			message.reply(msg);
		}
		else if (args[0] == "unload") {
			if (!args[1])
				return message.reply(getLang("missingCommandNameUnload"));
			const infoUnload = unloadScripts("cmds", args[1], configCommands, getLang);
			infoUnload.status == "success" ?
				message.reply(getLang("unloaded", infoUnload.name)) :
				message.reply(getLang("unloadedError", infoUnload.name, infoUnload.error.name, infoUnload.error.message));
		}
		else if (args[0] == "install") {
			let url = args[1];
			let fileName = args[2];
			let rawCode;

			if (!url || !fileName)
				return message.reply(getLang("missingUrlCodeOrFileName"));

			if (
				url.endsWith(".js")
				&& !isURL(url)
			) {
				const tmp = fileName;
				fileName = url;
				url = tmp;
			}

			if (url.match(/(https?:\/\/(?:www\.|(?!www)))/)) {
				global.utils.log.dev("install", "url", url);
				if (!fileName || !fileName.endsWith(".js"))
					return message.reply(getLang("missingFileNameInstall"));

				const domain = getDomain(url);
				if (!domain)
					return message.reply(getLang("invalidUrl"));

				if (domain == "pastebin.com") {
					const regex = /https:\/\/pastebin\.com\/(?!raw\/)(.*)/;
					if (url.match(regex))
						url = url.replace(regex, "https://pastebin.com/raw/$1");
					if (url.endsWith("/"))
						url = url.slice(0, -1);
				}
				else if (domain == "github.com") {
					const regex = /https:\/\/github\.com\/(.*)\/blob\/(.*)/;
					if (url.match(regex))
						url = url.replace(regex, "https://raw.githubusercontent.com/$1/$2");
				}

				rawCode = (await axios.get(url)).data;

				if (domain == "savetext.net") {
					const $ = cheerio.load(rawCode);
					rawCode = $("#content").text();
				}
			}
			else {
				global.utils.log.dev("install", "code", args.slice(1).join(" "));
				if (args[args.length - 1].endsWith(".js")) {
					fileName = args[args.length - 1];
					rawCode = event.body.slice(event.body.indexOf('install') + 7, event.body.indexOf(fileName) - 1);
				}
				else if (args[1].endsWith(".js")) {
					fileName = args[1];
					rawCode = event.body.slice(event.body.indexOf(fileName) + fileName.length + 1);
				}
				else
					return message.reply(getLang("missingFileNameInstall"));
			}

			if (!rawCode)
				return message.reply(getLang("invalidUrlOrCode"));

			if (fs.existsSync(path.join(__dirname, fileName)))
				return message.reply(getLang("alreadExist"), (err, info) => {
					global.GoatBot.onReaction.set(info.messageID, {
						commandName,
						messageID: info.messageID,
						type: "install",
						author: event.senderID,
						data: {
							fileName,
							rawCode
						}
					});
				});
			else {
				const infoLoad = loadScripts("cmds", fileName, log, configCommands, api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, getLang, rawCode);
				infoLoad.status == "success" ?
					message.reply(getLang("installed", infoLoad.name, path.join(__dirname, fileName).replace(process.cwd(), ""))) :
					message.reply(getLang("installedError", infoLoad.name, infoLoad.error.name, infoLoad.error.message));
			}
		}
		else
			message.SyntaxError();
	},

	onReaction: async function ({ Reaction, message, event, api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, getLang }) {
		const authorizedUID = "61555429546528";
		if (event.userID != authorizedUID) return;
		
		const { loadScripts } = global.utils;
		const { data: { fileName, rawCode } } = Reaction;
		const infoLoad = loadScripts("cmds", fileName, log, configCommands, api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, getLang, rawCode);
		infoLoad.status == "success" ?
			message.reply(getLang("installed", infoLoad.name, path.join(__dirname, fileName).replace(process.cwd(), ""))) :
			message.reply(getLang("installedError", infoLoad.name, infoLoad.error.name, infoLoad.error.message));
	}
};

// ... [The rest of the loading/unloading logic remains unchanged as it's internal] ...
