# Moonrakers Dispatch Console PRD & Implementation Spec

## Product Summary

**Product name:** Dispatch Console  
**Purpose:** A Moonrakers-inspired web companion app focused on helping players manage contract negotiations during the Planning Phase.

This app is not a full rules assistant and not a full game-state tracker. Its primary job is to help players build, compare, and validate possible negotiation deals for a selected Contract.

The app should behave like a digital version of the Moonrakers Negotiation Board, but with additional capabilities:

- Multiple negotiation offers/tabs
- Automatic remaining requirement/reward/risk counts
- Card database browsing
- Fuzzy card search
- Contract satisfaction validation
- Clear visual allocation of requirements, rewards, and hazards across players

---

## Goals

1. Help the Mission Leader manage complex contract negotiations.
2. Make negotiated deals visible and easy to compare.
3. Let users assign requirements, rewards, and hazards to players.
4. Track remaining requirements/rewards/hazards automatically.
5. Show when a Contract is satisfied.
6. Provide a searchable card database for Contracts, Crew, Ship Parts, Action Cards, and Objectives.
7. Use a Moonrakers-inspired sci-fi visual theme throughout.

---

## Non-Goals

The first version should **not**:

- Enforce every Moonrakers rule.
- Replace physical cards.
- Track every player’s deck.
- Track full game state across rounds.
- Resolve Execution Phase gameplay.
- Calculate win probabilities.
- Use official copyrighted art unless the user provides local assets.
- Require a backend.
- Support online multiplayer.

---

## Target User

Moonrakers players at the table, especially the current **Mission Leader**, during the Planning Phase when deciding which Contract to attempt and which players to bring as allies.

---

## Core Product Concept

The app is a **digital negotiation console**.

A Mission Leader:

1. Opens Dispatch.
2. Selects their faction/color.
3. Searches for and selects a Contract.
4. Begins negotiation.
5. Creates one or more negotiation offer tabs.
6. Assigns Contract requirements, rewards, and hazards to players.
7. Compares possible deals.
8. Uses the app to see whether the Contract requirements are satisfied and whether the deal is ready.

---

# Product Structure

## Top-Level Navigation

The home screen has two primary buttons:

| Plain concept | In-app thematic label |
|---|---|
| Start Contract | **Open Dispatch** |
| Card DB | **Access Armory** |

These labels should be used in the app.

---

# Visual Theme

## Theme Direction

Use a Moonrakers-inspired sci-fi terminal aesthetic:

- Dark navy/purple background
- Thin technical borders
- Neon accent colors
- Card-like panels
- Terminal-style section labels
- Subtle sci-fi grid/noise texture if easy
- Faction colors used prominently
- Interface should feel like a spaceship contract console

The UI should feel like a premium tabletop companion, not a generic dashboard.

---

## Color Tokens

Use these CSS variables as the initial theme:

```css
:root {
  --mr-bg: #2F324F;              /* deep Moonrakers navy/purple */
  --mr-bg-deep: #1E2138;         /* darker panel background */
  --mr-panel: #383B5D;           /* elevated surface */
  --mr-panel-soft: #44486C;      /* secondary surface */
  --mr-border: #D9DDEE;          /* thin technical borders */
  --mr-text: #F2F4FF;            /* main text */
  --mr-text-muted: #AEB4D4;      /* secondary text */

  --mr-alert: #E56F82;           /* pink/red warning panels */
  --mr-gold: #F4C84A;            /* prestige/yellow accent */
  --mr-cyan: #58C7E8;            /* reactor/energy accent */
  --mr-green: #98C95A;           /* shield/objective accent */
  --mr-orange: #F28A42;          /* damage/action accent */
  --mr-purple: #B478C8;          /* crew accent */

  --mr-sorelia: #62C7E6;
  --mr-komek: #F1C94B;
  --mr-ventus: #E89042;
  --mr-magnomi: #B987C9;
  --mr-henko: #8CCB6A;
}
```

These are approximate Moonrakers-inspired colors, not official extracted brand guidelines.

---

## Typography

Recommended font choices:

```css
:root {
  --font-display: "Orbitron", sans-serif;
  --font-body: "Inter", sans-serif;
  --font-mono: "Share Tech Mono", monospace;
}
```

Use:

- Display font for page titles, panel headers, faction labels, and major buttons.
- Body font for normal content.
- Mono font for small technical labels, counts, statuses, and metadata.

