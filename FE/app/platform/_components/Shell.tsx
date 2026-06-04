"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

function Icon({ d, size = 16 }: { d: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <g dangerouslySetInnerHTML={{ __html: d }} />
    </svg>
  );
}

const NAV_ITEMS = [
  {
    key: "problems",
    label: "Problems",
    href: "/platform/problems",
    badge: "2374",
    icon: `<path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>`,
  },
  {
    key: "queue",
    label: "Judge Queue",
    href: "/platform/queue",
    icon: `<path d="M4 6h16M4 12h16M4 18h7"/><circle cx="17" cy="18" r="3"/><path d="M17 15v3l2 2"/>`,
  },
  {
    key: "submissions",
    label: "Submissions",
    href: "/platform/submissions",
    icon: `<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>`,
  },
  {
    key: "leaderboard",
    label: "Leaderboard",
    href: "/platform/leaderboard",
    icon: `<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>`,
  },
  {
    key: "contests",
    label: "Contests",
    href: "/platform/contests",
    icon: `<circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>`,
  },
  {
    key: "profile",
    label: "Profile",
    href: "/platform/profile",
    icon: `<path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>`,
  },
];

export function Topbar() {
  const router = useRouter();
  return (
    <div className="topbar">
      <div className="topbar-logo">
        Code<span>Quest</span>
      </div>
      <div className="top-sep" />
      <div className="top-search">
        <Icon
          d={`<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>`}
          size={14}
        />
        <input placeholder="Search problems…" />
        <span className="top-kbd">/</span>
      </div>
      <div style={{ flex: 1 }} />
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <div className="top-icon-btn" title="Notifications">
          <Icon
            d={`<path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>`}
            size={16}
          />
          <span
            style={{
              position: "absolute",
              top: 4,
              right: 4,
              width: 6,
              height: 6,
              background: "var(--red)",
              borderRadius: "50%",
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "var(--s2)",
            border: "1px solid var(--bdr)",
            borderRadius: "var(--r-sm)",
            padding: "4px 10px",
            cursor: "pointer",
          }}
          onClick={() => router.push("/platform/profile")}
        >
          <div className="top-avatar">P</div>
          <span style={{ fontSize: 13, fontWeight: 500 }}>PixelKnight</span>
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/platform/problems") {
      return pathname.startsWith("/platform/problems") || pathname.startsWith("/platform/judge");
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="sidebar">
      <div className="nav-section" style={{ flex: 1 }}>
        <div className="nav-label">Navigate</div>
        {NAV_ITEMS.map((item) => (
          <Link key={item.key} href={item.href} style={{ textDecoration: "none" }}>
            <button className={`nav-item${isActive(item.href) ? " active" : ""}`}>
              <Icon d={item.icon} size={15} />
              <span>{item.label}</span>
              {item.badge && <span className="nav-badge">{item.badge}</span>}
            </button>
          </Link>
        ))}
      </div>
      <div
        style={{
          padding: "8px 10px 12px",
          borderTop: "1px solid var(--bdr)",
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: "var(--tx3)",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span className="dot live" />
          <span>Judge cluster online</span>
        </div>
      </div>
    </div>
  );
}

export { Icon };
