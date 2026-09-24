"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Mission } from "../lib/types";

export default function Home() {
  const router = useRouter();
  const [dump, setDump] = useState("");
  const [sent, setSent] = useState(false);
  const [listening, setListening] = useState(false);
  const [missions, setMissions] = useState<Mission[]>([]);

  useEffect(() => {
    fetch("/api/mission").then(r => r.json()).then(data => setMissions(data.missions ?? [])).catch(() => {});
  }, []);

  async function submit() {
    if (!dump.trim()) return;
    const res = await fetch("/api/mission", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({raw:dump.trim()}) });
    const data = await res.json();
    if (!res.ok) return;
    localStorage.setItem("heysuchi:last-mission", JSON.stringify(data.mission));
    setSent(true);
    setTimeout(() => router.push("/mission"), 350);
  }

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
        <div className="composerBottom"><button className="voice" onClick={voice}>{listening ? "● Listening…" : "◉ Speak"}</button><button className="send" onClick={submit}>Make it happen <span>↗</span></button></div>
      </div>
      {sent && <div className="toast"><span>✓</span><div><strong>Mission created.</strong><small>Opening your mission…</small></div></div>}
    </section>
    <section className="section"><div className="sectionHead"><div><p className="eyebrow">YOUR MISSIONS</p><h2>In motion</h2></div><button className="textButton">View all →</button></div>
      <div className="cards">{missions.map(m=><article className="mission" key={m.id} onClick={()=>{localStorage.setItem("heysuchi:last-mission",JSON.stringify(m));router.push("/mission")}}><div className="missionIcon">{m.domain==="Life"?"⌂":"✦"}</div><div className="missionBody"><div className="missionTop"><div><h3>{m.title}</h3><p>{m.domain+" · "+m.status.replace("_"," ")}</p></div><span>{m.progress}%</span></div><div className="bar"><i style={{width:m.progress+"%"}}/></div></div></article>)}</div>
      {!missions.length && <p className="sub">No missions yet.</p>}
    </section>
    <section className="section lower"><div className="mini"><span>✦</span><div><strong>Suchi principle</strong><p>You make decisions. Suchi handles execution.</p></div></div><div className="mini"><span>◌</span><div><strong>Attention saved</strong><p>2h 18m of work handled this week.</p></div></div></section>
    <nav className="nav"><button className="active">⌂<small>Today</small></button><button>✦<small>Missions</small></button><button>◌<small>Activity</small></button><button>⚙<small>Settings</small></button></nav>
  </main>;
}