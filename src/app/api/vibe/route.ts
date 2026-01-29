import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || "");

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { image } = data;

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash", 
      systemInstruction: `You are the VIBE CHECK Creative Lead. 
      Analyze the photo's aesthetic, lighting, and composition.
      Provide a JSON response: 
      { 
        "song": "Song Title", 
        "artist": "Artist Name", 
        "logic": "1 sentence on the visual-audio connection", 
        "compliment": "A short aesthetic compliment", 
        "tip": "A photography improvement tip", 
        "rating": [Provide a dynamic integer between 1 and 10 based ONLY on this specific image quality] 
      }
      CRITICAL: The "rating" must be a dynamic integer between 1 and 10. Output ONLY raw JSON.`,
    });

    const result = await model.generateContent([
      "Analyze this visual and output JSON.",
      { inlineData: { data: image.split(",")[1], mimeType: "image/jpeg" } },
    ]);

    const responseText = result.response.text();
    const jsonMatch = responseText.match(/\{[\s\S]*\}/); // Extracts JSON safely
    
    if (!jsonMatch) throw new Error("JSON Parse Error");
    return NextResponse.json(JSON.parse(jsonMatch[0]));
  } catch (error: any) {
    return NextResponse.json({ error: "Distillation Failed" }, { status: 500 });
  }
}