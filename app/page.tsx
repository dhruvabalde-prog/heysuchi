"use client";

import { useState } from "react";

const missions = [
  { title: "Build HeySuchi", meta: "Work · In progress", progress: 42, icon: "✦" },
  { title: "Plan family weekend", meta: "Life · Needs your decision", progress: 72, icon: "⌂" },
];

export default function Home() {
  const [dump, setDump] = useState("");
  const [sent, setSent] = useState(false);
  const [listening, setListening] = useState(false);

  function submit() { if (!dump.trim()) return; setSent(true); }
  function voice() {
    const Speech = typeof window !== "undefined" ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition : null;
    if (!Speech) { setListening(v => !v); return; }
    const r = new Speech(); r.lang = "en-IN"; r.continuous = false; r.interimResults = false;
    r.onstart = () => setListening(true); r.onend = () => setListening(false); r.onerror = () => setListening(false);
    r.onresult = (e: any) => setDump((e.results?.[0]?.[0]?.transcript ?? "").trim()); r.start();
  }

  return <main className="shell">
    <header className="topbar"><div className="brand"><span className="mark">✦</span><span>HeySuchi</span></div><button className="avatar">D</button></header>
    <section className="hero">
      <p className="eyebrow">YOUR OPERATING SYSTEM FOR GETTING THINGS DONE</p>
      <h1>What are we<br/><em>getting done?</em></h1>
      <p className="sub">Tell Suchi the outcome. She’ll work out the steps, do the work, and bring you back only when a decision is yours.</p>
      <div className={"composer " + (listening ? "listening" : "")}>
        <textarea value={dump} onChange={e=>{setDump(e.target.value);setSent(false)}} placeholder="Tell Suchi anything… a goal, a brain dump, a problem." rows={3}/>
        <div className="composerBottom"><button className="voice" onClick={voice} aria-label="Speak">{listening ? "● Listening…" : "◉ Hold to speak"}</button><button className="send" onClick={submit}>Make it happen <span>↗</span></button></div>
      </div>
      {sent && <div className="toast"><span>✓</span><div><strong>Mission created.</strong><small>Suchi is turning your thought into an actionable plan.</small></div></div>}
    </section>
    <section className="section"><div className="sectionHead"><div><p className="eyebrow">YOUR MISSIONS</p><h2>In motion</h2></div><button className="textButton">View all →</button></div>
      <div className="cards">{missions.map(m=><article className="mission" key={m.title}><div className="missionIcon">{m.icon}</div><div className="missionBody"><div className="missionTop"><div><h3>{m.title}</h3><p>{m.meta}</p></div><span>{m.progress}%</span></div><div className="bar"><i style={{width:m.progress+"%"}}/></div></div></article>)}</div>
    </section>
    <section className="section lower"><div className="mini"><span>✦</span><div><strong>Suchi principle</strong><p>You make decisions. Suchi handles execution.</p></div></div><div className="mini"><span>◌</span><div><strong>Attention saved</strong><p>2h 18m of work handled this week.</p></div></div></section>
    <nav className="nav"><button className="active">⌂<small>Today</small></button><button>✦<small>Missions</small></button><button>◌<small>Activity</small></button><button>⚙<small>Settings</small></button></nav>
  </main>;
}