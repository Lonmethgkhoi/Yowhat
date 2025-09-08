import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "Missing prompt" });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro"}); // Sửa tên model tại đây

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    if (!text) {
      console.warn("Warning: Gemini response did not contain text!", response);
      return res.status(500).json({ 
        error: "AI did not return any data", 
        modelUsed: "gemini-1.5-pro" 
      });
    }

    res.status(200).json({ 
      reply: text, 
      modelUsed: "gemini-1.5-pro" 
    });

  } catch (err) {
    console.error("Error calling Gemini API:", err);

    res.status(500).json({ 
      error: err.message || "Internal server error", 
      modelUsed: "gemini-1.5-pro" 
    });
  }
}
