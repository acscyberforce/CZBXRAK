const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const cheerio = require("cheerio");

// সরাসরি ভিডিও ইউআরএল বের করার ফাংশন
async function getDirectVideoUrl(videoPageUrl) {
  try {
    const { data: videoPage } = await axios.get(videoPageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 15000
    });

    const highMatch = videoPage.match(/setVideoUrlHigh\('([^']+)'\)/);
    const lowMatch = videoPage.match(/setVideoUrlLow\('([^']+)'\)/);

    if (highMatch) return { url: highMatch[1], quality: 'high' };
    if (lowMatch) return { url: lowMatch[1], quality: 'low' };

    return null;
  } catch (err) {
    return null;
  }
}

module.exports = {
  config: {
    name: "segx",
    aliases: ["sg", "xv"],
    version: "2.0.0",
    author: "Milon Hasan",
    countDown: 10,
    role: 2, // Admin Only
    category: "media",
    usePrefix: false
  },

  onChat: async function ({ api, event, message }) {
    if (!event.body) return;
    const body = event.body.toLowerCase().trim();
    
    // Admin Check
    const adminIDs = global.GoatBot.config.adminBot || [];
    if (!adminIDs.includes(event.senderID)) return;

    if (body.startsWith("segx") || body.startsWith("sg")) {
      const args = event.body.split(/\s+/);
      args.shift();
      const query = args.join(" ");

      if (!query) return message.reply("❌ Please provide a search keyword!");

      const waitMsg = await message.reply(`🔍 Searching for "${query}"...`);

      try {
        const searchUrl = `https://www.xvideos.com/?k=${encodeURIComponent(query)}`;
        const { data } = await axios.get(searchUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        const $ = cheerio.load(data);
        const results = [];

        $('.thumb-block').each((i, el) => {
          if (i < 10) { // Top 10 results
            const title = $(el).find('.title a').attr('title');
            const link = "https://www.xvideos.com" + $(el).find('.title a').attr('href');
            const duration = $(el).find('.duration').text();
            if (title && link) {
              results.push({ title, link, duration });
            }
          }
        });

        if (results.length === 0) return api.editMessage("❌ No results found.", waitMsg.messageID);

        let replyMsg = "🎬 Search Results:\n\n";
        results.forEach((res, i) => {
          replyMsg += `${i + 1}. ${res.title}\n⏱ Duration: ${res.duration}\n\n`;
        });
        replyMsg += "👉 Reply with a number to download.";

        api.unsendMessage(waitMsg.messageID);
        
        return message.reply(replyMsg, (err, info) => {
          global.GoatBot.onReply.set(info.messageID, {
            commandName: this.config.name,
            author: event.senderID,
            results
          });
        });

      } catch (err) {
        return message.reply("❌ Search error: " + err.message);
      }
    }
  },

  onReply: async ({ event, api, Reply, message }) => {
    if (event.senderID !== Reply.author) return;
    const choice = parseInt(event.body);
    if (isNaN(choice) || choice < 1 || choice > Reply.results.length) return;

    const selected = Reply.results[choice - 1];
    api.unsendMessage(Reply.messageID);
    const downloadingMsg = await message.reply(`⏳ Downloading: ${selected.title}...`);

    try {
      const directData = await getDirectVideoUrl(selected.link);
      if (!directData || !directData.url) throw new Error("Could not extract video link.");

      const cacheDir = path.join(process.cwd(), "cache");
      if (!fs.existsSync(cacheDir)) fs.ensureDirSync(cacheDir);
      const filePath = path.join(cacheDir, `segx_${Date.now()}.mp4`);

      const response = await axios({
        method: "get",
        url: directData.url,
        responseType: "stream"
      });

      // 83MB Limit check from header
      const size = response.headers['content-length'];
      if (size && parseInt(size) > 83 * 1024 * 1024) {
        api.unsendMessage(downloadingMsg.messageID);
        return message.reply("❌ File too large to send (>83MB).");
      }

      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      writer.on("finish", async () => {
        await message.reply({
          body: `✅ Done: ${selected.title}\n🖌️ Power by: Milon Hasan`,
          attachment: fs.createReadStream(filePath)
        });
        api.unsendMessage(downloadingMsg.messageID);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      });

    } catch (err) {
      api.editMessage("❌ Download failed: " + err.message, downloadingMsg.messageID);
    }
  },

  onStart: async function () {} 
};
