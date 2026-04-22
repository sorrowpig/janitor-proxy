const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.post("/v1/chat/completions", async (req, res) => {
  try {
    const apiKey =
      req.headers.authorization?.replace("Bearer ", "") ||
      req.body.api_key;

    if (!apiKey) {
      return res.status(401).json({ error: "No API key provided" });
    }

    let userText = "";

    if (req.body.messages) {
      userText =
        req.body.messages[req.body.messages.length - 1]?.content || "";
    }

    if (req.body.prompt) {
      userText = req.body.prompt;
    }

    if (!userText) {
      return res.status(400).json({ error: "No input text" });
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
      "No response";

    return res.json({
      response: text
    });

  } catch (error) {
    return res.status(500).json({
      error: error.toString()
    });
  }
});

app.listen(process.env.PORT || 3000);
