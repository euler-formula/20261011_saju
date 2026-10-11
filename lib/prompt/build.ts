import type { SajuRequest, SajuSummary } from "../types";

const elementLabels: Record<string, string> = { wood: "목", fire: "화", earth: "토", metal: "금", water: "수" };

export function buildInterpretationPrompt(input: SajuRequest, result: SajuSummary) {
  const five = Object.entries(result.fiveElements ?? {}).map(([key, value]) => `${elementLabels[key] ?? key} ${value}`).join(" · ");
  const pillar = (p: { label: string; hanja?: string } | null) => p ? `${p.label}${p.hanja ? `(${p.hanja})` : ""}` : "미상(시간 정보 없음)";
  return `당신은 사주 명리학을 바탕으로 상담하는 전문 상담사입니다. 계산 결과는 이미 확정되었습니다. 계산을 다시 하거나 글자를 바꾸지 마세요.

[말투 및 안전]
- 정중하고 차분한 존댓말을 사용하고, 단정 대신 경향으로 말하세요.
- 결과는 자기 이해와 점검을 위한 참고 자료입니다.
- 단점을 언급할 때는 구체적인 보완책을 함께 제시하세요.
- 사망 예언, 질병 확정, 의료·투자·법률 판단은 하지 마세요.
- 성별을 근거로 음양의 강약을 판단하지 마세요.

[계산 결과]
- 연주: ${pillar(result.pillars.year)} / 월주: ${pillar(result.pillars.month)} / 일주: ${pillar(result.pillars.day)} / 시주: ${pillar(result.pillars.hour)}
- 일간: ${result.dayMaster?.stem ?? "미상"}, ${result.dayMaster?.elementKo ?? ""}, 힘: ${result.dayMaster?.strength ?? "미상"}
- 오행 분포: ${five || "제공되지 않음"}
- 강한 오행: ${result.dominantElements?.join(", ") || "제공되지 않음"}
- 부족한 오행: ${result.weakElements?.join(", ") || "제공되지 않음"}
- 용신: ${result.yongsin?.primaryKo ?? "제공되지 않음"}${result.yongsin?.secondaryKo ? ` (보조 ${result.yongsin.secondaryKo})` : ""}
- 한계: ${result.limitations?.join(" / ") || "없음"}

[요청]
${input.fortuneType === "yearly" ? `${input.targetYear}년의 흐름을 중심으로` : "종합 성향을 중심으로"} 다음 6개 소제목으로 답하세요: 입력 및 한계, 사주 요약, 오행의 균형, ${input.fortuneType === "yearly" ? "올해의 흐름" : "핵심 성향"}, 실천 조언, 참고 안내. 여섯 단계를 모두 작성하고, 문장 중간이 아니라 완결된 문장으로 답변을 끝내세요. 모바일에서 읽기 좋은 짧은 문단을 사용하세요.`;
}
