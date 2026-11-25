// Dots: big halftone dot = today (the big sticker), small solid dot on top = prediction
// (the small sticker). Used by the scale and by the labelled pattern.
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

export function legend() {
  const l = el("div", "legend");
  const a = el("span"); a.append(el("i", "key key--today"), document.createTextNode("today"));
  const b = el("span"); b.append(el("i", "key key--pred"), document.createTextNode("prediction"));
  l.append(a, b);
  return l;
}
