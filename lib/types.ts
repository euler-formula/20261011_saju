export type CalendarType = "solar" | "lunar";
export type Gender = "male" | "female";
export type FortuneType = "general" | "yearly";

export type SajuRequest = {
  birthDate: string;
  birthTime?: string;
  calendar: CalendarType;
  isLeapMonth: boolean;
  gender: Gender;
  birthCity?: string;
  fortuneType: FortuneType;
  targetYear: number;
};

export type Pillar = { label: string; hanja?: string; stem?: string; branch?: string };
export type SajuSummary = {
  pillars: { year: Pillar; month: Pillar; day: Pillar; hour: Pillar | null };
  dayMaster?: { stem?: string; elementKo?: string; yinYang?: string; strength?: string };
  fiveElements?: Record<string, number>;
  dominantElements?: string[];
  weakElements?: string[];
  yongsin?: { primaryKo?: string; secondaryKo?: string; reasoning?: string };
  timeAccuracy?: string;
  limitations?: string[];
};

export type SajuResponse = { calculation: SajuSummary; interpretation: string; generatedWithAi: boolean };
