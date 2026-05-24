import { Outlet, Link, useLocation } from "react-router-dom";
import { FACTIONS } from "@/data/factions";

export function AppShell() {
  const loc = useLocation();
  const isHome = loc.pathname === "/";

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-mr-border/15 bg-mr-bg-deep/60 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-md border border-mr-cyan/60 grid place-items-center text-mr-cyan font-mono text-sm group-hover:shadow-[0_0_18px_-4px_var(--color-mr-cyan)] transition-all">
              ◇
            </div>
            <div className="leading-tight">
              <div className="mr-label text-mr-text-muted">Moonrakers Network</div>
              <div className="mr-title text-sm sm:text-base text-mr-text">Dispatch Console</div>
            </div>
          </Link>

          {!isHome && (
            <nav className="hidden sm:flex items-center gap-1 text-xs">
              <NavPill to="/dispatch" label="Dispatch" />
              <NavPill to="/armory" label="Armory" />
            </nav>
          )}
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-mr-border/10 mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4 text-[10px] mr-label">
          <span>FAN-MADE COMPANION · NOT AFFILIATED WITH IV STUDIO</span>
          <div className="hidden sm:flex items-center gap-3">
            {FACTIONS.map((f) => (
              <span key={f.id} className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ background: f.cssVar }} />
                {f.name}
              </span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

function NavPill({ to, label }: { to: string; label: string }) {
  const loc = useLocation();
  const active = loc.pathname.startsWith(to);
  return (
    <Link
      to={to}
      className={`px-3 py-1.5 rounded-md font-mono uppercase tracking-widest text-[10px] border transition-colors ${
        active
          ? "border-mr-cyan/70 text-mr-cyan bg-mr-cyan/5"
          : "border-mr-border/15 text-mr-text-muted hover:text-mr-text hover:border-mr-border/35"
      }`}
    >
      {label}
    </Link>
  );
}
