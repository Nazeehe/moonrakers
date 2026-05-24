import { Link } from "react-router-dom";
import { ArrowLeft, FileText, Users, Wrench, Layers, Target } from "lucide-react";
import { CATEGORY_LABEL, CATEGORY_SUBTITLE, type CardCategory } from "@/types/cards";
import { cardsByCategory } from "@/lib/cards";

type TileMeta = { key: CardCategory; icon: React.ReactNode; accent: string };

const TILES: TileMeta[] = [
  { key: "contract",  icon: <FileText className="w-6 h-6" />, accent: "var(--color-mr-cyan)" },
  { key: "crew",      icon: <Users    className="w-6 h-6" />, accent: "var(--color-mr-purple)" },
  { key: "ship_part", icon: <Wrench   className="w-6 h-6" />, accent: "var(--color-mr-gold)" },
  { key: "action",    icon: <Layers   className="w-6 h-6" />, accent: "var(--color-mr-orange)" },
  { key: "objective", icon: <Target   className="w-6 h-6" />, accent: "var(--color-mr-green)" },
];

export function ArmoryCategoryPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="flex items-center justify-between mb-6">
        <Link to="/" className="mr-label hover:text-mr-cyan inline-flex items-center gap-1.5">
          <ArrowLeft className="w-3.5 h-3.5" /> BACK
        </Link>
        <span className="mr-label">// ACCESS ARMORY</span>
      </div>

      <h1 className="mr-title text-2xl sm:text-4xl mb-1">Select database</h1>
      <p className="text-mr-text-muted text-sm mb-8">Choose a card archive to browse.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {TILES.map((t) => {
          const count = cardsByCategory(t.key).length;
          return (
            <Link
              key={t.key}
              to={`/armory/${t.key}`}
              className="mr-panel p-5 group hover:-translate-y-0.5 transition-transform"
              style={{ boxShadow: `0 0 0 1px color-mix(in oklab, ${t.accent} 18%, transparent), 0 0 32px -12px ${t.accent}` }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-md border grid place-items-center shrink-0"
                  style={{ borderColor: t.accent, color: t.accent, background: `color-mix(in oklab, ${t.accent} 10%, transparent)` }}
                >
                  {t.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <div className="mr-title text-lg text-mr-text">{CATEGORY_LABEL[t.key]}</div>
                    <div className="mr-label">{count} CARDS</div>
                  </div>
                  <div className="text-sm text-mr-text-muted">{CATEGORY_SUBTITLE[t.key]}</div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
