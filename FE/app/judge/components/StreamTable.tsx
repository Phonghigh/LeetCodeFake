"use client";

import type { TestCase } from "../types";

interface StreamTableProps {
  cases: TestCase[];
  totalCases: number;
}

export default function StreamTable({ cases, totalCases }: StreamTableProps) {
  const showInput = totalCases <= 5;

  return (
    <table className="tc-table" style={{ marginTop: 8 }}>
      <thead>
        <tr>
          <th style={{ width: 36 }}>#</th>
          <th style={{ width: 14 }} />
          {showInput && (
            <>
              <th>Input</th>
              <th>Expected</th>
              <th>Got</th>
            </>
          )}
          <th style={{ width: 70 }}>Time</th>
          <th style={{ width: 60 }}>Memory</th>
          <th style={{ width: 60 }}>Status</th>
        </tr>
      </thead>
      <tbody>
        {cases.map((c, i) => {
          const rowCls =
            c.status === "pass" ? "pass" : c.status === "tle" ? "tle" : "fail";
          return (
            <tr key={i} className={`${rowCls} row-new`}>
              <td style={{ color: "var(--tx3)" }}>
                {String(c.i + 1).padStart(2, "0")}
              </td>
              <td>
                <span
                  className={`dot ${
                    c.status === "pass"
                      ? "pass"
                      : c.status === "tle"
                      ? "idle"
                      : "fail"
                  }`}
                />
              </td>
              {showInput && (
                <>
                  <td
                    style={{
                      maxWidth: 140,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      color: "var(--tx2)",
                    }}
                  >
                    {c.inp}
                  </td>
                  <td style={{ color: "var(--green)" }}>{c.exp}</td>
                  <td
                    style={{
                      color:
                        c.status === "pass" ? "var(--tx2)" : "var(--red)",
                    }}
                  >
                    {c.got}
                  </td>
                </>
              )}
              <td
                style={{
                  color:
                    c.status === "tle" ? "var(--yellow)" : "var(--tx2)",
                }}
              >
                {c.status === "tle" ? ">2000ms" : `${c.ms}ms`}
              </td>
              <td style={{ color: "var(--tx3)" }}>{c.mem}</td>
              <td>
                {c.status === "pass" && (
                  <span style={{ color: "var(--green)", fontWeight: 600 }}>
                    PASS
                  </span>
                )}
                {c.status === "fail" && (
                  <span style={{ color: "var(--red)", fontWeight: 600 }}>
                    FAIL
                  </span>
                )}
                {c.status === "tle" && (
                  <span style={{ color: "var(--yellow)", fontWeight: 600 }}>
                    TLE
                  </span>
                )}
              </td>
            </tr>
          );
        })}
        {cases.length < totalCases && (
          <tr className="running">
            <td style={{ color: "var(--tx3)" }}>
              {String(cases.length + 1).padStart(2, "0")}
            </td>
            <td>
              <span className="dot running" />
            </td>
            {totalCases <= 5 && (
              <td colSpan={3} style={{ color: "var(--tx3)" }}>
                executing…
              </td>
            )}
            <td style={{ color: "var(--tx3)" }}>—</td>
            <td style={{ color: "var(--tx3)" }}>—</td>
            <td style={{ color: "var(--blue)", fontWeight: 600 }}>RUN</td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
