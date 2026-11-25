// The scale: a row of dots that is the control (seven steps, or five for the time frame).
// Tap, drag or use the arrow keys.
// The chosen dot grows. It can carry two marks at once: today (big) and prediction (small).
import { el, dot } from "./dots.js";

export function createScale({ label, onPick, onTouch, read = false, labels = ["1", "2", "3", "4", "5", "6", "7"] }) {
  const n = labels.length;
  const root = el("div", "scale" + (read ? " scale--read" : ""));
  const track = el("div", "dots");
  track.setAttribute("role", read ? "group" : "radiogroup");
  if (label) track.setAttribute("aria-label", label);
  const move = el("span", "scale__move");
  track.appendChild(move);
  track.style.setProperty("--n", n);

  let marks = { today: null, pred: null, mode: "today" };
  let touched = null;

  const steps = [];
  for (let i = 1; i <= n; i++) {
    const b = el("button", "scale__step");
    b.type = "button";
    if (!read) b.setAttribute("role", "radio");
    b.dataset.step = i;
    b.setAttribute("aria-label", "Step " + i + " of " + n);
    b.append(dot(false, false), el("span", "scale__num", labels[i - 1]));
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
      if (read) {
        b.setAttribute("aria-label", "Step " + i + " of " + n + (marks.today === i ? ", today" : "") + (marks.pred === i ? ", prediction" : ""));
        b.tabIndex = (touched ?? 1) === i ? 0 : -1;
      } else {
        b.setAttribute("aria-checked", cur === i ? "true" : "false");
        b.tabIndex = (cur == null ? i === 1 : cur === i) ? 0 : -1;
      }
    });
    if (marks.today != null && marks.pred != null && marks.today !== marks.pred) {
      const lo = Math.min(marks.today, marks.pred), hi = Math.max(marks.today, marks.pred);
      move.style.left = ((lo - 0.5) / n * 100) + "%";
      move.style.width = ((hi - lo) / n * 100) + "%";
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
    return Math.min(n, Math.max(1, Math.floor((e.clientX - r.left) / r.width * n) + 1));
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
    const cur = read ? (touched ?? 0) : (current() ?? touched ?? 0);
    let next = null;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") next = Math.min(n, cur + 1);
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") next = Math.max(1, cur - 1);
    if (/^[1-9]$/.test(e.key) && parseInt(e.key, 10) <= n) next = parseInt(e.key, 10);
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
