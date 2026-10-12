"use client";

import { FormEvent, useState } from "react";
import type { SajuResponse, SajuSummary } from "../lib/types";

const elementLabels: Record<string, string> = { wood: "목", fire: "화", earth: "토", metal: "금", water: "수" };
const elementHanja: Record<string, string> = { wood: "木", fire: "火", earth: "土", metal: "金", water: "水" };
const elementKeys: Record<string, string> = { wood: "wood", fire: "fire", earth: "earth", metal: "metal", water: "water", 목: "wood", 화: "fire", 토: "earth", 금: "metal", 수: "water" };
const energyKeywords: Record<string, string[]> = {
  wood: ["나무", "새싹", "성장", "시작", "확장", "생명력", "봄"],
  fire: ["태양", "불꽃", "불처럼", "따뜻", "뜨거", "열정", "표현력", "빛", "밝은", "여름"],
  earth: ["대지", "흙", "안정", "균형", "중심", "포용", "신뢰", "든든", "환절기"],
  metal: ["금속", "쇠", "결단", "원칙", "질서", "정리", "절제", "단단", "가을"],
  water: ["물결", "물처럼", "지혜", "흐름", "유연", "차분", "고요", "깊이", "겨울"],
};
const keywordToElement = Object.fromEntries(Object.entries(energyKeywords).flatMap(([element, words]) => words.map(word => [word, element])));
const energyKeywordPattern = new RegExp(`(${Object.keys(keywordToElement).sort((a, b) => b.length - a.length).join("|")}|(?<![가-힣])[목화토금수](?=(?:의|이|가|은|는|을|를|과|와|으로|로)(?:[^가-힣]|$)|[^가-힣]|$))`, "g");
const traditionalHours = [{ label: "자시 (23시~1시)", value: "23:30" }, { label: "축시 (1시~3시)", value: "01:30" }, { label: "인시 (3시~5시)", value: "03:30" }, { label: "묘시 (5시~7시)", value: "05:30" }, { label: "진시 (7시~9시)", value: "07:30" }, { label: "사시 (9시~11시)", value: "09:30" }, { label: "오시 (11시~13시)", value: "11:30" }, { label: "미시 (13시~15시)", value: "13:30" }, { label: "신시 (15시~17시)", value: "15:30" }, { label: "유시 (17시~19시)", value: "17:30" }, { label: "술시 (19시~21시)", value: "19:30" }, { label: "해시 (21시~23시)", value: "21:30" }];

function formatElements(elements?: string[]) {
  return elements?.map(element => elementLabels[element] ?? element).join(", ") || "—";
}

function ElementChip({ element }: { element: string }) {
  const key = elementKeys[element] ?? "earth";
  return <span className={`element-chip ${key}`}><i />{elementLabels[element] ?? element}</span>;
}

function ElementText({ text, hanjaElements = false }: { text: string; hanjaElements?: boolean }) {
  const parts = text.split(energyKeywordPattern);
  return <>{parts.map((part, index) => {
    const directElement = elementKeys[part];
    const element = directElement ?? (hanjaElements ? undefined : keywordToElement[part]);
    const useHanja = hanjaElements && Boolean(directElement);
    return element ? <strong className={`element-word ${element}${useHanja ? " element-hanja" : ""}`} key={index}>{useHanja ? elementHanja[element] : part}</strong> : part;
  })}</>;
}

function ElementRadar({ values }: { values?: Record<string, number> }) {
  const keys = ["wood", "fire", "earth", "metal", "water"];
  const point = (index: number, radius: number) => {
    const angle = (Math.PI * 2 * index) / 5 - Math.PI / 2;
    return `${50 + Math.cos(angle) * radius},${50 + Math.sin(angle) * radius}`;
  };
  const polygon = (radius: number) => keys.map((_, index) => point(index, radius)).join(" ");
  const valuePolygon = keys.map((key, index) => point(index, 17 + Math.min(Number(values?.[key] ?? 0), 4) * 8)).join(" ");
  return <div className="element-radar-wrap"><div className="element-radar" role="img" aria-label="오행 균형 오각형 그래프"><svg viewBox="0 0 100 100" aria-hidden="true"><polygon className="radar-grid" points={polygon(38)} /><polygon className="radar-grid" points={polygon(19)} />{keys.map((_, index) => <line key={index} x1="50" y1="50" x2={point(index, 38).split(",")[0]} y2={point(index, 38).split(",")[1]} />)}<polygon className="radar-value" points={valuePolygon} /></svg><div className="radar-labels">{keys.map(key => <span key={key} className={key}>{elementLabels[key]} <b>{values?.[key] ?? 0}</b></span>)}</div></div><p className="element-guide"><b>오행 쉽게 보기</b><span>목은 성장과 시작, 화는 표현과 열정, 토는 안정과 균형, 금은 결단과 원칙, 수는 지혜와 흐름을 뜻해요.</span></p></div>;
}

