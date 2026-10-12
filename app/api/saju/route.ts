import { NextResponse } from "next/server";
import { interpretWithGemini } from "../../../lib/gemini";
import { buildInterpretationPrompt } from "../../../lib/prompt/build";
import { calculateSaju } from "../../../lib/saju/engine";
import { validateRequest } from "../../../lib/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const checked = validateRequest(await request.json());
    if (!checked.data) return NextResponse.json({ error: checked.error }, { status: 400 });
    if (checked.data.fortuneType === "yearly") {
      return NextResponse.json({ error: "올해 운세는 대상 연도의 세운을 검증된 방식으로 계산하는 기능이 아직 준비되지 않아 현재 제공하지 않습니다. 종합 풀이를 이용해 주세요." }, { status: 422 });
    }
    if (process.env.SAJU_ENGINE_VERIFIED !== "true") return NextResponse.json({ error: "사주 계산 엔진이 아직 교차 검증 단계에 있어 분석을 안전하게 보류했습니다. 검증 완료 후 다시 이용해 주세요." }, { status: 503 });
    if (checked.data.calendar === "lunar") return NextResponse.json({ error: "음력 변환은 검증된 만세력 연동 전까지 안전하게 비활성화했습니다. 현재는 양력 입력을 이용해 주세요." }, { status: 422 });
    const calculation = calculateSaju(checked.data);
    const interpretation = await interpretWithGemini(buildInterpretationPrompt(checked.data, calculation));
    return NextResponse.json({ calculation, interpretation: interpretation.text, generatedWithAi: interpretation.generatedWithAi });
  } catch (error) {
    console.error("saju request failed", error);
    return NextResponse.json({ error: "분석을 완료하지 못했습니다. 입력을 확인한 뒤 다시 시도해 주세요." }, { status: 500 });
  }
}
