const { GoatWrapper } = require("fca-liane-utils");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

/**
 * -----------------------------------------------------------------
 * 💥 MEDIA INTRUSION BY: TONMOY HACKER
 * 🤖 BOT SYSTEM OPERACLE: YOUTUBE MEDIA EXTRACTOR
 * 👤 MASTERMIND: TIGER TONMOY (BD HACKER)
 * 📍 TARGET CORE: STREAM BUFFERING DEPLOYMENT (2026)
 * -----------------------------------------------------------------
 */

module.exports = {
  config: {
    name: "video",
    version: "2.6.6", // Cyber Upgrade
    author: "TONMOY HACKER",
    countDown: 5,
    role: 0,
    shortDescription: "Bypass & extract YouTube media frames.",
    longDescription: "Breach YouTube servers to extract and download visual data packets without prefix layers.",
    category: "cyber_media",
    guide: {
      en: "video <target packet name>"
    }
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID, body } = event;
    const hackerAlias = "TONMOY HACKER";

    let query = args.join(" ");

    // Handling No-prefix network input
    if (!query && body) {
      query = body.replace(/^video\s+/i, "").trim();
    }

    // Syntax validation alert
    if (!query || query.toLowerCase() === "video") {
      return api.sendMessage(
        `❌ [ACCESS DENIED]: Missing data footprint!\n📌 Protocol Example: video Let Me Love You`,
        threadID,
        messageID
      );
    }

    let tempMsgID = null;

    try {
      const searching = await api.sendMessage(
        `📡 INJECTING SEARCH BEACON\n┌────────────────────────┐\n🔍 Target Query: ${query}\n⏳ Locating data packets...`,
        threadID
      );
      tempMsgID = searching.messageID;

      // Hacking search parameters via BetaDash API
      const searchRes = await axios.get(
        `https://betadash-search-download.vercel.app/yt?search=${encodeURIComponent(query)}`
      );

      const video = searchRes.data?.[0];
      if (!video || !video.url) throw new Error("Target mainframe returned empty packet arrays.");

      await api.unsendMessage(tempMsgID).catch(() => {});

      const downloading = await api.sendMessage(
        `🎯 TARGET BREACHED\n┌────────────────────────┐\n📖 Title: ${video.title}\n⬇️ Extracting buffer streams...`,
        threadID
      );
      tempMsgID = downloading.messageID;

      // Forcing payload extraction via Imran API
      const dlRes = await axios.get(
        `https://yt-api-imran.vercel.app/api?url=${video.url}`
      );

      const downloadUrl = dlRes.data?.downloadUrl;
      if (!downloadUrl) throw new Error("Direct download stream URL could not be decrypted.");

      // Intercepting binary stream data
      const buffer = (
        await axios.get(downloadUrl, { responseType: "arraybuffer" })
      ).data;

      const cacheDir = path.join(process.cwd(), "cache");
      await fs.ensureDir(cacheDir);

      const filePath = path.join(cacheDir, `cyber_stream_${Date.now()}.mp4`);
      await fs.writeFile(filePath, buffer);

      // Terminal style presentation layout
      const finalMessage = {
        body:
          `┌────────────────────────┐\n` +
          `    ☠️ 𝘾𝙔𝘽𝙀𝙍 𝙈𝙀𝘿𝙄𝘼 𝙀𝙓𝙏𝙍𝘼𝘾𝙏𝙀𝘿 ☠️\n` +
          `└────────────────────────┘\n` +
          `📦 Packet: ${video.title}\n` +
          `⏱ Timeline: ${video.time}\n` +
          `👤 Breached By: ${hackerAlias}\n` +
          `🛰️ Matrix: Data download complete 🫡`,
        attachment: fs.createReadStream(filePath)
      };

      await api.sendMessage(finalMessage, threadID, async () => {
        if (fs.existsSync(filePath)) await fs.unlink(filePath);
      }, messageID);

      if (tempMsgID) await api.unsendMessage(tempMsgID).catch(() => {});

    } catch (err) {
      if (tempMsgID) await api.unsendMessage(tempMsgID).catch(() => {});
      api.sendMessage(
        `❌ SYSTEM BREACH CRITICAL\n━━━━━━━━━━━━━━━━━━━━━\n💥 Traceback: ${err.message || "Unknown proxy transmission failure."}`,
        threadID,
        messageID
      );
    }
  }
};

const wrapper = new GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: true });