// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { OpenAI } from 'openai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(cors());
app.use(express.json());

// In-memory chat history storage (for simplicity)
const chatHistories = {}; // { sessionId: [{ role: 'user'|'assistant', content: '...' }] }

app.post('/ask', async (req, res) => {
  const { message, sessionId } = req.body;
  if (!message || !sessionId) {
    return res.status(400).json({ error: 'Missing message or sessionId' });
  }

  // Initialize chat history if not present
  if (!chatHistories[sessionId]) {
    chatHistories[sessionId] = [
      {
        role: 'system',
        content: `You are an AI assistant for SpiceCraft Bistro. Use this info to answer clearly and concisely:
- Open 11 AM – 10 PM, closed Tuesdays
- Address: 1234 Main St, Arlington, VA
- Popular dishes: Jackfruit Biryani, Butter Chicken, Mango Lassi
- Vegan options: Chana Masala, Tandoori Cauliflower
- Parking available in rear lot
Limit your answer to 1-2 short sentences.`
      }
    ];
  }

  // Add user message to history
  chatHistories[sessionId].push({ role: 'user', content: message });

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: chatHistories[sessionId]
    });

    const reply = completion.choices[0].message.content;

    // Add assistant response to history
    chatHistories[sessionId].push({ role: 'assistant', content: reply });

    // Optional: limit history length to avoid memory overload
    if (chatHistories[sessionId].length > 20) {
      chatHistories[sessionId] = chatHistories[sessionId].slice(-10);
    }

    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch response from OpenAI' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
