// One-shot: parse the four CSVs in ../../data/CARD_LISTS_1/ + scan ../../images/
// to produce src/data/cards.json — a unified deck of cards consumed by the UI.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const DATA_DIR = path.join(ROOT, "data/CARD_LISTS_1");
const IMAGES_DIR = path.join(ROOT, "images");
const OUT = path.resolve(__dirname, "../src/data/cards.json");

// RFC4180-ish CSV parser: handles quoted fields, doubled quotes, embedded commas/newlines.
function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else { inQuotes = false; }
      } else {
        field += c;
      }
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ",") { row.push(field); field = ""; }
      else if (c === "\n" || c === "\r") {
        if (c === "\r" && text[i + 1] === "\n") i++;
        row.push(field); field = "";
        rows.push(row); row = [];
      } else field += c;
    }
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows.filter(r => r.length > 1 || (r[0] && r[0].trim()));
}

const EXPANSION = {
  BG: "base",
  BT: "binding_ties",
  DM: "dark_matter",
  END: "endless",
  FE: "1st_encounter",
  INT: "intrepid",
  NOM: "nomad",
  OL: "overload",
  SHR: "shard",
  STF: "starfall",
};

const EXPANSION_NAME = {
  base: "Base",
  binding_ties: "Binding Ties",
  dark_matter: "Dark Matter",
  endless: "Endless",
  "1st_encounter": "1st Encounter",
  intrepid: "Intrepid",
  nomad: "Nomad",
  overload: "Overload",
  shard: "Shard",
  starfall: "Starfall",
  frontier: "Frontier",
  marauders: "Marauders",
  events: "Events",
};

// Build an index of available image files per category so we can resolve images.
function indexImages(category) {
  const root = path.join(IMAGES_DIR, category);
  if (!fs.existsSync(root)) return new Map();
  const map = new Map(); // normalizedName -> /card-images/<cat>/<expansion>/<file>
  for (const expansion of fs.readdirSync(root)) {
    const dir = path.join(root, expansion);
    if (!fs.statSync(dir).isDirectory()) continue;
    for (const file of fs.readdirSync(dir)) {
      if (file.startsWith(".")) continue;
      const base = file.replace(/\.(jpg|jpeg|png|webp)$/i, "");
      const key = normalizeName(base);
      const url = `/card-images/${category}/${expansion}/${file}`;
      // First match wins; later expansions only fill in gaps.
      if (!map.has(key)) map.set(key, { url, expansion });
    }
  }
  return map;
}

function normalizeName(s) {
  return s.toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

function resolveImage(index, name) {
  const key = normalizeName(name);
  if (index.has(key)) return index.get(key);
  // "Foo, The" → "The_Foo"
  const m = name.match(/^(.+),\s*the$/i);
  if (m) {
    const flipped = normalizeName(`The ${m[1]}`);
    if (index.has(flipped)) return index.get(flipped);
  }
  // strip leading/trailing "the"
  const alt = key.replace(/^the_/, "").replace(/_the$/, "");
  if (alt !== key && index.has(alt)) return index.get(alt);
  return null;
}

function slug(name) {
  return normalizeName(name);
}

// --- Contracts ---
function buildContracts() {
  const csv = fs.readFileSync(path.join(DATA_DIR, "Contracts-Table 1.csv"), "utf8");
  const rows = parseCSV(csv);
  // Header is on row index 1 (row 0 is the REWARDS/REQUIREMENTS section banner)
  const header = rows[1].map(h => h.trim());
  const col = name => header.indexOf(name);
  const images = indexImages("contracts");

  const out = [];
  for (let i = 2; i < rows.length; i++) {
    const r = rows[i];
    if (!r[0] || !r[0].trim()) continue;
    const name = r[0].trim();
    const ctype = (r[col("CType")] || "").trim();
    const game = (r[col("Game")] || "").trim();
    const expansion = EXPANSION[game] || "base";

    const num = (key) => {
      const idx = col(key);
      const v = idx >= 0 ? (r[idx] || "").trim() : "";
      const n = parseInt(v, 10);
      return Number.isFinite(n) ? n : 0;
    };

    const rewards = [];
    if (num("Prestige")) rewards.push({ type: "prestige", count: num("Prestige") });
    if (num("Credits")) rewards.push({ type: "credit", count: num("Credits") });
    if (num("BC")) rewards.push({ type: "bonus_card", count: num("BC") });

    const requirements = [];
    if (num("Reactors")) requirements.push({ type: "reactor", count: num("Reactors") });
    if (num("Thrusters")) requirements.push({ type: "thruster", count: num("Thrusters") });
    if (num("Shields")) requirements.push({ type: "shield", count: num("Shields") });
    if (num("Damage")) requirements.push({ type: "damage", count: num("Damage") });
    if (num("Crew")) requirements.push({ type: "crew", count: num("Crew") });
    if (num("Moon")) requirements.push({ type: "moon", count: num("Moon") });
    if (num("Flex")) requirements.push({ type: "flex", count: num("Flex") });

    const hazards = num("HDice");
    const special = (r[col("Special")] || "").trim();

    const img = resolveImage(images, name);
    out.push({
      id: `contract-${slug(name)}`,
      name,
      category: "contract",
      contractType: ctype ? ctype.toLowerCase() : undefined,
      requirements,
      rewards,
      hazards,
      expansion: img?.expansion || expansion,
      expansionName: EXPANSION_NAME[img?.expansion || expansion] || expansion,
      imageUrl: img?.url,
      text: special || undefined,
      tags: [ctype && ctype.toLowerCase()].filter(Boolean),
    });
  }
  return out;
}

// --- Crew ---
function buildCrew() {
  const csv = fs.readFileSync(path.join(DATA_DIR, "Crew-Table 1.csv"), "utf8");
  const rows = parseCSV(csv);
  const header = rows[0].map(h => h.trim());
  const col = name => header.indexOf(name);
  const images = indexImages("crew");
  const out = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r[0] || !r[0].trim()) continue;
    const name = r[0].trim();
    const role = (r[col("Role")] || "").trim();
    const type = (r[col("Type")] || "").trim();
    const cost = parseInt((r[col("Cost")] || "").trim(), 10) || 0;
    const game = (r[col("Game")] || "").trim();
    const ability = (r[col("Ability")] || "").trim();
    const img = resolveImage(images, name);
    const expansion = img?.expansion || EXPANSION[game] || "base";
    out.push({
      id: `crew-${slug(name)}`,
      name,
      category: "crew",
      role,
      crewType: type,
      cost,
      text: ability,
      imageUrl: img?.url,
      expansion,
      expansionName: EXPANSION_NAME[expansion] || expansion,
      tags: [type && type.toLowerCase(), role && role.toLowerCase()].filter(Boolean),
    });
  }
  return out;
}

