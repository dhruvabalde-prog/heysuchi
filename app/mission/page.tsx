"use client";

import { useEffect, useState } from "react";
import type { Mission } from "../../lib/types";
import styles from "./page.module.css";

type Task = { id:string; title:string; status:string; position:number };
type Artifact = { id:string; name:string; title:string; summary:string; content:string };
type Decision = { id:string; question:string; options:unknown[]; status:string; answer:unknown };

export default function MissionPage() {
  const [mission,setMission]=useState<Mission|null>(null); const [tasks,setTasks]=useState<Task[]>([]); const [artifact,setArtifact]=useState<Artifact|null>(null); const [decisions,setDecisions]=useState<Decision[]>([]); const [busy,setBusy]=useState(false);
  async function load(id:string){const r=await fetch("/api/mission/"+id);if(!r.ok)return;const d=await r.json();setTasks(d.tasks??[]);setArtifact(d.artifact??null);setDecisions(d.decisions??[]);}
  useEffect(()=>{const raw=localStorage.getItem("heysuchi:last-mission");if(!raw)return;const saved=JSON.parse(raw) as Mission;setMission(saved);load(saved.id).catch(()=>{});},[]);
  async function answer(decisionId:string,answer:unknown){if(!mission)return;setBusy(true);await fetch("/api/mission/"+mission.id+"/decision",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({decisionId,answer})});await load(mission.id);setBusy(false);}
  if(!mission)return <main className={styles.emptyPage}><span className={styles.mark}>✦</span><h1>No mission yet.</h1><p>Tell Suchi the outcome. She'll take it from there.</p><a href="/">← Back</a></main>;
  return <main className={styles.missionPage}><a className={styles.back} href="/">← Today</a><p className="eyebrow">{mission.domain} · MISSION</p><h1>{mission.title}</h1><p className={styles.lead}>{mission.raw}</p>
    <section className={styles.statusCard}><div className={styles.statusTop}><div><span className={styles.pill}>{mission.status==="needs_you"?"Your decision":"Working"}</span><h2>{mission.nextAction}</h2></div><span className={styles.bigMark}>✦</span></div><div className={styles.bar}><i style={{width:mission.progress+"%"}}/></div></section>
    <section className={styles.timeline}>{tasks.map((task,index)=><div className={styles.timelineItem} key={task.id}><b>{task.status==="done"||task.status==="verified"?"✓":index+1}</b><div><strong>{task.title}</strong><small>{task.status==="done"?"Completed":task.status==="working"?"Working":task.status==="needs_you"?"Needs you":task.status==="verified"?"Verified":"Queued"}</small></div></div>)}</section>
    {decisions.filter(d=>d.status==="open").map(d=><section className={styles.decision} key={d.id}><p className="eyebrow">YOUR DECISION</p><h2>{d.question}</h2><div className={styles.choices}>{d.options.map((option,i)=><button disabled={busy} key={i} onClick={()=>answer(d.id,option)}>{String(option)}</button>)}</div></section>)}
    {artifact&&<section className={styles.detail}><div><strong>{artifact.name}</strong><p>{artifact.summary}</p></div><details><summary>Open</summary><pre>{artifact.content}</pre></details></section>}
  </main>;
}
