"use client";

import { FormEvent, useState } from "react";
import type { SajuResponse } from "../lib/types";

const benefitItems = [
  ["✦", "검증 가능한 계산", "사주 여덟 글자는 서버에서 결정론적으로 계산합니다."],
  ["◌", "쉬운 AI 해석", "어려운 용어보다 오늘의 언어로 차분하게 풀이합니다."],
  ["↗", "나에게 맞는 흐름", "종합 성향과 올해의 흐름 중 궁금한 내용을 고릅니다."],
  ["▣", "한눈에 보는 결과", "오행의 균형과 실천 조언을 카드로 정리합니다."],
];

export default function Home() {
  const [form, setForm] = useState({ calendar: "solar", isLeapMonth: false, birthDate: "", birthTime: "", timeUnknown: false, gender: "female", birthCity: "", fortuneType: "general", targetYear: new Date().getFullYear() });
  const [result, setResult] = useState<SajuResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const update = (key: string, value: string | boolean | number) => setForm(current => ({ ...current, [key]: value }));

  async function submit(event: FormEvent) {
    event.preventDefault(); setLoading(true); setError(""); setResult(null);
    try {
      const response = await fetch("/api/saju", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, birthTime: form.timeUnknown ? "" : form.birthTime }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "분석을 완료하지 못했습니다.");
      setResult(data);
      document.getElementById("result")?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (caught) { setError(caught instanceof Error ? caught.message : "문제가 발생했습니다."); }
    finally { setLoading(false); }
  }

  return <main>
    <header className="nav shell"><a className="brand" href="#top">moon <i>aura</i></a><a className="nav-link" href="#analyze">사주 분석하기 <span>→</span></a></header>
    <section className="hero shell" id="top">
      <div className="hero-copy"><p className="eyebrow">A GENTLER WAY TO READ YOURSELF</p><h1>당신의 사주를,<br /><span className="highlight">더 정확하고</span><br />더 다정하게.</h1><p className="lead">태어난 순간의 정보를 바탕으로, AI가 당신의 성향과 올해의 흐름을 이해하기 쉽게 풀어드려요.</p><a className="button primary" href="#analyze">내 사주 알아보기 <span>→</span></a><p className="privacy-note">입력 정보는 분석 중에만 사용하며 저장하지 않아요.</p></div>
      <div className="hero-orbit" aria-hidden="true"><div className="moon"><span>木</span><b>나의<br />기운</b><span>水</span></div><div className="float-card card-one"><small>나의 핵심 기운</small><strong>단단한 토(土),<br />흐르는 수(水)</strong><div className="mini-bars"><i /><i /><i /><i /><i /></div></div><div className="float-card card-two">오늘의 나를<br /><b>천천히 읽어보기</b> <span>↗</span></div></div>
    </section>
    <section className="section alternate"><div className="shell"><p className="eyebrow centered">MOON AURA WAY</p><h2>복잡한 사주를,<br /><span className="highlight">쉽고 편안하게.</span></h2><div className="benefits">{benefitItems.map(([icon, title, body]) => <article className="benefit" key={title}><span className="benefit-icon">{icon}</span><h3>{title}</h3><p>{body}</p></article>)}</div></div></section>
    <section className="section shell steps"><div><p className="eyebrow">HOW IT WORKS</p><h2>세 단계로 만나는<br /><span className="highlight">나의 이야기</span></h2></div><ol><li><b>01</b><div><h3>태어난 순간을 입력해요</h3><p>양·음력과 생년월일시를 차분히 알려주세요.</p></div></li><li><b>02</b><div><h3>사주를 계산하고 해석해요</h3><p>계산은 코드로, 풀이는 AI가 맡아요.</p></div></li><li><b>03</b><div><h3>나를 위한 힌트를 만나요</h3><p>강점과 보완점을 일상 언어로 확인해요.</p></div></li></ol></section>
    <section className="analyze-section" id="analyze"><div className="shell analyze-grid"><div className="analyze-intro"><p className="eyebrow">START YOUR READING</p><h2>지금의 나를<br /><span className="highlight">천천히 살펴볼까요?</span></h2><p>태어난 시간은 모르면 비워두셔도 괜찮아요. 시주를 제외한 보수적인 풀이로 안내합니다.</p><div className="safe-box">✦ 사주 해석은 자기 이해를 위한 참고 자료이며, 중요한 결정은 전문가와 상의해 주세요.</div></div>
      <form className="form-card" onSubmit={submit}><fieldset><legend>기본 정보</legend><label>달력 종류 <span className="choice-row"><button type="button" className={form.calendar === "solar" ? "selected" : ""} onClick={() => update("calendar", "solar")}>양력</button><button type="button" className={form.calendar === "lunar" ? "selected" : ""} onClick={() => update("calendar", "lunar")}>음력</button></span></label>{form.calendar === "lunar" && <label className="check"><input type="checkbox" checked={form.isLeapMonth} onChange={e => update("isLeapMonth", e.target.checked)} /> 윤달입니다</label>}<label>생년월일 <input required type="date" value={form.birthDate} onChange={e => update("birthDate", e.target.value)} /></label><label>태어난 시간 <input type="time" disabled={form.timeUnknown} value={form.birthTime} onChange={e => update("birthTime", e.target.value)} /></label><label className="check"><input type="checkbox" checked={form.timeUnknown} onChange={e => update("timeUnknown", e.target.checked)} /> 태어난 시간을 모르겠어요</label><label>성별 <span className="choice-row"><button type="button" className={form.gender === "female" ? "selected" : ""} onClick={() => update("gender", "female")}>여성</button><button type="button" className={form.gender === "male" ? "selected" : ""} onClick={() => update("gender", "male")}>남성</button></span></label><label>출생 지역 <small>선택</small><input placeholder="예: 서울" value={form.birthCity} onChange={e => update("birthCity", e.target.value)} /></label></fieldset><fieldset><legend>보고 싶은 이야기</legend><div className="topic-row"><button type="button" className={form.fortuneType === "general" ? "selected" : ""} onClick={() => update("fortuneType", "general")}>종합 풀이</button><button type="button" className={form.fortuneType === "yearly" ? "selected" : ""} onClick={() => update("fortuneType", "yearly")}>{form.targetYear}년 운세</button></div></fieldset>{error && <p className="error" role="alert">{error}</p>}<button className="button primary wide" disabled={loading}>{loading ? "나의 이야기를 읽는 중…" : "사주 분석 시작하기"} <span>→</span></button></form>
    </div></section>
    {result && <section className="result-section shell" id="result"><div className="result-head"><p className="eyebrow">YOUR READING</p><h2>나를 이해하는<br /><em>새로운 시선</em></h2>{!result.generatedWithAi && <p className="key-notice">AI 해석은 준비 중입니다. Gemini API 키를 설정하면 해석이 이 자리에 표시돼요.</p>}</div><div className="result-grid"><article className="result-card pillars"><h3>사주 여덟 글자</h3><div>{(["year", "month", "day", "hour"] as const).map((key, index) => <span key={key}><small>{["연주", "월주", "일주", "시주"][index]}</small><b>{result.calculation.pillars[key]?.label ?? "미상"}</b><i>{result.calculation.pillars[key]?.hanja ?? ""}</i></span>)}</div></article><article className="result-card elements"><h3>오행의 균형</h3>{Object.entries(result.calculation.fiveElements ?? {}).map(([key, value]) => <p key={key}><span>{({ wood: "목", fire: "화", earth: "토", metal: "금", water: "수" } as Record<string,string>)[key] ?? key}</span><i><b style={{ width: `${Math.min(Number(value) * 25, 100)}%` }} /></i><em>{String(value)}</em></p>)}</article><article className="result-card insight"><h3>계산의 요약</h3><p>일간 <b>{result.calculation.dayMaster?.stem ?? "—"}</b> · {result.calculation.dayMaster?.elementKo ?? ""}</p><p>강한 기운 <b>{result.calculation.dominantElements?.join(", ") || "—"}</b></p><p>보완 기운 <b>{result.calculation.weakElements?.join(", ") || "—"}</b></p></article></div><article className="interpretation"><p className="eyebrow">AI INTERPRETATION</p><div>{result.interpretation.split("\n").filter(Boolean).map((line, index) => <p key={index}>{line}</p>)}</div><small>이 해석은 자기 이해를 위한 참고 자료이며 의료·투자·법률 판단을 대신하지 않습니다.</small></article></section>}
    <footer><div className="shell"><a className="brand" href="#top">moon <i>aura</i></a><p>당신의 이야기를 더 정확하고 다정하게.</p><small>© 2026 Moon Aura. 사주 해석은 자기 이해를 위한 참고 자료입니다.</small></div></footer>
  </main>;
}
