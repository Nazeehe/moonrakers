import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Database, Radio } from "lucide-react";
import { FACTIONS } from "@/data/factions";

export function HomePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      {/* Status header */}
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-1">
          <div className="mr-label text-mr-cyan">// CHANNEL OPEN</div>
          <h1 className="mr-title text-3xl sm:text-5xl text-mr-text">
            Dispatch <span className="text-mr-cyan">Console</span>
          </h1>
          <p className="text-mr-text-muted text-sm sm:text-base mt-2">
            Moonrakers Negotiation Companion · Build deals, track requirements, ship contracts.
          </p>
        </div>
        <div className="hidden sm:flex flex-col items-end text-right">
          <span className="mr-label text-mr-text-muted">SYSTEM TIME</span>
          <Clock />
        </div>
      </div>

      {/* Primary actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 mt-2">
        <ActionTile
          to="/dispatch"
          icon={<Radio className="w-6 h-6" />}
          title="Open Dispatch"
          subtitle="Start a contract negotiation"
          accent="cyan"
        />
        <ActionTile
          to="/armory"
          icon={<Database className="w-6 h-6" />}
          title="Access Armory"
          subtitle="Browse contracts, crew, parts"
          accent="gold"
        />
      </div>

      {/* Faction line — slim decorative strip; full list lives in footer */}
      <div className="mt-8 flex items-center justify-center gap-2 sm:gap-3">
        {FACTIONS.map((f, i) => (
          <span key={f.id} className="flex items-center gap-2 sm:gap-3">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: f.colorHex, boxShadow: `0 0 10px -1px ${f.colorHex}` }}
              aria-hidden
            />
            <span className="mr-label text-[10px]" style={{ color: f.colorHex }}>
              {f.name.toUpperCase()}
            </span>
            {i < FACTIONS.length - 1 && (
              <span className="text-mr-text-muted/30 select-none" aria-hidden>·</span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}

function ActionTile({
  to, icon, title, subtitle, accent,
}: {
  to: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  accent: "cyan" | "gold";
}) {
  const ring = accent === "cyan" ? "var(--color-mr-cyan)" : "var(--color-mr-gold)";
  return (
    <Link
      to={to}
      className="group mr-panel p-5 sm:p-6 flex items-center justify-between gap-4 hover:-translate-y-0.5 transition-transform"
      style={{ boxShadow: `0 0 0 1px color-mix(in oklab, ${ring} 25%, transparent), 0 0 32px -10px ${ring}` }}
    >
      <div className="flex items-center gap-4 min-w-0">
        <div
          className="w-12 h-12 rounded-md border grid place-items-center shrink-0"
          style={{ borderColor: ring, color: ring, background: `color-mix(in oklab, ${ring} 8%, transparent)` }}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <div className="mr-title text-lg sm:text-xl text-mr-text">{title}</div>
          <div className="text-sm text-mr-text-muted">{subtitle}</div>
        </div>
      </div>
      <ArrowRight
        className="w-5 h-5 text-mr-text-muted group-hover:translate-x-1 transition-transform shrink-0"
        style={{ color: ring }}
      />
    </Link>
  );
}

function Clock() {
  // Display-only, ticks once a second.
  return <ClockTicker />;
}

function ClockTicker() {
  // Updates the timestamp every second.
  const [now, setNow] = React.useState(() => new Date());
  React.useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="font-mono text-mr-cyan text-sm tabular-nums">
      {now.toISOString().slice(11, 19)} UTC
    </span>
  );
}
