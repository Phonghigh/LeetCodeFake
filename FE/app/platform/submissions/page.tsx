"use client";

import { useState, useMemo } from "react";
import { SUBMISSIONS } from "../_data/mock";
import { VERDICT_DETAIL } from "../_types";
import type { VerdictKey } from "../_types";

const CODE_SNIPPET = `class Solution:
    def twoSum(self, nums, target):
        seen = {}
        for i, n in enumerate(nums):
            need = target - n
            if need in seen:
                return [seen[need], i]
            seen[n] = i`;

export default function SubmissionsPage() {
  const [vf, setVf] = useState("All");
  const [lf, setLf] = useState("All");
  const [df, setDf] = useState("All");
  const [expand, setExpand] = useState<number | null>(null);

  const langs = useMemo(() => ["All", ...new Set(SUBMISSIONS.map((s) => s.lang))], []);

  const rows = useMemo(
    () =>
      SUBMISSIONS.filter(
        (s) =>
          (vf === "All" || s.vk === vf) &&
          (lf === "All" || s.lang === lf) &&
          (df === "All" || s.prob.diff === df)
      ),
    [vf, lf, df]
  );

  const total   = rows.length;
  const acCount = rows.filter((s) => s.vk === "AC").length;
  const acRate  = total ? (acCount / total * 100).toFixed(1) : "0";
  const acRows  = rows.filter((s) => s.ms);
  const avgMs   = acRows.length
    ? (acRows.reduce((a, s) => a + (s.ms ?? 0), 0) / acRows.length).toFixed(1)
    : null;

  const verdictBreakdown = (["AC","WA","TLE","RE","CE"] as VerdictKey[]).map((v) => ({
    v,
    count: rows.filter((s) => s.vk === v).length,
  }));
  const maxVCount = Math.max(...verdictBreakdown.map((x) => x.count), 1);

  return (
    <div className="page">
      <div style={{ marginBottom:20 }}>
        <div className="page-title">Submission History</div>
        <div className="page-sub">{total} records shown</div>
      </div>

      {/* summary row */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:10, marginBottom:20 }}>
        <div className="card card-pad">
          <div className="stat-num" style={{ color:"var(--blue)" }}>{total}</div>
          <div className="stat-lbl">Total</div>
        </div>
        <div className="card card-pad">
          <div className="stat-num" style={{ color:"var(--green)" }}>{acCount}</div>
          <div className="stat-lbl">Accepted</div>
        </div>
        <div className="card card-pad">
          <div className="stat-num" style={{ color:"var(--blue)" }}>{acRate}%</div>
          <div className="stat-lbl">AC Rate</div>
        </div>
        {avgMs && (
          <div className="card card-pad">
            <div className="stat-num" style={{ color:"var(--tx)" }}>
              {avgMs}<span style={{ fontSize:14, fontWeight:400, color:"var(--tx3)" }}> ms</span>
            </div>
            <div className="stat-lbl">Avg Runtime (AC)</div>
          </div>
        )}
        {/* verdict bar chart */}
        <div className="card card-pad" style={{ gridColumn:"span 2" }}>
          <div style={{ fontSize:11, color:"var(--tx3)", textTransform:"uppercase", letterSpacing:".5px", marginBottom:8 }}>
            Verdict Breakdown
          </div>
          <div style={{ display:"flex", gap:8, alignItems:"flex-end", height:44 }}>
            {verdictBreakdown.map(({ v, count }) => (
              <div key={v} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                <div
                  style={{
                    width:"100%",
                    background: v==="AC" ? "var(--green)" : v==="TLE" ? "var(--yellow)" : "var(--red)",
                    height: Math.max(3, (count / maxVCount) * 36) + "px",
                    borderRadius:"2px 2px 0 0",
                    opacity:0.85,
                  }}
                />
                <span className={`badge ${v.toLowerCase()}`} style={{ fontSize:9, padding:"1px 4px" }}>{v}</span>
                <span className="mono" style={{ fontSize:9, color:"var(--tx3)" }}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* filters */}
      <div style={{ display:"flex", gap:8, marginBottom:14, flexWrap:"wrap" }}>
        <select className="inp" value={vf} onChange={(e) => setVf(e.target.value)}>
          <option value="All">All verdicts</option>
          {(["AC","WA","TLE","RE","CE"] as VerdictKey[]).map((v) => (
            <option key={v} value={v}>{VERDICT_DETAIL[v]}</option>
          ))}
        </select>
        <select className="inp" value={df} onChange={(e) => setDf(e.target.value)}>
          {["All","Easy","Medium","Hard"].map((d) => <option key={d}>{d}</option>)}
        </select>
        <select className="inp" value={lf} onChange={(e) => setLf(e.target.value)} style={{ maxWidth:140 }}>
          {langs.map((l) => <option key={l}>{l}</option>)}
        </select>
      </div>

      {/* table */}
      <div className="card" style={{ overflow:"hidden" }}>
        <table className="tbl">
          <thead>
            <tr>
              <th style={{ width:80 }}>#</th>
              <th>Problem</th>
              <th style={{ width:90 }}>Language</th>
              <th style={{ width:110 }}>Verdict</th>
              <th style={{ width:80 }}>Runtime</th>
              <th style={{ width:80 }}>Memory</th>
              <th style={{ width:80 }}>When</th>
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 80).map((s) => (
              <>
                <tr
                  key={s.id}
                  className={`clickable${expand === s.id ? " highlight" : ""}`}
                  onClick={() => setExpand(expand === s.id ? null : s.id)}
                >
                  <td className="mono" style={{ color:"var(--tx3)", fontSize:11 }}>#{s.id}</td>
                  <td>
                    <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                      <span className={`badge ${s.prob.diff.toLowerCase()}`} style={{ fontSize:10 }}>{s.prob.diff[0]}</span>
                      <span style={{ fontWeight:500 }}>{s.prob.title}</span>
                    </div>
                  </td>
                  <td className="mono" style={{ fontSize:12, color:"var(--tx3)" }}>{s.lang}</td>
                  <td><span className={`badge ${s.vk.toLowerCase()}`}>{VERDICT_DETAIL[s.vk]}</span></td>
                  <td className="mono" style={{ fontSize:12, color:"var(--tx2)" }}>{s.ms ? s.ms+"ms" : "—"}</td>
                  <td className="mono" style={{ fontSize:12, color:"var(--tx3)" }}>{s.mem ?? "—"}</td>
                  <td className="mono" style={{ fontSize:11, color:"var(--tx3)" }}>{s.ago}</td>
                </tr>
                {expand === s.id && (
                  <tr key={`${s.id}-expand`} className="fade-in">
                    <td colSpan={7} style={{ background:"#0d1526", padding:0 }}>
                      <div style={{ padding:"12px 16px" }}>
                        <div style={{ display:"flex", gap:16, marginBottom:12, flexWrap:"wrap" }}>
                          <SubMetric label="Submission" value={"#"+s.id} />
                          {s.ms  && <SubMetric label="Runtime" value={s.ms+"ms"}  color="var(--green)" />}
                          {s.mem && <SubMetric label="Memory"  value={s.mem}       color="var(--blue)"  />}
                          <SubMetric label="Language" value={s.lang} />
                          <SubMetric label="Verdict"  value={VERDICT_DETAIL[s.vk]} color={s.vk==="AC"?"var(--green)":"var(--red)"} />
                        </div>
                        <pre
                          className="mono"
                          style={{
                            fontSize:12, lineHeight:1.7, color:"#94a3b8",
                            background:"var(--bg)", padding:"10px 12px",
                            borderRadius:"var(--r-sm)", overflow:"auto",
                          }}
                        >
                          {CODE_SNIPPET}
                        </pre>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SubMetric({ label, value, color = "var(--tx2)" }: { label: string; value: string; color?: string }) {
  return (
    <div>
      <div style={{ fontSize:10, color:"var(--tx3)", textTransform:"uppercase", letterSpacing:".5px", marginBottom:3 }}>
        {label}
      </div>
      <div className="mono" style={{ fontSize:14, fontWeight:600, color }}>{value}</div>
    </div>
  );
}
