import { GoogleGenerativeAI } from "@google/generative-ai";

export async function interpretWithGemini(prompt: string) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return { text: "AI 해석을 생성하려면 서버 환경변수 GEMINI_API_KEY를 설정해 주세요. 계산 결과는 아래에서 확인할 수 있습니다.", generatedWithAi: false };
  const client = new GoogleGenerativeAI(key);
  const model = client.getGenerativeModel({ model: "gemini-2.0-flash", generationConfig: { temperature: 0.4, maxOutputTokens: 1200 } });
  const response = await model.generateContent(prompt);
  return { text: response.response.text(), generatedWithAi: true };
}
