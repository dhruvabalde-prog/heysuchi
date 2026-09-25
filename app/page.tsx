"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Mission } from "../lib/types";

type Tab = "day" | "actions" | "suchi" | "chats" | "goals";

const nav: { id: Tab; label: string; icon: string }[] = [
  { id: "day", label: "My Day", icon: "⌂" },
  { id: "actions", label: "Actions", icon: "✓" },
  { id: "suchi", label: "Suchi", icon: "✦" },
  { id: "chats", label: "Chats", icon: "◌" },
  { id: "goals", label: "Goals", icon: "◎" },
];

const dayFilters = ["North Stars", "Calendar", "Tasks", "Routines", "Meetings", "Events"];
const actionFilters = ["All", "Review", "Confirm", "Respond", "Approve", "Choose", "Schedule"];

function Logo() {
  return <img className="brandLogo" src="/heysuchi-mark.svg" alt="" />;
}

function StatusPill({ status }: { status: Mission["status"] }) {
  const label = status === "needs_you" ? "Needs you" : status.replace("_", " ");
  return <span className={"statusPill " + status}>{label}</span>;
}

function MissionRow({ mission, onOpen }: { mission: Mission; onOpen: () => void }) {
  return (
    <button className="chatRow" onClick={onOpen}>
      <span className="chatAvatar"><Logo /></span>
      <span className="chatCopy">
        <span className="chatTitle">{mission.title}</span>
        <span className="chatPreview">{mission.nextAction}</span>
      </span>
      <span className="chatMeta">
        <span>{mission.progress}%</span>
        <StatusPill status={mission.status} />
      </span>
    </button>
  );
}

