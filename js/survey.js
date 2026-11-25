// Survey, made for touch. It opens on the time frame, then asks four questions, each on
// two lines (today and the prediction), then one last step: consent, an optional reason and
// an optional tip of data: how long the visitor has lived in the Netherlands. The receipt follows on its own screen. One clear action per screen.
import { BOOTH as B } from "./content.js";
import { complete } from "./compose.js";
import { el } from "./dots.js";
import { createScale } from "./scale.js";
import { add, pref } from "./store.js";
import { receiptParts, receiptView, armPrint, disarmPrint } from "./receipt.js";

const screen = document.getElementById("screen");
const fresh = () => ({
  today: [null, null, null, null], prediction: [null, null, null, null], years: null,
  because: "", lived: null, consent: null, paper: ""
});
let state = fresh();

// The order of screens: the time frame, the four questions, the last step.
const FLOW = [{ k: "time" }];
B.axes.forEach((_, a) => FLOW.push({ k: "question", a }));
FLOW.push({ k: "last" });
const STEPS = B.axes.length + 1;   // what the bar counts: the four questions and the last step
let pos = 0;
let view = null;   // the scale screen now showing

// ---- small builders ----------------------------------------------------
const stack = (cls, ...nodes) => { const s = el("div", "stack " + (cls || "")); s.append(...nodes.filter(Boolean)); return s; };
function link(href, text) { const a = el("a", "", text); a.href = href; return a; }
function button(text, cls, role, on) {
  const b = el("button", cls, text);
  b.type = "button";
  if (role) b.dataset.role = role;
  b.addEventListener("click", on);
  return b;
}
function mount(...nodes) {
  screen.textContent = "";
  const s = el("div", "screen");
  s.append(...nodes.filter(Boolean));
  screen.appendChild(s);
  window.scrollTo(0, 0);
}
function progress(step) {
  const bar = el("div", "progress");
  for (let i = 1; i <= STEPS; i++) bar.appendChild(el("i", i < step ? "done" : i === step ? "now" : ""));
  bar.setAttribute("role", "img");
  bar.setAttribute("aria-label", step ? "Step " + step + " of " + STEPS : STEPS + " steps ahead");
  return bar;
}
const head = (step, kicker, title) => stack("", progress(step), stack("stack--s", el("div", "kicker", kicker), el("h1", "big", title)));

function go(n) {
  if (n < 0) { location.href = "index.html"; return; }   // back from the first screen: the landing page
  pos = Math.min(FLOW.length - 1, n);
  render();
}
function render() {
  const f = FLOW[pos];
  view = null;
  disarmPrint();
  if (f.k === "time") view = scaleScreen(null);
  else if (f.k === "question") view = scaleScreen(f.a);
  else lastScreen();
  if (view) view.paint();
}

// ---- a scale screen: the time frame (one line) or a question (two lines) -----------
// Tap or drag a line to choose; the meaning of the chosen step appears under it.
function scaleScreen(a) {
  const isTime = a == null;
  const ax = isTime ? B.time : B.axes[a];
  const next = button("Next", "btn", "next", () => go(pos + 1));
  const actions = el("div", "actions");
  actions.append(next, button("Back", "linkbtn", "back", () => go(pos - 1)));

  // one line = a label on the left, a scale, and under it what the chosen step means
  const line = (key, labelText, promptText, keyCls) => {
    const get = () => (isTime ? state.years : (key === "pred" ? state.prediction : state.today)[a]);
    const set = i => { if (isTime) state.years = i; else (key === "pred" ? state.prediction : state.today)[a] = i; };
    const row = el("div", "line");
    const label = el("div", "line__label");
    const name = el("div", "line__name");
    name.append(el("i", "key " + keyCls), document.createTextNode(labelText));
    label.append(name, el("div", "line__ask", promptText));
    const scale = createScale({ label: labelText + ": " + promptText, labels: isTime ? B.time.labels : undefined, onPick: i => { set(i); paint(); } });
    scale.el.classList.add("scale--" + key);
    const cap = el("div", "line__cap");
    cap.setAttribute("aria-live", "polite");
    const body = el("div", "line__body");
    body.append(scale.el, cap);
    row.append(label, body);
    const paintLine = () => {
      const i = get();
      scale.set(key === "pred" ? { today: null, pred: i, mode: "pred" } : { today: i, pred: null, mode: "today" });
      cap.textContent = "";
      if (i == null) { cap.append(el("p", "muted", "Tap a step. Its meaning shows here.")); return; }
      if (isTime) cap.append(el("div", "line__step", B.time.labels[i - 1] + " years"), el("p", "", "You predict where " + B.place + " will be " + B.time.phrases[i - 1] + "."));
      else cap.append(el("div", "line__step", "Step " + i + " of " + B.steps), el("p", "", "A country where " + ax.steps[i - 1] + "."));
    };
    return { row, get, set, paintLine };
  };
  const when = state.years ? B.time.phrases[state.years - 1] : "by then";
  const lines = isTime
    ? [line("pred", "Years", "from now", "key--pred")]
    : [line("today", "Today", "Where is " + B.place + " now?", "key--today"),
       line("pred", "Prediction", "Where is it " + when + "?", "key--pred")];

  // the two ends of the scale, named once above the lines
  const ends = el("div", "line line--ends");
  const poles = el("div", "poles");
  poles.append(el("span", "", ax.l), el("span", "", ax.r));
  ends.append(el("div"), poles);
  const board = el("div", "lines");
  board.append(isTime ? "" : ends, ...lines.map(l => l.row));

  mount(stack("stack--l wide",
    isTime ? head(0, "Before the questions", ax.ask || ax.q) : head(a + 1, "Question " + (a + 1) + " of " + B.axes.length, ax.q),
    board, actions));

  function paint() {
    lines.forEach(l => l.paintLine());
    next.disabled = !lines.every(l => l.get() != null);
    next.textContent = isTime ? "Start: question 1" : a < B.axes.length - 1 ? "Next question" : "Next: last step";
  }
  // number keys: fill the first empty line, then change the last one
  const pick = i => {
    if (i > (isTime ? B.time.labels.length : B.steps)) return;
    const l = lines.find(x => x.get() == null) || lines[lines.length - 1];
    l.set(i); paint();
  };
  return { paint, pick };
}

