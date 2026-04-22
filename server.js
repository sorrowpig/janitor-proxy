const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// ⭐ 不限制路由（Janitor Other 常亂打）
app.post("*", async (req, res) => {
  try {
    const apiKey =
      req.headers.authorization?.replace("Bearer ", "") ||
      req.body.api_key;

    let text =
      req.body.prompt ||
      req.body.text ||
      req.body.input ||
      (req.body.messages &&
        req.body.messages[req.body.messages.length - 1]?.content) ||
      "";

    if (!apiKey || !text) {
      return res.json({ text: "missing input" });
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
              parts: [{ text }]
            }
          ]
        })
      }
    );

    const data = await response.json();

    const output =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "no response";

    // ⭐ Janitor 最寬鬆回傳
    return res.send(output);

  } catch (e) {
    return res.send("error: " + e.toString());
  }
});

app.listen(process.env.PORT || 3000);
