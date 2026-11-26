// The years slider: one dot dragged along a line, from 0 at one end to ∞ at the other.
// It moves freely under the finger and settles on the nearest named stop when let go.
// The dot grows the further ahead it is dragged: the same solid dot as a prediction mark.
import { el } from "./dots.js";

export function createSlider({ label, labels, texts, onPick }) {
  const n = labels.length;
  const root = el("div", "slider");
  root.style.setProperty("--n", n);
  const track = el("div", "slider__track");
  track.setAttribute("role", "slider");
  track.setAttribute("aria-label", label);
  track.setAttribute("aria-valuemin", "1");
  track.setAttribute("aria-valuemax", String(n));
  track.tabIndex = 0;
  const handle = el("span", "slider__dot");
  const stops = el("div", "slider__stops");
  const nums = [];
  labels.forEach(l => {
    const s = el("span", "slider__stop");
    s.append(el("i"), el("b", "", l));
    stops.appendChild(s);
    nums.push(s);
  });
  track.append(stops, handle);
  root.appendChild(track);

  let value = null;   // the chosen stop, 1 to n; null until the dot has been moved
  let dragging = false;

  // pos runs from 0 (first stop) to n - 1 (last stop), and may sit between stops while dragging
  function place(pos) {
    handle.style.left = ((pos + 0.5) / n * 100) + "%";
    handle.style.setProperty("--grow", String(pos / (n - 1)));
  }
  function paint() {
    root.classList.toggle("is-set", value != null);
    root.classList.toggle("is-dragging", dragging);
    nums.forEach((s, k) => s.classList.toggle("is-on", value === k + 1));
    if (value != null) {
      track.setAttribute("aria-valuenow", String(value));
      track.setAttribute("aria-valuetext", texts ? texts[value - 1] : labels[value - 1]);
    }
    if (!dragging) place(value == null ? 0 : value - 1);
  }
  function settle(pos) {
    const v = Math.min(n, Math.max(1, Math.round(pos) + 1));
    const changed = v !== value;
    value = v;
    paint();
    if (changed && onPick) onPick(v);
  }
  const posOf = e => {
    const r = track.getBoundingClientRect();
    return Math.min(n - 1, Math.max(0, (e.clientX - r.left) / r.width * n - 0.5));
  };

  track.addEventListener("pointerdown", e => {
    if (e.button > 0) return;
    dragging = true;
    try { track.setPointerCapture(e.pointerId); } catch (err) {}
    root.classList.add("is-set", "is-dragging");
    place(posOf(e));
  });
  track.addEventListener("pointermove", e => { if (dragging) place(posOf(e)); });
  const up = e => {
    if (!dragging) return;
    dragging = false;
    settle(posOf(e));
  };
  track.addEventListener("pointerup", up);
  track.addEventListener("pointercancel", () => { dragging = false; paint(); });

  track.addEventListener("keydown", e => {
    const cur = value == null ? 0 : value;
    let next = null;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") next = Math.min(n, cur + 1);
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") next = Math.max(1, cur - 1);
    if (e.key === "Home") next = 1;
    if (e.key === "End") next = n;
    if (next == null) return;
    e.preventDefault();
    settle(next - 1);
  });

  paint();
  return {
    el: root,
    set(v) { value = v; paint(); },
    pick(v) { if (v >= 1 && v <= n) settle(v - 1); }
  };
}
