"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CONTESTS, PROBLEMS } from "../_data/mock";

const CONTEST_PROBLEMS: [string, string, string, number, number][] = [
  ["Q1","Goblin Gold","Easy",3,12044],
  ["Q2","Mana Pipeline","Medium",4,6810],
  ["Q3","Dungeon Routing","Medium",5,3902],
  ["Q4","Dragon Partition","Hard",6,1187],
];

export default function ContestsPage() {
  const router = useRouter();
  const [secs, setSecs] = useState(2 * 3600 + 14 * 60 + 8);

  useEffect(() => {
    const t = setInterval(() => setSecs((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);

  const hh = String(Math.floor(secs / 3600)).padStart(2, "0");
  const mm = String(Math.floor((secs % 3600) / 60)).padStart(2, "0");
  const ss = String(secs % 60).padStart(2, "0");

  return (
    <div className="page">
      <div style={{ marginBottom:20 }}>
        <div className="page-title">Contests</div>
        <div className="page-sub">Weekly & biweekly competitions</div>
      </div>

      {/* upcoming */}
      <div
        className="card card-pad"
        style={{ marginBottom:16, border:"1px solid var(--blue-bd)", background:"var(--blue-bg)" }}
      >
        <div style={{ display:"flex", alignItems:"center", gap:14, flexWrap:"wrap" }}>
          <div style={{ flex:1 }}>
            <span className="badge blue" style={{ marginBottom:8, display:"inline-flex" }}>Upcoming</span>
            <div style={{ fontWeight:700, fontSize:17, marginBottom:2 }}>{CONTESTS[0].name}</div>
            <div style={{ fontSize:12, color:"var(--tx3)" }}>
              {CONTESTS[0].start} · {CONTESTS[0].dur} min · {CONTESTS[0].reg.toLocaleString()} registered
            </div>
          </div>
          <div style={{ display:"flex", gap:6, alignItems:"center" }}>
            {([[hh,"HRS"],[mm,"MIN"],[ss,"SEC"]] as [string,string][]).map(([v, l]) => (
              <div
                key={l}
                style={{
                  textAlign:"center", background:"var(--s2)", border:"1px solid var(--bdr)",
                  borderRadius:"var(--r)", padding:"8px 12px", minWidth:56,
                }}
              >
                <div className="mono" style={{ fontSize:22, fontWeight:700, lineHeight:1 }}>{v}</div>
                <div style={{ fontSize:9, color:"var(--tx3)", marginTop:3 }}>{l}</div>
              </div>
            ))}
          </div>
          <button className="btn btn-blue">Register</button>
        </div>
        <div style={{ borderTop:"1px solid var(--bdr)", marginTop:14, paddingTop:14 }}>
          <div style={{ fontSize:12, fontWeight:600, color:"var(--tx2)", marginBottom:8 }}>Problems</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))", gap:8 }}>
            {CONTEST_PROBLEMS.map(([id, t, d, pts, n]) => (
              <div
                key={id}
                style={{
                  background:"var(--s2)", border:"1px solid var(--bdr)", borderRadius:"var(--r)",
                  padding:"8px 12px", cursor:"pointer",
                }}
                onClick={() => router.push(`/platform/judge/1`)}
              >
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                  <span style={{ fontSize:11, color:"var(--tx3)", fontWeight:600 }}>{id}</span>
                  <span className={`badge ${d.toLowerCase()}`} style={{ fontSize:10 }}>{pts} pts</span>
                </div>
                <div style={{ fontWeight:500, fontSize:13, marginBottom:2 }}>{t}</div>
                <div style={{ fontSize:11, color:"var(--tx3)" }} className="mono">{n.toLocaleString()} solved</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* past contests */}
      <div className="card" style={{ overflow:"hidden" }}>
        <div style={{ padding:"12px 16px", fontWeight:600, fontSize:13, borderBottom:"1px solid var(--bdr)" }}>
          Past Contests
        </div>
        <table className="tbl">
          <thead>
            <tr>
              <th>Name</th>
              <th style={{ width:180 }}>Date</th>
              <th style={{ width:90 }}>Participants</th>
              <th style={{ width:90 }}>Duration</th>
            </tr>
          </thead>
          <tbody>
            {CONTESTS.slice(1).map((c, i) => (
              <tr key={i} className="clickable">
                <td style={{ fontWeight:500 }}>{c.name}</td>
                <td className="mono" style={{ fontSize:12, color:"var(--tx2)" }}>{c.start}</td>
                <td className="mono" style={{ fontSize:12 }}>{c.reg.toLocaleString()}</td>
                <td className="mono" style={{ fontSize:12, color:"var(--tx3)" }}>{c.dur} min</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