---

## UI Style Guidelines

- Rounded panels, but not overly bubbly.
- Thin borders and slight glow effects.
- High contrast text.
- Large tappable areas for tablet/mobile use.
- Use colored status indicators.
- Avoid dense spreadsheet-like UI.
- Prioritize quick readability at the table.

---

# Factions / Player Colors

Use the five Moonrakers faction/player colors as selectable player identities:

```ts
type FactionId = "sorelia" | "komek" | "ventus" | "magnomi" | "henko";

type Faction = {
  id: FactionId;
  name: string;
  colorHex: string;
};

const factions: Faction[] = [
  { id: "sorelia", name: "Sorelia", colorHex: "#62C7E6" },
  { id: "komek", name: "Komek", colorHex: "#F1C94B" },
  { id: "ventus", name: "Ventus", colorHex: "#E89042" },
  { id: "magnomi", name: "Magnomi", colorHex: "#B987C9" },
  { id: "henko", name: "Henko", colorHex: "#8CCB6A" }
];
```

---

# Core Screens

## Screen 1: Home

### Purpose

Entry point into the app.

### Requirements

- Show product title: **Dispatch Console**
- Show subtitle: **Moonrakers Negotiation Companion**
- Show two large primary actions:
  - **Open Dispatch**
  - **Access Armory**
- Use strong Moonrakers visual theme.
- Show faction names/colors decoratively along the bottom or side.

### Wireframe

```text
┌──────────────────────────────────────────────┐
│ MOONRAKERS NETWORK                           │
│ DISPATCH CONSOLE                             │
│                                              │
│  Task: Contract Negotiation                  │
│  Status: Awaiting Mission Leader             │
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │            OPEN DISPATCH               │  │
│  │     Start a contract negotiation       │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │            ACCESS ARMORY               │  │
│  │     Browse contracts, crew, parts      │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  SORELIA | KOMEK | VENTUS | MAGNOMI | HENKO  │
└──────────────────────────────────────────────┘
```

---

## Screen 2: Access Armory / Card Database Categories

### Purpose

Let the user choose which card category to browse.

### Categories

- Contracts
- Crew
- Ship Parts
- Action Cards
- Objectives
- Expansion Cards, optional later

### Requirements

- Display categories as large cards/panels.
- Each category navigates to a card browser page.
- Use short descriptive subtitles.

### Wireframe

```text
┌──────────────────────────────────────────────┐
│ < BACK                         ACCESS ARMORY │
├──────────────────────────────────────────────┤
│ Select database                              │
│                                              │
│ ┌──────────────┐ ┌──────────────┐            │
│ │ CONTRACTS    │ │ CREW         │            │
│ │ mission list │ │ personnel    │            │
│ └──────────────┘ └──────────────┘            │
│                                              │
│ ┌──────────────┐ ┌──────────────┐            │
│ │ SHIP PARTS   │ │ ACTION CARDS │            │
│ │ upgrades     │ │ loadout      │            │
│ └──────────────┘ └──────────────┘            │
│                                              │
│ ┌──────────────┐                             │
│ │ OBJECTIVES   │                             │
│ │ vault        │                             │
│ └──────────────┘                             │
└──────────────────────────────────────────────┘
```

---

## Screen 3: Card Browser

### Purpose

Browse cards in a selected category.

### Requirements

- Page title should match selected category.
- Include fuzzy search field.
- Cards appear in responsive grid.
- Cards can be filtered by:
  - name
  - type/category
  - tags
  - text
  - expansion
- Tap/click a card to zoom.
- Zoom modal can be closed by:
  - X button
  - Escape key
  - clicking/tapping outside modal

### Card Display Strategy

If `imageUrl` exists:

- Render image.

If no image exists:

- Render styled placeholder card from metadata:
  - card name
  - card category
  - requirements/rewards if Contract
  - text if available
  - tags

### Wireframe

```text
┌──────────────────────────────────────────────┐
│ < ARMORY                         CONTRACTS   │
├──────────────────────────────────────────────┤
│ Search: [ rescue station               🔍 ]  │
│                                              │
│ ┌────────┐ ┌────────┐ ┌────────┐             │
│ │ Card   │ │ Card   │ │ Card   │             │
│ │ image  │ │ image  │ │ image  │             │
│ └────────┘ └────────┘ └────────┘             │
│                                              │
│ ┌────────┐ ┌────────┐ ┌────────┐             │
│ │ Card   │ │ Card   │ │ Card   │             │
│ │ image  │ │ image  │ │ image  │             │
│ └────────┘ └────────┘ └────────┘             │
└──────────────────────────────────────────────┘
```

