"use client";

import type { DoneVerdict, TestCase, Lang } from "../types";
import StreamTable from "./StreamTable";

interface VerdictViewProps {
  doneV: DoneVerdict;
  cases: TestCase[];
  dist: number[];
  distMax: number;
  totalCases: number;
  lang: Lang;
}

export default function VerdictView({
  doneV,
  cases,
  dist,
  distMax,
  totalCases,
  lang,
}: VerdictViewProps) {
  const { vkey, vconf } = doneV;
  const pass = cases.filter((c) => c.status === "pass").length;
  const times = cases.map((c) => c.ms);
  const avgT = times.length
    ? (times.reduce((a, b) => a + b, 0) / times.length).toFixed(2)
    : "—";
  const maxT = times.length ? Math.max(...times).toFixed(2) : "—";
  const mem = cases.length ? cases[cases.length - 1].mem : "—";
  const failCase = cases.find((c) => c.status !== "pass");

  return (
    <div className="summary">
      {/* verdict headline */}
      <div className={`verdict-line ${vconf.cls}`}>
        <span style={{ fontSize: 18 }}>{vconf.icon}</span>
        <span>{vconf.label}</span>
        <span
          style={{
            marginLeft: "auto",
            fontWeight: 400,
            fontSize: 13,
            opacity: 0.75,
          }}
        >
          {vkey !== "CE" && `${pass} / ${totalCases} test cases`}
        </span>
      </div>

      {/* CE block */}
      {vkey === "CE" && (
        <div className="fail-block">
          <div
            style={{ color: "var(--purple)", fontWeight: 600, marginBottom: 8, fontSize: 12 }}
          >
            Compilation Error
          </div>
          <pre
            style={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: 11.5,
              color: "#fca5a5",
              lineHeight: 1.7,
            }}
          >{`solution.py:7: SyntaxError: invalid syntax
    return [seen[need], i
                        ^
Expected ')' before end of line`}</pre>
        </div>
      )}

      {/* RE trace */}
      {vkey === "RE" && failCase && (
        <div className="fail-block">
          <div
            style={{ color: "var(--red)", fontWeight: 600, marginBottom: 8, fontSize: 12 }}
          >
            Runtime Error · Case #{failCase.i + 1}
          </div>
          <pre
            style={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: 11.5,
              color: "#fca5a5",
              lineHeight: 1.7,
            }}
          >{`Traceback (most recent call last):
  File "solution.py", line 6, in twoSum
    if need in seen:
IndexError: list index out of range`}</pre>
        </div>
      )}

      {/* WA diff */}
      {vkey === "WA" && failCase && (
        <div className="fail-block">
          <div
            style={{ color: "var(--red)", fontWeight: 600, marginBottom: 10, fontSize: 12 }}
          >
            Wrong Answer · Case #{failCase.i + 1}
          </div>
          <div className="row">
            <span className="key">Input</span>
            <span className="val">
              nums = {failCase.inp}, target = {failCase.tgt}
            </span>
          </div>
          <div className="row">
            <span className="key">Expected</span>
            <span className="val right">{failCase.exp}</span>
          </div>
          <div className="row">
            <span className="key">Got</span>
            <span className="val wrong">{failCase.got}</span>
          </div>
        </div>
      )}

      {/* TLE info */}
      {vkey === "TLE" && failCase && (
        <div className="fail-block">
          <div
            style={{ color: "var(--yellow)", fontWeight: 600, marginBottom: 10, fontSize: 12 }}
          >
            Time Limit Exceeded · Case #{failCase.i + 1}
          </div>
          <div className="row">
            <span className="key">Input</span>
            <span className="val">
              nums = {failCase.inp}, target = {failCase.tgt}
            </span>
          </div>
          <div className="row">
            <span className="key">Elapsed</span>
            <span className="val" style={{ color: "var(--yellow)" }}>
              {">"} 2000ms
            </span>
          </div>
          <div className="row">
            <span className="key">Limit</span>
            <span className="val">2000ms</span>
          </div>
        </div>
      )}

      {/* AC metrics */}
      {vkey === "AC" && (
        <>
          <div className="metric-row">
            <div className="metric">
              <div className="val" style={{ color: "var(--blue)" }}>
                {avgT}
                <span
                  style={{ fontSize: 13, fontWeight: 400, color: "var(--tx3)" }}
                >
                  {" "}
                  ms
                </span>
              </div>
              <div className="lbl">Avg Runtime</div>
              <div className="pct">
                beats{" "}
                <b style={{ color: "var(--tx)" }}>87.4%</b> of {lang} submissions
              </div>
            </div>
            <div className="metric">
              <div className="val" style={{ color: "var(--green)" }}>
                {mem}
              </div>
              <div className="lbl">Peak Memory</div>
              <div className="pct">
                beats <b style={{ color: "var(--tx)" }}>64.2%</b> of {lang} submissions
              </div>
            </div>
            <div className="metric">
              <div className="val" style={{ color: "var(--yellow)" }}>
                {maxT}
                <span
                  style={{ fontSize: 13, fontWeight: 400, color: "var(--tx3)" }}
                >
                  {" "}
                  ms
                </span>
              </div>
              <div className="lbl">Worst Case</div>
              <div className="pct">
                case #
                {cases.reduce(
                  (m, c, i, a) => (c.ms > a[m].ms ? i : m),
                  0
                ) + 1}
              </div>
            </div>
          </div>

          {/* distribution chart */}
          <div
            style={{
              background: "var(--s2)",
              border: "1px solid var(--bdr-soft)",
              borderRadius: "var(--r)",
              padding: "12px 14px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <span
                style={{ fontSize: 12, fontWeight: 600, color: "var(--tx2)" }}
              >
                Runtime Distribution
              </span>
              <span
                style={{
                  fontSize: 11,
                  color: "var(--tx3)",
                  fontFamily: "JetBrains Mono, monospace",
                }}
              >
                your submission → {avgT}ms
              </span>
            </div>
            <div className="dist-chart">
              {dist.map((v, i) => {
                const h = Math.max(4, Math.round((v / distMax) * 100));
                const isMe = i === 7;
                return (
                  <div
                    key={i}
                    className="dist-bar"
                    style={{
                      height: `${h}%`,
                      background: isMe ? "var(--blue)" : "var(--bdr)",
                      boxShadow: isMe ? "0 0 8px var(--blue)" : undefined,
                    }}
                    title={`${i * 10}–${(i + 1) * 10}ms · ${v}`}
                  />
                );
              })}
            </div>
            <div className="dist-label">
              <span>0ms</span>
              <span>faster than most</span>
              <span>200ms</span>
            </div>
          </div>
        </>
      )}

      {/* per-case table */}
      {vkey !== "CE" && cases.length > 0 && (
        <div
          style={{
            background: "var(--s1)",
            borderRadius: "var(--r)",
            border: "1px solid var(--bdr-soft)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "8px 14px",
              borderBottom: "1px solid var(--bdr)",
              display: "flex",
              gap: 14,
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--tx2)" }}>
              Test Case Log
            </span>
            <span style={{ fontSize: 11, color: "var(--tx3)" }}>
              {pass}/{cases.length} passed
            </span>
            <span
              style={{
                fontSize: 11,
                color: "var(--tx3)",
                marginLeft: "auto",
                fontFamily: "JetBrains Mono, monospace",
              }}
            >
              avg {avgT}ms · peak {mem}
            </span>
          </div>
          <StreamTable cases={cases} totalCases={totalCases} />
        </div>
      )}
    </div>
  );
}
