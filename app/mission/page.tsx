"use client";

import { useEffect, useState } from "react";
import type { Mission } from "../../lib/types";
import styles from "./page.module.css";

type Task={id:string;title:string;status:string;position:number};
type Artifact={id:string;name:string;title:string;summary:string;content:string};
type Decision={id:string;question:string;options:unknown[];status:string;answer:unknown};

export default function MissionPage(){
 const[mission,setMission]=useState<Mission|null>(null),[tasks,setTasks]=useState<Task[]>([]),[artifact,setArtifact]=useState<Artifact|null>(null),[decisions,setDecisions]=useState<Decision[]>([]),[busy,setBusy]=useState(false),[error,setError]=useState("");
 async function load(id:string){const r=await fetch("/api/mission/"+id,{cache:"no-store"});if(!r.ok){setError("Could not load this mission.");return}const d=await r.json();setTasks(d.tasks??[]);setArtifact(d.artifact??null);setDecisions(d.decisions??[])}
 async function refresh(){if(!mission)return;const r=await fetch("/api/mission/"+mission.id+"/refresh",{method:"POST"});if(!r.ok){setError("Could not refresh this mission.");return}const d=await r.json();setMission(d.mission);localStorage.setItem("heysuchi:last-mission",JSON.stringify(d.mission));await load(mission.id)}
 async function action(path:string,body?:object){if(!mission)return;setBusy(true);setError("");const r=await fetch("/api/mission/"+mission.id+"/"+path,{method:"POST",headers:{"Content-Type":"application/json"},body:body?JSON.stringify(body):undefined});const d=await r.json().catch(()=>({}));if(!r.ok){setError(d.error??"Suchi could not continue.");setBusy(false);return}await refresh();setBusy(false)}
 useEffect(()=>{try{const raw=localStorage.getItem("heysuchi:last-mission");if(!raw)return;const saved=JSON.parse(raw)as Mission;if(!saved?.id){setError("Mission reference is invalid.");return}setMission(saved);load(saved.id).catch(()=>setError("Could not load this mission."));const timer=setInterval(()=>load(saved.id).catch(()=>{}),10000);return()=>clearInterval(timer)}catch{setError("Mission reference is invalid.")}},[]);
 if(!mission)return <main className={styles.emptyPage}><span className={styles.logo}><img src="/heysuchi-mark.svg" alt=""/></span><h1>No mission yet.</h1><p>{error||"Tell Suchi an outcome and it will appear here."}</p><a href="/">← Back to Suchi</a></main>;
 const statusText=mission.status==="needs_you"?"Needs you":mission.status==="done"||mission.status==="completed"?"Complete":"Working";
 return <main className={styles.page}>
  <header className={styles.header}><a href="/" className={styles.back}>‹</a><div><span>Mission</span><small>{mission.domain} · {statusText}</small></div><button onClick={refresh} aria-label="Refresh mission">↻</button></header>
  <section className={styles.titleBlock}><span className={styles.status}>{statusText}</span><h1>{mission.title}</h1><p>{mission.raw}</p><div className={styles.progress}><i style={{width:mission.progress+"%"}}/></div><small>{mission.progress}% complete</small></section>
  <section className={styles.chat}>
   <div className={styles.systemMessage}><span className={styles.avatar}><img src="/heysuchi-mark.svg" alt=""/></span><div><strong>Suchi</strong><p>{mission.nextAction}</p><time>Now</time></div></div>
   {tasks.filter(t=>t.status==="done"||t.status==="verified").slice(0,4).map((task)=><div className={styles.doneMessage} key={task.id}><span>✓</span><div><strong>{task.title}</strong><small>Completed</small></div></div>)}
   {decisions.filter(d=>d.status==="open").map(d=><div className={styles.decision} key={d.id}><span className={styles.label}>YOUR DECISION</span><h2>{d.question}</h2><div className={styles.choices}>{d.options.map((option,i)=><button disabled={busy} key={i} onClick={()=>action("decision",{decisionId:d.id,answer:option})}>{String(option)}</button>)}</div></div>)}
   {artifact&&<div className={styles.artifact}><div className={styles.fileIcon}>✦</div><div><strong>{artifact.name}</strong><p>{artifact.summary}</p></div><details><summary>Open</summary><pre>{artifact.content}</pre></details><a href={"/api/mission/"+mission.id+"/artifact"}>Export</a></div>}
   {error&&<div className={styles.error}>{error}</div>}
  </section>
  <div className={styles.actions}><button disabled={busy||mission.status==="done"} onClick={()=>action("execute")}>Run next step</button><button disabled={busy} onClick={()=>action("verify")}>Verify</button><button disabled={busy} onClick={()=>action("advance")}>Advance</button></div>
  <div className={styles.timeline}><strong>Mission timeline</strong>{tasks.map((task,index)=><div key={task.id}><span>{["done","verified"].includes(task.status)?"✓":index+1}</span><p>{task.title}<small>{task.status.replace("_"," ")}</small></p></div>)}</div>
 </main>
}
