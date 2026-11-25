// Survey: one question per screen. Today, then the prediction, on the same scale;
// then the years, then a name and one line. The receipt in the left column fills in as
// the visitor answers and works as the navigation; at the end it is the result.
import { BOOTH as B } from "./content.js";
import { complete } from "./compose.js";
import { el, legend } from "./dots.js";
import { patternNamed } from "./pattern.js";
import { createScale } from "./scale.js";
import { add, pref } from "./store.js";
import { receiptParts, receiptView, armPrint, disarmPrint } from "./receipt.js";

const $ = id => document.getElementById(id);
const screen = $("screen"), side = $("side"), mainTitle = $("main-title"), keys = $("keys");
const fresh = () => ({
  today: [null, null, null, null], prediction: [null, null, null, null], years: null,
  name: "", because: "", role: null, livesNL: false, consent: false, paper: ""
});
let state = fresh();

// The order of screens. Each question is two stops on one screen: today, then prediction.
const FLOW = [{ k: "start" }];
B.axes.forEach((_, a) => FLOW.push({ k: "step", a, mode: "today" }, { k: "step", a, mode: "pred" }));
FLOW.push({ k: "step", a: 4, mode: "pred" }, { k: "words" });
let pos = 0;
let view = null;   // the scale screen now showing, kept while only the mode changes

// ---- small builders ----------------------------------------------------
const stack = (cls, ...nodes) => { const s = el("div", "stack " + (cls || "")); s.append(...nodes.filter(Boolean)); return s; };
const sec = (...nodes) => { const s = el("section", "sec stack stack--s"); s.append(...nodes.filter(Boolean)); return s; };
function link(href, text) { const a = el("a", "", text); a.href = href; return a; }

function mount(title, ...nodes) {
  mainTitle.textContent = title;
  screen.textContent = "";
  const s = el("div", "screen col");
  s.append(...nodes.filter(Boolean));
  screen.appendChild(s);
  screen.scrollTop = 0;
  if (matchMedia("(max-width: 860px)").matches) window.scrollTo(0, 0);
}

// The bar of keys under the panels: [{ label, on | href, kbd, go, disabled, role }]
function setKeys(list, hint) {
  keys.textContent = "";
  list.filter(Boolean).forEach(k => {
    const b = el(k.href ? "a" : "button", "fkey" + (k.go ? " fkey--go" : ""));
    if (k.href) b.href = k.href;
    else { b.type = "button"; b.disabled = !!k.disabled; b.addEventListener("click", k.on); }
    if (k.role) b.dataset.role = k.role;
    if (k.kbd) b.append(el("kbd", "", k.kbd));
    b.append(el("span", "", k.label));
    keys.appendChild(b);
  });
  if (hint) keys.appendChild(el("span", "hint", hint));
}

// The receipt column while answering: every row of marks is a way to that question.
const firstOpenRow = () => { const r = state.today.findIndex((v, a) => v == null || state.prediction[a] == null); return r === -1 ? 4 : r; };
const stopOf = (a, mode) => FLOW.findIndex(f => f.k === "step" && f.a === a && (a === 4 || f.mode === mode));
function paintSide(active) {
  side.textContent = "";
  side.appendChild(receiptView(receiptParts(state, { draft: true }), {
    active, canGo: r => r <= firstOpenRow(), onRow: r => go(stopOf(r, "today"))
  }));
}

function go(n) { pos = Math.max(0, Math.min(FLOW.length - 1, n)); render(); }

function render() {
  const f = FLOW[pos];
  if (f.k === "step" && view && view.a === f.a) { view.paint(); return; }
  view = null;
  disarmPrint();
  if (f.k === "start") startScreen();
  else if (f.k === "step") { view = stepScreen(f.a); view.paint(); }
  else wordsScreen();
}

// ---- start ---------------------------------------------------------------
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

function startScreen() {
  const hero = sec(
    el("h2", "big", B.line + "."),
    el("p", "", "Four questions about " + B.place + ". For each one you mark where the country is today and where you predict it is heading. Then you say how soon."),
    el("p", "", "You get your answer back as a donation receipt: your marks, a short scenario text and what your prediction costs. It fills in beside this column while you answer."),
    el("p", "", "About two minutes. No name, no money.")
  );
  const look = sec(el("h2", "sec__h", "Or look first"), el("p", "", "Open a ready-made answer. Nothing is saved."), presetChips(-1));
  const what = el("p", "");
  what.append(
    "Prediction Booth is a prototype for a conference booth and part of a design master's research into how patterns come to carry meaning. The scenario text is put together from sentences written in advance, not by AI. ",
    link("about.html#how", "How the text is made"), ". ", link("explore.html", "See all cards"), "."
  );
  mount("Survey", hero, look, sec(el("h2", "sec__h", "What this is"), what));
  setKeys([{ label: "Start", kbd: "Enter", go: true, role: "next", on: () => go(1) }], "or press a question in the receipt");
  paintSide(null);
}

