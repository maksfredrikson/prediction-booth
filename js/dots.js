// Dots: the pattern of five rows of seven, the same layout as the paper card.
// Big dot = today (the big sticker), small dot on top = prediction (the small sticker).
import { BOOTH as B } from "./content.js";

export const el = (tag, cls, text) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
};

export const rowNames = [...B.axes.map(a => a.q), B.time.q];

export function dot(isToday, isPred) {
  const d = el("span", "dot" + (isToday ? " is-today" : "") + (isPred ? " is-pred" : ""));
  d.append(el("i", "b"), el("i", "t"), el("i", "p"));
  return d;
}

export function dotsRow(today, pred) {
  const row = el("div", "dots");
  for (let i = 1; i <= 7; i++) row.appendChild(dot(today === i, pred === i));
  return row;
}

// card = { today: [..4], prediction: [..4], years } ; values may be null while answering
const rowsOf = card => [
  ...B.axes.map((_, a) => [card.today[a], card.prediction[a]]),
  [null, card.years]
];

export function patternMini(card, nowRow) {
  const p = el("div", "pattern pattern--mini");
  p.setAttribute("role", "img");
  p.setAttribute("aria-label", "Pattern: " + describe(card));
  rowsOf(card).forEach(([t, pr], i) => {
    const r = dotsRow(t, pr);
    if (i === nowRow) r.classList.add("is-now");
    p.appendChild(r);
  });
  return p;
}

// Rows with the question on the left and the dots on the right.
export function patternNamed(card) {
  const frag = document.createDocumentFragment();
  rowsOf(card).forEach(([t, pr], i) => {
    const row = el("div", "prow");
    const name = el("div", "prow__name");
    name.append(el("b", "", String(i + 1) + " "), document.createTextNode(rowNames[i]));
    row.append(name, dotsRow(t, pr));
    frag.appendChild(row);
  });
  return frag;
}

export function describe(card) {
  const v = x => (x == null ? "-" : x);
  return "today " + card.today.map(v).join(" ") + ", prediction " + card.prediction.map(v).join(" ") + ", years " + v(card.years);
}

export function legend() {
  const l = el("div", "legend");
  const a = el("span"); a.append(el("i", "key key--today"), document.createTextNode("today"));
  const b = el("span"); b.append(el("i", "key key--pred"), document.createTextNode("prediction"));
  l.append(a, b);
  return l;
}
