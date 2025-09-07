import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Missing prompt" });

  try {
    
    const model = "gpt-5-nano"; 

    const response = await openai.responses.create({
      model: model,
      input: prompt
    });

    if (!response.output_text) {
      console.warn("Warning: Response không có output_text!", response);
      return res.status(500).json({ 
        error: "AI không trả dữ liệu", 
        modelUsed: model 
      });
    }

    
    res.status(200).json({ 
      reply: response.output_text, 
      modelUsed: model 
    });
  } catch (err) {
    console.error("Lỗi gọi OpenAI:", err);

    
    res.status(500).json({ 
      error: err.message || "Internal server error", 
      modelUsed: "gpt-5-nano" 
    });
  }
}
