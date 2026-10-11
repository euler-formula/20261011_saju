# 사주 계산 엔진 문서 (Saju Engine)

> 사주 여덟 글자 계산을 담당하는 엔진(`saju-fortune` 패키지)의 검증·출력 구조·연동 문서.
> 명리학 지식은 `domain-knowledge.md`, 전체 아키텍처는 `architecture.md`,
> 해석 프롬프트는 `interpretation-prompt.md` 참고.
>
> 이 문서는 계산 알고리즘을 직접 구현하지 않는다. 검증된 패키지를 **어떻게 쓰고,
> 결과를 어떻게 믿고, 서비스에 어떻게 연결하는가**를 다룬다.

---

## 1. 엔진 선택

- **채택 후보**: `saju-fortune` (npm)
- 버전(검증 시점): **0.2.0**
- 라이선스: MIT
- 출처: NomaDamas/k-skill (github.com/NomaDamas/k-skill)
- 설명: "Local saju fortune analysis helper for interview-style k-skills"

### 역할 분리 (재확인)
- **계산**: 이 패키지가 결정론적으로 여덟 글자·오행·용신 등을 산출한다.
- **해석**: LLM(Gemini)이 담당. 여덟 글자를 LLM에 맡기지 않는다(환각 방지).
- 서비스에 들어가는 것은 **패키지(코드)**이지, k-skill의 instruction.md(에이전트 지시문)가 아니다.

---

## 2. 설치 · 호출

```bash
npm install saju-fortune
```

### 제공 함수 (실제 exports)
```
analyzeSaju              # 1인 사주 분석 (핵심)
checkCompatibility       # 궁합 (2인)
callSajuTool             # MCP 스타일 도구명 래퍼
getMissingInterviewFields# 부족한 입력 필드 확인
normalizeBirthInput      # 입력 정규화
```

### 기본 호출
```js
const { analyzeSaju } = require("saju-fortune");

const result = analyzeSaju(
  {
    name: "홍길동",          // 선택
    birthDate: "1990-03-15", // 필수 (YYYY-MM-DD)
    birthTime: "10:30",      // 선택 (HH:mm) — 없으면 시주 미확정
    calendar: "solar",       // "solar" | "lunar"
    isLeapMonth: false,      // 음력 윤달 여부
    gender: "male",          // "male" | "female"
    birthCity: "서울"        // 선택 (경도 보정용)
  },
  {
    analysisType: "fortune",
    fortuneType: "general",  // general|love|wealth|career|health
    targetYear: 2026
  }
);
```

`fortuneType` 매핑: 종합=`general`, 연애=`love`, 재물=`wealth`, 직업=`career`, 건강=`health`, 한해운세=`general`+`targetYear`.

---

## 3. 출력 구조 (실측 기준)

> ⚠️ 이 구조에 `architecture.md`의 데이터 흐름과
> `interpretation-prompt.md`의 입력 포맷이 의존한다.

`analyzeSaju` 반환 객체의 주요 필드:

| 필드 | 내용 |
|------|------|
| `input` | 정규화된 입력값 (isLeapMonth 등 채워짐) |
| `pillars` | 네 기둥: `year` / `month` / `day` / `hour` |
| `pillars.*.label` | 한글 간지 (예: "경오") |
| `pillars.*.hanja` | 한자 간지 (예: "庚午") |
| `pillars.*.stem` / `branch` | 천간 / 지지 |
| `pillars.*.stemElement(Ko)` | 천간 오행 (metal / 금) |
| `pillars.*.branchElement(Ko)` | 지지 오행 |
| `pillars.*.branchAnimal` | 지지 동물 (예: "말") |
| `pillars.*.yinYang` | 음양 (yang / yin) |
| `pillars.hour` | **시간 미상 시 `null`** |
| `timeAccuracy` | "known" / "unknown" |
| `limitations` | 한계 안내 문자열 배열 (시간 미상 등) |
| `dayMaster` | 일간(나): stem, element, yinYang, **strength(신강신약)** |
| `fiveElements` | 오행 개수 분포 {wood, fire, earth, metal, water} |
| `dominantElements` | 강한 오행 배열 |
| `weakElements` | 부족한 오행 배열 |
| `yongsin` | 용신: primary/secondary + reasoning |
| `interview` | 부족·선택 필드, 추천 질문 |
| `readingGuide` | 풀이 가이드 문장 배열 |
| `fortune` | 주제별 결과: summary, guidance[], caveat |