### Zoom Modal Wireframe

```text
┌──────────────────────────────────────────────┐
│                                  [ X ]       │
│                                              │
│              ┌────────────────┐              │
│              │                │              │
│              │   LARGE CARD   │              │
│              │                │              │
│              └────────────────┘              │
│                                              │
└──────────────────────────────────────────────┘
```

---

## Screen 4: Open Dispatch / Contract Setup

### Purpose

Select Mission Leader and Contract before starting negotiation.

### Requirements

- User selects one Mission Leader faction/color.
- User searches Contracts via fuzzy search.
- Matching Contract cards appear in a grid.
- User taps/clicks a Contract to select it.
- Selected Contract is shown full-size or large below search results.
- **Begin Negotiation** button is disabled until both:
  - Mission Leader is selected
  - Contract is selected

### Wireframe

```text
┌──────────────────────────────────────────────┐
│ < HOME                           DISPATCH    │
├──────────────────────────────────────────────┤
│ SELECT MISSION LEADER                        │
│                                              │
│ ┌────────┐ ┌────────┐ ┌────────┐             │
│ │SORELIA │ │ KOMEK  │ │ VENTUS │             │
│ └────────┘ └────────┘ └────────┘             │
│ ┌────────┐ ┌────────┐                        │
│ │MAGNOMI │ │ HENKO  │                        │
│ └────────┘ └────────┘                        │
│                                              │
│ FIND CONTRACT                                │
│ [ search contract name/type/reward     🔍 ]  │
│                                              │
│ ┌────────┐ ┌────────┐ ┌────────┐             │
│ │ Card   │ │ Card   │ │ Card   │             │
│ └────────┘ └────────┘ └────────┘             │
│                                              │
│ SELECTED CONTRACT                            │
│ ┌─────────────────────┐                      │
│ │ Full selected card  │                      │
│ └─────────────────────┘                      │
│                                              │
│        ┌──────────────────────────┐          │
│        │     BEGIN NEGOTIATION    │          │
│        └──────────────────────────┘          │
└──────────────────────────────────────────────┘
```

---

## Screen 5: Negotiation Page

### Purpose

Main negotiation workspace.

### High-Level Structure

- Header
- Negotiation tabs
- Status banner
- Player boxes
- Contract details
- Assignment modal/editor

### Tab Behavior

Players often discuss multiple potential deals in parallel.

The app should support multiple negotiation tabs:

- Add tab
- Rename tab
- Duplicate tab
- Delete tab
- Switch active tab

Default tab names:

- Offer A
- Offer B
- Offer C

### Requirements

Each negotiation tab tracks its own allocations and acceptance state.

The selected Mission Leader and Contract remain the same across all tabs.

### Wireframe

```text
┌──────────────────────────────────────────────┐
│ < DISPATCH              CONTRACT NEGOTIATION │
├──────────────────────────────────────────────┤
│ [ Offer A ] [ Offer B ] [ Offer C ] [ + ]    │
├──────────────────────────────────────────────┤
│ STATUS: Requirements incomplete              │
│ Missing: 2 Damage, 1 Reactor                 │
├──────────────────────────────────────────────┤
│ PLAYERS                                      │
│                                              │
│ ┌────────────────────┐ ┌───────────────────┐ │
│ │ SORELIA            │ │ KOMEK             │ │
│ │ MISSION LEADER     │ │                   │ │
│ │                    │ │ Req: 1 Damage     │ │
│ │ Rewards: 1 Prestige│ │ Risk: 1 Hazard    │ │
│ └────────────────────┘ └───────────────────┘ │
│                                              │
│ ┌────────────────────┐ ┌───────────────────┐ │
│ │ VENTUS             │ │ MAGNOMI           │ │
│ │ Req: 1 Reactor     │ │ Rewards: 2 Credits│ │
│ └────────────────────┘ └───────────────────┘ │
│                                              │
│ ┌────────────────────┐                       │
│ │ HENKO              │                       │
│ │ Empty              │                       │
│ └────────────────────┘                       │
├──────────────────────────────────────────────┤
│ CONTRACT                                     │
│ Rescue the Drift Miner                       │
│                                              │
│ REQUIREMENTS REMAINING                       │
│ [ Damage x2 ] [ Reactor x1 ] [ Shield x0 ]   │
│                                              │
│ REWARDS REMAINING                            │
│ [ Prestige x1 ] [ Credits x2 ] [ Bonus x1 ]  │
│                                              │
│ RISK REMAINING                               │
│ [ Hazard x1 ]                                │
└──────────────────────────────────────────────┘
```

