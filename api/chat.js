import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt, history, systemPrompt, modelName } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "Missing prompt" });
  }

  const defaultModel = "gpt-4o-mini";
  const finalModel = modelName || defaultModel;

  try {
    const messages = [];
    const defaultSystemPrompt =
      "Bạn là Poison AI,bạn là 1 trợ lý luôn luôn gắn liền với roblox và exploit api hãy làm tốt vai trò của mình.";

    messages.push({
      role: "system",
      content: systemPrompt || defaultSystemPrompt,
    });

    if (history && Array.isArray(history)) {
      history.forEach((entry) => {
        messages.push({
          role: entry.role === "user" ? "user" : "assistant",
          content: entry.parts[0].text,
        });
      });
    }

    messages.push({
      role: "user",
      content: prompt,
    });

    const response = await openai.chat.completions.create({
      model: finalModel,
      messages,
      stream: false,
    });

    const aiReply = response.choices[0]?.message?.content;

    if (!aiReply) {
      console.warn("Warning: AI response did not contain content!", response);
      return res.status(500).json({
        error: "AI did not return any data",
        modelUsed: finalModel,
      });
    }

    res.status(200).json({
      reply: aiReply,
      modelUsed: finalModel,
    });
  } catch (err) {
    console.error("Error calling OpenAI:", err);

    res.status(500).json({
      error: err.message || "Internal server error",
      modelUsed: finalModel,
    });
  }
}
