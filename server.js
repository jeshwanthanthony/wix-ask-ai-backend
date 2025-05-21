// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { OpenAI } from 'openai';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const systemMessage = {
  role: 'system',
  content: 'You are a friendly assistant for SpiceCraft Indian Bistro. Answer in 1–2 short sentences.'
};

app.post('/ask', async (req, res) => {
  try {
    let { history = [] } = req.body;
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Missing question' });
    }

    // Build the messages array
    const messages = [
      ...(history.length ? history : [systemMessage]),
      { role: 'user', content: question }
    ];

    // Call OpenAI
    const resp = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages
    });

    const assistantMsg = resp.choices[0].message.content.trim();
    // Append assistant reply to history
    const newHistory = [...messages, { role: 'assistant', content: assistantMsg }];

    res.json({
      reply: assistantMsg,
      history: newHistory
    });
  } catch (err) {
    console.error('OpenAI error:', err);
    res.status(500).json({ error: 'API error' });
  }
});

app.get('/', (_, res) => res.send('Wix Ask AI backend is running.'));
app.listen(PORT, () => console.log(`Server on http://localhost:${PORT}`));