// A row of large choices; one is chosen. options: [[value, label], ...]. An optional row can
// be un-chosen by tapping the chosen one again.
function choices(labelText, options, current, onPick, optional) {
  const box = el("div", "stack stack--s");
  const group = el("div", "choices");
  group.setAttribute("role", "radiogroup");
  group.setAttribute("aria-label", labelText);
  const buttons = options.map(([value, text]) => {
    const b = el("button", "choice", text);
    b.type = "button";
    b.setAttribute("role", "radio");
    b.addEventListener("click", () => { current = optional && current === value ? null : value; paint(); onPick(current); });
    group.appendChild(b);
    return { b, value };
  });
  const paint = () => buttons.forEach(o => o.b.setAttribute("aria-checked", o.value === current ? "true" : "false"));
  paint();
  box.append(el("div", "mid", labelText), group);
  return box;
}

// ---- the last step: consent (required), a reason and a tip of data (both optional) -----
function lastScreen() {
  const field = (id, labelText, max, value) => {
    const f = el("div", "field");
    const l = el("label", "", labelText); l.htmlFor = id;
    const i = el("input"); i.type = "text"; i.id = id; i.maxLength = max; i.value = value || ""; i.autocomplete = "off";
    f.append(l, i);
    return { f, i };
  };
  const because = field("w-because", "I predict this because (one line, if you like)", 120, state.because);
  const paper = field("w-paper", "Paper card number, if you hold one", 3, state.paper);
  paper.i.inputMode = "numeric";
  const keep = () => { state.because = because.i.value; state.paper = paper.i.value; };

  const give = button("Donate my view", "btn", "", () => { keep(); donate(); });
  const hint = el("p", "note");
  const ready = () => {
    give.disabled = state.consent == null;
    hint.textContent = state.consent == null ? "Answer the consent question to donate."
      : state.consent ? "Ready. Shown without your name: there is no name to show."
      : "Ready. Your view still counts at the booth; it will not appear in the publication.";
  };
  const actions = el("div", "actions");
  actions.append(give, button("Back", "linkbtn", "back", () => { keep(); go(pos - 1); }));
  ready();

  mount(stack("stack--l wide",
    head(STEPS, "Last step", "Consent, then donate"),
    stack("",
      el("p", "lead", "A photo of my card, my marks and my words may be shown, without my name, in a master's research publication."),
      choices("Your consent", [[true, "Yes, they may be shown"], [false, "No, keep them out of the publication"]], state.consent, v => { state.consent = v; ready(); })),
    stack("form", because.f),
    stack("",
      stack("stack--s", el("div", "kicker", "Optional"), el("h2", "big big--s", "Tip your data"),
        el("p", "muted", "Like a tip on a bill: one more answer, only if you want to give it. It helps read the cards together.")),
      choices(B.lived.q, B.lived.options, state.lived, v => { state.lived = v; }, true)),
    stack("form", paper.f),
    stack("stack--s", el("p", "note", "The booth keeps your marks, your consent answer, and whatever you add here. Never your name or a contact detail: please leave them out."), hint),
    actions));
}

