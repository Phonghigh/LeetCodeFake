"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { PROBLEMS } from "../../_data/mock";
import type { VerdictKey } from "../../_types";

/* ── syntax-colored code snippets ── */
const SNIPS: Record<string, { lines: number; code: string }> = {
  Python3: {
    lines: 9,
    code: `<span class="kw">class</span> <span class="fn">Solution</span>:\n    <span class="kw">def</span> <span class="fn">twoSum</span>(<span class="self">self</span>, nums: List[<span class="tp">int</span>], target: <span class="tp">int</span>) -&gt; List[<span class="tp">int</span>]:\n        seen = {}  <span class="cm"># value → index</span>\n        <span class="kw">for</span> i, n <span class="kw">in</span> <span class="bi">enumerate</span>(nums):\n            need = target - n\n            <span class="kw">if</span> need <span class="kw">in</span> seen:\n                <span class="kw">return</span> [seen[need], i]\n            seen[n] = i\n        <span class="kw">return</span> []`,
  },
  "C++": {
    lines: 12,
    code: `<span class="kw">class</span> <span class="fn">Solution</span> {\n<span class="kw">public</span>:\n    vector&lt;<span class="tp">int</span>&gt; <span class="fn">twoSum</span>(vector&lt;<span class="tp">int</span>&gt;&amp; nums, <span class="tp">int</span> target) {\n        unordered_map&lt;<span class="tp">int</span>,<span class="tp">int</span>&gt; seen;\n        <span class="kw">for</span> (<span class="tp">int</span> i = <span class="nm">0</span>; i &lt; (<span class="tp">int</span>)nums.size(); ++i) {\n            <span class="tp">int</span> need = target - nums[i];\n            <span class="kw">if</span> (seen.count(need)) <span class="kw">return</span> {seen[need], i};\n            seen[nums[i]] = i;\n        }\n        <span class="kw">return</span> {};\n    }\n};`,
  },
  JavaScript: {
    lines: 9,
    code: `<span class="kw">var</span> <span class="fn">twoSum</span> = <span class="kw">function</span>(nums, target) {\n    <span class="kw">const</span> seen = <span class="kw">new</span> Map();\n    <span class="kw">for</span> (<span class="kw">let</span> i = <span class="nm">0</span>; i &lt; nums.length; i++) {\n        <span class="kw">const</span> need = target - nums[i];\n        <span class="kw">if</span> (seen.has(need)) <span class="kw">return</span> [seen.get(need), i];\n        seen.set(nums[i], i);\n    }\n    <span class="kw">return</span> [];\n};`,
  },
};

const CASE_INPUTS: [string, string, string][] = [
  ["[2,7,11,15]","9","[0,1]"], ["[3,2,4]","6","[1,2]"], ["[3,3]","6","[0,1]"],
  ["[1,2,3,4]","7","[2,3]"],   ["[0,4,3,0]","0","[0,3]"],
  ["[-1,-2,-3,-4,-5]","-8","[2,4]"], ["[1000000000,1]","1000000001","[0,1]"],
  ["[2,5,5,11]","10","[1,2]"], ["[1,3,4,2]","6","[2,3]"], ["[-3,4,3,90]","0","[0,2]"],
];

const VCONF: Record<VerdictKey, { cls: string; label: string; icon: string; total: number }> = {
  AC:  { cls:"ac",  label:"Accepted",           icon:"✓", total:30 },
  WA:  { cls:"wa",  label:"Wrong Answer",        icon:"✗", total:7  },
  TLE: { cls:"tle", label:"Time Limit Exceeded", icon:"⏱", total:14 },
  RE:  { cls:"re",  label:"Runtime Error",       icon:"☠", total:11 },
  CE:  { cls:"ce",  label:"Compilation Error",   icon:"⚡", total:0  },
};

interface CaseResult { i:number; inp:string; tgt:string; exp:string; got:string; ms:number; mem:string; status:"pass"|"fail"|"tle"; }

