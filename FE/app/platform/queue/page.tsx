"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { INITIAL_QUEUE, PROBLEMS, seedRng, QUEUE_LANGS, QUEUE_USERS, QUEUE_VERDICTS } from "../_data/mock";
import { VERDICT_DETAIL } from "../_types";
import type { QueueItem, VerdictKey } from "../_types";

const VK_META = {
  AC:  { cls:"ac",  short:"AC",  label:"Accepted" },
  WA:  { cls:"wa",  short:"WA",  label:"Wrong Answer" },
  TLE: { cls:"tle", short:"TLE", label:"Time Limit Exceeded" },
  RE:  { cls:"re",  short:"RE",  label:"Runtime Error" },
  CE:  { cls:"ce",  short:"CE",  label:"Compilation Error" },
} as const;

interface Stats { total: number; ac: number; wa: number; tle: number; re: number; ce: number; avgMs: number; pending: number; }

export default function QueuePage() {
  const router = useRouter();
  const rng = useMemo(() => seedRng(42), []);
  const [items, setItems] = useState<QueueItem[]>(() =>
    INITIAL_QUEUE.map((it) => ({ ...it }))
  );
  const [paused, setPaused] = useState(false);
  const [stats, setStats] = useState<Stats>({ total:350, ac:147, wa:109, tle:49, re:32, ce:13, avgMs:1840, pending:3 });
  const [sel, setSel] = useState<QueueItem | null>(null);
  const tick = useRef(0);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => {
      tick.current++;
      setItems((prev) => {
        let next = prev.map((it) => {
          if (it.liveStatus === "judging") {
            const elapsed = it.elapsed + 200;
            if (elapsed >= it.judgeMs) return { ...it, elapsed, liveStatus: "done" as const };
            return { ...it, elapsed };
          }
          return it;
        });
        const pendingIdx = next.findIndex((it) => it.liveStatus === "pending");
        const judgingCount = next.filter((it) => it.liveStatus === "judging").length;
        if (pendingIdx !== -1 && judgingCount < 3) {
          next[pendingIdx] = { ...next[pendingIdx], liveStatus: "judging", elapsed: 0 };
        }
        if (tick.current % 2 === 0) {
          const vk = QUEUE_VERDICTS[tick.current % QUEUE_VERDICTS.length];
          const prob = PROBLEMS[tick.current % PROBLEMS.length];
          const newItem: QueueItem = {
            id: 10500 + tick.current,
            prob,
            lang: QUEUE_LANGS[tick.current % QUEUE_LANGS.length],
            user: QUEUE_USERS[tick.current % QUEUE_USERS.length],
            vk,
            verdict: VERDICT_DETAIL[vk],
            ms: vk === "AC" ? parseFloat((0.5 + rng() * 100).toFixed(1)) : null,
            status: "pending",
            liveStatus: "pending",
            elapsed: 0,
            judgeMs: parseFloat((300 + rng() * 2000).toFixed(0)),
            ago: "just now",
          };
          next = [newItem, ...next.slice(0, 59)];
          setStats((s) => ({
            ...s, total: s.total + 1,
            pending: next.filter((i) => i.liveStatus === "pending").length,
            ac:  vk==="AC"  ? s.ac+1  : s.ac,
            wa:  vk==="WA"  ? s.wa+1  : s.wa,
            tle: vk==="TLE" ? s.tle+1 : s.tle,
            re:  vk==="RE"  ? s.re+1  : s.re,
          }));
        }
        return next;
      });
    }, 400);
    return () => clearInterval(t);
  }, [paused, rng]);

  const judging = items.filter((i) => i.liveStatus === "judging").length;
  const pending = items.filter((i) => i.liveStatus === "pending").length;
  const acRate  = ((stats.ac / stats.total) * 100).toFixed(1);

  return (
    <div className="page">
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20, flexWrap:"wrap" }}>
        <div>
          <div className="page-title" style={{ display:"flex", alignItems:"center", gap:10 }}>
            <span className="dot live" />
            Judge Queue
          </div>
          <div className="page-sub">Live submission feed · refreshes automatically</div>
        </div>
        <div style={{ flex:1 }} />
        <button className="btn btn-ghost" onClick={() => setPaused((p) => !p)}>
          {paused ? "▶ Resume" : "⏸ Pause"}
        </button>
      </div>

      {/* stats strip */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))", gap:10, marginBottom:20 }}>
        {(
          [
            ["Total",    stats.total.toLocaleString(), "var(--tx)"],
            ["Accepted", stats.ac.toLocaleString(),    "var(--green)"],
            ["Wrong Ans",stats.wa.toLocaleString(),    "var(--red)"],
            ["TLE",      stats.tle.toLocaleString(),   "var(--yellow)"],
            ["RE",       stats.re.toLocaleString(),    "var(--red)"],
            ["AC Rate",  acRate+"%",                   "var(--blue)"],
          ] as [string, string, string][]
        ).map(([l, v, c]) => (
          <div key={l} className="card card-pad">
            <div className="stat-num" style={{ color:c, fontSize:22 }}>{v}</div>
            <div className="stat-lbl">{l}</div>
          </div>
        ))}
      </div>

      {/* judge workers */}
      <div className="card card-pad" style={{ marginBottom:16 }}>
        <div style={{ display:"flex", alignItems:"center", gap:14, flexWrap:"wrap" }}>
          <span style={{ fontSize:12, fontWeight:600, color:"var(--tx2)" }}>Judge Workers</span>
          <div style={{ display:"flex", gap:8 }}>
            {["Judge-01","Judge-02","Judge-03","Judge-04"].map((j, i) => (
              <div
                key={j}
                style={{ display:"flex", alignItems:"center", gap:5, background:"var(--s2)", border:"1px solid var(--bdr)", borderRadius:"var(--r-sm)", padding:"4px 10px", fontSize:11 }}
              >
                <span className={`dot ${i < judging ? "run" : "idle"}`} />
                <span className="mono" style={{ color:"var(--tx2)" }}>{j}</span>
                <span style={{ color:i < judging ? "var(--blue)" : "var(--tx3)", fontSize:10 }}>
                  {i < judging ? "judging" : "idle"}
                </span>
              </div>
            ))}
          </div>
          <div style={{ flex:1 }} />
          <span className="mono" style={{ fontSize:11, color:"var(--tx3)" }}>
            {pending} pending · {judging} running · avg {stats.avgMs}ms
          </span>
        </div>
      </div>

      {/* queue table */}
      <div className="card" style={{ overflow:"hidden" }}>
        <table className="tbl">
          <thead>
            <tr>
              <th style={{ width:80 }}>#</th>
              <th>Problem</th>
              <th style={{ width:90 }}>User</th>
              <th style={{ width:90 }}>Language</th>
              <th style={{ width:100 }}>Status</th>
              <th style={{ width:110 }}>Progress</th>
              <th style={{ width:80 }}>Runtime</th>
              <th style={{ width:60 }}>When</th>
            </tr>
          </thead>
          <tbody>
            {items.slice(0, 40).map((it, i) => {
              const progPct =
                it.liveStatus === "judging"
                  ? Math.min(98, (it.elapsed / it.judgeMs) * 100)
                  : it.liveStatus === "done"
                  ? 100
                  : 0;
              return (
                <tr
                  key={it.id}
                  className={`clickable${i < 3 ? " row-new" : ""}`}
                  onClick={() => setSel(sel?.id === it.id ? null : it)}
                >
                  <td className="mono" style={{ color:"var(--tx3)", fontSize:11 }}>#{it.id}</td>
                  <td style={{ fontWeight:500, whiteSpace:"nowrap", overflow:"hidden", maxWidth:180, textOverflow:"ellipsis" }}>
                    <span className={`badge ${it.prob.diff.toLowerCase()}`} style={{ marginRight:6 }}>{it.prob.diff[0]}</span>
                    {it.prob.title}
                  </td>
                  <td className="mono" style={{ fontSize:11, color:"var(--tx2)" }}>{it.user}</td>
                  <td className="mono" style={{ fontSize:11, color:"var(--tx3)" }}>{it.lang}</td>
                  <td>
                    {it.liveStatus === "pending" && (
                      <span style={{ display:"flex", alignItems:"center", gap:5, color:"var(--tx3)", fontSize:12 }}>
                        <span className="dot idle"/>Pending
                      </span>
                    )}
                    {it.liveStatus === "judging" && (
                      <span style={{ display:"flex", alignItems:"center", gap:5, color:"var(--blue)", fontSize:12 }}>
                        <span className="dot run"/>Judging
                      </span>
                    )}
                    {it.liveStatus === "done" && (
                      <span className={`badge ${it.vk.toLowerCase()}`}>
                        {VK_META[it.vk as VerdictKey]?.short ?? it.vk}
                      </span>
                    )}
                  </td>
                  <td>
                    {it.liveStatus === "judging" && (
                      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                        <div className="prog" style={{ flex:1 }}>
                          <div className="prog-fill" style={{ width:progPct+"%", background:"var(--blue)" }} />
                        </div>
                        <span className="mono" style={{ fontSize:10, color:"var(--tx3)", whiteSpace:"nowrap" }}>
                          {it.elapsed}ms
                        </span>
                      </div>
                    )}
                    {it.liveStatus === "done" && (
                      <span className="mono" style={{ fontSize:11, color:"var(--tx3)" }}>{it.judgeMs}ms</span>
                    )}
                  </td>
                  <td className="mono" style={{ fontSize:11, color:"var(--tx3)" }}>{it.ms ? it.ms+"ms" : "—"}</td>
                  <td className="mono" style={{ fontSize:10, color:"var(--tx3)", whiteSpace:"nowrap" }}>{it.ago}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* selected detail panel */}
      {sel && (
        <div className="card card-pad fade-in" style={{ marginTop:12 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
            <span style={{ fontWeight:600 }}>{sel.prob.title}</span>
            <span className={`badge ${sel.prob.diff.toLowerCase()}`}>{sel.prob.diff}</span>
            <span className="badge gray mono" style={{ fontSize:11 }}>{sel.lang}</span>
            <div style={{ flex:1 }} />
            {sel.liveStatus === "done" && (
              <span className={`badge ${sel.vk.toLowerCase()}`}>{VK_META[sel.vk as VerdictKey]?.label}</span>
            )}
          </div>
          <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
            <Metric label="Submission ID" value={"#"+sel.id} />
            <Metric label="User"          value={sel.user} />
            <Metric label="Language"      value={sel.lang} />
            <Metric label="Judge time"    value={sel.judgeMs+"ms"} />
            {sel.ms && <Metric label="Runtime" value={sel.ms+"ms"} color="var(--green)" />}
          </div>
        </div>
      )}
    </div>
  );
}

function Metric({ label, value, color = "var(--tx2)" }: { label: string; value: string; color?: string }) {
  return (
    <div>
      <div style={{ fontSize:10, color:"var(--tx3)", textTransform:"uppercase", letterSpacing:".5px", marginBottom:3 }}>
        {label}
      </div>
      <div className="mono" style={{ fontSize:14, fontWeight:600, color }}>{value}</div>
    </div>
  );
}
