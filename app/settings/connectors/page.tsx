"use client";

import styles from "./page.module.css";

const services=[
 {name:"Gmail",desc:"Email, drafts and replies",icon:"✉"},
 {name:"Google Calendar",desc:"Schedule, meetings and events",icon:"▣"},
 {name:"Google Tasks",desc:"Tasks and routines",icon:"✓"},
 {name:"Google Drive",desc:"Files and documents",icon:"◈"},
];

export default function Connectors(){
 return <main className={styles.connectorPage}>
   <a className={styles.connectorBack} href="/settings">← Settings</a>
   <p className="eyebrow">CONNECTORS & INTEGRATIONS</p>
   <h1>Connect what<br/><em>Suchi needs.</em></h1>
   <p className={styles.connectorLead}>Give Suchi access only to the services you want her to work with.</p>
   <a className={styles.googleConnect} href="/api/auth/google"><span>G</span><div><strong>Connect Google account</strong><small>Sign in and grant the Google permissions you choose.</small></div><b>→</b></a>
   <section className={styles.connectorList}>{services.map(s=><article key={s.name}><span className={styles.connectorIcon}>{s.icon}</span><div><strong>{s.name}</strong><small>{s.desc}</small></div><span className={styles.connectorState}>Available</span></article>)}</section>
   <section className={styles.connectorNote}><strong>Progressive permissions</strong><p>HeySuchi should only request service access when you choose to connect it. Your Google account remains the source of truth for these services.</p></section>
 </main>
}