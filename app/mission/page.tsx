"use client";

import { useEffect, useState } from "react";
import type { Mission } from "../../lib/types";

export default function MissionPage() {
  const [mission, setMission] = useState<Mission | null>(null);
  useEffect(() => {
    const raw = localStorage.getItem("heysuchi:last-mission");
    if (raw) setMission(JSON.parse(raw));
  }, []);

  if (!mission) return <main className="emptyPage"><span className="mark">✦</span><h1>No mission yet.</h1><p>Tell Suchi what outcome you want on the home screen.</p><a href="/">← Back to today</a></main>;

  return <main className="missionPage">
    <a className="back" href="/">← Today</a>
    <p className="eyebrow">{mission.domain} · MISSION</p>
    <h1>{mission.title}</h1>
    <p className="lead">{mission.raw}</p>
    <section className="statusCard">
      <div className="statusTop"><div><span className="pill">{mission.status === "needs_you" ? "Needs your decision" : "Working"}</span><h2>{mission.progress}% complete</h2></div><span className="bigMark">✦</span></div>
      <div className="bar"><i style={{width:mission.progress+"%"}} /></div>
      <p className="next"><strong>Next:</strong> {mission.nextAction}</p>
    </section>
    <section className="timeline"><div className="timelineItem done"><b>✓</b><div><strong>Understand your outcome</strong><small>Suchi extracted the goal and context.</small></div></div><div className="timelineItem done"><b>✓</b><div><strong>Create execution plan</strong><small>Tasks were broken into executable steps.</small></div></div><div className="timelineItem current"><b>→</b><div><strong>Execute and verify</strong><small>Suchi is working through the plan.</small></div></div></section>
  </main>;
}