export default function Home() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("suchi");
  const [dump, setDump] = useState("");
  const [listening, setListening] = useState(false);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [dayFilter, setDayFilter] = useState("North Stars");
  const [actionFilter, setActionFilter] = useState("All");
  const [chatTab, setChatTab] = useState<"Me" | "Team">("Me");

  useEffect(() => {
    fetch("/api/mission", { cache: "no-store" })
      .then(async (r) => {
        if (r.status === 401) {
          router.replace("/auth");
          return null;
        }
        return r.json();
      })
      .then((d) => d && setMissions(d.missions ?? []))
      .catch(() => setError("Could not load missions."))
      .finally(() => setLoading(false));
  }, [router]);

  async function submit() {
    if (!dump.trim() || busy) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/mission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raw: dump.trim() }),
      });
      const data = await res.json();
      if (res.status === 401) {
        router.push("/auth");
        return;
      }
      if (!res.ok) {
        setError(data.error ?? "Could not start mission.");
        return;
      }
      localStorage.setItem("heysuchi:last-mission", JSON.stringify(data.mission));
      setDump("");
      router.push("/mission");
    } catch {
      setError("Suchi could not start that mission.");
    } finally {
      setBusy(false);
    }
  }

  function voice() {
    const Speech = typeof window !== "undefined"
      ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      : null;
    if (!Speech) {
      setError("Voice input is not supported in this browser.");
      return;
    }
    const recognition = new Speech();
    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => {
      setListening(false);
      setError("Voice input stopped.");
    };
    recognition.onresult = (e: any) => setDump((e.results?.[0]?.[0]?.transcript ?? "").trim());
    recognition.start();
  }

  const needsYou = missions.filter((m) => m.status === "needs_you" || m.status === "blocked");
  const working = missions.filter((m) => ["working", "planning", "queued"].includes(m.status));
  const completed = missions.filter((m) => ["done", "completed"].includes(m.status));
  const actionItems = useMemo(() => [...needsYou, ...working].slice(0, 8), [needsYou, working]);

  function openMission(m: Mission) {
    localStorage.setItem("heysuchi:last-mission", JSON.stringify(m));
    router.push("/mission");
  }

  return (
    <main className="appShell">
      <header className="topbar">
        <button className="brandButton" onClick={() => setTab("suchi")} aria-label="HeySuchi home">
          <Logo /><span>HeySuchi</span>
        </button>
        <div className="topActions">
          <button className="iconButton" onClick={() => router.push("/activity")} aria-label="Notifications">♧<i /></button>
          <button className="profileButton" onClick={() => router.push("/settings")} aria-label="Profile and settings">D</button>
        </div>
      </header>

      <section className="pageBody">
        {tab === "day" && (
          <div className="tabPage">
            <div className="pageIntro">
              <p className="eyebrow">TODAY</p>
              <h1>My Day <span>☀</span></h1>
              <p>Everything important, in one calm view.</p>
            </div>
            <div className="pillScroller stickyPills">{dayFilters.map((f) => <button key={f} className={dayFilter === f ? "pill active" : "pill"} onClick={() => setDayFilter(f)}>{f}</button>)}</div>
            <section className="dayHero">
              <div><span className="heroIcon">✦</span><strong>{dayFilter}</strong><p>{dayFilter === "North Stars" ? "Your bigger direction, quietly kept in view." : "Connect the relevant Google service to see this here automatically."}</p></div>
              <span className="syncDot">●</span>
            </section>
            <div className="emptyState">
              <span>◌</span>
              <strong>{dayFilter === "North Stars" ? "Your North Stars are coming." : "This view will fill from your connected Google account."}</strong>
              <p>HeySuchi keeps Google Calendar and Google Tasks as the source of truth.</p>
              <button onClick={() => router.push("/settings")}>Open Settings →</button>
            </div>
          </div>
        )}

        {tab === "actions" && (
          <div className="tabPage actionsPage">
            <div className="pageIntro">
              <p className="eyebrow">LOW ATTENTION MODE</p>
              <h1>Actions</h1>
              <p>Read one thing. Make one decision. Keep moving.</p>
            </div>
            <div className="pillScroller frozenPills">{actionFilters.map((f) => <button key={f} className={actionFilter === f ? "pill active" : "pill"} onClick={() => setActionFilter(f)}>{f}</button>)}</div>
            <div className="actionFeed">
              {loading ? <div className="skeletonCard" /> : actionItems.length ? actionItems.map((m, i) => (
                <article className="actionCard" key={m.id}>
                  <div className="actionTop"><span>Suchi · {i + 1}</span><StatusPill status={m.status} /></div>
                  <h2>{m.title}</h2>
                  <p>{m.nextAction}</p>
                  <div className="attachment"><span>✦</span><div><strong>Mission brief</strong><small>Open the detailed context when you need it.</small></div><b>›</b></div>
                  <div className="actionButtons"><button onClick={() => openMission(m)}>{m.status === "needs_you" ? "Review" : "Open"}</button><button className="soft" onClick={() => openMission(m)}>See details</button></div>
                </article>
              )) : <div className="emptyState"><span>✓</span><strong>Nothing needs you right now.</strong><p>Suchi will bring you back only when a meaningful decision is ready.</p></div>}
            </div>
          </div>
        )}

        {tab === "suchi" && (
          <div className="tabPage suchiPage">
            <div className="suchiGlow" />
            <div className="pageIntro centred">
              <span className="aiBadge"><Logo /></span>
              <p className="eyebrow">YOUR EXECUTION LAYER</p>
              <h1>What are we<br /><em>getting done?</em></h1>
              <p>Tell Suchi the outcome. She'll work out the steps, do the work, and come back only when a decision is yours.</p>
            </div>
            <div className={listening ? "composer listening" : "composer"}>
              <textarea value={dump} onChange={(e) => setDump(e.target.value)} placeholder="Tell Suchi anything…" rows={4} />
              <div className="composerBottom">
                <button className="voiceButton" onClick={voice}>{listening ? "● Listening…" : "◉ Speak"}</button>
                <button className="primaryButton" onClick={submit}>{busy ? "Starting…" : "Make it happen"} <span>↗</span></button>
              </div>
            </div>
            {error && <div className="errorBar">{error}</div>}
            <div className="quickGrid">
              {["Plan my day", "Handle my emails", "Prepare for my next meeting", "Find something in Drive"].map((q) => <button key={q} onClick={() => setDump(q)}><span>✦</span>{q}<b>›</b></button>)}
            </div>
            <section className="statsRow">
              <div><strong>{missions.length}</strong><span>Missions</span></div>
              <div><strong>{needsYou.length}</strong><span>Needs you</span></div>
              <div><strong>{working.length}</strong><span>Working</span></div>
              <div><strong>{completed.length}</strong><span>Done</span></div>
            </section>
          </div>
        )}

        {tab === "chats" && (
          <div className="tabPage chatsPage">
            <div className="pageIntro compact">
              <p className="eyebrow">MISSIONS & PEOPLE</p>
              <h1>Chats</h1>
            </div>
            <div className="chatTabs"><button className={chatTab === "Me" ? "active" : ""} onClick={() => setChatTab("Me")}>Me</button><button className={chatTab === "Team" ? "active" : ""} onClick={() => setChatTab("Team")}>Team <span>Locked</span></button></div>
            {chatTab === "Team" ? (
              <div className="lockedCard"><span>⌁</span><h2>Team is coming soon.</h2><p>Add family, teammates and collaborators to work with Suchi together.</p></div>
            ) : (
              <div className="chatList">
                {loading ? <div className="skeletonCard" /> : missions.length ? missions.map((m) => <MissionRow key={m.id} mission={m} onOpen={() => openMission(m)} />) : <div className="emptyState"><span>◌</span><strong>No missions yet.</strong><p>Tell Suchi an outcome and it will appear here as a chat.</p><button onClick={() => setTab("suchi")}>Start something →</button></div>}
              </div>
            )}
          </div>
        )}

        {tab === "goals" && (
          <div className="tabPage lockedPage">
            <div className="lockedCard large"><span>◎</span><p className="eyebrow">COMING SOON</p><h1>Goals</h1><p>Your long-term direction will live here. For now, Suchi keeps the execution moving.</p></div>
          </div>
        )}
      </section>

      <button className="floatingCreate" onClick={() => setTab("suchi")} aria-label="Tell Suchi">+</button>
      <nav className="bottomNav">
        {nav.map((item) => <button key={item.id} className={tab === item.id ? "active" : ""} onClick={() => setTab(item.id)} disabled={item.id === "goals"}><span>{item.icon}</span><small>{item.label}</small>{item.id === "goals" && <i>⌁</i>}</button>)}
      </nav>
    </main>
  );
}
