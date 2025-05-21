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

// ← This is your “always-on” restaurant brief
const systemMessage = {
  role: 'system',
  content: `
You are a friendly assistant for SpiceCraft Indian Bistro, with two DMV locations, ("IF THE ANSWERS IS NOT FOUND BELOW IN THE GIVEN TEXT, STATE PLEASE CONTACT OWNER"):
- Clarendon: 1135 N Highland St, Arlington, VA 22201  
- Del Ray: 2607 Mount Vernon Ave, Alexandria, VA 22305  

Owners: Anthony Sankar (manager), Helen Sanjjav, Premnath Durairaj (head chef).  
Hours: Tue–Thu 11:30 AM–2:30 PM & 5–9 PM, Fri–Sat 11:30–2:30 & 5–9:30, Sun 11:30–2:30, closed Mon.  

Menu highlights:
• Dum Biryani (w/ yogurt relish)  
• Butter Chicken Pasta, Butter Paneer Pasta  
• Tandoori Specialties, Chana Masala, Tandoori Cauliflower  
• Signature Lamb Rogan Josh, Chicken Korma  
• Vegan & gluten-free options across appetizers, mains & desserts  
• Desserts: Rice Kheer, Vegan Blueberry Kheer  
• Full bar & playful cocktails, kid’s menu, catering available  
  
Answer every question in 1–2 friendly sentences.
  `.trim()
};

app.post('/ask', async (req, res) => {
  try {
    const { question, history = [] } = req.body;
    if (!question) return res.status(400).json({ error: 'Missing question' });

    // Build the message list: system prompt → past convo → new user question
    const messages = [
      systemMessage,
      ...history,
      { role: 'user', content: question }
    ];

    // Call GPT
    const resp = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages
    });

    const assistantMsg = resp.choices[0].message.content.trim();

    // Build new history (only user+assistant, skip system)
    const newHistory = [
      ...history,
      { role: 'user', content: question },
      { role: 'assistant', content: assistantMsg }
    ];

    return res.json({
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
