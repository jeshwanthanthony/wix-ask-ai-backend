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

app.get('/', (_, res) => {
  res.send('Wix Ask AI backend is running');
});

app.post('/ask', async (req, res) => {
  const { question } = req.body;

  if (!question) {
    return res.status(400).json({ error: 'Missing question' });
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o', // Switch here if needed
      messages: [{ role: 'user', content: question }],
    });

    const answer = response.choices[0].message.content;
    res.json({ answer });
  } catch (err) {
    console.error('OpenAI API error:', err);
    res.status(500).json({ error: 'API error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