function genCase(i: number, verdict: VerdictKey): CaseResult {
  const [inp, tgt, exp] = CASE_INPUTS[i % CASE_INPUTS.length];
  const ms = parseFloat((0.5 + Math.random() * 2.8).toFixed(2));
  const mem = parseFloat((8.2 + Math.random() * 0.8).toFixed(1)) + "MB";
  let status: "pass"|"fail"|"tle" = "pass";
  let got = exp;
  if (verdict==="WA"  && i===6)  { status="fail"; got="[0,0]"; }
  if (verdict==="TLE" && i===13) { status="tle";  got="—"; }
  if (verdict==="RE"  && i===10) { status="fail"; got="Error"; }
  return { i, inp, tgt, exp, got, ms, mem, status };
}

function buildDist() {
  return Array.from({ length:20 }, (_,i) => {
    const x=i/19, peak=Math.exp(-Math.pow((x-.35)/.15,2));
    return Math.round(10+peak*80+Math.random()*10);
  });
}

export default function PlatformJudgePage() {
  const router = useRouter();
  const params = useParams();
  const prob = PROBLEMS.find((p) => p.id === Number(params.id)) ?? PROBLEMS[0];

  const [lang, setLang]       = useState("Python3");
  const [langOpen, setLangOpen] = useState(false);
  const [descTab, setDescTab] = useState(0);
  const [consTab, setConsTab] = useState<"console"|"tests">("console");
  const [vkey, setVkey]       = useState<VerdictKey>("AC");
  const [phase, setPhase]     = useState<"idle"|"running"|"submitting"|"done">("idle");
  const [cases, setCases]     = useState<CaseResult[]>([]);
  const [doneV, setDoneV]     = useState<{ vk:VerdictKey; vc:typeof VCONF[VerdictKey]; cases:CaseResult[]; total:number } | null>(null);
  const [total, setTotal]     = useState(0);

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const bodyRef = useRef<HTMLDivElement>(null);
  const dist = useMemo(() => buildDist(), []);
  const distMax = Math.max(...dist);

  const after = useCallback((ms: number, fn: () => void) => {
    const t = setTimeout(fn, ms);
    timers.current.push(t);
  }, []);
  const clearAll = useCallback(() => { timers.current.forEach(clearTimeout); timers.current = []; }, []);
  useEffect(() => () => clearAll(), [clearAll]);
  useEffect(() => { if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight; }, [cases]);

  function run(isSubmit: boolean) {
    clearAll();
    const vk = isSubmit ? vkey : "AC";
    const vc = VCONF[vk];
    const tot = isSubmit ? vc.total : 3;
    if (vk==="CE" && isSubmit) {
      setPhase("done"); setCases([]); setTotal(0);
      setDoneV({ vk, vc, cases:[], total:0 }); setConsTab("console"); return;
    }
    setPhase(isSubmit ? "submitting" : "running");
    setCases([]); setDoneV(null); setTotal(tot); setConsTab("console");
    const all = Array.from({ length:tot }, (_, i) => genCase(i, vk));
    all.forEach((c, i) => after(100 + i*90, () => setCases((prev) => [...prev, c])));
    after(100 + tot*90 + 200, () => { setPhase("done"); setDoneV({ vk, vc, cases:all, total:tot }); });
  }

  const pct   = total > 0 ? (cases.length / total * 100) : 0;
  const avgMs = cases.length ? (cases.reduce((s,c) => s+c.ms, 0) / cases.length).toFixed(2) : null;
  const pass  = cases.filter((c) => c.status==="pass").length;
  const snip  = SNIPS[lang] ?? SNIPS.Python3;
  const isRunning = phase==="running" || phase==="submitting";

  return (
    <div className="page-full">
      <style>{`.kw{color:#c084fc}.fn{color:#60a5fa}.tp{color:#f472b6}.bi{color:#f472b6}.self{color:#fb923c}.nm{color:#fbbf24}.cm{color:#64748b}`}</style>

      {/* header */}
      <div
        style={{
          padding:"10px 16px", background:"var(--s1)", borderBottom:"1px solid var(--bdr)",
          display:"flex", alignItems:"center", gap:12, flexWrap:"wrap", flexShrink:0,
        }}
      >
        <button className="btn btn-ghost" onClick={() => router.back()} style={{ padding:"4px 10px", fontSize:12 }}>
          ← Back
        </button>
        <span style={{ fontWeight:600, fontSize:15 }}>{prob.title}</span>
        <span className={`badge ${prob.diff.toLowerCase()}`}>{prob.diff}</span>
        <span style={{ fontSize:12, color:"var(--tx3)" }}>
          Acc: <b style={{ color:"var(--tx2)" }}>{prob.acc}%</b>
        </span>
        <div style={{ flex:1 }} />
        <span style={{ fontSize:11, color:"var(--tx3)" }}>Time: 2000ms · Mem: 256MB</span>
      </div>

      {/* split */}
      <div style={{ flex:1, display:"flex", overflow:"hidden" }}>
        {/* left: description */}
        <div style={{ width:"42%", minWidth:280, display:"flex", flexDirection:"column", borderRight:"1px solid var(--bdr)", overflow:"hidden" }}>
          <div className="tabs" style={{ flexShrink:0 }}>
            {["Description","Solutions","Discuss"].map((t, i) => (
              <div key={t} className={`tab-item${descTab===i?" active":""}`} onClick={() => setDescTab(i)}>{t}</div>
            ))}
          </div>
          {descTab === 0 ? (
            <div style={{ flex:1, overflowY:"auto", padding:"18px 18px 40px" }}>
              <h1 style={{ fontSize:17, fontWeight:600, marginBottom:12 }}>{prob.title}</h1>
              <div style={{ display:"flex", gap:8, marginBottom:14, flexWrap:"wrap" }}>
                <span className={`badge ${prob.diff.toLowerCase()}`}>{prob.diff}</span>
                {prob.tags?.map((t) => <span key={t} className="badge gray" style={{ fontSize:10 }}>{t}</span>)}
              </div>
              <p style={{ lineHeight:1.7, color:"#cbd5e1", marginBottom:12, fontSize:14 }}>
                Given an array of integers{" "}
                <code style={{ fontFamily:"JetBrains Mono", fontSize:12, background:"var(--s2)", padding:"1px 5px", borderRadius:3, color:"#93c5fd" }}>nums</code>
                {" "}and an integer{" "}
                <code style={{ fontFamily:"JetBrains Mono", fontSize:12, background:"var(--s2)", padding:"1px 5px", borderRadius:3, color:"#93c5fd" }}>target</code>
                , return indices of the two numbers such that they add up to <strong>target</strong>.
              </p>
              <p style={{ lineHeight:1.7, color:"var(--tx3)", marginBottom:16, fontSize:14 }}>
                Each input has exactly one solution. You may not use the same element twice.
              </p>
              {(
                [
                  ["Example 1","nums = [2,7,11,15], target = 9","Output: [0,1]","Because nums[0] + nums[1] == 9."],
                  ["Example 2","nums = [3,2,4], target = 6","Output: [1,2]",""],
                  ["Example 3","nums = [3,3], target = 6","Output: [0,1]",""],
                ] as [string,string,string,string][]
              ).map(([h,i,o,e]) => (
                <div key={h} style={{ background:"var(--s2)", border:"1px solid var(--bdr-soft)", borderRadius:"var(--r)", padding:"10px 12px", marginBottom:10 }}>
                  <div style={{ fontSize:11, fontWeight:600, color:"var(--tx3)", textTransform:"uppercase", letterSpacing:".4px", marginBottom:6 }}>{h}</div>
                  <pre style={{ fontFamily:"JetBrains Mono", fontSize:12, lineHeight:1.7, color:"#cbd5e1" }}>
                    {`Input:  ${i}\n${o}${e?"\nExplain: "+e:""}`}
                  </pre>
                </div>
              ))}
              <div style={{ background:"var(--s2)", borderRadius:"var(--r)", padding:"12px 14px", marginTop:6 }}>
                <div style={{ fontSize:12, fontWeight:600, color:"var(--tx2)", marginBottom:8 }}>Constraints</div>
                <ul style={{ paddingLeft:18, fontFamily:"JetBrains Mono", fontSize:12, lineHeight:1.9, color:"var(--tx3)" }}>
                  <li>2 ≤ nums.length ≤ 10⁴</li>
                  <li>-10⁹ ≤ nums[i] ≤ 10⁹</li>
                  <li>Only one valid answer.</li>
                </ul>
              </div>
            </div>
          ) : (
            <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", color:"var(--tx3)", flexDirection:"column", gap:8 }}>
              <span style={{ fontSize:32, opacity:.2 }}>🔒</span>
              <span style={{ fontSize:13 }}>Login to view {["solutions","discussions"][descTab-1]}</span>
            </div>
          )}
        </div>

        {/* right: editor + console */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
          {/* toolbar */}
          <div style={{ height:44, flexShrink:0, display:"flex", alignItems:"center", gap:8, padding:"0 12px", background:"var(--s1)", borderBottom:"1px solid var(--bdr)" }}>
            <div style={{ position:"relative" }}>
              <button
                style={{ display:"flex", alignItems:"center", gap:6, background:"var(--s2)", border:"1px solid var(--bdr)", borderRadius:"var(--r-sm)", padding:"4px 10px", fontSize:12, fontFamily:"JetBrains Mono", color:"var(--tx2)", cursor:"pointer" }}
                onClick={() => setLangOpen((o) => !o)}
              >
                <span style={{ width:7, height:7, borderRadius:"50%", background:"var(--blue)", display:"inline-block" }} />
                {lang}<span style={{ fontSize:10, color:"var(--tx3)" }}>▾</span>
              </button>
              {langOpen && (
                <div style={{ position:"absolute", top:"calc(100% + 4px)", left:0, background:"var(--s1)", border:"1px solid var(--bdr)", borderRadius:"var(--r)", overflow:"hidden", zIndex:20, minWidth:130 }}>
                  {Object.keys(SNIPS).map((l) => (
                    <div key={l} onClick={() => { setLang(l); setLangOpen(false); }}
                      style={{ padding:"8px 12px", fontSize:12, fontFamily:"JetBrains Mono", cursor:"pointer", color:lang===l?"var(--blue)":"var(--tx2)", background:lang===l?"var(--blue-bg)":"transparent" }}>
                      {l}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={{ flex:1 }} />
            <button className="btn btn-ghost" onClick={() => run(false)} disabled={isRunning} style={{ borderColor:"var(--blue)", color:"var(--blue)" }}>
              {phase==="running" ? <><Spin/>Running…</> : "▶ Run"}
            </button>
            <button className="btn btn-blue" onClick={() => run(true)} disabled={isRunning}>
              {phase==="submitting" ? <><Spin/>Judging…</> : "Submit"}
            </button>
          </div>

          {/* code */}
          <div style={{ flex:1, display:"flex", overflow:"auto", background:"#0d1526" }}>
            <div className="mono" style={{ flexShrink:0, width:44, padding:"16px 8px 0 0", textAlign:"right", color:"var(--tx3)", fontSize:12, lineHeight:1.75, userSelect:"none" }}>
              {Array.from({ length:snip.lines }, (_,i) => <div key={i}>{i+1}</div>)}
            </div>
            <pre className="mono" style={{ flex:1, margin:0, padding:"16px 16px 0 0", fontSize:13, lineHeight:1.75, color:"#e2e8f0", whiteSpace:"pre" }}
              dangerouslySetInnerHTML={{ __html:snip.code }}/>
          </div>

          {/* console */}
          <div style={{ height:270, flexShrink:0, display:"flex", flexDirection:"column", borderTop:"1px solid var(--bdr)" }}>
            <div style={{ display:"flex", alignItems:"center", background:"var(--s1)", borderBottom:"1px solid var(--bdr)", flexShrink:0 }}>
              {(["console","tests"] as const).map((k) => (
                <div key={k} className={`tab-item${consTab===k?" active":""}`} onClick={() => setConsTab(k)} style={{ height:40 }}>
                  {k==="console" ? "Console" : "Test Cases"}
                </div>
              ))}
              <div style={{ flex:1 }} />
              <div style={{ display:"flex", alignItems:"center", gap:5, paddingRight:12 }}>
                <span style={{ fontSize:10, color:"var(--tx3)" }}>demo</span>
                {(Object.keys(VCONF) as VerdictKey[]).map((k) => (
                  <span key={k} onClick={() => setVkey(k)} style={{
                    fontSize:10, fontWeight:600, padding:"2px 6px", borderRadius:3, cursor:"pointer",
                    background: vkey===k ? (k==="AC"?"var(--green-bg)":k==="TLE"?"var(--yel-bg)":k==="CE"?"var(--pur-bg)":"var(--red-bg)") : "var(--s2)",
                    color: vkey===k ? (k==="AC"?"var(--green)":k==="TLE"?"var(--yellow)":k==="CE"?"var(--purple)":"var(--red)") : "var(--tx3)",
                    border: `1px solid ${vkey===k?(k==="AC"?"var(--green-bd)":k==="TLE"?"var(--yel-bd)":k==="CE"?"var(--pur-bd)":"var(--red-bd)"):"var(--bdr)"}`,
                  }}>{k}</span>
                ))}
              </div>
            </div>
            <div ref={bodyRef} style={{ flex:1, overflowY:"auto" }}>
              {consTab==="tests" ? (
                <div style={{ padding:12 }}>
                  <div style={{ fontSize:12, fontWeight:600, color:"var(--tx2)", marginBottom:8 }}>Sample Test Cases</div>
                  {(["Case 1\nnums = [2,7,11,15]\ntarget = 9","Case 2\nnums = [3,2,4]\ntarget = 6","Case 3\nnums = [3,3]\ntarget = 6"]).map((tc,i) => {
                    const [label,...rest]=tc.split("\n");
                    return (
                      <div key={i} style={{ marginBottom:8 }}>
                        <div style={{ fontSize:11, color:"var(--tx3)", marginBottom:4 }}>{label}</div>
                        <pre className="mono" style={{ fontSize:12, background:"var(--s2)", padding:"8px 10px", borderRadius:"var(--r-sm)", color:"var(--tx2)" }}>{rest.join("\n")}</pre>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <JudgeConsole
                  phase={phase} cases={cases} doneV={doneV} total={total}
                  pct={pct} avgMs={avgMs} pass={pass} dist={dist} distMax={distMax} lang={lang}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function JudgeConsole({ phase, cases, doneV, total, pct, avgMs, pass, dist, distMax, lang }: {
  phase: string; cases: CaseResult[]; doneV: any; total: number;
  pct: number; avgMs: string|null; pass: number; dist: number[]; distMax: number; lang: string;
}) {
  if (phase==="idle") return (
    <div style={{ height:"100%", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:8, color:"var(--tx3)" }}>
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" opacity=".3"><path d="M5 3l14 9L5 21V3z"/></svg>
      <span style={{ fontSize:12 }}>Click <b style={{ color:"var(--tx2)" }}>Run</b> to test · <b style={{ color:"var(--tx2)" }}>Submit</b> to judge all</span>
    </div>
  );
  if (doneV) return <VerdictSummary doneV={doneV} cases={cases} dist={dist} distMax={distMax} total={total} pass={pass} lang={lang}/>;
  return (
    <div>
      <div style={{ padding:"10px 14px 0", marginBottom:4 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
          <div style={{ display:"flex", alignItems:"center", gap:7, fontSize:12, color:"var(--tx2)" }}>
            <span className="dot run"/>
            <span className="mono">{phase==="running"?"Running samples":"Judging"}</span>
            <span style={{ color:"var(--tx3)" }}>{cases.length} / {total}</span>
          </div>
          {avgMs && <span className="mono" style={{ fontSize:11, color:"var(--tx3)" }}>avg {avgMs}ms</span>}
        </div>
        <div className="prog">
          <div className="prog-fill" style={{ width:pct+"%", background:cases.some(c=>c.status!=="pass")?"var(--red)":"var(--blue)" }}/>
        </div>
      </div>
      <CaseTable cases={cases} total={total} isSubmit={total>3}/>
    </div>
  );
}

function CaseTable({ cases, total, isSubmit }: { cases: CaseResult[]; total: number; isSubmit: boolean }) {
  return (
    <table style={{ width:"100%", borderCollapse:"collapse", fontFamily:"JetBrains Mono", fontSize:12 }}>
      <thead>
        <tr style={{ borderBottom:"1px solid var(--bdr)" }}>
          <th style={{ padding:"5px 10px", textAlign:"left", color:"var(--tx3)", fontSize:10, fontWeight:600, textTransform:"uppercase", letterSpacing:".4px", width:36 }}>#</th>
          <th style={{ padding:"5px 10px", width:14 }}/>
          {!isSubmit && <>
            <th style={{ padding:"5px 10px", textAlign:"left", color:"var(--tx3)", fontSize:10, fontWeight:600 }}>Input</th>
            <th style={{ padding:"5px 10px", textAlign:"left", color:"var(--tx3)", fontSize:10, fontWeight:600 }}>Expected</th>
            <th style={{ padding:"5px 10px", textAlign:"left", color:"var(--tx3)", fontSize:10, fontWeight:600 }}>Got</th>
          </>}
          <th style={{ padding:"5px 10px", textAlign:"left", color:"var(--tx3)", fontSize:10, fontWeight:600, width:70 }}>Time</th>
          <th style={{ padding:"5px 10px", textAlign:"left", color:"var(--tx3)", fontSize:10, fontWeight:600, width:70 }}>Memory</th>
          <th style={{ padding:"5px 10px", textAlign:"left", color:"var(--tx3)", fontSize:10, fontWeight:600, width:60 }}>Status</th>
        </tr>
      </thead>
      <tbody>
        {cases.map((c,i) => (
          <tr key={i} className="row-new" style={{ borderBottom:"1px solid var(--bdr-soft)", background:c.status!=="pass"?"rgba(239,68,68,.03)":"" }}>
            <td style={{ padding:"4px 10px", color:"var(--tx3)" }}>{String(c.i+1).padStart(2,"0")}</td>
            <td style={{ padding:"4px 10px" }}><span className={`dot ${c.status==="pass"?"pass":"fail"}`}/></td>
            {!isSubmit && <>
              <td style={{ padding:"4px 10px", color:"var(--tx2)", maxWidth:130, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.inp}</td>
              <td style={{ padding:"4px 10px", color:"var(--green)" }}>{c.exp}</td>
              <td style={{ padding:"4px 10px", color:c.status==="pass"?"var(--tx2)":"var(--red)" }}>{c.got}</td>
            </>}
            <td style={{ padding:"4px 10px", color:c.status==="tle"?"var(--yellow)":"var(--tx2)" }}>{c.status==="tle"?">2000ms":c.ms+"ms"}</td>
            <td style={{ padding:"4px 10px", color:"var(--tx3)" }}>{c.mem}</td>
            <td style={{ padding:"4px 10px" }}>
              {c.status==="pass"&&<span style={{ color:"var(--green)", fontWeight:600 }}>PASS</span>}
              {c.status==="fail"&&<span style={{ color:"var(--red)",   fontWeight:600 }}>FAIL</span>}
              {c.status==="tle" &&<span style={{ color:"var(--yellow)",fontWeight:600 }}>TLE</span>}
            </td>
          </tr>
        ))}
        {cases.length < total && (
          <tr style={{ borderBottom:"1px solid var(--bdr-soft)", background:"rgba(59,130,246,.03)" }}>
            <td style={{ padding:"4px 10px", color:"var(--tx3)" }}>{String(cases.length+1).padStart(2,"0")}</td>
            <td style={{ padding:"4px 10px" }}><span className="dot run"/></td>
            {!isSubmit && <td colSpan={3} style={{ padding:"4px 10px", color:"var(--tx3)" }}>executing…</td>}
            <td style={{ padding:"4px 10px", color:"var(--tx3)" }}>—</td>
            <td style={{ padding:"4px 10px", color:"var(--tx3)" }}>—</td>
            <td style={{ padding:"4px 10px", color:"var(--blue)", fontWeight:600 }}>RUN</td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

function VerdictSummary({ doneV, cases, dist, distMax, total, pass, lang }: any) {
  const { vk, vc } = doneV;
  const times = cases.map((c: CaseResult) => c.ms);
  const avgT = times.length ? (times.reduce((a:number,b:number)=>a+b,0)/times.length).toFixed(2) : "—";
  const maxT = times.length ? Math.max(...times).toFixed(2) : "—";
  const mem  = cases.length ? cases[cases.length-1].mem : "—";
  const failCase = cases.find((c: CaseResult) => c.status !== "pass");
  return (
    <div style={{ padding:14, display:"flex", flexDirection:"column", gap:12 }}>
      <div className={`verdict-card ${vc.cls}`}>
        <span style={{ fontSize:16 }}>{vc.icon}</span>
        <span>{vc.label}</span>
        <span style={{ marginLeft:"auto", fontWeight:400, fontSize:12, opacity:.75 }}>{vk!=="CE"&&`${pass} / ${total} cases`}</span>
      </div>
      {vk==="CE"&&(
        <pre className="mono" style={{ fontSize:11.5, color:"#fca5a5", lineHeight:1.7, background:"var(--s2)", padding:"10px 12px", borderRadius:"var(--r-sm)" }}>
          {`solution.py:7: SyntaxError: invalid syntax\n    return [seen[need], i\n                        ^\nExpected ')' before end of line`}
        </pre>
      )}
      {vk==="RE"&&failCase&&(
        <pre className="mono" style={{ fontSize:11.5, color:"#fca5a5", lineHeight:1.7, background:"var(--s2)", padding:"10px 12px", borderRadius:"var(--r-sm)" }}>
          {`Traceback (most recent call last):\n  File "solution.py", line 6, in twoSum\nIndexError: list index out of range`}
        </pre>
      )}
      {(vk==="WA"||vk==="TLE")&&failCase&&(
        <div style={{ background:"var(--s2)", border:"1px solid var(--bdr-soft)", borderRadius:"var(--r)", padding:"10px 12px", fontSize:12 }}>
          <div style={{ color:vk==="WA"?"var(--red)":"var(--yellow)", fontWeight:600, marginBottom:8 }}>
            {vk==="WA"?"Wrong Answer":"Time Limit Exceeded"} · Case #{failCase.i+1}
          </div>
          <div className="mono" style={{ display:"flex", flexDirection:"column", gap:5 }}>
            <div><span style={{ color:"var(--tx3)", width:64, display:"inline-block" }}>Input</span><span style={{ color:"var(--tx2)" }}>nums = {failCase.inp}, target = {failCase.tgt}</span></div>
            {vk==="WA"&&<>
              <div><span style={{ color:"var(--tx3)", width:64, display:"inline-block" }}>Expected</span><span style={{ color:"var(--green)" }}>{failCase.exp}</span></div>
              <div><span style={{ color:"var(--tx3)", width:64, display:"inline-block" }}>Got</span><span style={{ color:"var(--red)" }}>{failCase.got}</span></div>
            </>}
            {vk==="TLE"&&<div><span style={{ color:"var(--tx3)", width:64, display:"inline-block" }}>Elapsed</span><span style={{ color:"var(--yellow)" }}>&gt; 2000ms (limit: 2000ms)</span></div>}
          </div>
        </div>
      )}
      {vk==="AC"&&(
        <>
          <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
            {(
              [["Avg Runtime",avgT+"ms","var(--blue)","beats 87.4%"],["Peak Memory",mem,"var(--green)","beats 64.2%"],["Worst Case",maxT+"ms","var(--tx)","case #"+(cases.reduce((m:number,c:CaseResult,i:number,a:CaseResult[])=>c.ms>a[m].ms?i:m,0)+1)]] as [string,string,string,string][]
            ).map(([l,v,c,s])=>(
              <div key={l} style={{ flex:1, minWidth:110, background:"var(--s2)", border:"1px solid var(--bdr-soft)", borderRadius:"var(--r)", padding:"10px 12px" }}>
                <div className="mono" style={{ fontSize:18, fontWeight:700, color:c, marginBottom:2 }}>{v}</div>
                <div style={{ fontSize:10, color:"var(--tx3)", textTransform:"uppercase", letterSpacing:".4px" }}>{l}</div>
                <div style={{ fontSize:11, color:"var(--tx3)", marginTop:3 }}>{s}</div>
              </div>
            ))}
          </div>
          <div style={{ background:"var(--s2)", border:"1px solid var(--bdr-soft)", borderRadius:"var(--r)", padding:"10px 12px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
              <span style={{ fontSize:12, fontWeight:600, color:"var(--tx2)" }}>Runtime Distribution</span>
              <span className="mono" style={{ fontSize:11, color:"var(--tx3)" }}>your submission → {avgT}ms</span>
            </div>
            <div className="dist-wrap">
              {dist.map((v: number, i: number) => {
                const h = Math.max(3, Math.round(v/distMax*100));
                const isMe = i===7;
                return <div key={i} className="dist-bar" style={{ height:h+"%", background:isMe?"var(--blue)":"var(--bdr)", boxShadow:isMe?"0 0 6px var(--blue)":"" }}/>;
              })}
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:"var(--tx3)", marginTop:4 }}><span>0ms</span><span>200ms</span></div>
          </div>
          <CaseTable cases={cases} total={total} isSubmit={total>3}/>
        </>
      )}
    </div>
  );
}

function Spin() {
  return <svg className="spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48 2.83 2.83M2 12h4m12 0h4" strokeLinecap="round"/></svg>;
}
