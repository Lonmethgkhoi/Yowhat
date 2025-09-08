import { GoogleGenerativeAI } from "@google/generative-ai";

// Lấy API key từ biến môi trường
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
    // Chọn model Gemini Pro
    const model = genAI.getGenerativeModel({ model: "gemini-pro"});

    // Gọi API của Gemini
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    if (!text) {
      console.warn("Warning: Gemini response did not contain text!", response);
      return res.status(500).json({ 
        error: "AI did not return any data", 
        modelUsed: "gemini-pro" 
      });
    }

    res.status(200).json({ 
      reply: text, 
      modelUsed: "gemini-pro" 
    });

  } catch (err) {
    console.error("Error calling Gemini API:", err);

    res.status(500).json({ 
      error: err.message || "Internal server error", 
      modelUsed: "gemini-pro" 
    });
  }
}
