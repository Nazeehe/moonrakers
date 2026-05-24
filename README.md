# Dispatch Console

Fan-made web companion for *Moonrakers* — built for the Mission Leader to
manage contract negotiations during the Planning Phase. Multiple offer tabs,
auto-tracking of remaining requirements / rewards / hazards, contract
satisfaction validation, and a searchable card database.

Not affiliated with IV Studio. Card text and images live in `data/` and
`images/` and are intended for personal/table use only.

## Quickstart

```bash
cd app
npm install
npm run dev
```

Open <http://localhost:5173>. For your phone on the same Wi-Fi:

```bash
npm run dev -- --host 0.0.0.0
# then visit the printed Network URL on your phone
```

## Repo layout

```
.
├── data/CARD_LISTS_1/     # source CSVs (one per card category)
├── images/                # card art, organized by category/expansion
└── app/                   # the React app
    ├── public/card-images → symlink to ../../images (Vite serves these)
    ├── scripts/build-cards.mjs  # CSV → src/data/cards.json
    └── src/
        ├── pages/         # HomePage, ArmoryCategoryPage, CardBrowserPage,
        │                  # DispatchSetupPage, NegotiationPage
        ├── components/    # Layout, Armory, Negotiation, Icons
        ├── state/         # negotiationReducer, derived state, persistence hook
        ├── data/          # generated cards.json, faction definitions
        ├── lib/           # cards helpers
        └── types/         # Card, Allocation, NegotiationSession, etc.
```

## Data pipeline

`app/scripts/build-cards.mjs` parses the four CSVs in `data/CARD_LISTS_1/`,
maps each card to its image file across the expansion subfolders, and emits
`app/src/data/cards.json` (392 cards, ~96% with images).

```bash
cd app
npm run build:cards
```

Re-run this whenever the CSVs or images change. The expansion codes
(`BG`, `BT`, `DM`, `END`, `FE`, `INT`, `NOM`, `OL`, `SHR`, `STF`) map to
the directory names under `images/<category>/`.

## What's built

- **Home** — entry to Dispatch and Armory
- **Armory** — category tiles + fuzzy-searchable card browser with zoom modal
- **Dispatch Setup** — pick Mission Leader faction + search/select contract
- **Negotiation** — multi-tab workspace, tap-to-assign with floating bottom
  pill, edit/move/remove allocations, live status banner
  (`REQUIREMENTS INCOMPLETE` → `REWARDS UNRESOLVED` → `HAZARD RISK UNRESOLVED`
  → `DEAL READY`), LocalStorage persistence

## Deliberately not built (yet)

- Per-player accept/decline toggle
- Notes per tab/player
- Best-offer comparison
- Expansion-toggle filter on the negotiation surface
- Import/export of card data

## Stack

Vite · React 19 · TypeScript · Tailwind v4 · Fuse.js · lucide-react ·
react-router-dom · LocalStorage. No backend.

## Acknowledgements

Card lists and art assets are from the *Moonrakers* tabletop game by
IV Studio. This is an unofficial companion app. If you're from IV Studio
and you'd like this taken down, open an issue.
