const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// 同時支援 OpenAI & Other
app.post("/v1/chat/completions", async (req, res) => {
  try {
    // ✅ API key（支援兩種來源）
    const apiKey =
      req.headers.authorization?.replace("Bearer ", "") ||
      req.body.api_key;

    if (!apiKey) {
      return res.status(401).json({ error: "No API key provided" });
    }

    // ✅ 判斷格式（messages or prompt）
    let userText = "";

    // OpenAI 格式
    if (req.body.messages) {
      userText =
        req.body.messages[req.body.messages.length - 1]?.content || "";
    }

    // Other 格式
    if (req.body.prompt) {
      userText = req.body.prompt;
    }

    if (!userText) {
      return res.status(400).json({ error: "No input text" });
    }

    // 🔥 呼叫 Gemini
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
              parts: [{ text: userText }]
            }
          ]
        })
      }
    );

    const data = await response.json();

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response";

    // ✅ 判斷回傳格式（對應 Janitor 模式）
    
    // OpenAI 回傳
    if (req.body.messages) {
      return res.json({
        choices: [
          {
            message: {
              role: "assistant",
              content: text
            }
          }
        ]
      });
    }

    // Other 回傳（最通用）
    return res.json({
      results: [
        {
          text: text
        }
      ]
    });

  } catch (error) {
    res.status(500).json({
      error: error.toString()
    });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server running...");
});
