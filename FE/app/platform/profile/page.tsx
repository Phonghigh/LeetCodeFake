"use client";

import { useMemo } from "react";
import { LEADERBOARD, SUBMISSIONS, genHeatmap } from "../_data/mock";

const HEAT = ["#1e293b","#14532d","#166534","#16a34a","#22c55e"];

export default function ProfilePage() {
  const weeks = useMemo(() => genHeatmap(), []);
  const me = LEADERBOARD.find((r) => r.isMe) ?? LEADERBOARD[0];
  const langs: [string, number][] = [
    ["Python3", 62], ["C++", 28], ["Go", 18], ["JavaScript", 12], ["Rust", 8],
  ];
  const total = langs.reduce((a, b) => a + b[1], 0);

  return (
    <div className="page">
      <div style={{ display:"grid", gridTemplateColumns:"300px 1fr", gap:16, alignItems:"start" }}>
        {/* left */}
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <div className="card card-pad" style={{ textAlign:"center" }}>
            <div
              style={{
                width:64, height:64, borderRadius:"50%", background:"var(--blue)",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:26, fontWeight:700, margin:"0 auto 12px", color:"#fff",
              }}
            >
              P
            </div>
            <div style={{ fontWeight:600, fontSize:18, marginBottom:2 }}>PixelKnight</div>
            <div style={{ fontSize:12, color:"var(--tx3)", marginBottom:12 }}>
              Joined Jan 2023 · Rank #{me.rank.toLocaleString()}
            </div>
            <div style={{ fontSize:13, color:"var(--tx2)", lineHeight:1.6, marginBottom:12 }}>
              Full-stack engineer. Python + Go by day, competitive programming by night.
            </div>
            <div style={{ display:"flex", gap:6, justifyContent:"center", flexWrap:"wrap" }}>
              <span className="badge blue">Top 0.07%</span>
              <span className="badge gray mono">{me.lang}</span>
              <span className="badge gray">🔥 {me.streak}d streak</span>
            </div>
          </div>

          <div className="card card-pad">
            <div style={{ fontWeight:600, marginBottom:12, fontSize:13 }}>Kill Count</div>
            {(
              [
                ["Easy",   "var(--green)",  me.easy,   90],
                ["Medium", "var(--yellow)", me.medium, 60],
                ["Hard",   "var(--red)",    me.hard,   30],
              ] as [string, string, number, number][]
            ).map(([l, c, v, m]) => (
              <div key={l} style={{ marginBottom:10 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                  <span className={`badge ${l.toLowerCase()}`} style={{ fontSize:11 }}>{l}</span>
                  <span className="mono" style={{ fontSize:12, color:"var(--tx3)" }}>{v}/{m}</span>
                </div>
                <div className="prog">
                  <div className="prog-fill" style={{ width:Math.min(100, v/m*100)+"%", background:c }} />
                </div>
              </div>
            ))}
          </div>

          <div className="card card-pad">
            <div style={{ fontWeight:600, marginBottom:12, fontSize:13 }}>Languages</div>
            {langs.map(([l, n]) => (
              <div key={l} style={{ marginBottom:8 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                  <span className="mono" style={{ fontSize:12, color:"var(--tx2)" }}>{l}</span>
                  <span className="mono" style={{ fontSize:11, color:"var(--tx3)" }}>{n} solved</span>
                </div>
                <div className="prog">
                  <div className="prog-fill" style={{ width:(n/total*100)+"%", background:"var(--blue)", opacity:0.8 }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* right */}
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
            {(
              [
                ["Solved", me.solved,              "var(--tx)"],
                ["Score",  me.score.toLocaleString(),"var(--blue)"],
                ["Streak", me.streak+"d",            "var(--yellow)"],
                ["Rank",   "#"+me.rank,              "var(--green)"],
              ] as [string, string | number, string][]
            ).map(([l, v, c]) => (
              <div key={l} className="card card-pad">
                <div className="stat-num" style={{ color:c, fontSize:26 }}>{v}</div>
                <div className="stat-lbl">{l}</div>
              </div>
            ))}
          </div>

          <div className="card card-pad">
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
              <span style={{ fontWeight:600, fontSize:13 }}>Activity Heatmap</span>
              <span style={{ fontSize:11, color:"var(--tx3)" }}>128 submissions this year</span>
            </div>
            <div className="heatmap">
              {weeks.map((wk, i) => (
                <div key={i} className="heatmap-col">
                  {wk.map((v, d) => (
                    <div key={d} className="heatmap-cell" style={{ background:HEAT[v] }} title={`${v} solves`} />
                  ))}
                </div>
              ))}
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:4, justifyContent:"flex-end", marginTop:8 }}>
              <span style={{ fontSize:10, color:"var(--tx3)" }}>less</span>
              {HEAT.map((c, i) => (
                <div key={i} style={{ width:10, height:10, background:c, borderRadius:2 }} />
              ))}
              <span style={{ fontSize:10, color:"var(--tx3)" }}>more</span>
            </div>
          </div>

          <div className="card" style={{ overflow:"hidden" }}>
            <div style={{ padding:"12px 16px", fontWeight:600, fontSize:13, borderBottom:"1px solid var(--bdr)" }}>
              Recent Submissions
            </div>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Problem</th>
                  <th style={{ width:90 }}>Verdict</th>
                  <th style={{ width:80 }}>Runtime</th>
                  <th style={{ width:60 }}>When</th>
                </tr>
              </thead>
              <tbody>
                {SUBMISSIONS.slice(0, 8).map((s) => (
                  <tr key={s.id}>
                    <td style={{ fontWeight:500 }}>{s.prob.title}</td>
                    <td><span className={`badge ${s.vk.toLowerCase()}`}>{s.vk}</span></td>
                    <td className="mono" style={{ fontSize:12 }}>{s.ms ? s.ms+"ms" : "—"}</td>
                    <td className="mono" style={{ fontSize:11, color:"var(--tx3)" }}>{s.ago}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
