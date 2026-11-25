// An answer as five labelled rows, laid out like the paper card: each row has its question,
// the step numbers and the two end labels. Touching a dot shows what that step means.
import { BOOTH as B } from "./content.js";
import { el, rowNames, STEP_LABELS } from "./dots.js";
import { createScale } from "./scale.js";

export const poleLabels = r => (r === 4 ? [B.time.l, B.time.r] : [B.axes[r].l, B.axes[r].r]);
export const stepLabels = r => (r === 4 ? B.time.labels : STEP_LABELS);
const cap = t => t.charAt(0).toUpperCase() + t.slice(1);
export const stepSentence = (r, i) =>
  r === 4 ? cap(B.time.phrases[i - 1]) + "." : "A country where " + B.axes[r].steps[i - 1] + ".";

export function poles(r) {
  const [l, rt] = poleLabels(r);
  const p = el("div", "poles");
  p.append(el("span", "", l), el("span", "", rt));
  return p;
}

// card = { today: [..4], prediction: [..4], years }
export function patternNamed(card) {
  const frag = document.createDocumentFragment();
  rowNames.forEach((q, r) => {
    const t = r === 4 ? null : card.today[r], p = r === 4 ? card.years : card.prediction[r];
    const row = el("div", "prow");
    const name = el("div", "prow__name", (r + 1) + " " + q);
    const cap = el("div", "prow__cap");
    cap.setAttribute("aria-live", "polite");
    const show = i => {
      if (i == null) { cap.textContent = "Touch a dot to read what that step stands for."; return; }
      const is = [t === i ? "today" : null, p === i ? "prediction" : null].filter(Boolean);
      cap.textContent = (r === 4 ? "" : "Step " + i + (is.length ? " (" + is.join(" and ") + ")" : "") + ": ") + stepSentence(r, i);
    };
    const scale = createScale({ label: q, read: true, labels: stepLabels(r), onTouch: i => { if (i != null) show(i); } });
    scale.set(r === 4 ? { today: null, pred: card.years, mode: "pred" } : { today: t, pred: p, mode: "pred" });
    show(null);
    row.append(name, scale.el, poles(r), cap);
    frag.appendChild(row);
  });
  return frag;
}
