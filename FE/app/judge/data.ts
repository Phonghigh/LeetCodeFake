import type { VerdictConfig, VerdictKey, Lang } from "./types";

export const SNIPPETS: Record<Lang, { lines: number; code: string }> = {
  Python3: {
    lines: 9,
    code: `<span class="kw">class</span> <span class="fn">Solution</span>:
    <span class="kw">def</span> <span class="fn">twoSum</span>(<span class="self">self</span>, nums: List[<span class="tp">int</span>], target: <span class="tp">int</span>) -&gt; List[<span class="tp">int</span>]:
        seen = {}  <span class="cm"># value → index</span>
        <span class="kw">for</span> i, n <span class="kw">in</span> <span class="bi">enumerate</span>(nums):
            need = target - n
            <span class="kw">if</span> need <span class="kw">in</span> seen:
                <span class="kw">return</span> [seen[need], i]
            seen[n] = i
        <span class="kw">return</span> []`,
  },
  "C++": {
    lines: 12,
    code: `<span class="kw">class</span> <span class="fn">Solution</span> {
<span class="kw">public</span>:
    vector&lt;<span class="tp">int</span>&gt; <span class="fn">twoSum</span>(vector&lt;<span class="tp">int</span>&gt;&amp; nums, <span class="tp">int</span> target) {
        unordered_map&lt;<span class="tp">int</span>,<span class="tp">int</span>&gt; seen;
        <span class="kw">for</span> (<span class="tp">int</span> i = <span class="nm">0</span>; i &lt; (<span class="tp">int</span>)nums.size(); ++i) {
            <span class="tp">int</span> need = target - nums[i];
            <span class="kw">if</span> (seen.count(need)) <span class="kw">return</span> {seen[need], i};
            seen[nums[i]] = i;
        }
        <span class="kw">return</span> {};
    }
};`,
  },
  JavaScript: {
    lines: 9,
    code: `<span class="kw">var</span> <span class="fn">twoSum</span> = <span class="kw">function</span>(nums, target) {
    <span class="kw">const</span> seen = <span class="kw">new</span> Map();
    <span class="kw">for</span> (<span class="kw">let</span> i = <span class="nm">0</span>; i &lt; nums.length; i++) {
        <span class="kw">const</span> need = target - nums[i];
        <span class="kw">if</span> (seen.has(need)) <span class="kw">return</span> [seen.get(need), i];
        seen.set(nums[i], i);
    }
    <span class="kw">return</span> [];
};`,
  },
};

export const VERDICTS: Record<VerdictKey, VerdictConfig> = {
  AC:  { cls: "ac",  label: "Accepted",           icon: "✓", totalCases: 30 },
  WA:  { cls: "wa",  label: "Wrong Answer",        icon: "✗", totalCases: 7  },
  TLE: { cls: "tle", label: "Time Limit Exceeded", icon: "⏱", totalCases: 14 },
  RE:  { cls: "re",  label: "Runtime Error",       icon: "☠", totalCases: 11 },
  CE:  { cls: "ce",  label: "Compilation Error",   icon: "⚡", totalCases: 0  },
};

const CASE_INPUTS: Array<[string, string, string]> = [
  ["[2,7,11,15]", "9",  "[0,1]"],
  ["[3,2,4]",     "6",  "[1,2]"],
  ["[3,3]",       "6",  "[0,1]"],
  ["[1,2,3,4]",   "7",  "[2,3]"],
  ["[0,4,3,0]",   "0",  "[0,3]"],
  ["[-1,-2,-3,-4,-5]", "-8", "[2,4]"],
  ["[1000000000,1]", "1000000001", "[0,1]"],
  ["[2,5,5,11]",  "10", "[1,2]"],
  ["[1,3,4,2]",   "6",  "[2,3]"],
  ["[-3,4,3,90]", "0",  "[0,2]"],
];

export function genCase(
  i: number,
  verdict: VerdictKey,
) {
  const [inp, tgt, exp] = CASE_INPUTS[i % CASE_INPUTS.length];
  const ms = parseFloat((0.6 + Math.random() * 2.8).toFixed(2));
  const mem = parseFloat((8.3 + Math.random() * 0.6).toFixed(1)) + "KB";

  let status: "pass" | "fail" | "tle" = "pass";
  let got = exp;
  if (verdict === "WA"  && i === 6)  { status = "fail"; got = "[0,0]"; }
  if (verdict === "TLE" && i === 13) { status = "tle";  got = "—"; }
  if (verdict === "RE"  && i === 10) { status = "fail"; got = "Error"; }

  return { i, inp, tgt, exp, got, ms, mem, status } as const;
}

export function genAllCases(verdict: VerdictKey, count: number) {
  return Array.from({ length: count }, (_, i) => genCase(i, verdict));
}

function seedRnd(s: number) {
  let x = s;
  return () => {
    x = (x ^ (x << 13)) ^ (x >> 7) ^ (x ^ (x << 17));
    return Math.abs(x) / 2147483647;
  };
}

export function buildDist(): number[] {
  const rnd = seedRnd(4231);
  return Array.from({ length: 20 }, (_, i) => {
    const x = i / 19;
    const peak = Math.exp(-Math.pow((x - 0.35) / 0.15, 2));
    return Math.round(10 + peak * 80 + rnd() * 12);
  });
}
