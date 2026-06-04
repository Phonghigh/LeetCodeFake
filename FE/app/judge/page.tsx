"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import type { Lang, VerdictKey, Phase, TestCase, DoneVerdict } from "./types";
import { SNIPPETS, VERDICTS, genAllCases, buildDist } from "./data";
import ConsoleView from "./components/ConsoleView";
import TestCaseEditor from "./components/TestCaseEditor";
import SvgSpin from "./components/SvgSpin";

const LANGS = Object.keys(SNIPPETS) as Lang[];

export default function JudgePage() {
  const [descTab, setDescTab] = useState(0);
  const [consTab, setConsTab] = useState<"console" | "testcase">("console");
  const [lang, setLang] = useState<Lang>("Python3");
  const [langOpen, setLangOpen] = useState(false);
  const [verdict, setVerdict] = useState<VerdictKey>("AC");
  const [phase, setPhase] = useState<Phase>("idle");
  const [cases, setCases] = useState<TestCase[]>([]);
  const [doneV, setDoneV] = useState<DoneVerdict | null>(null);
  const [totalCases, setTotalCases] = useState(0);

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const bodyRef = useRef<HTMLDivElement>(null);

  const after = useCallback((ms: number, fn: () => void) => {
    const t = setTimeout(fn, ms);
    timers.current.push(t);
  }, []);

  const clearAll = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  useEffect(() => () => clearAll(), [clearAll]);

  // auto-scroll console body
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [cases]);

  function startRun(isSubmit: boolean) {
    clearAll();
    const vkey = isSubmit ? verdict : "AC";
    const vconf = VERDICTS[vkey];
    const total = isSubmit ? vconf.totalCases : 3;

    if (vkey === "CE" && isSubmit) {
      setPhase("done");
      setCases([]);
      setTotalCases(0);
      setDoneV({ vkey, vconf, cases: [], totalCases: 0 });
      setConsTab("console");
      return;
    }

    setPhase(isSubmit ? "submitting" : "running");
    setCases([]);
    setDoneV(null);
    setTotalCases(total);
    setConsTab("console");

    const allCases = genAllCases(vkey, total);
    allCases.forEach((c, i) => {
      after(100 + i * 90, () => {
        setCases((prev) => [...prev, c]);
      });
    });
    after(100 + total * 90 + 150, () => {
      setPhase("done");
      setDoneV({ vkey, vconf, cases: allCases, totalCases: total });
    });
  }

  const snippet = SNIPPETS[lang];
  const dist = useMemo(() => buildDist(), []);
  const distMax = Math.max(...dist);

  const passCount = cases.filter((c) => c.status === "pass").length;
  const avgMs =
    cases.length
      ? (cases.reduce((s, c) => s + c.ms, 0) / cases.length).toFixed(2)
      : null;
  const pct = totalCases > 0 ? (cases.length / totalCases) * 100 : 0;

  const isRunning = phase !== "idle" && phase !== "done";

  return (
    <div className="app">
      {/* ── top bar ── */}
      <div className="topbar">
        <div className="logo">
          Code<span>Quest</span>
        </div>
        <div className="sep" />
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="prob-title">1. Two Sum</span>
          <span className="badge easy">Easy</span>
        </div>
        <div style={{ flex: 1 }} />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 12,
            color: "var(--tx3)",
          }}
        >
          <span>
            Acceptance: <b style={{ color: "var(--tx2)" }}>49.1%</b>
          </span>
          <div className="sep" />
          <span>
            Submissions: <b style={{ color: "var(--tx2)" }}>18.2M</b>
          </span>
        </div>
      </div>

      {/* ── split ── */}
      <div className="split">
        {/* left: description */}
        <div className="pane-left">
          <div className="tab-row">
            {["Description", "Solutions", "Discussions"].map((t, i) => (
              <div
                key={t}
                className={`tab${descTab === i ? " active" : ""}`}
                onClick={() => setDescTab(i)}
              >
                {t}
              </div>
            ))}
          </div>

          {descTab === 0 && (
            <div className="desc-body">
              <h1>Two Sum</h1>
              <p>
                Given an array of integers <code>nums</code> and an integer{" "}
                <code>target</code>, return{" "}
                <em>
                  indices of the two numbers such that they add up to{" "}
                  <code>target</code>
                </em>
                .
              </p>
              <p>
                You may assume that each input would have{" "}
                <strong>exactly one solution</strong>, and you may not use the
                same element twice. You can return the answer in any order.
              </p>
              <div className="example">
                <div className="label">Example 1</div>
                <pre>{`Input:  nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplain: nums[0] + nums[1] == 9, return [0, 1].`}</pre>
              </div>
              <div className="example">
                <div className="label">Example 2</div>
                <pre>{`Input:  nums = [3,2,4], target = 6\nOutput: [1,2]`}</pre>
              </div>
              <div className="example">
                <div className="label">Example 3</div>
                <pre>{`Input:  nums = [3,3], target = 6\nOutput: [0,1]`}</pre>
              </div>
              <div className="constraint-block">
                <h3>Constraints</h3>
                <ul>
                  <li>
                    <code>2 ≤ nums.length ≤ 10⁴</code>
                  </li>
                  <li>
                    <code>-10⁹ ≤ nums[i] ≤ 10⁹</code>
                  </li>
                  <li>
                    <code>-10⁹ ≤ target ≤ 10⁹</code>
                  </li>
                  <li>Only one valid answer exists.</li>
                </ul>
              </div>
              <div className="constraint-block" style={{ marginTop: 12 }}>
                <h3>Follow-up</h3>
                <p
                  style={{
                    color: "#94a3b8",
                    fontSize: 13,
                    marginTop: 4,
                    lineHeight: 1.6,
                  }}
                >
                  Can you come up with an algorithm that is less than O(n²) time
                  complexity?
                </p>
              </div>
            </div>
          )}

          {descTab === 1 && (
            <LockedPane icon="🔒" title="Solutions" sub="Login to view community solutions" />
          )}
          {descTab === 2 && (
            <LockedPane icon="💬" title="Discussions" sub="Join the conversation" />
          )}
        </div>

        {/* right: editor + console */}
        <div className="pane-right">
          {/* editor toolbar */}
          <div className="editor-toolbar">
            <div style={{ position: "relative" }}>
              <div
                className="lang-sel"
                onClick={() => setLangOpen((o) => !o)}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: "var(--blue)",
                    display: "inline-block",
                  }}
                />
                {lang}
                <span style={{ color: "var(--tx3)", fontSize: 10 }}>▾</span>
              </div>
              {langOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 4px)",
                    left: 0,
                    background: "var(--s1)",
                    border: "1px solid var(--bdr)",
                    borderRadius: 6,
                    overflow: "hidden",
                    zIndex: 20,
                    minWidth: 140,
                  }}
                >
                  {LANGS.map((l) => (
                    <div
                      key={l}
                      onClick={() => {
                        setLang(l);
                        setLangOpen(false);
                      }}
                      style={{
                        padding: "8px 14px",
                        fontSize: 12,
                        fontFamily: "JetBrains Mono, monospace",
                        cursor: "pointer",
                        color: lang === l ? "var(--blue)" : "var(--tx2)",
                        background:
                          lang === l ? "var(--blue-bg)" : "transparent",
                      }}
                    >
                      {l}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={{ flex: 1 }} />
            <span
              style={{ fontSize: 11, color: "var(--tx3)", marginRight: 4 }}
            >
              Time limit: 2000ms · Memory: 256MB
            </span>
            <button
              className="btn btn-run"
              onClick={() => startRun(false)}
              disabled={isRunning}
            >
              {phase === "running" ? (
                <>
                  <SvgSpin />
                  Running…
                </>
              ) : (
                <>▶ Run</>
              )}
            </button>
            <button
              className="btn btn-submit"
              onClick={() => startRun(true)}
              disabled={isRunning}
            >
              {phase === "submitting" ? (
                <>
                  <SvgSpin />
                  Judging…
                </>
              ) : (
                "Submit"
              )}
            </button>
          </div>

          {/* code editor */}
          <div className="editor-area">
            <style>{`.kw{color:#c084fc}.fn{color:#60a5fa}.tp{color:#f472b6}.bi{color:#f472b6}.self{color:#fb923c}.nm{color:#fbbf24}.cm{color:#64748b}`}</style>
            <div className="line-nums mono">
              {Array.from({ length: snippet.lines }, (_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
            <pre
              className="code-view"
              dangerouslySetInnerHTML={{ __html: snippet.code }}
            />
          </div>

          {/* console area */}
          <div className="console-area">
            <div className="console-toolbar">
              <div
                className={`tab${consTab === "console" ? " active" : ""}`}
                onClick={() => setConsTab("console")}
                style={{ height: 40 }}
              >
                Console
              </div>
              <div
                className={`tab${consTab === "testcase" ? " active" : ""}`}
                onClick={() => setConsTab("testcase")}
                style={{ height: 40 }}
              >
                Test cases
              </div>
              <div style={{ flex: 1 }} />
              {/* demo verdict picker */}
              <div
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                <span style={{ fontSize: 10, color: "var(--tx3)" }}>demo</span>
                <div className="v-picker">
                  {(Object.entries(VERDICTS) as [VerdictKey, typeof VERDICTS[VerdictKey]][]).map(
                    ([k, v]) => (
                      <div
                        key={k}
                        className={`v-chip ${k.toLowerCase()}${
                          verdict === k ? " active" : ""
                        }`}
                        onClick={() => setVerdict(k)}
                      >
                        {k}
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
            <div className="console-body" ref={bodyRef}>
              {consTab === "console" && (
                <ConsoleView
                  phase={phase}
                  cases={cases}
                  doneV={doneV}
                  totalCases={totalCases}
                  dist={dist}
                  distMax={distMax}
                  pct={pct}
                  avgMs={avgMs}
                  passCount={passCount}
                  lang={lang}
                />
              )}
              {consTab === "testcase" && <TestCaseEditor />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LockedPane({
  icon,
  title,
  sub,
}: {
  icon: string;
  title: string;
  sub: string;
}) {
  return (
    <div className="idle-msg" style={{ gap: 10 }}>
      <span style={{ fontSize: 32, opacity: 0.3 }}>{icon}</span>
      <span style={{ fontWeight: 600, color: "var(--tx2)" }}>{title}</span>
      <span style={{ fontSize: 12, color: "var(--tx3)" }}>{sub}</span>
    </div>
  );
}
