"use client";

import { useEffect, useState } from "react";
import type { Mission } from "../../lib/types";
import styles from "./page.module.css";

type Task = { id:string; title:string; status:string; position:number };
type Artifact = { id:string; name:string; title:string; summary:string; content:string };

export default function MissionPage() {
  const [mission, setMission] = useState<Mission | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [artifact, setArtifact] = useState<Artifact | null>(null);
  useEffect(() => {
    const raw = localStorage.getItem("heysuchi:last-mission");
    if (!raw) return;
    const saved = JSON.parse(raw) as Mission;
    setMission(saved);
    fetch("/api/mission/" + saved.id).then(r => r.ok ? r.json() : null).then(data => {
      if (data) { setTasks(data.tasks ?? []); setArtifact(data.artifact ?? null); }
    }).catch(() => {});
  }, []);
  if (!mission) return <main className={styles.emptyPage}><span className={styles.mark}>✦</span><h1>No mission yet.</h1><p>Tell Suchi the outcome. She'll take it from there.</p><a href="/">← Back</a></main>;
  return <main className={styles.missionPage}>
    <a className={styles.back} href="/">← Today</a>
    <p className="eyebrow">{mission.domain} · MISSION</p>
    <h1>{mission.title}</h1>
    <p className={styles.lead}>{mission.raw}</p>
    <section className={styles.statusCard}><div className={styles.statusTop}><div><span className={styles.pill}>{mission.status === "needs_you" ? "Your decision" : "Working"}</span><h2>{mission.nextAction}</h2></div><span className={styles.bigMark}>✦</span></div><div className={styles.bar}><i style={{width:mission.progress+"%"}} /></div></section>
    <section className={styles.timeline}>{tasks.map((task,index)=><div className={styles.timelineItem} key={task.id}><b>{task.status==="done"||task.status==="verified"?"✓":index+1}</b><div><strong>{task.title}</strong><small>{task.status==="done"?"Completed":task.status==="working"?"Working":task.status==="needs_you"?"Needs you":"Queued"}</small></div></div>)}</section>
    {artifact && <section className={styles.detail}><div><strong>{artifact.name}</strong><p>{artifact.summary}</p></div><details><summary>Open</summary><pre>{artifact.content}</pre></details></section>}
    <section className={styles.ask}><p className="eyebrow">NEXT STEP</p><h2>Suchi will ask only when a decision is yours.</h2></section>
  </main>;
}
