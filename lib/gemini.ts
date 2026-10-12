import { GoogleGenerativeAI } from "@google/generative-ai";

export async function interpretWithGemini(prompt: string) {
  const interpretationSafety = `\n\n[Interpretation boundaries]\nWrite in Korean. Do not present a yearly fortune, target-year forecast, timing prediction, or seasonal prediction: only describe general tendencies in the calculated chart. Five-element numbers are simple counts of the assigned stem and branch elements; do not call a lower count a deficiency or say it must be supplemented. Do not recommend food, supplements, diets, or health effects for a five element. Give only non-medical, everyday suggestions such as rest, journaling, conversation, or reviewing plans.`;
  const key = process.env.GEMINI_API_KEY;
  if (!key) return { text: "AI 해석을 생성하려면 서버 환경변수 GEMINI_API_KEY를 설정해 주세요. 계산 결과는 아래에서 확인할 수 있습니다.", generatedWithAi: false };
  try {
    const client = new GoogleGenerativeAI(key);
    const candidates = ["gemini-flash-lite-latest", "gemini-flash-latest"];
    let lastError: unknown;
    for (const name of candidates) {
      try {
        const model = client.getGenerativeModel({ model: name, generationConfig: { temperature: 0.4, maxOutputTokens: 2048 } });
        const response = await model.generateContent(`${prompt}${interpretationSafety}`, { timeout: 12000 });
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
