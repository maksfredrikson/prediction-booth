// About: the full table of questions, steps, price lines and years, read from content.js,
// so the rule behind the scenario text is visible. Touch a step to read its sentence.
import { BOOTH as B } from "./content.js";
import { el } from "./dots.js";
import { createScale } from "./scale.js";

const table = document.getElementById("table");

function block(index, ax, sentence, prices) {
  const sec = el("section", "sec stack wide");
  const head = el("div", "stack stack--s");
  head.append(el("div", "kicker", index), el("h2", "mid", ax.q));

  let pinned = ax.labels ? 2 : Math.ceil(B.steps / 2), touched = null;
  const desc = el("div", "desc");
  desc.setAttribute("aria-live", "polite");
  const paint = () => {
    const i = touched ?? pinned;
    desc.textContent = "";
    desc.append(el("div", "desc__step", (ax.labels ? ax.labels[i - 1] + " years adds" : "Step " + i + " of " + B.steps + " adds")), el("p", "", sentence(i)));
  };
  const scale = createScale({
    label: ax.q, labels: ax.labels || undefined,
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
    p.append(side("Price, if the prediction moves left", prices[0]), side("Price, if it moves right", prices[1]));
    sec.append(p);
  }
  paint();
  return sec;
}

B.axes.forEach((ax, a) => {
  table.appendChild(block("Question " + (a + 1), ax, i => "\u2026 a country where " + ax.steps[i - 1], [ax.toLeft, ax.toRight]));
});
table.appendChild(block("The time frame", B.time, i => "\u2026 " + B.time.phrases[i - 1] + " \u2026", null));