// ---- a scale screen: one of the four questions, or the years --------------
function stepScreen(a) {
  const isTime = a === 4;
  const ax = isTime ? B.time : B.axes[a];
  let touched = null;

  const head = el("h2", "big", ax.q);
  const tabs = el("div", "modes");
  tabs.setAttribute("role", "tablist");
  const tab = (mode, text, keyCls) => {
    const t = el("button", "mode");
    t.type = "button";
    t.setAttribute("role", "tab");
    t.append(el("i", "key " + keyCls), document.createTextNode(text));
    t.addEventListener("click", () => go(stopOf(a, mode)));
    return t;
  };
  const tabToday = tab("today", "Today", "key--today");
  const tabPred = tab("pred", "Prediction", "key--pred");
  if (!isTime) tabs.append(tabToday, tabPred);

  const prompt = el("p", "");
  const mode = () => FLOW[pos].mode;
  const get = m => (isTime ? state.years : (m === "pred" ? state.prediction : state.today)[a]);
  const pick = i => {
    if (isTime) state.years = i;
    else (mode() === "pred" ? state.prediction : state.today)[a] = i;
    paint();
  };
  const scale = createScale({ label: ax.q, onPick: pick, onTouch: i => { touched = i; paintDesc(); } });
  const poles = el("div", "poles");
  poles.append(el("span", "", ax.l), el("span", "", ax.r));
  const scaleBox = el("div");
  scaleBox.append(scale.el, poles);

  const desc = el("div", "desc");
  desc.setAttribute("aria-live", "polite");
  mount(isTime ? "How soon" : "Question " + (a + 1) + " of 4", stack("", head, isTime ? null : tabs, prompt, scaleBox, desc));

  function paintDesc() {
    const i = touched ?? get(mode());
    desc.textContent = "";
    if (i == null) { desc.append(el("p", "", "Touch a step to read what it stands for. The dot you choose grows.")); return; }
    const is = [];
    if (!isTime && state.today[a] === i) is.push("today");
    if ((isTime ? state.years : state.prediction[a]) === i) is.push("your prediction");
    const tag = "Step " + i + " of 7" + (is.length ? ": " + is.join(" and ") : "");
    desc.append(el("div", "desc__step", tag), el("p", "", isTime ? "It gets there " + B.time.phrases[i - 1] + "." : "A country where " + ax.steps[i - 1].t + "."));
  }

  function paint() {
    const m = mode();
    if (!isTime) {
      tabToday.setAttribute("aria-selected", m === "today" ? "true" : "false");
      tabPred.setAttribute("aria-selected", m === "pred" ? "true" : "false");
      tabPred.disabled = state.today[a] == null;
    }
    prompt.textContent = isTime ? "How many years until your prediction is the country?" :
      m === "today" ? "Today: where is " + B.place + " now?" : "Your prediction: where is it heading?";
    scale.set(isTime ? { today: null, pred: state.years, mode: "pred" } : { today: state.today[a], pred: state.prediction[a], mode: m });
    setKeys([
      { label: "Back", kbd: "Esc", role: "back", on: () => go(pos - 1) },
      { label: isTime ? "Next: name it" : m === "today" ? "Next: your prediction" : a < 3 ? "Next question" : "Next: how soon",
        kbd: "Enter", go: true, role: "next", disabled: get(m) == null, on: () => go(pos + 1) }
    ], "1-7 choose a step");
    paintSide(a);
    paintDesc();
  }
  return { a, paint, pick };
}

// ---- name and one line ----------------------------------------------------
function wordsScreen() {
  const form = el("form", "stack");
  form.noValidate = true;
  const text = (id, labelText, max, value) => {
    const f = el("div", "field");
    const l = el("label", "", labelText); l.htmlFor = id;
    const i = el("input"); i.type = "text"; i.id = id; i.maxLength = max; i.value = value || ""; i.autocomplete = "off";
    f.append(l, i);
    return { f, i };
  };
  const name = text("w-name", "Give your prediction a name", 40, state.name);
  const because = text("w-because", "I predict this because", 120, state.because);

  const roleBox = el("div", "field");
  roleBox.setAttribute("role", "radiogroup");
  roleBox.append(el("div", "legend", "I work as"));
  const roles = el("div", "ticks-inline");
  ["designer", "engineer", "other"].forEach(r => {
    const l = el("label", "tick");
    const i = el("input"); i.type = "radio"; i.name = "role"; i.value = r; i.checked = state.role === r;
    i.addEventListener("change", () => { state.role = r; });
    l.append(i, el("span", "", r));
    roles.appendChild(l);
  });
  roleBox.appendChild(roles);
  const tick = (labelText, key) => {
    const l = el("label", "tick");
    const i = el("input"); i.type = "checkbox"; i.checked = state[key];
    i.addEventListener("change", () => { state[key] = i.checked; });
    l.append(i, el("span", "", labelText));
    return l;
  };
  const ticks = stack("stack--s",
    tick("I live in the Netherlands.", "livesNL"),
    tick("My marks and my words may be shown, without my name, in a master's research publication.", "consent"));
  const paper = text("w-paper", "Paper card number, if you hold one", 3, state.paper);
  paper.i.inputMode = "numeric";

  const keep = () => { state.name = name.i.value; state.because = because.i.value; state.paper = paper.i.value; };
  form.append(el("h2", "big", "Name your prediction"), name.f, because.f, roleBox, ticks, paper.f,
    el("p", "muted", "Please leave out your own name and contact details. The booth never keeps them."));
  form.addEventListener("submit", e => {
    e.preventDefault();
    keep();
    if (!complete(state)) { go(1); return; }
    const no = parseInt(state.paper, 10);
    const saved = add({ ...state, no: Number.isInteger(no) && no > 0 ? no : null });
    const card = saved || { ...state, at: new Date().toISOString() };
    state = fresh();
    showResult(card, saved ? { saved: true } : { saved: false, label: "NOT SAVED", title: "Your view", note: "This browser refused to save the answer, so it is shown once and not kept." });
  });

  mount("Last step", form);
  setKeys([
    { label: "Back", kbd: "Esc", role: "back", on: () => { keep(); go(pos - 1); } },
    { label: "Donate my view", go: true, on: () => form.requestSubmit() }
  ]);
  paintSide(null);
  name.i.focus({ preventScroll: true });
}

