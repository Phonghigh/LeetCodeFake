"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { PROBLEMS } from "../_data/mock";
import type { Problem } from "../_types";

const HEAT_C = ["#1e293b","#14532d","#166534","#16a34a","#22c55e"];

export default function ProblemsPage() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [diff, setDiff] = useState("All");
  const [stat, setStat] = useState("All");
  const [tag, setTag] = useState("All");

  const tags = useMemo(() => ["All", ...new Set(PROBLEMS.flatMap((p) => p.tags))], []);
  const rows = useMemo(
    () =>
      PROBLEMS.filter(
        (p) =>
          (diff === "All" || p.diff === diff) &&
          (stat === "All" ||
            (stat === "Solved" && p.status === "solved") ||
            (stat === "Todo" && p.status === "todo") ||
            (stat === "Attempted" && p.status === "attempted")) &&
          (tag === "All" || p.tags.includes(tag)) &&
          (!q || p.title.toLowerCase().includes(q.toLowerCase()))
      ),
    [q, diff, stat, tag]
  );

  const solved = PROBLEMS.filter((p) => p.status === "solved").length;

  function openProblem(p: Problem) {
    router.push(`/platform/judge/${p.id}`);
  }

  return (
    <div className="page">
      {/* header */}
      <div style={{ display:"flex", alignItems:"flex-end", gap:16, flexWrap:"wrap", marginBottom:20 }}>
        <div>
          <div className="page-title">Problems</div>
          <div className="page-sub">{PROBLEMS.length} problems · {solved} solved</div>
        </div>
        <div style={{ flex:1 }} />
        <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
          <input
            className="inp"
            placeholder="Search…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={{ width:200 }}
          />
          <select className="inp" value={diff} onChange={(e) => setDiff(e.target.value)}>
            {["All","Easy","Medium","Hard"].map((d) => <option key={d}>{d}</option>)}
          </select>
          <select className="inp" value={stat} onChange={(e) => setStat(e.target.value)}>
            {["All","Solved","Attempted","Todo"].map((d) => <option key={d}>{d}</option>)}
          </select>
          <select className="inp" value={tag} onChange={(e) => setTag(e.target.value)} style={{ maxWidth:160 }}>
            {tags.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {/* progress bars */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:20 }}>
        {(
          [
            ["Easy",   PROBLEMS.filter((p) => p.diff==="Easy").length,   PROBLEMS.filter((p) => p.diff==="Easy"   && p.status==="solved").length, "var(--green)"] ,
            ["Medium", PROBLEMS.filter((p) => p.diff==="Medium").length, PROBLEMS.filter((p) => p.diff==="Medium" && p.status==="solved").length, "var(--yellow)"],
            ["Hard",   PROBLEMS.filter((p) => p.diff==="Hard").length,   PROBLEMS.filter((p) => p.diff==="Hard"   && p.status==="solved").length, "var(--red)"],
          ] as [string, number, number, string][]
        ).map(([lbl, tot, done, col]) => (
          <div key={lbl} className="card card-pad" style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ flex:1 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                <span className={`badge ${lbl.toLowerCase()}`}>{lbl}</span>
                <span className="mono" style={{ fontSize:12, color:"var(--tx2)" }}>
                  {done}<span style={{ color:"var(--tx3)" }}> / {tot}</span>
                </span>
              </div>
              <div className="prog">
                <div className="prog-fill" style={{ width:(done/tot*100)+"%", background:col }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* table */}
      <div className="card" style={{ overflow:"hidden" }}>
        <table className="tbl">
          <thead>
            <tr>
              <th style={{ width:40 }}>#</th>
              <th style={{ width:32 }} />
              <th>Title</th>
              <th style={{ width:90 }}>Difficulty</th>
              <th style={{ width:90 }}>Acceptance</th>
              <th>Tags</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} className="clickable" onClick={() => openProblem(p)}>
                <td className="mono" style={{ color:"var(--tx3)", fontSize:12 }}>{p.id}</td>
                <td>
                  {p.status === "solved"    && <span style={{ color:"var(--green)",  fontSize:13 }}>✓</span>}
                  {p.status === "attempted" && <span style={{ color:"var(--yellow)", fontSize:13 }}>○</span>}
                  {p.status === "todo"      && <span style={{ color:"var(--tx3)",    fontSize:13 }}>–</span>}
                </td>
                <td style={{ fontWeight:500 }}>{p.title}</td>
                <td><span className={`badge ${p.diff.toLowerCase()}`}>{p.diff}</span></td>
                <td className="mono" style={{ fontSize:12, color:"var(--tx2)" }}>{p.acc}%</td>
                <td>
                  <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                    {p.tags.map((t) => (
                      <span key={t} className="badge gray" style={{ fontSize:10 }}>{t}</span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <div style={{ padding:40, textAlign:"center", color:"var(--tx3)" }}>No problems match the filter.</div>
        )}
      </div>
    </div>
  );
}
