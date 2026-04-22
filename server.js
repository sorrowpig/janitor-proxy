const express = require("express");
const app = express();

app.use(express.json());

app.post("/v1/chat/completions", async (req, res) => {
  try {
    // ✅ 從 header 拿 API key
    const apiKey = req.headers.authorization?.replace("Bearer ", "");

    if (!apiKey) {
      return res.status(401).json({ error: "No API key provided" });
    }

    // ✅ 取 Janitor 傳來的 messages
    const messages = req.body.messages || [];

    // 把對話轉成 Gemini 格式
    const lastMessage = messages[messages.length - 1]?.content || "";

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" +
        apiKey,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: lastMessage }],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response";

    // ✅ 回傳 OpenAI 格式（Janitor 才看得懂）
    res.json({
      choices: [
        {
          message: {
            role: "assistant",
            content: text,
          },
        },
      ],
    });
  } catch (e) {
    res.status(500).json({ error: e.toString() });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server running");
});