---

# Negotiation Interaction Model

## Assignment Flow

The app uses tap-to-assign, not drag-and-drop.

### User Flow

1. User taps a requirement, reward, or risk icon in the Contract Details panel.
2. App opens a small assignment modal.
3. User selects count.
4. User taps a player box.
5. App assigns the item to that player.
6. Remaining count updates.
7. Player box updates.

### Why Tap-to-Assign

This is better than drag-and-drop for a table-side app because:

- Works better on phones and tablets.
- Avoids accidental gestures.
- Keeps assignment flow explicit.
- Is easier to implement in v1.
- Is easier to use during active table conversation.

---

## Assignment Modal

### Requirements

- Shows selected resource.
- Shows available count.
- Lets user increase/decrease selected count.
- Count cannot exceed remaining count.
- User can cancel.
- After selecting count, user taps a player to assign.

### Wireframe

```text
┌──────────────────────────────────────────────┐
│ ASSIGN RESOURCE                              │
├──────────────────────────────────────────────┤
│ Resource: Prestige                           │
│ Available: 3                                 │
│                                              │
│ Count                                        │
│      [ - ]   1   [ + ]                       │
│                                              │
│ Now tap a player box to assign.              │
│                                              │
│ [ Cancel ]                                   │
└──────────────────────────────────────────────┘
```

---

## Editing Existing Allocations

When user taps an item inside a player box:

Open an edit popover/modal with options:

- Increase count
- Decrease count
- Move to another player
- Remove allocation
- Cancel

---

# Contract Tracking Model

## Three Allocation Categories

The app must treat these separately:

| Category | Meaning | Completion logic |
|---|---|---|
| Requirement | What players say they can contribute to complete Contract | Must reach zero remaining |
| Reward | What players receive if Contract succeeds | Should not exceed total reward |
| Risk | Who takes Hazard Dice or similar risk | Should equal total hazards |

---

## Contract Requirements

Requirements are resources the group must collectively provide.

Examples:

- Damage
- Reactor
- Thruster
- Shield
- Crew

The Contract is considered mechanically satisfied when all required resources have been assigned.

---

## Contract Rewards

Rewards are negotiated benefits.

Examples:

- Prestige
- Credits
- Bonus Cards
- Binding Ties / reputation, if expansion enabled

Rewards should be assignable to players.

The app should prevent assigning more rewards than available by default.

---

## Contract Risk

Risk is primarily Hazard Dice.

The app should support assigning hazard dice to players.

The app should show unresolved risk if some Hazard Dice remain unassigned.

---

# Contract Status States

The app should show a clear status banner.

## Possible States

| State | Condition | Example UI text |
|---|---|---|
| Requirements incomplete | Requirement remaining > 0 | `Requirements incomplete: 2 Damage, 1 Reactor missing` |
| Contract satisfied | All requirements remaining = 0 | `Contract requirements satisfied` |
| Rewards unresolved | Requirements satisfied but rewards remain | `Rewards still unassigned` |
| Risk unresolved | Requirements satisfied but hazards remain | `Hazard risk unresolved` |
| Deal ready | Requirements satisfied, rewards allocated, hazards allocated | `Deal ready` |

---

## Contract Satisfied Artifact

When requirements are complete, show a prominent artifact/banner.

### Basic Version

```text
┌──────────────────────────────────────────────┐
│ ✅ CONTRACT SATISFIED                         │
│ All requirements have been assigned.          │
│                                              │
│ Rewards: fully allocated                      │
│ Hazard Risk: 1 die unresolved                 │
└──────────────────────────────────────────────┘
```

### Thematic Version

```text
┌──────────────────────────────────────────────┐
│ CONNECTION ESTABLISHED                        │
│ CONTRACT REQUIREMENTS SATISFIED               │
│                                              │
│ Awaiting final reward and hazard agreement.   │
└──────────────────────────────────────────────┘
```

Use the thematic version if it fits the final visual direction.

---

