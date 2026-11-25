// Answers stay in this browser (localStorage). Export and import as a JSON file.
// A card holds marks and words, never a name or contact detail.
import { BOOTH } from "./content.js";

const KEY = "prediction-booth-cards-v2";   // v2: years is a step on the five-step time frame

const int17 = v => Number.isInteger(v) && v >= 1 && v <= 7;
const str = (v, max) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "");

// Returns a clean card, or null if the marks are not valid.
export function clean(c) {
  if (!c || !Array.isArray(c.today) || !Array.isArray(c.prediction)) return null;
  if (c.today.length !== 4 || c.prediction.length !== 4) return null;
  if (!c.today.every(int17) || !c.prediction.every(int17)) return null;
  if (!Number.isInteger(c.years) || c.years < 1 || c.years > BOOTH.time.labels.length) return null;
  return {
    id: str(c.id, 60) || newId(),
    no: Number.isInteger(c.no) && c.no > 0 ? c.no : null,
    at: str(c.at, 40) || new Date().toISOString(),
    today: c.today.slice(),
    prediction: c.prediction.slice(),
    years: c.years,
    because: str(c.because, 120),
    role: ["designer", "engineer", "other"].includes(c.role) ? c.role : null,
    livesNL: c.livesNL === true,
    consent: c.consent === true
  };
}

const newId = () => Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);

export function load() {
  try {
    const all = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(all) ? all.map(clean).filter(Boolean) : [];
  } catch (e) { return []; }
}

function save(cards) {
  try { localStorage.setItem(KEY, JSON.stringify(cards)); return true; } catch (e) { return false; }
}

export function add(card) {
  const all = load();
  const entry = clean({ ...card, id: newId(), at: new Date().toISOString() });
  if (!entry) return null;
  if (!entry.no) entry.no = all.reduce((m, c) => Math.max(m, c.no || 0), 0) + 1;
  all.push(entry);
  return save(all) ? entry : null;
}

export function exportFile() {
  const cards = load();
  const data = { booth: "Prediction Booth", version: 1, exported: new Date().toISOString(), cards };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "prediction-booth-cards-" + new Date().toISOString().slice(0, 10) + ".json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  return cards.length;
}

// Adds the cards from a file to the ones already here. A card already present is skipped.
export async function importFile(file) {
  const data = JSON.parse(await file.text());
  const list = Array.isArray(data) ? data : Array.isArray(data.cards) ? data.cards : null;
  if (!list) throw new Error("This file holds no cards.");
  const all = load();
  const have = new Set(all.map(c => c.id));
  let added = 0, skipped = 0;
  list.forEach(raw => {
    const c = clean(raw);
    if (!c || have.has(c.id)) { skipped++; return; }
    have.add(c.id); all.push(c); added++;
  });
  all.sort((a, b) => (a.at < b.at ? -1 : a.at > b.at ? 1 : 0));
  if (!save(all)) throw new Error("The browser refused to save.");
  return { added, skipped };
}

export function clear() {
  try { localStorage.removeItem(KEY); } catch (e) {}
}

export const pref = {
  get(k, fallback) { try { const v = localStorage.getItem("prediction-booth-" + k); return v === null ? fallback : v; } catch (e) { return fallback; } },
  set(k, v) { try { localStorage.setItem("prediction-booth-" + k, v); } catch (e) {} }
};
