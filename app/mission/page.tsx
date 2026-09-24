"use client";

import { useEffect, useState } from "react";
import type { Mission } from "../../lib/types";
import styles from "./page.module.css";

export default function MissionPage() {
  const [mission, setMission] = useState<Mission | null>(null);
  useEffect(() => { const raw = localStorage.getItem("heysuchi:last-mission"); if (raw) setMission(JSON.parse(raw)); }, []);
  if (!mission) return <main className={styles.emptyPage}><span className={styles.mark}>✦</span><h1>No mission yet.</h1><p>Tell Suchi the outcome. She'll take it from there.</p><a href="/">← Back</a></main>;
  return <main className={styles.missionPage}><a className={styles.back} href="/">← Today</a><p className="eyebrow">{mission.domain} · MISSION</p><h1>{mission.title}</h1><p className={styles.lead}>{mission.raw}</p>
    <section className={styles.statusCard}><div className={styles.statusTop}><div><span className={styles.pill}>{mission.status === "needs_you" ? "Your decision" : "Working"}</span><h2>{mission.nextAction}</h2></div><span className={styles.bigMark}>✦</span></div><div className={styles.bar}><i style={{width:mission.progress+"%"}} /></div></section>
    <section className={styles.update}><span>✦</span><div><strong>Latest update</strong><p>Suchi is working on it. You'll hear from her when there's a decision, a blocker, or the work is done.</p></div></section>
    <section className={styles.detail}><div><strong>Want the detail?</strong><p>Mission notes are kept separately so the main experience stays fast and calm.</p></div><button>Open mission.md ↗</button></section>
    <section className={styles.ask}><p className="eyebrow">NEXT STEP</p><h2>When Suchi needs you, she'll ask one clear question.</h2><div className={styles.choices}><button>Approve</button><button>Choose an option</button><button>Ask Suchi why</button></div></section>
  </main>;
}