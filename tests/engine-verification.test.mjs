import assert from "node:assert/strict";
import test from "node:test";
import { analyzeSaju } from "saju-fortune";

test("known non-boundary reference: 1990-05-15 10:50 matches the independent reference", () => {
  const result = analyzeSaju({ birthDate: "1990-05-15", birthTime: "10:50", calendar: "solar", gender: "male" });
  assert.deepEqual(
    [result.pillars.year.label, result.pillars.month.label, result.pillars.day.label, result.pillars.hour?.label],
    ["경오", "신사", "경진", "신사"],
  );
});

test("package limitation: it cannot apply the 2025 Ipchun time boundary", () => {
  const result = analyzeSaju({ birthDate: "2025-02-03", birthTime: "23:30", calendar: "solar", gender: "female" });
  // KASI's 2025 Ipchun is 2025-02-03 23:10 KST. A production engine must return 을사·무인 here.
  assert.deepEqual([result.pillars.year.label, result.pillars.month.label], ["갑진", "정축"]);
});
