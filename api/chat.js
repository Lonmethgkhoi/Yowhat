import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt, history, systemPrompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "Missing prompt" });
  }

  try {
    const messages = [];

    // ✅ System prompt mặc định
    const defaultSystemPrompt =
      "Bạn là Poison AI,bạn là 1 trợ lý luôn luôn gắn liền với roblox và exploit api hãy làm tốt vai trò của mình.";

    messages.push({
      role: "system",
      content: systemPrompt || defaultSystemPrompt,
    });

    // ✅ Lịch sử chat (nếu có)
    if (history && Array.isArray(history)) {
      history.forEach(entry => {
        messages.push({
          role: entry.role === "user" ? "user" : "assistant",
          content: entry.parts[0].text,
        });
      });
    }

    // ✅ Prompt hiện tại
    messages.push({
      role: "user",
      content: prompt,
    });

    // ✅ Gọi OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      stream: false,
    });

    const aiReply = response.choices[0]?.message?.content;

    if (!aiReply) {
      console.warn("Warning: AI response did not contain content!", response);
      return res.status(500).json({
        error: "AI did not return any data",
        modelUsed: "gpt-4o-mini",
      });
    }

    res.status(200).json({
      reply: aiReply,
      modelUsed: "gpt-4o-mini",
    });
  } catch (err) {
    console.error("Error calling OpenAI:", err);

    res.status(500).json({
      error: err.message || "Internal server error",
      modelUsed: "gpt-4o-mini",
    });
  }
}