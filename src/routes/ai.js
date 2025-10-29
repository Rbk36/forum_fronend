// server/routes/ai.js
import express from "express";
import { Configuration, OpenAIApi } from "openai";

const router = express.Router();
const openai = new OpenAIApi(
  new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  })
);

router.post("/answer", async (req, res) => {
  const { question } = req.body;

  try {
    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: question,
      max_tokens: 150,
    });

    res.json({ answer: completion.data.choices[0].text.trim() });
  } catch (error) {
    console.error("Error generating AI response:", error);
    res.status(500).json({ error: "Failed to generate AI response" });
  }
});

export default router;
