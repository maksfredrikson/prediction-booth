// Scenarios: the ready-made predictions from content.js, each on the same five-step rows as a
// visitor's answer. Two come from the zine; three are the edges and the middle of the scale.
import { BOOTH as B } from "./content.js";
import { list } from "./compose.js";
import { el } from "./dots.js";
import { patternNamed } from "./pattern.js";

const box = document.getElementById("scenarios");

function scenario(pr, k) {
  const sec = el("section", "sec stack wide");
  const head = el("div", "stack stack--s");
  head.append(el("div", "kicker", pr.src === "zine" ? "From the zine" : "A point on the scale"), el("h2", "big big--s", pr.name));
  if (pr.text) head.append(el("p", "muted", pr.text));
  const text = el("p", "lead", "A country where " + list(pr.pred.map((v, a) => B.axes[a].steps[v - 1])) + ".");
  const rows = el("div");
  rows.append(patternNamed({ today: [null, null, null, null], prediction: pr.pred, years: null }));
  const open = el("a", "btn btn--plain btn--s", "Open as a receipt");
  open.href = "survey.html?preset=" + k;
  const actions = el("div", "actions");
  actions.append(open);
  sec.append(head, text, rows, actions);
  return sec;
}

// the zine's scenarios first, then the edges and the middle
B.presets.map((pr, k) => [pr, k]).sort((a, b) => (b[0].src === "zine") - (a[0].src === "zine"))
  .forEach(([pr, k]) => box.appendChild(scenario(pr, k)));
