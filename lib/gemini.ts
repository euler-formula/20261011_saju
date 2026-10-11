import { GoogleGenerativeAI } from "@google/generative-ai";

export async function interpretWithGemini(prompt: string) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return { text: "AI 해석을 생성하려면 서버 환경변수 GEMINI_API_KEY를 설정해 주세요. 계산 결과는 아래에서 확인할 수 있습니다.", generatedWithAi: false };
  try {
    const client = new GoogleGenerativeAI(key);
    const candidates = ["gemini-3.8-flash", "gemini-flash-lite-latest", "gemini-flash-latest"];
    let lastError: unknown;
    for (const name of candidates) {
      try {
        const model = client.getGenerativeModel({ model: name, generationConfig: { temperature: 0.4, maxOutputTokens: 2048 } });
        const response = await model.generateContent(prompt);
        return { text: response.response.text(), generatedWithAi: true };
      } catch (error) {
        lastError = error;
        console.warn(`Gemini model unavailable: ${name}`, error);
      }
    }
    throw lastError;
  } catch (error) {
    // Do not leak provider details or credentials to the browser.
    console.error("Gemini interpretation failed", error);
    return { text: "사주 계산은 완료됐지만 AI 해석 연결에 실패했습니다. .env.local의 GEMINI_API_KEY에 Google AI Studio에서 발급한 API 키를 설정한 뒤 서버를 다시 시작해 주세요.", generatedWithAi: false };
  }
}
