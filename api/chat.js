import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Dùng key OpenAI
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "Missing prompt" });
  }

  try {
    // Gọi OpenAI Chat Completion
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-nano",  // 🔹 Đổi sang model bạn muốn
      messages: [
        { role: "system", content: "Bạn là một trợ lý hữu ích." },
        { role: "user", content: prompt }
      ],
    });

    const aiReply = response.choices[0].message.content;

    if (!aiReply) {
      console.warn("Warning: AI response did not contain content!", response);
      return res.status(500).json({
        error: "AI did not return any data",
        modelUsed: "gpt-4.1-nano"
      });
    }

    res.status(200).json({
      reply: aiReply,
      modelUsed: "gpt-4.1-nano"
    });

  } catch (err) {
    console.error("Error calling OpenAI:", err);

    res.status(500).json({
      error: err.message || "Internal server error",
      modelUsed: "gpt-4.1-nano"
    });
  }
  }
