// The labelled pattern: five rows of seven laid out like the paper card. Each row has its
// question, the step numbers and the two end labels. Touching a dot shows what that step means.
import { BOOTH as B } from "./content.js";
import { el, rowNames } from "./dots.js";
import { createScale } from "./scale.js";

export const poleLabels = r => (r === 4 ? [B.time.l, B.time.r] : [B.axes[r].l, B.axes[r].r]);
export const stepSentence = (r, i) =>
  r === 4 ? "It gets there " + B.time.phrases[i - 1] + "." : "A country where " + B.axes[r].steps[i - 1].t + ".";

export function poles(r) {
  const [l, rt] = poleLabels(r);
  const p = el("div", "poles");
  p.append(el("span", "", l), el("span", "", rt));
  return p;
}

// card = { today: [..4], prediction: [..4], years }
export function patternNamed(card) {
  const frag = document.createDocumentFragment();
  const desc = el("div", "desc");
  desc.setAttribute("aria-live", "polite");
  const idle = () => {
    desc.textContent = "";
    desc.append(el("p", "", "Touch any dot to read what that step stands for."));
  };
  const show = (r, i) => {
    const t = r === 4 ? null : card.today[r], p = r === 4 ? card.years : card.prediction[r];
    desc.textContent = "";
    const head = el("div", "desc__step", "Row " + (r + 1) + ", step " + i + " of 7");
    const is = [t === i ? "today" : null, p === i ? "prediction" : null].filter(Boolean);
    if (is.length) head.append(": " + is.join(" and "));
    desc.append(head, el("p", "", stepSentence(r, i)));
  };

  const first = el("div", "prow prow--desc");
  first.append(desc);
  frag.appendChild(first);

  rowNames.forEach((q, r) => {
    const row = el("div", "prow");
    const name = el("div", "prow__name");
    name.append(el("b", "", String(r + 1) + " "), document.createTextNode(q));
    const scale = createScale({ label: q, read: true, onTouch: i => { if (i != null) show(r, i); } });
    scale.set(r === 4 ? { today: null, pred: card.years, mode: "pred" } : { today: card.today[r], pred: card.prediction[r], mode: "pred" });
    const box = el("div");
    box.append(scale.el, poles(r));
    row.append(name, box);
    frag.appendChild(row);
  });

  idle();
  return frag;
}
