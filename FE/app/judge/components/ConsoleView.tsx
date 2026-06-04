"use client";

import type { Phase, TestCase, DoneVerdict, Lang } from "../types";
import StreamTable from "./StreamTable";
import VerdictView from "./VerdictView";

interface ConsoleViewProps {
  phase: Phase;
  cases: TestCase[];
  doneV: DoneVerdict | null;
  totalCases: number;
  dist: number[];
  distMax: number;
  pct: number;
  avgMs: string | null;
  passCount: number;
  lang: Lang;
}

export default function ConsoleView({
  phase,
  cases,
  doneV,
  totalCases,
  dist,
  distMax,
  pct,
  avgMs,
  lang,
}: ConsoleViewProps) {
  if (phase === "idle") {
    return (
      <div className="idle-msg">
        <svg
          width="28"
          height="28"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M5 3l14 9L5 21V3z" />
        </svg>
        <span style={{ fontSize: 13 }}>
          Click <b>Run</b> to test samples · <b>Submit</b> to judge all cases
        </span>
      </div>
    );
  }

  if (doneV) {
    return (
      <VerdictView
        doneV={doneV}
        cases={cases}
        dist={dist}
        distMax={distMax}
        totalCases={totalCases}
        lang={lang}
      />
    );
  }

  // streaming state
  return (
    <div>
      <div
        style={{
          padding: "10px 14px 0",
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 4,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 12,
              color: "var(--tx2)",
            }}
          >
            <span className="dot running" />
            <span style={{ fontFamily: "JetBrains Mono, monospace" }}>
              {phase === "running" ? "Running samples" : "Judging"}
            </span>
            <span style={{ color: "var(--tx3)" }}>
              {cases.length} / {totalCases} cases
            </span>
          </div>
          {avgMs && (
            <span
              style={{
                fontSize: 11,
                color: "var(--tx3)",
                fontFamily: "JetBrains Mono, monospace",
              }}
            >
              avg {avgMs}ms
            </span>
          )}
        </div>
        <div className="prog-wrap">
          <div
            className="prog-fill"
            style={{
              width: `${pct}%`,
              background: cases.some((c) => c.status !== "pass")
                ? "var(--red)"
                : "var(--blue)",
            }}
          />
        </div>
      </div>
      <StreamTable cases={cases} totalCases={totalCases} />
    </div>
  );
}
