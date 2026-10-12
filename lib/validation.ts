import type { SajuRequest } from "./types";

export function validateRequest(value: unknown): { data?: SajuRequest; error?: string } {
  if (!value || typeof value !== "object") return { error: "입력 정보를 확인해 주세요." };
  const input = value as Record<string, unknown>;
  const birthDate = String(input.birthDate ?? "");
  const birthTime = String(input.birthTime ?? "");
  const calendar = input.calendar;
  const gender = input.gender;
  const targetYear = Number(input.targetYear);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate) || Number.isNaN(Date.parse(`${birthDate}T00:00:00Z`))) return { error: "생년월일을 YYYY-MM-DD 형식으로 입력해 주세요." };
  if (birthTime && !/^([01]\d|2[0-3]):[0-5]\d$/.test(birthTime)) return { error: "출생 시간은 HH:mm 형식이어야 합니다." };
  if (calendar !== "solar" && calendar !== "lunar") return { error: "양력 또는 음력을 선택해 주세요." };
  if (gender !== "male" && gender !== "female") return { error: "성별을 선택해 주세요." };
  if (!Number.isInteger(targetYear) || targetYear < 1900 || targetYear > 2100) return { error: "대상 연도를 확인해 주세요." };
  return { data: { birthDate, birthTime: birthTime || undefined, calendar, isLeapMonth: Boolean(input.isLeapMonth), gender, fortuneType: input.fortuneType === "yearly" ? "yearly" : "general", targetYear } };
}
