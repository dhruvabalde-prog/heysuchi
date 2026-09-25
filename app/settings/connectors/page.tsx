"use client";

const services=[
 {name:"Gmail",desc:"Email, drafts and replies",icon:"✉"},
 {name:"Google Calendar",desc:"Schedule, meetings and events",icon:"▣"},
 {name:"Google Tasks",desc:"Tasks and routines",icon:"✓"},
 {name:"Google Drive",desc:"Files and documents",icon:"◈"},
];

export default function Connectors(){
 return <main className="connectorPage">
   <a className="connectorBack" href="/settings">← Settings</a>
   <p className="eyebrow">CONNECTORS & INTEGRATIONS</p>
   <h1>Connect what<br/><em>Suchi needs.</em></h1>
   <p className="connectorLead">Give Suchi access only to the services you want her to work with.</p>
   <a className="googleConnect" href="/api/auth/google"><span>G</span><div><strong>Connect Google account</strong><small>Sign in and grant the Google permissions you choose.</small></div><b>→</b></a>
   <section className="connectorList">{services.map(s=><article key={s.name}><span className="connectorIcon">{s.icon}</span><div><strong>{s.name}</strong><small>{s.desc}</small></div><span className="connectorState">Available</span></article>)}</section>
   <section className="connectorNote"><strong>Progressive permissions</strong><p>HeySuchi should only request service access when you choose to connect it. Your Google account remains the source of truth for these services.</p></section>
 </main>
}