function CoreEnergyBars({ values }: { values?: Record<string, number> }) {
  return <div className="core-energy-visual" aria-label="나의 핵심 기운 그래프"><span>나의 핵심 기운</span><div>{["wood", "fire", "earth", "metal", "water"].map(key => <i key={key}><b style={{ height: `${22 + Math.min(Number(values?.[key] ?? 0), 4) * 15}%` }} /><em>{elementLabels[key]}</em></i>)}</div></div>;
}

function consultationSummary(calculation: SajuSummary) {
  const strong = formatElements(calculation.dominantElements);
  const weak = formatElements(calculation.weakElements);
  return `${calculation.dayMaster?.elementKo ?? "나"}의 기운을 중심으로 ${strong}의 흐름이 두드러지며, ${weak}의 기운을 일상에서 보완해 가면 좋습니다.`;
}

function formatSummaryLineBreaks(text: string) {
  return text.replace(/,\s*/g, (comma, offset: number) => {
    const beforeComma = text.slice(0, offset);
    const afterComma = text.slice(offset + comma.length);
    const hasElementBefore = /[목화토금수](?:의\s*기운)?\s*$/.test(beforeComma);
    const hasElementAfter = /^\s*[목화토금수](?:의\s*기운)?/.test(afterComma);
    return hasElementBefore && hasElementAfter ? ", " : ",\n";
  });
}

