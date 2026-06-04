"use client";

import { LEADERBOARD } from "../_data/mock";

export default function LeaderboardPage() {
  const rows = LEADERBOARD;

  return (
    <div className="page">
      <div style={{ marginBottom:16 }}>
        <div className="page-title">Leaderboard</div>
        <div className="page-sub">Global ranking by score</div>
      </div>

      {/* podium */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:20, maxWidth:560 }}>
        {([1, 0, 2] as const).map((i) => {
          const p = rows[i];
          const medals = ["🥇","🥈","🥉"];
          const cols   = ["#FFD700","#CBD5E1","#CD7F32"];
          return (
            <div
              key={i}
              className="card card-pad"
              style={{ textAlign:"center", border:`1px solid ${i===0?"rgba(255,215,0,.3)":"var(--bdr)"}` }}
            >
              <div style={{ fontSize:28, marginBottom:4 }}>{medals[i]}</div>
              <div style={{ fontWeight:600, fontSize:13, color:cols[i], marginBottom:2 }}>{p.user}</div>
              <div className="mono" style={{ fontSize:11, color:"var(--tx3)" }}>{p.score.toLocaleString()} pts</div>
              <div style={{ fontSize:11, color:"var(--tx3)", marginTop:4 }}>{p.solved} solved</div>
            </div>
          );
        })}
      </div>

      {/* table */}
      <div className="card" style={{ overflow:"hidden" }}>
        <table className="tbl">
          <thead>
            <tr>
              <th style={{ width:60 }}>Rank</th>
              <th>User</th>
              <th style={{ width:80 }}>Solved</th>
              <th style={{ width:90 }}>Score</th>
              <th style={{ width:80 }}>Streak</th>
              <th style={{ width:90 }}>Lang</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.rank} className={p.isMe ? "highlight" : ""}>
                <td
                  className="mono"
                  style={{
                    fontWeight: p.rank <= 3 ? 700 : 400,
                    color:
                      p.rank === 1 ? "#FFD700"
                      : p.rank === 2 ? "#CBD5E1"
                      : p.rank === 3 ? "#CD7F32"
                      : "var(--tx3)",
                    fontSize: 13,
                  }}
                >
                  #{p.rank}
                </td>
                <td style={{ fontWeight: p.isMe ? 600 : 400 }}>{p.user}</td>
                <td className="mono" style={{ fontSize:13 }}>{p.solved}</td>
                <td className="mono" style={{ fontSize:13, color:"var(--blue)" }}>{p.score.toLocaleString()}</td>
                <td className="mono" style={{ fontSize:13, color:"var(--yellow)" }}>🔥 {p.streak}</td>
                <td><span className="badge gray mono" style={{ fontSize:11 }}>{p.lang}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
