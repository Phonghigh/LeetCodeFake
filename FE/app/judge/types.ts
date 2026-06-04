export type VerdictKey = "AC" | "WA" | "TLE" | "RE" | "CE";
export type Phase = "idle" | "running" | "submitting" | "done";
export type CaseStatus = "pass" | "fail" | "tle";
export type Lang = "Python3" | "C++" | "JavaScript";

export interface TestCase {
  i: number;
  inp: string;
  tgt: string;
  exp: string;
  got: string;
  ms: number;
  mem: string;
  status: CaseStatus;
}

export interface VerdictConfig {
  cls: string;
  label: string;
  icon: string;
  totalCases: number;
}

export interface DoneVerdict {
  vkey: VerdictKey;
  vconf: VerdictConfig;
  cases: TestCase[];
  totalCases: number;
}