// --- Ship Parts ---
function buildShipParts() {
  const csv = fs.readFileSync(path.join(DATA_DIR, "Ship Parts-Table 1.csv"), "utf8");
  const rows = parseCSV(csv);
  const header = rows[0].map(h => h.trim());
  const col = name => header.indexOf(name);
  const images = indexImages("ship_parts");
  const out = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r[0] || !r[0].trim()) continue;
    const name = r[0].trim();
    const brand = (r[col("Brand")] || "").trim();
    const cards = ["Card1","Card2","Card3","Card4","Card5"]
      .map(k => (r[col(k)] || "").trim())
      .filter(Boolean);
    const cost = parseInt((r[col("Cost")] || "").trim(), 10) || 0;
    const game = (r[col("Game")] || "").trim();
    const ability = (r[col("Ability")] || "").trim();
    const img = resolveImage(images, name);
    const expansion = img?.expansion || EXPANSION[game] || "base";
    out.push({
      id: `ship_part-${slug(name)}`,
      name,
      category: "ship_part",
      brand,
      cardSlots: cards,
      cost,
      text: ability,
      imageUrl: img?.url,
      expansion,
      expansionName: EXPANSION_NAME[expansion] || expansion,
      tags: [brand && brand.toLowerCase(), ...cards.map(c => c.toLowerCase())].filter(Boolean),
    });
  }
  return out;
}

// --- Objectives ---
function buildObjectives() {
  const csv = fs.readFileSync(path.join(DATA_DIR, "Objectives-Table 1.csv"), "utf8");
  const rows = parseCSV(csv);
  const header = rows[0].map(h => h.trim());
  const col = name => header.indexOf(name);
  const images = indexImages("objectives");
  const out = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r[0] || !r[0].trim()) continue;
    const name = r[0].trim();
    const color = (r[col("Color")] || "").trim();
    const game = (r[col("Game")] || "").trim();
    const desc = (r[col("Description")] || "").trim();
    const img = resolveImage(images, name);
    const expansion = img?.expansion || EXPANSION[game] || "base";
    out.push({
      id: `objective-${slug(name)}`,
      name,
      category: "objective",
      color,
      text: desc,
      imageUrl: img?.url,
      expansion,
      expansionName: EXPANSION_NAME[expansion] || expansion,
      tags: [color && color.toLowerCase()].filter(Boolean),
    });
  }
  return out;
}

// --- Action Cards: derived from images folder (no CSV) ---
function buildActionCards() {
  const cat = "action_cards";
  const root = path.join(IMAGES_DIR, cat);
  const out = [];
  if (!fs.existsSync(root)) return out;
  for (const expansion of fs.readdirSync(root)) {
    const dir = path.join(root, expansion);
    if (!fs.statSync(dir).isDirectory()) continue;
    for (const file of fs.readdirSync(dir)) {
      if (file.startsWith(".") || !/\.(jpg|jpeg|png|webp)$/i.test(file)) continue;
      const base = file.replace(/\.(jpg|jpeg|png|webp)$/i, "");
      const name = base.replace(/_/g, " ");
      out.push({
        id: `action-${expansion}-${slug(base)}`,
        name,
        category: "action",
        imageUrl: `/card-images/${cat}/${expansion}/${file}`,
        expansion,
        expansionName: EXPANSION_NAME[expansion] || expansion,
        tags: [expansion],
      });
    }
  }
  return out;
}

const all = [
  ...buildContracts(),
  ...buildCrew(),
  ...buildShipParts(),
  ...buildObjectives(),
  ...buildActionCards(),
];

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(all, null, 2));

const counts = all.reduce((acc, c) => ({ ...acc, [c.category]: (acc[c.category]||0)+1 }), {});
const withImages = all.filter(c => c.imageUrl).length;
console.log(`wrote ${all.length} cards → ${path.relative(process.cwd(), OUT)}`);
console.log(`  by category:`, counts);
console.log(`  with images: ${withImages}/${all.length}`);
