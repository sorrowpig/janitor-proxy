const express = require("express");
const fetch = require("node-fetch");

const app = express();
app.use(express.json());

// Janitor AI 會呼叫這個
app.post("/v1/chat/completions", async (req, res) => {
  try {
    // 從 header 拿 API key
    const apiKey = req.headers.authorization?.replace("Bearer ", "");

    if (!apiKey) {
      return res.status(401).json({ error: "No API key provided" });
    }

    // 取得對話內容
    const messages = req.body.messages || [];
    const lastMessage = messages[messages.length - 1]?.content || "";

    // 呼叫 Gemini API
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" +
        apiKey,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: lastMessage }]
            }
          ]
        })
      }
    );

    const data = await response.json();

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response";

    // 回傳 Janitor 能理解的格式
    res.json({
      choices: [
        {
          message: {
            role: "assistant",
            content: text
          }
        }
      ]
    });

  } catch (error) {
    res.status(500).json({
      error: error.toString()
    });
  }
});

// 啟動伺服器
app.listen(process.env.PORT || 3000, () => {
  console.log("Server running...");
});