# Resource Icons

## Asset Constraint

Do not assume official Moonrakers icon assets are available.

For v1, create original SVG icon approximations.

Do not copy official game art unless the user provides assets and confirms they are for personal/private use.

---

## Required Resource Icons

| Game concept | App icon concept |
|---|---|
| Damage | Explosion/starburst |
| Reactor | Lightning bolt / energy core |
| Thruster | Rocket plume |
| Shield | Shield outline |
| Crew | Helmet/person silhouette |
| Hazard | Warning triangle |
| Prestige | Medal/star |
| Credit | Coin |
| Bonus Card | Card stack |
| Binding Ties | Chain link / knot |
| Contract | Document/card |
| Ship Part | Gear/module |

---

## Icon Component API

```ts
type ResourceType =
  | "damage"
  | "reactor"
  | "thruster"
  | "shield"
  | "crew"
  | "prestige"
  | "credit"
  | "bonus_card"
  | "hazard"
  | "binding_ties";

type ResourceIconProps = {
  type: ResourceType;
  size?: number;
  className?: string;
};
```

---

# Data Model

## Card Types

```ts
type CardCategory =
  | "contract"
  | "crew"
  | "ship_part"
  | "action"
  | "objective";

type Card = {
  id: string;
  name: string;
  category: CardCategory;
  imageUrl?: string;
  expansion?: string;
  tags?: string[];
  text?: string;
};
```

---

## Counted Resource

```ts
type CountedResource = {
  type: ResourceType;
  count: number;
};
```

---

## Contract Card

```ts
type ContractCard = Card & {
  category: "contract";
  contractType?: "delivery" | "explore" | "kill" | "rescue" | "other";
  requirements: CountedResource[];
  rewards: CountedResource[];
  hazards: number;
};
```

---

## Negotiation Session

```ts
type NegotiationSession = {
  id: string;
  missionLeader: FactionId;
  contractId: string;
  tabs: NegotiationTab[];
  activeTabId: string;
};
```

---

## Negotiation Tab

```ts
type NegotiationTab = {
  id: string;
  name: string;
  allocations: Allocation[];
  acceptedBy: FactionId[];
  notes?: string;
};
```

---

## Allocation

```ts
type AllocationKind = "requirement" | "reward" | "risk";

type Allocation = {
  id: string;
  kind: AllocationKind;
  resourceType: ResourceType;
  count: number;
  playerId: FactionId;
};
```

---

# State Management

Use a reducer for negotiation state.

## Reducer Actions

```ts
type NegotiationAction =
  | { type: "CREATE_SESSION"; missionLeader: FactionId; contractId: string }
  | { type: "ADD_TAB" }
  | { type: "DUPLICATE_TAB"; tabId: string }
  | { type: "DELETE_TAB"; tabId: string }
  | { type: "SET_ACTIVE_TAB"; tabId: string }
  | { type: "RENAME_TAB"; tabId: string; name: string }
  | { type: "ADD_ALLOCATION"; allocation: Allocation }
  | { type: "UPDATE_ALLOCATION"; allocationId: string; patch: Partial<Allocation> }
  | { type: "REMOVE_ALLOCATION"; allocationId: string }
  | { type: "TOGGLE_ACCEPTED"; tabId: string; playerId: FactionId };
```

---

# Derived State / Validation Logic

## Remaining Requirements

```ts
function getRemainingRequirements(
  contract: ContractCard,
  allocations: Allocation[]
): CountedResource[] {
  // Start with contract.requirements.
  // Subtract allocations where kind === "requirement".
  // Return remaining counts.
}
```

---

## Remaining Rewards

```ts
function getRemainingRewards(
  contract: ContractCard,
  allocations: Allocation[]
): CountedResource[] {
  // Start with contract.rewards.
  // Subtract allocations where kind === "reward".
  // Return remaining counts.
}
```

---

## Remaining Hazards

```ts
function getRemainingHazards(
  contract: ContractCard,
  allocations: Allocation[]
): number {
  // Start with contract.hazards.
  // Subtract allocations where kind === "risk" and resourceType === "hazard".
  // Return remaining hazard count.
}
```

---

## Contract Satisfaction

```ts
function isContractSatisfied(
  contract: ContractCard,
  allocations: Allocation[]
): boolean {
  // Return true when every requirement remaining count is zero.
}
```

---

## Deal Ready

