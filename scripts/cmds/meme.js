const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const apiUrl = "https://raw.githubusercontent.com/Saim-x69x/sakura/main/ApiUrl.json";

async function getApiUrl() {
  const res = await axios.get(apiUrl);
  return res.data.apiv3;
}

async function urlToBase64(url) {
  const res = await axios.get(url, { responseType: "arraybuffer" });
  return Buffer.from(res.data).toString("base64");
}

module.exports = {
  config: {
    name: "meme",
    aliases: ["mem"],
    version: "1.0",
    author: "Zihad Ahmed (API by siamx9x)",
    countDown: 5,
    role: 0,
    shortDescription: "Generate a meme using image",
    longDescription: "Generate a meme using an image.",
    category: "fun",
    guide: "{p}meme (reply to an image)"
  },
  onStart: async function ({ api, event, args, message }) {
    const repliedImage = event.messageReply?.attachments?.[0];
    const prompt = 'make meme bangla';

    if (!repliedImage || repliedImage.type !== "photo") {
      return message.reply(
        "⚠️ | Please reply to an image to make a meme!"
      );
    }

    const processingMsg = await message.reply(
      "🎨 | Your meme is being crafted..."
    );
    const imgPath = path.join(
      __dirname,
      "cache",
      `${Date.now()}_meme.jpg`
    );

    try {
      const API_URL = await getApiUrl();
      const payload = {
        prompt: prompt,
        images: [await urlToBase64(repliedImage.url)],
        format: "jpg"
      };

      const res = await axios.post(API_URL, payload, {
        responseType: "arraybuffer",
        timeout: 180000
      });

      await fs.ensureDir(path.dirname(imgPath));
      await fs.writeFile(imgPath, Buffer.from(res.data));

      await api.unsendMessage(processingMsg.messageID);
      await message.reply({
        body: `✅ Meme created successfully!`,
        attachment: fs.createReadStream(imgPath)
      });
    } catch (error) {
      console.error("MEME Error:", error?.response?.data || error.message);
      if (processingMsg?.messageID) {
        await api.unsendMessage(processingMsg.messageID);
      }
      message.reply(
        "❌ | Unable to complete the request at the moment.\nTry again in a few minutes."
      );
    } finally {
      if (fs.existsSync(imgPath)) {
        await fs.remove(imgPath);
      }
    }
  }
};
