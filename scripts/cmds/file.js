const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "file",
    aliases: ["filecmd", "viewcode"],
    version: "1.7.0",
    author: "Milon Pro",
    countDown: 5,
    role: 0,
    shortDescription: "View the source code (No Prefix)",
    category: "system",
    guide: { en: "file [commandName]" }
  },

  // Handles no prefix functionality
  onChat: async function ({ api, event, message }) {
    const { body, senderID } = event;
    
    // --- [ 🔐 AUTHORIZED UIDs ] ---
    const adminUIDs = ["61555429546528", "61585985686316", "61555429546528"]; 

    if (!body) return;

    const args = body.split(/\s+/);
    const trigger = args[0].toLowerCase();

    if (trigger === "file") {
      // Security Check
      if (!adminUIDs.includes(senderID)) {
        return message.reply("❌ | Access Denied: You are not authorized to use this command.");
      }

      const cmdName = args[1];
      if (!cmdName) {
        return message.reply("⚠️ | Please provide a command name.\nExample: file join");
      }

      const cmdPath = path.join(__dirname, `${cmdName}.js`);

      if (!fs.existsSync(cmdPath)) {
        return message.reply(`❌ | Error: Command "${cmdName}.js" not found.`);
      }

      try {
        const code = fs.readFileSync(cmdPath, "utf8");

        if (code.length > 19000) {
          return message.reply("⚠️ | File Limit: This code is too large to display.");
        }

        return message.reply({
          body: `📄 | Source code of "${cmdName}.js":\n\n${code}`
        });
      } catch (err) {
        console.error(err);
        return message.reply("❌ | Error: Unable to read the file.");
      }
    }
  },

  // Also keeps onStart for prefix usage
  onStart: async function ({ args, message, event }) {
    const { senderID } = event;
    const adminUIDs = ["61555429546528", "61585985686316", "61555429546528"];

    if (!adminUIDs.includes(senderID)) {
      return message.reply("❌ | Access Denied: Unauthorized UID.");
    }

    const cmdName = args[0];
    if (!cmdName) return message.reply("⚠️ | Usage: file [commandName]");

    const cmdPath = path.join(__dirname, `${cmdName}.js`);
    if (!fs.existsSync(cmdPath)) return message.reply(`❌ | Command "${cmdName}.js" not found.`);

    try {
      const code = fs.readFileSync(cmdPath, "utf8");
      return message.reply(`📄 | Source code of "${cmdName}.js":\n\n${code}`);
    } catch (err) {
      return message.reply("❌ | Error reading the file.");
    }
  }
};