```ts
function isDealReady(
  contract: ContractCard,
  allocations: Allocation[]
): boolean {
  // Return true when:
  // - all requirements are satisfied
  // - all rewards are allocated
  // - all hazards are allocated
}
```

---

# Technology Stack

Recommended stack:

- Vite
- React
- TypeScript
- Tailwind CSS
- Fuse.js
- lucide-react
- Local JSON data
- LocalStorage persistence

No backend required for v1.

---

## Dependencies

```bash
npm install fuse.js lucide-react clsx
npm install -D tailwindcss postcss autoprefixer
```

Optional:

```bash
npm install framer-motion
```

---

# Routes

```text
/
  HomePage

/armory
  ArmoryCategoryPage

/armory/:category
  CardBrowserPage

/dispatch
  DispatchSetupPage

/negotiation
  NegotiationPage
```

For the first prototype, it is acceptable to use simple in-memory state and route navigation. LocalStorage persistence should be added once core flows work.

---

# Component Structure

```text
src/
  app/
    App.tsx
    routes.tsx

  data/
    cards.json
    factions.ts
    sampleContracts.ts

  components/
    Layout/
      AppShell.tsx
      TerminalPanel.tsx
      HeaderBar.tsx

    Home/
      HomePage.tsx

    Armory/
      ArmoryCategoryPage.tsx
      CardBrowserPage.tsx
      CardGrid.tsx
      CardTile.tsx
      CardZoomModal.tsx
      FuzzySearchBox.tsx

    Dispatch/
      DispatchSetupPage.tsx
      FactionSelector.tsx
      ContractSearchGrid.tsx
      SelectedContractPanel.tsx

    Negotiation/
      NegotiationPage.tsx
      NegotiationTabs.tsx
      PlayerBoxGrid.tsx
      PlayerBox.tsx
      ContractDetailPanel.tsx
      ResourcePool.tsx
      ResourceIconButton.tsx
      AssignmentModal.tsx
      ContractStatusBanner.tsx

    Icons/
      ResourceIcon.tsx
      DamageIcon.tsx
      ReactorIcon.tsx
      ThrusterIcon.tsx
      ShieldIcon.tsx
      CrewIcon.tsx
      HazardIcon.tsx
      PrestigeIcon.tsx
      CreditIcon.tsx
      BonusCardIcon.tsx
      BindingTiesIcon.tsx

  state/
    negotiationReducer.ts
    useNegotiationSession.ts

  types/
    cards.ts
    negotiation.ts
```

---

# Sample Data

Claude should start with sample cards and placeholder metadata.

```ts
const sampleContract = {
  id: "contract-sample-001",
  name: "Rescue the Drift Miner",
  category: "contract",
  contractType: "rescue",
  requirements: [
    { type: "shield", count: 2 },
    { type: "damage", count: 1 }
  ],
  rewards: [
    { type: "prestige", count: 2 },
    { type: "credit", count: 4 },
    { type: "bonus_card", count: 1 }
  ],
  hazards: 2,
  tags: ["rescue", "shield", "hazard"]
};
```

Add at least 8 sample Contracts so search/grid behavior feels real.

---

# Card Data File Shape

Use a local `cards.json` file.

```json
[
  {
    "id": "contract-sample-001",
    "name": "Rescue the Drift Miner",
    "category": "contract",
    "contractType": "rescue",
    "requirements": [
      { "type": "shield", "count": 2 },
      { "type": "damage", "count": 1 }
    ],
    "rewards": [
      { "type": "prestige", "count": 2 },
      { "type": "credit", "count": 4 },
      { "type": "bonus_card", "count": 1 }
    ],
    "hazards": 2,
    "tags": ["rescue", "shield", "hazard"]
  }
]
```

---

# Fuzzy Search

Use Fuse.js.

## Search Fields

For all cards:

```ts
const fuse = new Fuse(cards, {
  keys: ["name", "category", "text", "tags", "expansion"],
  threshold: 0.35
});
```

For Contracts, include:

```ts
keys: [
  "name",
  "contractType",
  "tags",
  "requirements.type",
  "rewards.type"
]
```

---

# Persistence

Use LocalStorage for v1.

Persist:

- Last selected Mission Leader
- Current negotiation session
- Negotiation tabs
- Allocations
- User preference for showing placeholder cards vs compact cards

Do not persist card zoom state.

---

# Responsive Design

The app should work well on:

