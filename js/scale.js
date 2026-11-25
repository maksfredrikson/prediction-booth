// The seven-step scale: a row of dots that is the control. Tap, drag or use the arrow keys.
// The chosen dot grows. It can carry two marks at once: today (big) and prediction (small).
import { el, dot } from "./dots.js";

export function createScale({ label, onPick, onTouch, read = false }) {
  const root = el("div", "scale" + (read ? " scale--read" : ""));
  const track = el("div", "dots");
  track.setAttribute("role", "radiogroup");
  if (label) track.setAttribute("aria-label", label);
  const move = el("span", "scale__move");
  track.appendChild(move);

  let marks = { today: null, pred: null, mode: "today" };
  let touched = null;

  const steps = [];
  for (let i = 1; i <= 7; i++) {
    const b = el("button", "scale__step");
    b.type = "button";
    b.setAttribute("role", "radio");
    b.dataset.step = i;
    b.setAttribute("aria-label", "Step " + i + " of 7");
    b.append(dot(false, false), el("span", "scale__num", String(i)));
    b.addEventListener("focus", () => touch(i));
    b.addEventListener("blur", () => touch(null));
    // keyboard activation only: pointer input is handled on the track
    b.addEventListener("click", e => { if (e.detail === 0) pick(i); });
    steps.push(b);
    track.appendChild(b);
  }

  const current = () => (marks.mode === "pred" ? marks.pred : marks.today);

  function paint() {
    const cur = current();
    steps.forEach((b, k) => {
      const i = k + 1;
      const d = b.firstChild;
      d.classList.toggle("is-today", marks.today === i);
      d.classList.toggle("is-pred", marks.pred === i);
      b.classList.toggle("is-on", marks.today === i || marks.pred === i);
      b.classList.toggle("is-touch", touched === i);
      b.setAttribute("aria-checked", cur === i ? "true" : "false");
      b.tabIndex = (cur == null ? i === 1 : cur === i) ? 0 : -1;
    });
    if (marks.today != null && marks.pred != null && marks.today !== marks.pred) {
      const lo = Math.min(marks.today, marks.pred), hi = Math.max(marks.today, marks.pred);
      move.style.left = ((lo - 0.5) / 7 * 100) + "%";
      move.style.width = ((hi - lo) / 7 * 100) + "%";
      move.hidden = false;
    } else move.hidden = true;
  }

  function touch(i) {
    if (touched === i) return;
    touched = i;
    paint();
    if (onTouch) onTouch(i);
  }
  function pick(i) {
    if (current() !== i && onPick) onPick(i);
  }
  const nearest = e => {
    const r = track.getBoundingClientRect();
    return Math.min(7, Math.max(1, Math.floor((e.clientX - r.left) / r.width * 7) + 1));
  };

  let down = false;
  track.addEventListener("pointerdown", e => {
    if (e.button > 0) return;
    down = true;
    try { track.setPointerCapture(e.pointerId); } catch (err) {}
    const i = nearest(e);
    touch(i);
    pick(i);
  });
  track.addEventListener("pointermove", e => {
    const i = nearest(e);
    if (down) { touch(i); pick(i); }
    else if (e.pointerType === "mouse") touch(i);
  });
  const up = () => { down = false; };
  track.addEventListener("pointerup", up);
  track.addEventListener("pointercancel", up);
  track.addEventListener("pointerleave", e => { if (!down && e.pointerType === "mouse") touch(null); });

  track.addEventListener("keydown", e => {
    const cur = current() ?? touched ?? 0;
    let next = null;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") next = Math.min(7, cur + 1);
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") next = Math.max(1, cur - 1);
    if (/^[1-7]$/.test(e.key)) next = parseInt(e.key, 10);
    if (next == null) return;
    e.preventDefault();
    pick(next);
    steps[next - 1].focus();
  });

  root.appendChild(track);
  paint();
  return {
    el: root,
    set(m) { marks = { ...marks, ...m }; paint(); },
    focus() { (steps.find(b => b.tabIndex === 0) || steps[0]).focus({ preventScroll: true }); }
  };
}
