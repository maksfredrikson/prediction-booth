// Scenarios: the ready-made predictions from content.js. The row of chips at the top chooses
// one; it is shown on the same five-step rows as a visitor's answer. Two come from the zine;
// three are the edges and the middle of the scale.
import { BOOTH as B } from "./content.js";
import { list } from "./compose.js";
import { el } from "./dots.js";
import { patternNamed } from "./pattern.js";

const nav = document.getElementById("scenario-nav");
const box = document.getElementById("scenario");
// the zine's scenarios first, then the edges and the middle
const order = B.presets.map((_, k) => k).sort((a, b) => (B.presets[b].src === "zine") - (B.presets[a].src === "zine"));

function show(k) {
  const pr = B.presets[k];
  nav.querySelectorAll(".chip").forEach(c => c.setAttribute("aria-pressed", c.dataset.k === String(k) ? "true" : "false"));
  box.textContent = "";
  const wrap = el("div", "stack wide");
  const head = el("div", "stack stack--s");
  head.append(el("div", "kicker", pr.src === "zine" ? "From the zine" : "A point on the scale"), el("h1", "big", pr.name));
  if (pr.text) head.append(el("p", "muted", pr.text));
  const text = el("p", "lead", "A country where " + list(pr.pred.map((v, a) => B.axes[a].steps[v - 1])) + ".");
  const rows = el("div");
  rows.append(patternNamed({ today: [null, null, null, null], prediction: pr.pred, years: null }));
  const open = el("a", "btn btn--plain btn--s", "Open as a receipt");
  open.href = "survey.html?preset=" + k;
  const actions = el("div", "actions");
  actions.append(open);
  wrap.append(head, text, rows, actions);
  box.appendChild(wrap);
  history.replaceState(null, "", "#" + (k + 1));
}

order.forEach(k => {
  const c = el("button", "chip", B.presets[k].name);
  c.type = "button";
  c.dataset.k = k;
  c.addEventListener("click", () => show(k));
  nav.appendChild(c);
});

// scenarios.html#3 opens the third ready-made answer of the content file
const fromHash = parseInt(location.hash.slice(1), 10) - 1;
show(B.presets[fromHash] ? fromHash : order[0]);