function splitInterpretation(raw: string) {
  const body: string[] = [];
  const limitations: string[] = [];
  let inLimitations = false;
  raw.split("\n").map(line => line.replace(/^\s*(?:#{1,6}\s*|[-•]\s*)/, "").replace(/\*\*/g, "").trim()).filter(Boolean).forEach(line => {
    if (/^(입력\s*(및|과)\s*한계|한계|주의사항)/.test(line)) { inLimitations = true; return; }
    (inLimitations ? limitations : body).push(line);
  });
  return { body: body.length ? body : ["해석을 준비하지 못했습니다. 잠시 후 다시 시도해 주세요."], limitations };
}

function groupInterpretation(lines: string[]) {
  const headings = /^(성향 요약|오행의 균형|올해의 흐름|실천 조언)$/;
  const sections: { title: string; paragraphs: string[] }[] = [];
  for (const line of lines) {
    if (headings.test(line)) sections.push({ title: line, paragraphs: [] });
    else {
      if (!sections.length) sections.push({ title: "상세 해석", paragraphs: [] });
      sections[sections.length - 1].paragraphs.push(line);
    }
  }
  return sections;
}

export default function Home() {
  const [form, setForm] = useState({ calendar: "solar", isLeapMonth: false, birthTime: "", timeUnknown: false, gender: "female", fortuneType: "general", targetYear: new Date().getFullYear() });
  const [birth, setBirth] = useState({ year: "", month: "", day: "" });
  const [result, setResult] = useState<SajuResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const update = (key: string, value: string | boolean | number) => setForm(current => ({ ...current, [key]: value }));
  const interpretation = result ? splitInterpretation(result.interpretation) : null;
  const interpretationSections = interpretation ? groupInterpretation(interpretation.body) : [];
  const dayCount = birth.year && birth.month ? new Date(Number(birth.year), Number(birth.month), 0).getDate() : 31;

  async function submit(event: FormEvent) {
    event.preventDefault(); setLoading(true); setError(""); setResult(null); setDetailsOpen(false); setTimeout(() => document.getElementById("reading-loading")?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
    try {
      const birthDate = `${birth.year}-${birth.month.padStart(2, "0")}-${birth.day.padStart(2, "0")}`;
      const response = await fetch("/api/saju", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, birthDate, birthTime: form.timeUnknown ? "" : form.birthTime }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "분석을 완료하지 못했습니다.");
      setResult(data);
      document.getElementById("result")?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (caught) { setError(caught instanceof Error ? caught.message : "문제가 발생했습니다."); }
    finally { setLoading(false); }
  }

  return <main>
    <header className="nav shell"><a className="brand" href="#top">moon <i>aura</i></a><a className="nav-link" href="#analyze">사주 정보 입력하기 <span>→</span></a></header>
    <section className="hero shell" id="top"><div className="hero-copy"><p className="eyebrow">A GENTLER WAY TO READ YOURSELF</p><h1>당신의 사주를,<br /><span className="highlight">더 정확하고</span><br />더 다정하게.</h1><p className="lead">태어난 순간의 정보를 바탕으로, AI가 당신의 성향과 올해의 흐름을 이해하기 쉽게 풀어드려요.</p><a className="button primary" href="#analyze">내 사주 알아보기 <span>→</span></a></div><div className="hero-orbit" aria-hidden="true"><div className="moon"><span>木</span><b>나의<br />기운</b><span>水</span></div><div className="float-card card-one"><small>나의 핵심 기운</small><strong>단단한 토(土),<br />흐르는 수(水)</strong><div className="mini-bars"><i /><i /><i /><i /><i /></div></div><div className="float-card card-two">오늘의 나를<br /><b>천천히 읽어보기</b> <span>↗</span></div></div><p className="privacy-note">입력 정보는 분석 중에만 사용하며 저장하지 않아요.</p></section>
    <section className="steps-section"><div className="section shell steps"><div><p className="eyebrow">HOW IT WORKS</p><h2>세 단계로 만나는<br /><span className="highlight">나의 이야기</span></h2></div><ol><li><b>01</b><div><h3>태어난 순간을 입력해요</h3><p>양·음력과 생년월일시를 차분히 알려주세요.</p></div></li><li><b>02</b><div><h3>사주를 계산하고 해석해요</h3><p>계산은 코드로, 풀이는 AI가 맡아요.</p></div></li><li><b>03</b><div><h3>나를 위한 힌트를 만나요</h3><p>강점과 보완점을 일상 언어로 확인해요.</p></div></li></ol></div></section>
    <section className="analyze-section" id="analyze"><div className="shell analyze-grid"><div className="analyze-intro"><p className="eyebrow">START YOUR READING</p><h2>지금의 나를<br /><span className="highlight">천천히 살펴볼까요?</span></h2><p className="time-guidance">태어난 시간은 모르면 비워두셔도 괜찮아요.<br />시주를 제외한 보수적인 풀이로 안내합니다.</p><div className="safe-box">✦ 사주 해석은 자기 이해를 위한 참고 자료이며, 중요한 결정은 전문가와 상의해 주세요.</div></div>
      <form className="form-card" onSubmit={submit}><fieldset><legend>기본 정보</legend><label>달력 종류 <span className="choice-row"><button type="button" className={form.calendar === "solar" ? "selected" : ""} onClick={() => update("calendar", "solar")}>양력</button><button type="button" className={form.calendar === "lunar" ? "selected" : ""} onClick={() => update("calendar", "lunar")}>음력</button></span></label>{form.calendar === "lunar" && <label className="check"><input type="checkbox" checked={form.isLeapMonth} onChange={e => update("isLeapMonth", e.target.checked)} /> 윤달입니다</label>}<label>생년월일 <span className="date-selects"><select required value={birth.year} onChange={e => setBirth(current => ({ ...current, year: e.target.value }))}><option value="">생년</option>{Array.from({ length: new Date().getFullYear() - 1899 }, (_, index) => <option key={index} value={new Date().getFullYear() - index}>{new Date().getFullYear() - index}년</option>)}</select><select required value={birth.month} onChange={e => setBirth(current => ({ ...current, month: e.target.value, day: "" }))}><option value="">월</option>{Array.from({ length: 12 }, (_, index) => <option key={index} value={index + 1}>{index + 1}월</option>)}</select><select required value={birth.day} onChange={e => setBirth(current => ({ ...current, day: e.target.value }))}><option value="">일</option>{Array.from({ length: dayCount }, (_, index) => <option key={index} value={index + 1}>{index + 1}일</option>)}</select></span></label><label>태어난 시간 <select className="traditional-time" disabled={form.timeUnknown} required={!form.timeUnknown} value={form.birthTime} onChange={e => update("birthTime", e.target.value)}><option value="">시간대를 선택해 주세요</option>{traditionalHours.map(hour => <option key={hour.value} value={hour.value}>{hour.label}</option>)}</select></label><label className="check"><input type="checkbox" checked={form.timeUnknown} onChange={e => update("timeUnknown", e.target.checked)} /> 태어난 시간을 모르겠어요</label><label>성별 <span className="choice-row"><button type="button" className={form.gender === "female" ? "selected" : ""} onClick={() => update("gender", "female")}>여성</button><button type="button" className={form.gender === "male" ? "selected" : ""} onClick={() => update("gender", "male")}>남성</button></span></label></fieldset><fieldset><legend>보고 싶은 이야기</legend><div className="topic-row"><button type="button" className={form.fortuneType === "general" ? "selected" : ""} onClick={() => update("fortuneType", "general")}>종합 풀이</button><button type="button" className={form.fortuneType === "yearly" ? "selected" : ""} onClick={() => update("fortuneType", "yearly")}>{form.targetYear}년 운세</button></div></fieldset>{error && <p className="error" role="alert">{error}</p>}<button className="button primary wide" disabled={loading}>{loading ? "나의 이야기를 읽는 중…" : "사주 분석 시작하기"} <span>→</span></button></form>
    </div>{loading && <section className="reading-loading" id="reading-loading" aria-live="polite"><div className="loading-orbit"><i /><i /><i /><i /><i /><b>五</b></div><div><p className="eyebrow">READING YOUR MOMENT</p><h3>태어난 순간의 기운을<br />차분히 읽고 있어요.</h3><p>사주팔자와 오행의 균형을 살피고, 나만의 이야기를 정리하는 중입니다.</p></div></section>}</section>
    {result && interpretation && <section className="result-section shell" id="result"><div className="result-head"><p className="eyebrow">YOUR READING</p><h2>나를 이해하는<br /><span className="highlight">새로운 시선</span></h2>{!result.generatedWithAi && <p className="key-notice">AI 해석은 준비 중입니다. Gemini API 키를 설정하면 해석이 이 자리에 표시돼요.</p>}</div><div className="result-grid"><article className="result-card pillars"><h3>사주 여덟 글자</h3><div>{(["year", "month", "day", "hour"] as const).map((key, index) => { const pillar = result.calculation.pillars[key]; return <span key={key} className={index === 2 ? "pillar-item day-pillar" : "pillar-item"}><small>{["연주", "월주", "일주", "시주"][index]}</small>{pillar ? <div className="pillar-character-stack"><div><em>천간</em><b>{pillar.stem ?? pillar.label?.[0]}</b><i>{pillar.hanja?.[0] ?? ""}</i></div><div><em>지지</em><b>{pillar.branch ?? pillar.label?.[1]}</b><i>{pillar.hanja?.[1] ?? ""}</i></div></div> : <b className="unknown-pillar">미상</b>}{pillar && <div className="pillar-badges"><u className={elementKeys[pillar.stemElement ?? ""] ?? ""}>{elementLabels[pillar.stemElement ?? ""] ?? "미상"}</u><u>{pillar.yinYang === "yang" ? "양" : "음"}</u></div>}</span> })}</div></article><article className="result-card elements"><h3>오행의 균형</h3><ElementRadar values={result.calculation.fiveElements} /></article><article className="result-card insight"><h3>계산의 요약</h3><p>일간 <b>{result.calculation.dayMaster?.stem ?? "—"}</b> · <strong className={`element-word ${elementKeys[result.calculation.dayMaster?.elementKo ?? ""] ?? ""}`}>{result.calculation.dayMaster?.elementKo ?? ""}</strong></p><CoreEnergyBars values={result.calculation.fiveElements} /><div className="energy-summary"><span>강한 기운</span><div>{(result.calculation.dominantElements?.length ? result.calculation.dominantElements : ["—"]).map(element => element === "—" ? <em key={element}>—</em> : <ElementChip key={element} element={element} />)}</div></div><div className="energy-summary weak"><span>보완할 기운</span><div>{(result.calculation.weakElements?.length ? result.calculation.weakElements : ["—"]).map(element => element === "—" ? <em key={element}>—</em> : <ElementChip key={element} element={element} />)}</div></div></article></div><article className="interpretation"><p className="eyebrow">사주 상담 결과</p><p className="consult-summary"><span className="consult-summary-highlight"><ElementText text={formatSummaryLineBreaks(consultationSummary(result.calculation))} hanjaElements /></span></p>{interpretation.body.length > 0 && <details className="consult-details"><summary>상세 해석 펼쳐보기</summary><div className="interpretation-sections">{interpretationSections.map(section => <section className="interpretation-section" key={section.title}><h4>{section.title}</h4>{section.paragraphs.map((paragraph, index) => <p key={index}><ElementText text={paragraph} /></p>)}</section>)}</div></details>}<small className="subtle-notice">이 해석은 자기 이해를 위한 참고 자료이며 의료·투자·법률 판단을 대신하지 않습니다. {interpretation.limitations.length > 0 ? interpretation.limitations.join(" ") : result.calculation.limitations?.join(" ") || ""}</small></article></section>}
    <footer><div className="shell"><a className="brand" href="#top">moon <i>aura</i></a><p>당신의 이야기를 더 정확하고 다정하게.</p><small>© 2026 Moon Aura. 사주 해석은 자기 이해를 위한 참고 자료입니다.</small></div></footer>
  </main>;
}
