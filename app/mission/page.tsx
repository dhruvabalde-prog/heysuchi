"use client";

import { useEffect, useState } from "react";
import type { Mission } from "../../lib/types";
import styles from "./page.module.css";

export default function MissionPage() {
  const [mission, setMission] = useState<Mission | null>(null);
  useEffect(() => { const raw = localStorage.getItem("heysuchi:last-mission"); if (raw) setMission(JSON.parse(raw)); }, []);
  if (!mission) return <main className={styles.emptyPage}><span className={styles.mark}>✦</span><h1>No mission yet.</h1><p>Tell Suchi what outcome you want on the home screen.</p><a href="/">← Back to today</a></main>;
  return <main className={styles.missionPage}><a className={styles.back} href="/">← Today</a><p className="eyebrow">{mission.domain} · MISSION</p><h1>{mission.title}</h1><p className={styles.lead}>{mission.raw}</p><section className={styles.statusCard}><div className={styles.statusTop}><div><span className={styles.pill}>{mission.status === "needs_you" ? "Needs your decision" : "Working"}</span><h2>{mission.progress}% complete</h2></div><span className={styles.bigMark}>✦</span></div><div className={styles.bar}><i style={{width:mission.progress+"%"}} /></div><p className={styles.next}><strong>Next:</strong> {mission.nextAction}</p></section><section className={styles.timeline}><div className={styles.timelineItem+" "+styles.done}><b>✓</b><div><strong>Understand your outcome</strong><small>Suchi extracted the goal and context.</small></div></div><div className={styles.timelineItem+" "+styles.done}><b>✓</b><div><strong>Create execution plan</strong><small>Tasks were broken into executable steps.</small></div></div><div className={styles.timelineItem+" "+styles.current}><b>→</b><div><strong>Execute and verify</strong><small>Suchi is working through the plan.</small></div></div></section></main>;
}