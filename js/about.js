// About: the full table of questions, steps, price lines and years, read from content.js,
// so the rule behind the scenario text is visible. Touch a step to read its sentence.
import { BOOTH as B } from "./content.js";
import { el } from "./dots.js";
import { createScale } from "./scale.js";
import { wrap, W } from "./receipt.js";

const table = document.getElementById("table");
const toc = document.getElementById("toc");

function block(n, id, index, ax, sentence, prices) {
  const sec = el("section", "sec stack");
  sec.id = id;
  const head = el("div");
  head.append(el("div", "sec__h", index), el("h2", "", ax.q));

  let pinned = 4, touched = null;
  const desc = el("div", "desc");
  desc.setAttribute("aria-live", "polite");
  const paint = () => {
    const i = touched ?? pinned;
    desc.textContent = "";
    desc.append(el("div", "desc__step", "Step " + i + " of 7 adds"), el("p", "", sentence(i)));
  };
  const scale = createScale({
    label: ax.q,
    onPick: i => { pinned = i; scale.set({ pred: i }); paint(); },
    onTouch: i => { touched = i; paint(); }
  });
  scale.set({ pred: pinned, mode: "pred" });
  const poles = el("div", "poles");
  poles.append(el("span", "", ax.l), el("span", "", ax.r));
  const scaleBox = el("div");
  scaleBox.append(scale.el, poles);
  sec.append(head, scaleBox, desc);
  if (prices) {
    const p = el("div", "prices");
    const side = (h, text) => { const d = el("div"); d.append(el("span", "", h), document.createTextNode(text)); return d; };
    p.append(side("Price, moving left", prices[0]), side("Price, moving right", prices[1]));
    sec.append(p);
  }
  paint();

  // the same block as a line in the contents column
  const a = el("a", "rrow");
  a.href = "#" + id;
  wrap(n + " " + ax.q, W, "  ").forEach(l => a.appendChild(el("span", "rl", l)));
  toc.appendChild(a);
  return sec;
}

B.axes.forEach((ax, a) => {
  table.appendChild(block(a + 3, "q" + (a + 1), "Question " + (a + 1), ax, i => "\u2026 a country where " + ax.steps[i - 1].t, [ax.toLeft, ax.toRight]));
});
table.appendChild(block(7, "soon", "How soon", B.time, i => "\u2026 " + B.time.phrases[i - 1] + " \u2026", null));
