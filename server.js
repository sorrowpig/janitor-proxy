const express = require("express");
const app = express();

app.use(express.json());

app.post("/chat", async (req, res) => {
  try {
    const message = req.body.message;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" +
        process.env.GEMINI_API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: message }] }],
        }),
      }
    );

    const data = await response.json();

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "no response";

    res.json({ reply: text });
  } catch (e) {
    res.status(500).json({ error: e.toString() });
  }
});

app.listen(process.env.PORT || 3000);
