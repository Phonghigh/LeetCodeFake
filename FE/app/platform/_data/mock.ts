import type { Problem, Submission, QueueItem, LeaderboardEntry, Contest, VerdictKey } from "../_types";

export const PROBLEMS: Problem[] = [
  { id:1,  title:"Two Sum",                  diff:"Easy",   acc:49.1, tags:["Array","Hash Table"],          status:"solved" },
  { id:2,  title:"Add Two Numbers",           diff:"Medium", acc:40.2, tags:["Linked List","Math"],          status:"solved" },
  { id:3,  title:"Longest Substring",         diff:"Medium", acc:33.8, tags:["Hash Table","Sliding Window"], status:"solved" },
  { id:4,  title:"Median of Two Arrays",      diff:"Hard",   acc:37.4, tags:["Binary Search","Divide"],      status:"todo" },
  { id:5,  title:"Longest Palindrome",        diff:"Medium", acc:32.7, tags:["DP","String"],                 status:"todo" },
  { id:6,  title:"Reverse Linked List",       diff:"Easy",   acc:72.3, tags:["Linked List","Recursion"],     status:"solved" },
  { id:7,  title:"Valid Parentheses",         diff:"Easy",   acc:40.8, tags:["String","Stack"],              status:"attempted" },
  { id:8,  title:"Merge Sorted Arrays",       diff:"Easy",   acc:45.7, tags:["Array","Two Pointers"],        status:"solved" },
  { id:9,  title:"Climbing Stairs",           diff:"Easy",   acc:51.9, tags:["DP","Math"],                   status:"solved" },
  { id:10, title:"Binary Tree Inorder",       diff:"Easy",   acc:72.9, tags:["Tree","DFS"],                  status:"solved" },
  { id:11, title:"Maximum Depth of Tree",     diff:"Easy",   acc:73.7, tags:["Tree","BFS"],                  status:"todo" },
  { id:12, title:"Number of Islands",         diff:"Medium", acc:56.8, tags:["Graph","DFS","Matrix"],        status:"attempted" },
  { id:13, title:"Coin Change",               diff:"Medium", acc:41.8, tags:["Array","DP","BFS"],            status:"todo" },
  { id:14, title:"Word Break",                diff:"Medium", acc:45.3, tags:["DP","Trie"],                   status:"todo" },
  { id:15, title:"LRU Cache",                 diff:"Medium", acc:41.2, tags:["Hash Table","Design"],         status:"todo" },
  { id:16, title:"Trapping Rain Water",       diff:"Hard",   acc:58.8, tags:["Array","DP","Stack"],          status:"todo" },
  { id:17, title:"Sliding Window Maximum",    diff:"Hard",   acc:46.5, tags:["Array","Sliding Window"],      status:"todo" },
  { id:18, title:"Serialize Binary Tree",     diff:"Hard",   acc:55.6, tags:["Tree","Design","DFS"],         status:"todo" },
  { id:19, title:"Word Ladder",               diff:"Hard",   acc:36.8, tags:["BFS","Hash Table"],            status:"todo" },
  { id:20, title:"Merge K Sorted Lists",      diff:"Hard",   acc:49.8, tags:["Linked List","Heap"],          status:"todo" },
];

const VERDICT_CYCLE: VerdictKey[] = ["AC","WA","AC","AC","TLE","WA","AC","RE","AC","WA","AC","AC","CE","WA","AC","TLE","AC","WA","AC","AC"];
const USERS = ["ptr_nova","bytezerker","segfaulteen","heap_o_fun","recursia","mut_borrow","tail_call","dijkstrana","cache_miss","off_by_one","race_cond","git_blamed"];
const LANGS = ["Python3","C++","Java","Go","JavaScript","Rust","C"];

function seedRng(s: number) {
  let x = s;
  return () => {
    x ^= x << 13; x ^= x >> 7; x ^= x << 17;
    return Math.abs(x) / 2147483647;
  };
}
const rng = seedRng(9173);

export const SUBMISSIONS: Submission[] = Array.from({ length: 120 }, (_, i) => {
  const vk = VERDICT_CYCLE[i % VERDICT_CYCLE.length];
  const prob = PROBLEMS[Math.floor(rng() * PROBLEMS.length)];
  const lang = LANGS[Math.floor(rng() * LANGS.length)];
  const user = USERS[Math.floor(rng() * USERS.length)];
  const ms = vk === "AC" ? parseFloat((0.5 + rng() * 120).toFixed(1)) : null;
  const mem = vk === "AC" ? parseFloat((8 + rng() * 40).toFixed(1)) + "MB" : null;
  const ago = i < 5 ? `${i + 1}m ago` : i < 20 ? `${Math.round(i / 2)}m ago` : `${Math.round(i / 10)}h ago`;
  return {
    id: 10200 + i, prob, lang, user, vk,
    verdict: { AC:"Accepted", WA:"Wrong Answer", TLE:"Time Limit Exceeded", RE:"Runtime Error", CE:"Compilation Error" }[vk],
    ms, mem, ago, ts: Date.now() - i * 180000,
  };
});

