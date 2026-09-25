"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";

type Settings={autonomy:string;approvals:Record<string,boolean>;notifications:boolean};
const fallback:Settings={autonomy:"approval",approvals:{spending:true,external_messages:true,documents:true,travel_booking:true,deletion:true,research:false,code_changes:false},notifications:true};
const sections=[
  ["Account","Your profile and connected identity."],
  ["Connectors & Integrations","Google Workspace and future services."],
  ["Autonomy","How much execution Suchi can complete without asking."],
  ["Approval controls","Actions that can pause for your decision."],
  ["Notifications","Only meaningful changes and decisions."],
  ["AI preferences","Response style, privacy and model behaviour."],
  ["Appearance","Light, dark or system."],
  ["Privacy & Security","Accounts, permissions and sessions."],
  ["Help & Support","FAQs and support."]
];

export default function Settings(){
 const[settings,setSettings]=useState<Settings>(fallback);
 const[email,setEmail]=useState("");
 const[saved,setSaved]=useState(false);
 const[error,setError]=useState("");
 useEffect(()=>{fetch("/api/settings",{cache:"no-store"}).then(r=>r.json()).then(d=>{if(d.settings)setSettings(d.settings);setEmail(d.email??"");}).catch(()=>setError("Could not load settings."));},[]);
 async function save(next:Settings){setSettings(next);setSaved(false);const r=await fetch("/api/settings",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(next)});if(!r.ok){setError("Could not save settings.");return}setSaved(true)}
 async function logout(){await fetch("/api/auth/logout",{method:"POST"});location.href="/auth";}
 return <main className={styles.page}>
   <header className={styles.header}><a href="/" className={styles.back}>←</a><div><p className="eyebrow">SETTINGS</p><h1>Settings</h1></div></header>
   <section className={styles.account}><div className={styles.avatar}>D</div><div><strong>{email||"Your account"}</strong><small>HeySuchi account</small></div></section>
   <a className={styles.googleCard} href="/api/auth/google"><span className={styles.googleIcon}>G</span><div><strong>Connect Google account</strong><small>Gmail · Calendar · Tasks · Drive</small></div><b>→</b></a>
   {error&&<div className={styles.error}>{error}</div>}
   <section className={styles.section}><p className="eyebrow">PREFERENCES</p>
     <div className={styles.card}>
       <div><strong>Autonomy</strong><small>Choose how often Suchi pauses for you.</small></div>
       <div className={styles.choices}>{[["approval","Ask at important steps"],["selected","Ask only on selected actions"],["direct","Deliver without asking"]].map(([v,l])=><button className={settings.autonomy===v?styles.selected:""} key={v} onClick={()=>save({...settings,autonomy:v})}>{l}</button>)}</div>
     </div>
     <div className={styles.card}>
       <div><strong>Approval controls</strong><small>Keep important actions under your control.</small></div>
       {Object.entries(settings.approvals).map(([k,v])=><label key={k}><span>{k.replaceAll("_"," ").replace(/\b\w/g,m=>m.toUpperCase())}</span><input type="checkbox" checked={v} onChange={e=>save({...settings,approvals:{...settings.approvals,[k]:e.target.checked}})}/></label>)}
     </div>
     <div className={styles.card}><label><span><strong>Notifications</strong><small>Meaningful decisions and completed work.</small></span><input type="checkbox" checked={settings.notifications} onChange={e=>save({...settings,notifications:e.target.checked})}/></label>{saved&&<small className={styles.saved}>Saved</small>}</div>
   </section>
   <section className={styles.section}><p className="eyebrow">SETTINGS</p><div className={styles.links}>{sections.filter(([n])=>n!=="Autonomy"&&n!=="Approval controls"&&n!=="Notifications").map(([name,desc])=><a key={name} href={name==="Connectors & Integrations"?"/settings/connectors":"#"} className={styles.link}><span><strong>{name}</strong><small>{desc}</small></span><b>›</b></a>)}</div></section>
   <button className={styles.logout} onClick={logout}>Sign out</button>
 </main>
}