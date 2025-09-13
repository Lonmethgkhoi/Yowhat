import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt, history } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "Missing prompt" });
  }

  try {
    const messages = (history || []).map(entry => ({
      role: entry.role === "user" ? "user" : "assistant",
      content: entry.parts[0].text
    }));
    
    messages.push({
      role: "user",
      content: prompt
    });

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // 🔹 Tên mô hình chính xác
      messages: messages,
      stream: false,
    });
    
    const aiReply = response.choices[0].message.content;

    if (!aiReply) {
      console.warn("Warning: AI response did not contain content!", response);
      return res.status(500).json({ 
        error: "AI did not return any data", 
        modelUsed: "gpt-4o-mini" 
      });
    }

    res.status(200).json({ 
      reply: aiReply, 
      modelUsed: "gpt-4o-mini" 
    });

  } catch (err) {
    console.error("Error calling OpenAI:", err);

    res.status(500).json({ 
      error: err.message || "Internal server error", 
      modelUsed: "gpt-4o-mini" 
    });
  }
}