### 실측 예시 (1990-03-15 10:30, male, solar, 서울)
```json
{
  "pillars": {
    "year":  { "label": "경오", "hanja": "庚午", "yinYang": "yang", ... },
    "month": { "label": "기묘", "hanja": "己卯", ... },
    "day":   { "label": "기묘", "hanja": "己卯", ... },
    "hour":  { "label": "기사", "hanja": "己巳", ... }
  },
  "dayMaster":   { "stem": "기", "elementKo": "토", "yinYang": "yin", "strength": "strong" },
  "fiveElements":{ "wood": 2, "fire": 2, "earth": 3, "metal": 1, "water": 0 },
  "dominantElements": ["earth"],
  "weakElements": ["water"],
  "yongsin": { "primaryKo": "목(木)", "secondaryKo": "수(水)", "reasoning": "..." }
}
```

→ 이 사람: 일간 기(己)=음토, 신강. 토 과다·수 부족 → 용신 목/수. `domain-knowledge.md`의 이론과 필드가 대응됨.

---

## 4. 예외 · 특수 입력 처리

### 태어난 시간 미상
- `birthTime` 생략 시:
  - `pillars.hour` = **null**
  - `timeAccuracy` = "unknown"
  - `limitations`에 안내 문구 추가("시주는 확정하지 않고 연·월·일 중심…")
- 서비스: 시주 없이 보수적 풀이로 진행하고, 이 한계를 사용자에게 노출.

### 음력 입력 — ⚠️ 중요
- 이 패키지의 음력 변환 정확도는 **별도 검증 전까지 신뢰하지 않는다.**
- 안전한 방식: 음력 입력은 **검증된 만세력/라이브러리로 먼저 양력 변환** →
  `calendar: "solar"`로 호출 → 변환 근거·윤달 여부를 limitations로 기록.
- 윤달 플래그(`isLeapMonth`)는 입력 단계에서 반드시 확인.

### 진태양시(경도) 보정
- `birthCity`로 경도 보정을 반영(생략 시 기본값/생략).
- 시(時) 경계 부근 출생은 이 보정으로 시주가 바뀔 수 있음 → 가능하면 출생지 입력 유도.

---

## 5. 검증 (Verification)

> 남의 패키지를 계산 엔진으로 채택하려면 정확도를 직접 검증하고 기록해야 한다.
> 아래는 **필수 검증 항목**. 채택 확정 전 반드시 통과 확인.

### 반드시 확인할 케이스
- [ ] **절기 경계**: 입춘 전후 출생의 연주가 정확히 갈리는가 (예: 2월 3일생 vs 2월 5일생)
- [ ] **월주 경계**: 각 월의 절(節) 경계 전후로 월주가 바뀌는가
- [ ] **시주 경계**: 자시(23~01시) 등 시 경계 처리
- [ ] **윤달**: 음력 윤달 입력 시 양력 대응이 맞는가 (또는 사전 변환 방식 채택)
- [ ] **진태양시**: 출생지별 경도 보정이 반영되는가
- [ ] 알려진 정답 사주(직접 만세력으로 확인한 표본) 여러 건과 대조

### ⚠️ 검증 중 발견된 유의점
- 실측 예시(1990-03-15 10:30)에서 **월주와 일주가 모두 "기묘(己卯)"로 동일**하게 나왔다.
  우연일 수 있으나, 서로 다른 기둥이 같은 간지로 나오는 경우가 잦다면
  계산 로직(특히 일주 산출)에 오류가 없는지 **교차 검증 필요**.
- 즉, 이 패키지를 무검증으로 신뢰하지 말 것. 위 케이스들을 반드시 대조한 뒤 채택 결정.

### 검증 결과 기록란
| 케이스 | 입력 | 기대값 | 실제값 | 통과 |
|--------|------|--------|--------|:---:|
| (작성 예정) | | | | |

