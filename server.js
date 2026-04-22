const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// ⭐ 改成 root route（Janitor Other 最容易打到）
app.post("/", async (req, res) => {
  try {
    const apiKey =
      req.headers.authorization?.replace("Bearer ", "") ||
      req.body.api_key;

    if (!apiKey) {
      return res.json({ text: "missing api key" });
    }

    let userText = "";

    if (req.body.messages) {
      userText =
        req.body.messages[req.body.messages.length - 1]?.content || "";
    } else if (req.body.prompt) {
      userText = req.body.prompt;
    }

    if (!userText) {
      return res.json({ text: "no input" });
    }

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
      "no response";

    // ⭐ Janitor 最寬鬆格式
    return res.json({
      text
    });

  } catch (err) {
    return res.json({
      text: "error: " + err.toString()
    });
  }
});

app.listen(process.env.PORT || 3000);
