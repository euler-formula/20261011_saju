import type { SajuRequest, SajuSummary } from "../types";

// The package remains behind this adapter so a verified engine can replace it without UI/API changes.
export function calculateSaju(input: SajuRequest): SajuSummary {
  // saju-fortune is CommonJS and has no published TypeScript definitions.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { analyzeSaju } = require("saju-fortune") as { analyzeSaju: (birth: object, options: object) => SajuSummary };
  const result = analyzeSaju(
    { birthDate: input.birthDate, birthTime: input.birthTime, calendar: input.calendar, isLeapMonth: input.isLeapMonth, gender: input.gender, birthCity: input.birthCity },
    { analysisType: "fortune", fortuneType: input.fortuneType === "yearly" ? "general" : "general", targetYear: input.targetYear },
  );
  return result;
}