### 2026-10-11 1차 실측 기록

`1990-03-15 10:30`, 양력, 남성, 서울을 v0.2.0으로 실행한 결과는 문서의 예시와 동일하게
연주 `경오`, 월주 `기묘`, 일주 `기묘`, 시주 `기사`, 오행 `목2·화2·토3·금1·수0`이었다.

월주와 일주가 모두 `기묘`인 결과가 재현되었으나, 이는 패키지의 자기 일관성만 확인한 것이며
독립 만세력 기준값과의 교차 검증은 아직 수행되지 않았다. 따라서 애플리케이션은
`SAJU_ENGINE_VERIFIED=true`가 명시되기 전까지 실제 분석 요청을 차단한다.

### 2026-10-11 2차 독립 교차검증 — 실패

공식 한국천문연구원 2025년 월력요항에서 입춘은 **2025-02-03 23:10 (KST)**이다.
따라서 2025-02-03 23:30 출생은 입춘 이후로, 연주/월주가 `을사`/`무인`이어야 한다.

그러나 `saju-fortune@0.2.0`은 해당 시각에도 `갑진`/`정축`을 반환했다. 패키지 구현이
연도별 절입 **시각** 대신 고정된 달·일(2월 4일)을 사용하기 때문이다. 월주도 같은 방식으로
고정 날짜를 사용한다. 이는 절기 경계 출생자에게 잘못된 결과를 만들므로 서비스의 계산 엔진으로
채택하지 않는다.

- 통과 표본: 1990-05-15 10:50 → `경오·신사·경진·신사` (비경계 표본)
- 실패 표본: 2025-02-03 23:30 → 실제 반환 `갑진·정축`, 요구값 `을사·무인`
- 자동 재현: `npm test`의 `tests/engine-verification.test.mjs`
- 다음 조치: KASI 절입 시각·음양력 데이터와 실제 시간 경계를 지원하는 대체 엔진을 선정하거나,
  그 데이터를 기준으로 계산 어댑터를 새로 구현한다. 그 전까지 `SAJU_ENGINE_VERIFIED`는 `false`로 유지한다.

---

## 6. 서비스 연동 (Next.js)

```
[Route Handler: /api/saju]
  1. 입력 검증 (양/음력, 윤달, 생년월일, 시각, 성별, 주제)
  2. (음력이면) 검증된 라이브러리로 양력 변환
  3. analyzeSaju(...) 실행 → 위 출력 객체 획득
  4. 출력에서 필요한 필드 추출 → 프롬프트에 삽입
     (pillars, dayMaster, fiveElements, dominant/weak, yongsin, fortune.summary 등)
  5. Gemini 호출 → 자연어 풀이
  6. 계산 요약 + 해석을 클라이언트로 반환
```

- 패키지는 **서버에서만** 실행(Node 패키지, 클라이언트 불가).
- 출력의 `readingGuide`, `fortune.caveat`, `limitations`는 프롬프트/UI에 활용 가능.

---

## 7. 리스크 · 대안

- **보안 감사 경고**: skills.sh에서 Socket/Snyk/Gen Agent Trust Hub 모두 "Warn" 표시.
  도입 전 경고 내용 확인 필요.
- **소규모 패키지 의존**: 개인/커뮤니티 패키지로 유지보수·정확도 보장이 제한적.
- **대안**:
  - 다른 만세력 계산 라이브러리로 교체
  - 계산 로직을 참고해 직접 구현/포팅
  - 계산만 담당하는 별도 검증된 API 사용
- 연동 함수 경계(`계산(input) → result`)를 고정해두면 엔진 교체 시 영향 최소화.

---

## 8. 미결정 사항 (Decisions Needed)
- [ ] `saju-fortune` 최종 채택 여부 (§5 검증 통과 후)
- [ ] 음력 변환: 패키지 내장 사용 vs 외부 라이브러리 선(先)변환
- [ ] 진태양시 보정 수준 (출생지 필수화 여부)
- [ ] 보안 경고 내용 확인 및 수용 가능성 판단
