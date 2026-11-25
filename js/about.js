// About: the full table of questions, steps, price lines and years, read from content.js,
// so the rule behind the scenario text is visible. Touch a step to read its sentence.
import { BOOTH as B } from "./content.js";
import { el } from "./dots.js";
import { createScale } from "./scale.js";

const table = document.getElementById("table");

function block(index, ax, sentence, prices) {
  const sec = el("section", "row");
  const label = el("div", "row__label stack stack--s");
  label.append(el("div", "eyebrow", index), el("h2", "", ax.q));
  label.lastChild.style.fontSize = "17px";

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
    onPick: i => { pinned = i; scale.set({ today: i }); paint(); },
    onTouch: i => { touched = i; paint(); }
  });
  scale.set({ today: pinned, mode: "today" });
  const poles = el("div", "poles");
  poles.append(el("span", "", ax.l), el("span", "", ax.r));
  const scaleBox = el("div");
  scaleBox.append(scale.el, poles);

  const body = el("div", "row__body stack");
  body.append(scaleBox, desc);
  if (prices) {
    const p = el("div", "prices");
    const side = (head, text) => { const d = el("div"); d.append(el("span", "", head), document.createTextNode(text)); return d; };
    p.append(side("Price, if the prediction moves left", prices[0]), side("Price, if it moves right", prices[1]));
    body.append(p);
  }
  sec.append(label, body);
  paint();
  return sec;
}

B.axes.forEach((ax, a) => {
  table.appendChild(block("Question " + (a + 1), ax, i => "… a country where " + ax.steps[i - 1].t, [ax.toLeft, ax.toRight]));
});
table.appendChild(block("How soon", B.time, i => "… " + B.time.phrases[i - 1] + " …", null));
