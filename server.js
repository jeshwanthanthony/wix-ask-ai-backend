import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { OpenAI } from 'openai';

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Maintain short session memory (chat history per visitor session - lightweight for now)
let chatHistory = [];

app.post('/ask', async (req, res) => {
  const { userMessage } = req.body;

  if (!userMessage) return res.status(400).json({ error: 'Missing message' });

  try {
    // Append new message
    chatHistory.push({ role: 'user', content: userMessage });

    // Keep history trimmed (only last 5 exchanges)
    if (chatHistory.length > 10) chatHistory = chatHistory.slice(-10);

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a helpful assistant for a restaurant called SpiceCraft Indian Bistro. Respond in 1–2 short friendly sentences only.' },
        ...chatHistory
      ],
    });

    const botReply = response.choices[0].message.content;
    chatHistory.push({ role: 'assistant', content: botReply });

    res.json({ reply: botReply });

  } catch (error) {
    console.error('OpenAI error:', error);
    res.status(500).json({ error: 'Something went wrong.' });
  }
});

app.listen(port, () => {
  console.log(`✅ Server is running on http://localhost:${port}`);
});