- iPhone-sized screens
- iPad/tablet screens
- Desktop browser

## Mobile Priorities

- Large tap targets
- Single-column layout when narrow
- Player boxes in a 1-column or 2-column grid
- Contract panel below player boxes
- Sticky status banner if possible

## Tablet/Desktop Priorities

- Player boxes and Contract Details can be side-by-side
- Tabs should remain visible
- Contract status should be visible without scrolling

---

# Accessibility

- All buttons must have clear labels.
- Resource icons must have text labels or aria labels.
- Color should not be the only indicator.
- Modals should trap focus.
- Escape closes modals.
- Selected states should use border/glow/text, not only color.

---

# MVP Acceptance Criteria

## Home

- Shows themed title and subtitle.
- Shows **Open Dispatch** and **Access Armory**.
- Buttons navigate correctly.

## Armory

- Shows card categories.
- Category opens card grid.
- Fuzzy search filters cards by name/type/text/tags.
- Tap card opens zoom modal.
- Zoom modal closes correctly.

## Dispatch Setup

- User can select exactly one Mission Leader faction.
- User can fuzzy search Contracts.
- User can select one Contract.
- Selected Contract appears clearly.
- **Begin Negotiation** disabled until faction and Contract are selected.
- Clicking **Begin Negotiation** opens the Negotiation page.

## Negotiation

- Shows tabs.
- User can add a tab.
- User can switch between tabs.
- User can duplicate a tab.
- User can delete a tab.
- Shows 5 player boxes.
- Mission Leader box is first and clearly marked.
- Shows Contract name, requirements, rewards, and hazards.
- User can tap a resource, choose count, and assign it to a player.
- Remaining counts update immediately.
- User can edit/remove assigned items.
- Status banner updates as allocations change.
- App clearly shows:
  - incomplete requirements
  - contract satisfied
  - rewards unresolved
  - hazard unresolved
  - deal ready

## Theme

- Uses Moonrakers-inspired dark sci-fi terminal theme.
- Uses faction colors.
- Uses original SVG icons for resources.
- Does not require official game art.

---

# Nice-to-Have Features After MVP

- Accept/decline state per player per offer tab.
- Notes per player.
- Notes per offer tab.
- “Best offer” comparison summary.
- Offer duplicate + tweak workflow.
- Print/share deal summary.
- QR code for shared deal, if backend/server later exists.
- Expansion toggle:
  - Base
  - Binding Ties
  - Nomad
  - Overload
  - Titan box content
- Local image upload for card images.
- Import/export card database JSON.
- Undo/redo.
- Sound effects, subtle only.
- Animated “Contract Satisfied” effect.

---

# Implementation Guidance for Claude

Build in this order:

1. Create Vite React TypeScript app with Tailwind.
2. Add theme variables and AppShell.
3. Add HomePage.
4. Add Armory category page.
5. Add sample card data.
6. Add card browser with fuzzy search and zoom modal.
7. Add Dispatch setup page.
8. Add faction selector.
9. Add Contract search/select.
10. Add negotiation data types and reducer.
11. Add Negotiation page skeleton.
12. Add tabs.
13. Add player boxes.
14. Add Contract Detail panel.
15. Add ResourceIcon components.
16. Implement tap-to-assign flow.
17. Implement remaining counts.
18. Implement status banner.
19. Add edit/remove allocation support.
20. Add LocalStorage persistence.
21. Polish responsive layout and theme.

---

# Important UX Principle

The app should optimize for speed during a live board game.

Players should be able to answer these questions at a glance:

- What Contract are we negotiating?
- What does the Contract still need?
- Who is offering what?
- Who gets what?
- Who takes the risk?
- Is the Contract satisfied?
- Which offer tab is currently best?

The app should never make the user dig through menus during negotiation.

---

# Final Product Framing

The product is:

> A Moonrakers Dispatch Console for building, comparing, and locking contract negotiation offers.

The key value over the physical Negotiation Board is:

| Physical Negotiation Board | Dispatch Console |
|---|---|
| Tracks one deal visually | Tracks multiple offers/tabs |
| Uses physical tokens | Uses editable digital allocations |
| Helps memory | Helps comparison |
| Static board | Validates remaining requirements/rewards |
| No card search | Built-in card database |
| No history | Can persist current negotiation state |

The MVP should focus tightly on **parallel negotiation states + automatic remaining counts + contract satisfaction feedback**.
