export type Difficulty = "Easy" | "Medium" | "Hard";
export type ProblemStatus = "solved" | "attempted" | "todo";
export type VerdictKey = "AC" | "WA" | "TLE" | "RE" | "CE";
export type QueueStatus = "pending" | "judging" | "done";
export type Lang = "Python3" | "C++" | "JavaScript" | "Java" | "Go" | "Rust" | "C" | "Haskell" | "Lisp";

export interface Problem {
  id: number;
  title: string;
  diff: Difficulty;
  acc: number;
  tags: string[];
  status: ProblemStatus;
}

export interface Submission {
  id: number;
  prob: Problem;
  lang: string;
  user: string;
  vk: VerdictKey;
  verdict: string;
  ms: number | null;
  mem: string | null;
  ago: string;
  ts: number;
}

export interface QueueItem {
  id: number;
  prob: Problem;
  lang: string;
  user: string;
  vk: VerdictKey;
  verdict: string;
  ms: number | null;
  status: QueueStatus;
  liveStatus: QueueStatus;
  elapsed: number;
  judgeMs: number;
  ago: string;
}

export interface LeaderboardEntry {
  rank: number;
  user: string;
  solved: number;
  score: number;
  streak: number;
  easy: number;
  medium: number;
  hard: number;
  lang: string;
  isMe?: boolean;
}

export interface Contest {
  id: number;
  name: string;
  start: string;
  dur: number;
  reg: number;
  state: "upcoming" | "ended";
  problems: number;
}

export const VERDICT_DETAIL: Record<VerdictKey, string> = {
  AC: "Accepted",
  WA: "Wrong Answer",
  TLE: "Time Limit Exceeded",
  RE: "Runtime Error",
  CE: "Compilation Error",
};

export const VK_META: Record<VerdictKey, { cls: string; label: string; color: string }> = {
  AC:  { cls: "ac",  label: "Accepted",           color: "var(--green)" },
  WA:  { cls: "wa",  label: "Wrong Answer",        color: "var(--red)" },
  TLE: { cls: "tle", label: "Time Limit Exceeded", color: "var(--yellow)" },
  RE:  { cls: "re",  label: "Runtime Error",       color: "var(--red)" },
  CE:  { cls: "ce",  label: "Compilation Error",   color: "var(--purple)" },
};