// ---- result: the receipt in its column, the answer as dots beside it -------
function showResult(card, meta) {
  view = null;
  pos = 0;
  const pad3 = n => String(n).padStart(3, "0");
  const copyBox = el("input"); copyBox.type = "checkbox"; copyBox.checked = pref.get("booth-copy", "0") === "1";
  const copy = el("label", "tick");
  copy.append(copyBox, el("span", "", "Print the booth's copy for the roll under the receipt"));

  const fill = () => {
    const parts = receiptParts(card, { label: meta.saved ? null : (meta.label || "EXAMPLE - NOT SAVED"), boothCopy: copyBox.checked });
    side.textContent = "";
    side.appendChild(receiptView(parts));
    side.scrollTop = 0;
    armPrint(parts.map(p => p.t));
  };
  copyBox.addEventListener("change", () => { pref.set("booth-copy", copyBox.checked ? "1" : "0"); fill(); });
  fill();

  const head = meta.saved
    ? sec(el("h2", "big", "Thank you."), el("p", "", "Your view is donated and saved in this browser as No " + pad3(card.no) + ". The receipt holds your marks, your scenario text and the price of your prediction."))
    : sec(el("h2", "big", meta.title), el("p", "", meta.note), meta.preset != null ? presetChips(meta.preset) : null);
  const pattern = el("section", "sec");
  pattern.append(stack("stack--s", el("h2", "sec__h", "The same answer as dots"), legend()), patternNamed(card));
  const printing = sec(el("h2", "sec__h", "Printing"),
    el("p", "", "The receipt is 32 characters wide, for a 58 mm receipt printer. Any printer works: choose the narrow paper in the print dialog."), copy);

  mount(meta.saved ? "Donated, No " + pad3(card.no) : "Example, not saved", head, pattern, printing);
  const again = () => { state = fresh(); history.replaceState(null, "", location.pathname); go(meta.saved ? 0 : 1); };
  setKeys([
    { label: "Print receipt", kbd: "P", role: "print", on: () => window.print() },
    { label: meta.saved ? "Next visitor: start again" : "Answer yourself", kbd: "Enter", go: true, role: "next", on: again },
    { label: "See all cards", href: "explore.html" }
  ]);
}

function usePreset(k) {
  const pr = B.presets[k];
  if (!pr) return;
  showResult({ today: [4, 4, 4, 4], prediction: pr.pred.slice(), years: 3, at: new Date().toISOString() },
    { saved: false, preset: k, title: pr.name,
      note: "A ready-made answer. Today is set to the middle of every scale and the prediction to this preset, three years from now. Nothing is saved." +
        (pr.text ? " From the zine: " + pr.text : "") });
}

// ---- keys: Enter = next, Esc = back, 1-7 = choose a step, P = print --------
document.addEventListener("keydown", e => {
  if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
  const inField = e.target instanceof Element && e.target.matches("input, textarea, select");
  const press = role => { const b = keys.querySelector('[data-role="' + role + '"]:not([disabled])'); if (b) { e.preventDefault(); b.click(); } };
  if (e.key === "Escape") press("back");
  if (inField) return;
  if (e.key === "Enter" && !(e.target instanceof Element && e.target.closest("button, a"))) press("next");
  if (/^[1-7]$/.test(e.key) && view) { e.preventDefault(); view.pick(parseInt(e.key, 10)); }
  if ((e.key === "p" || e.key === "P")) press("print");
});

// ?m=343566374 opens an answer (today, prediction, years) without saving it; ?preset=3 opens a preset.
const qs = new URLSearchParams(location.search);
const digits = (qs.get("m") || "").replace(/[^1-7]/g, "").split("").map(Number);
if (digits.length === 9) {
  showResult({ today: digits.slice(0, 4), prediction: digits.slice(4, 8), years: digits[8], at: new Date().toISOString() },
    { saved: false, title: "An answer from a link", note: "Opened from a link. Nothing is saved." });
} else if (qs.get("preset") !== null && B.presets[parseInt(qs.get("preset"), 10)]) {
  usePreset(parseInt(qs.get("preset"), 10));
} else render();