function donate() {
  if (!complete(state) || state.consent == null) { go(0); return; }
  const no = parseInt(state.paper, 10);
  const saved = add({ ...state, no: Number.isInteger(no) && no > 0 ? no : null });
  const card = saved || { ...state, at: new Date().toISOString() };
  state = fresh();
  showResult(card, saved ? { saved: true } : { saved: false, label: "NOT SAVED", title: "Your view", note: "This browser refused to save the answer, so it is shown once and not kept." });
}

// ---- the receipt: its own screen, one unbroken strip ---------------------------------
function presetChips(active) {
  const chips = el("div", "chips");
  B.presets.forEach((pr, k) => {
    const c = el("button", "chip", pr.name);
    c.type = "button";
    c.setAttribute("aria-pressed", k === active ? "true" : "false");
    c.addEventListener("click", () => usePreset(k));
    chips.appendChild(c);
  });
  return chips;
}

function showResult(card, meta) {
  view = null;
  const pad3 = n => String(n).padStart(3, "0");
  const copyBox = el("input"); copyBox.type = "checkbox"; copyBox.checked = pref.get("booth-copy", "0") === "1";
  const copy = el("label", "tick small");
  copy.append(copyBox, el("span", "", "Also print the booth's copy for the roll"));

  const paper = el("div", "paper");
  const fill = () => {
    const parts = receiptParts(card, { label: meta.saved ? null : (meta.label || "EXAMPLE - NOT SAVED"), boothCopy: copyBox.checked });
    paper.textContent = "";
    paper.appendChild(receiptView(parts));
    armPrint(parts.map(p => p.t));
  };
  copyBox.addEventListener("change", () => { pref.set("booth-copy", copyBox.checked ? "1" : "0"); fill(); });
  fill();

  const again = () => {
    if (meta.saved) { location.href = "index.html"; return; }     // next visitor: back to the landing page
    state = fresh(); history.replaceState(null, "", location.pathname); go(0);
  };
  const actions = el("div", "actions");
  if (meta.saved) actions.append(button("Print receipt", "btn", "print", () => window.print()), button("Next visitor: start again", "linkbtn", "", again));
  else actions.append(button("Answer yourself", "btn", "next", again), button("Print this receipt", "linkbtn", "print", () => window.print()));
  const see = meta.preset != null ? link("scenarios.html", "All scenarios") : link("index.html#explore", "See all cards");
  see.className = "linkbtn";
  actions.append(see);

  const top = meta.saved
    ? stack("", stack("stack--s", el("div", "kicker", "Donated, No " + pad3(card.no)), el("h1", "big", "Thank you. Here is your receipt.")), actions)
    : stack("", stack("stack--s", el("div", "kicker", "Example, not saved"), el("h1", "big", meta.title)),
        el("p", "lead", meta.note), meta.preset != null ? presetChips(meta.preset) : null, actions);
  mount(stack("stack--l", top, stack("stack--s", paper, copy)));
}

function usePreset(k) {
  const pr = B.presets[k];
  if (!pr) return;
  const years = 2;
  const mid = Math.ceil(B.steps / 2);
  showResult({ today: [mid, mid, mid, mid], prediction: pr.pred.slice(), years, at: new Date().toISOString() },
    { saved: false, preset: k, title: pr.name,
      note: "A scenario shown as a receipt: today sits in the middle of every scale, the prediction is this scenario, " + B.time.phrases[years - 1] + "." +
        (pr.text ? " From the zine: " + pr.text : "") });
}

// ---- keys (quiet helpers): Enter = the main action, Esc = back, 1-5 = choose a step ----
document.addEventListener("keydown", e => {
  if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
  const inField = e.target instanceof Element && e.target.matches("input, textarea, select");
  const press = role => { const b = screen.querySelector('[data-role="' + role + '"]:not([disabled])'); if (b) { e.preventDefault(); b.click(); } };
  if (e.key === "Escape") press("back");
  if (inField) return;
  if (e.key === "Enter" && !(e.target instanceof Element && e.target.closest("button, a"))) press("next");
  if (/^[1-9]$/.test(e.key) && view) { e.preventDefault(); view.pick(parseInt(e.key, 10)); }
});

// ?m=232344532 opens an answer without saving it: four digits for today, four for the
// prediction, one for the step on the time frame (each 1 to 5). ?preset=3 opens a ready-made answer.
const qs = new URLSearchParams(location.search);
const digits = (qs.get("m") || "").replace(/[^1-9]/g, "").split("").map(Number);
if (digits.length === 9 && digits.slice(0, 8).every(v => v <= B.steps) && digits[8] <= B.time.labels.length) {
  showResult({ today: digits.slice(0, 4), prediction: digits.slice(4, 8), years: digits[8], at: new Date().toISOString() },
    { saved: false, title: "An answer from a link", note: "Opened from a link. Nothing is saved." });
} else if (qs.get("preset") !== null && B.presets[parseInt(qs.get("preset"), 10)]) {
  usePreset(parseInt(qs.get("preset"), 10));
} else render();
