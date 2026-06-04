"use client";

import { useState } from "react";

const CASES = [
  { n: "Case 1", inp: "nums = [2,7,11,15]\ntarget = 9" },
  { n: "Case 2", inp: "nums = [3,2,4]\ntarget = 6" },
  { n: "Case 3", inp: "nums = [3,3]\ntarget = 6" },
];

export default function TestCaseEditor() {
  const [active, setActive] = useState(0);

  return (
    <div style={{ padding: 14 }}>
      <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
        {CASES.map((c, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className="btn btn-ghost"
            style={{
              fontSize: 12,
              padding: "4px 10px",
              borderColor: active === i ? "var(--blue)" : "var(--bdr)",
              color: active === i ? "var(--blue)" : "var(--tx3)",
            }}
          >
            {c.n}
          </button>
        ))}
        <button
          className="btn btn-ghost"
          style={{ fontSize: 12, padding: "4px 10px", color: "var(--tx3)" }}
        >
          + Add
        </button>
      </div>
      <textarea
        className="mono"
        defaultValue={CASES[active].inp}
        key={active}
        style={{
          width: "100%",
          height: 80,
          background: "var(--s2)",
          border: "1px solid var(--bdr)",
          borderRadius: "var(--r-sm)",
          color: "var(--tx)",
          fontSize: 12,
          padding: "10px 12px",
          resize: "vertical",
          outline: "none",
          lineHeight: 1.7,
        }}
      />
    </div>
  );
}