export const INITIAL_QUEUE: QueueItem[] = Array.from({ length: 30 }, (_, i) => {
  const vk = VERDICT_CYCLE[i % VERDICT_CYCLE.length];
  const prob = PROBLEMS[i % PROBLEMS.length];
  const lang = LANGS[i % LANGS.length];
  const user = USERS[i % USERS.length];
  const judgeMs = parseFloat((200 + rng() * 2200).toFixed(0));
  const status: QueueItem["status"] = i === 0 ? "judging" : i < 3 ? "pending" : "done";
  const ms = status === "done" && vk === "AC" ? parseFloat((0.5 + rng() * 100).toFixed(1)) : null;
  return {
    id: 10350 + i, prob, lang, user, vk,
    verdict: { AC:"Accepted", WA:"Wrong Answer", TLE:"Time Limit Exceeded", RE:"Runtime Error", CE:"Compilation Error" }[vk],
    ms, status, liveStatus: status, elapsed: 0, judgeMs, ago: `${i + 1}m`,
  };
});

export const LEADERBOARD: LeaderboardEntry[] = [
  { rank:1,   user:"nullptr_nova",       solved:842, score:39820, streak:214, easy:280, medium:420, hard:142, lang:"C++" },
  { rank:2,   user:"byteberser",         solved:808, score:37110, streak:130, easy:261, medium:405, hard:142, lang:"Python3" },
  { rank:3,   user:"segfaulteen",        solved:781, score:35990, streak:96,  easy:252, medium:391, hard:138, lang:"Go" },
  { rank:4,   user:"heapified",          solved:742, score:33010, streak:71,  easy:238, medium:374, hard:130, lang:"Rust" },
  { rank:5,   user:"recursia",           solved:705, score:31240, streak:58,  easy:224, medium:355, hard:126, lang:"Java" },
  { rank:6,   user:"mut_borrow",         solved:688, score:30110, streak:44,  easy:218, medium:344, hard:126, lang:"Rust" },
  { rank:7,   user:"tail_call",          solved:651, score:28760, streak:39,  easy:208, medium:321, hard:122, lang:"Haskell" },
  { rank:8,   user:"dijkstrana",         solved:634, score:27880, streak:33,  easy:201, medium:315, hard:118, lang:"C++" },
  { rank:9,   user:"cache_miss",         solved:611, score:26540, streak:28,  easy:194, medium:301, hard:116, lang:"Python3" },
  { rank:10,  user:"off_by_one",         solved:598, score:25890, streak:22,  easy:188, medium:291, hard:119, lang:"C++" },
  { rank:11,  user:"race_condition",     solved:572, score:24320, streak:18,  easy:180, medium:278, hard:114, lang:"Go" },
  { rank:12,  user:"async_await",        solved:544, score:23010, streak:14,  easy:172, medium:263, hard:109, lang:"JavaScript" },
  { rank:13,  user:"big_o_nono",         solved:521, score:22140, streak:11,  easy:165, medium:252, hard:104, lang:"Python3" },
  { rank:14,  user:"lambda_lord",        solved:498, score:21030, streak:9,   easy:158, medium:241, hard:99,  lang:"Lisp" },
  { rank:15,  user:"kernel_panik",       solved:477, score:20210, streak:7,   easy:150, medium:231, hard:96,  lang:"C" },
  { rank:1287,user:"PixelKnight (you)",  solved:128, score:9240,  streak:18,  easy:72,  medium:44,  hard:12,  lang:"Python3", isMe:true },
];

export const CONTESTS: Contest[] = [
  { id:312, name:"Weekly Contest 312",   start:"Sat Jun 7 02:30 UTC",  dur:90, reg:18420, state:"upcoming", problems:4 },
  { id:311, name:"Weekly Contest 311",   start:"Sat May 31 02:30 UTC", dur:90, reg:17891, state:"ended",    problems:4 },
  { id:210, name:"Biweekly Contest 210", start:"Sat May 24 14:30 UTC", dur:90, reg:14302, state:"ended",    problems:4 },
  { id:310, name:"Weekly Contest 310",   start:"Sat May 17 02:30 UTC", dur:90, reg:16744, state:"ended",    problems:4 },
];

export function genHeatmap(): number[][] {
  const rnd = seedRng(1337);
  return Array.from({ length: 53 }, () =>
    Array.from({ length: 7 }, () => {
      const r = rnd();
      return r > 0.94 ? 4 : r > 0.85 ? 3 : r > 0.72 ? 2 : r > 0.55 ? 1 : 0;
    })
  );
}

export { seedRng };
export const QUEUE_LANGS = ["Python3","C++","Java","Go","JavaScript","Rust"];
export const QUEUE_USERS = ["ptr_nova","bytezerker","segfaulteen","heap_o_fun","recursia","git_blamed"];
export const QUEUE_VERDICTS: VerdictKey[] = ["AC","WA","AC","AC","TLE","WA","AC","RE","AC","WA"];
