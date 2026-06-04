import { Topbar, Sidebar } from "./_components/Shell";

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app">
      <Topbar />
      <div className="body-row">
        <Sidebar />
        <main className="main">{children}</main>
      </div>
    </div>
  );
}
