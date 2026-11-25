// Survey: one question per screen. Today, then the prediction, on the same scale;
// then the years, then a name and one line; then the result: pattern, text, receipt.
import { BOOTH as B } from "./content.js";
import { compose, complete } from "./compose.js";
import { el, patternMini, patternNamed, legend } from "./dots.js";
import { createScale } from "./scale.js";
import { add, pref } from "./store.js";
import { receiptLines, armPrint, disarmPrint } from "./receipt.js";

const screen = document.getElementById("screen");
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
function row(label, body, cls) {
  const r = el("section", "row " + (cls || ""));
  const l = el("div", "row__label"), b = el("div", "row__body");
  if (label) l.append(label);
  if (body) b.append(body);
  r.append(l, b);
  return r;
}
function button(text, cls, onClick) {
  const b = el("button", "btn " + (cls || ""), text);
  b.type = "button";
  b.addEventListener("click", onClick);
  return b;
}
function mount(...nodes) {
  screen.textContent = "";
  const s = el("div", "screen");
  s.append(...nodes);
  screen.appendChild(s);
  window.scrollTo(0, 0);
}
function progress(block) {
  const wrap = el("div", "stack stack--s");
  const bar = el("div", "progress");
  for (let i = 1; i <= 6; i++) bar.appendChild(el("i", i < block ? "done" : i === block ? "now" : ""));
  bar.setAttribute("role", "img");
  bar.setAttribute("aria-label", "Step " + block + " of 6");
  wrap.append(bar);
  return wrap;
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
  const example = { today: [3, 4, 3, 5], prediction: [5, 6, 3, 6], years: 3 };
  const mid = patternMini(example);
  mid.className = "pattern pattern--mini pattern--mid";
  const left = stack("stack--s start-example", el("div", "eyebrow", "One answer looks like this"), mid, legend());

  const start = button("Start", "btn--go", () => go(1));
  const actions = el("div", "actions");
  actions.append(start, el("span", "note", "About two minutes. No name, no money."));
  const right = stack("",
    el("h1", "title", B.line + "."),
    el("p", "lead", "Four questions about " + B.place + ". For each one you mark where the country is today and where you predict it is heading. Then you say how soon."),
    el("p", "lead", "You get your answer back as a pattern of dots, a short scenario text and a donation receipt."),
    actions
  );
  const hero = row(left, right, "row--plain row--hero");

  const look = row(el("div", "eyebrow", "Or look first"),
    stack("stack--s", el("p", "", "Open a ready-made answer. Nothing is saved."), presetChips(-1)));

  const what = el("p", "text");
  what.append(
    "Prediction Booth is a prototype for a conference booth and part of a design master's research into how patterns come to carry meaning. The scenario text is put together from sentences written in advance, not by AI. ",
    link("about.html#how", "How the text is made"), ". ", link("explore.html", "See all cards"), "."
  );
  mount(hero, look, row(el("div", "eyebrow", "What this is"), what));
}
function link(href, text) { const a = el("a", "", text); a.href = href; return a; }

// ---- a scale screen: one of the four questions, or the years --------------
function stepScreen(a) {
  const isTime = a === 4;
  const ax = isTime ? B.time : B.axes[a];
  let touched = null;

  const bar = progress(a + 1);
  const eyebrow = el("div", "eyebrow", isTime ? "How soon" : "Question " + (a + 1) + " of 4");
  const head = el("h2", "question", ax.q);
  const sofarBox = el("div", "stack stack--s sofar");
  const left = stack("", eyebrow, head, sofarBox);

  const tabs = el("div", "modes");
  tabs.setAttribute("role", "tablist");
  const tab = (mode, text, keyCls) => {
    const t = el("button", "mode");
    t.type = "button";
    t.setAttribute("role", "tab");
    t.append(el("i", "key " + keyCls), document.createTextNode(text));
    t.addEventListener("click", () => go(FLOW.findIndex(f => f.k === "step" && f.a === a && f.mode === mode)));
    return t;
  };
  const tabToday = tab("today", "Today", "key--today");
  const tabPred = tab("pred", "Prediction", "key--pred");
  if (!isTime) tabs.append(tabToday, tabPred);

  const prompt = el("p", "");
  const mode = () => FLOW[pos].mode;
  const get = m => (isTime ? state.years : (m === "pred" ? state.prediction : state.today)[a]);
  const scale = createScale({
    label: ax.q,
    onPick: i => {
      if (isTime) state.years = i;
      else (mode() === "pred" ? state.prediction : state.today)[a] = i;
      paint();
    },
    onTouch: i => { touched = i; paintDesc(); }
  });
  const poles = el("div", "poles");
  poles.append(el("span", "", ax.l), el("span", "", ax.r));
  const scaleBox = el("div");
  scaleBox.append(scale.el, poles);

  const desc = el("div", "desc");
  desc.setAttribute("aria-live", "polite");
  const back = button("Back", "btn--quiet", () => go(pos - 1));
  const next = button("Next", "btn--go", () => go(pos + 1));
  const actions = el("div", "actions");
  actions.append(back, next);

  const right = stack("", isTime ? null : tabs, prompt, scaleBox, desc, actions);
  mount(row(null, bar, "row--plain row--tight"), row(left, right, "row--plain"));

  function paintDesc() {
    const i = touched ?? get(mode());
    desc.textContent = "";
    if (i == null) { desc.append(el("p", "muted", "Touch a step to read what it stands for. The dot you choose grows.")); return; }
    const tagLine = el("div", "desc__step", "Step " + i + " of 7");
    if (!isTime && state.today[a] === i) tagLine.append(" · ", el("b", "", "today"));
    if (!isTime && state.prediction[a] === i) tagLine.append(" · ", el("b", "", "your prediction"));
    if (isTime && state.years === i) tagLine.append(" · ", el("b", "", "your prediction"));
    desc.append(tagLine, el("p", "", isTime ? "It gets there " + B.time.phrases[i - 1] + "." : "A country where " + ax.steps[i - 1].t + "."));
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
    next.disabled = get(m) == null;
    next.textContent = isTime ? "Next: name it" : m === "today" ? "Next: your prediction" : a < 3 ? "Next question" : "Next: how soon";
    sofarBox.textContent = "";
    sofarBox.append(el("div", "eyebrow", "Your pattern so far"), patternMini(state, a));
    paintDesc();
  }
  return { a, paint, focus: () => scale.focus() };
}

// ---- name and one line ----------------------------------------------------
function wordsScreen() {
  const bar = progress(6);
  const left = stack("", el("div", "eyebrow", "Last step"), el("h2", "question", "Name your prediction"),
    stack("stack--s sofar", el("div", "eyebrow", "Your pattern"), patternMini(state)));

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
  const paper = text("w-paper", "Holding a paper card? Its number (optional)", 3, state.paper);
  paper.i.inputMode = "numeric";

  const keep = () => { state.name = name.i.value; state.because = because.i.value; state.paper = paper.i.value; };
  const back = button("Back", "btn--quiet", () => { keep(); go(pos - 1); });
  const give = el("button", "btn btn--go", "Donate my view");
  give.type = "submit";
  const actions = el("div", "actions");
  actions.append(back, give);
  form.append(name.f, because.f, roleBox, ticks, paper.f,
    el("p", "note", "Please leave out your own name and contact details. The booth never keeps them."), actions);
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

  mount(row(null, bar, "row--plain row--tight"), row(left, form, "row--plain"));
  name.i.focus({ preventScroll: true });
}

// ---- result: pattern, scenario text, receipt -------------------------------
function showResult(card, meta) {
  view = null;
  const text = compose(card);
  const pad3 = n => String(n).padStart(3, "0");

  const headLeft = stack("stack--s",
    el("div", "eyebrow", meta.saved ? "Donated · No " + pad3(card.no) : "Example"),
    el("h1", "question", meta.saved ? (card.name ? "“" + card.name + "”" : "Your view of " + B.place) : meta.title));
  const headRight = stack("stack--s",
    el("p", "", meta.saved ? "Thank you. Here is your view as a pattern, a scenario text and a receipt. It is saved in this browser under No " + pad3(card.no) + "." : meta.note),
    card.because ? el("p", "muted", "Because: " + card.because) : null,
    meta.preset != null ? presetChips(meta.preset) : null);
  const head = row(headLeft, headRight, "row--plain");

  const pattern = el("section", "row");
  pattern.style.display = "block";
  const ph = el("div", "prow prow--head");
  ph.append(el("div", "eyebrow", "Pattern"), legend());
  pattern.append(ph, patternNamed(card));

  const scen = el("div", "scenario");
  scen.append(el("p", "", text.today), el("p", "", text.prediction));
  const price = el("p", "price", (text.priceLead ? text.priceLead + " " : "") + text.price);
  scen.append(price);
  if (meta.zine) scen.append(el("p", "zine", "From the zine: " + meta.zine));
  const scenario = row(el("div", "eyebrow", "Scenario"), scen);

  const pre = el("pre", "receipt");
  pre.setAttribute("aria-label", "Receipt");
  const copy = el("label", "tick small");
  const copyBox = el("input"); copyBox.type = "checkbox"; copyBox.checked = pref.get("booth-copy", "0") === "1";
  copy.append(copyBox, el("span", "", "Add the booth's copy for the roll"));
  const fill = () => {
    const lines = receiptLines(card, { label: meta.saved ? null : (meta.label || "EXAMPLE - NOT SAVED"), boothCopy: copyBox.checked });
    pre.textContent = lines.join("\n");
    armPrint(lines);
  };
  copyBox.addEventListener("change", () => { pref.set("booth-copy", copyBox.checked ? "1" : "0"); fill(); });
  fill();
  const print = button("Print receipt", "", () => window.print());
  const receipt = row(
    stack("stack--s", el("div", "eyebrow", "Receipt"), el("p", "note", "32 characters wide, for a 58 mm receipt printer. Any printer works: choose the narrow paper in the print dialog."), print, copy),
    pre);

  const again = button(meta.saved ? "Next visitor: start again" : "Answer yourself", "btn--go", () => { state = fresh(); history.replaceState(null, "", location.pathname); go(meta.saved ? 0 : 1); });
  const explore = link("explore.html", "See all cards"); explore.className = "btn";
  const actions = el("div", "actions");
  actions.append(again, explore);
  mount(head, pattern, scenario, receipt, row(null, actions));
}

function usePreset(k) {
  const pr = B.presets[k];
  if (!pr) return;
  showResult({ today: [4, 4, 4, 4], prediction: pr.pred.slice(), years: 3, at: new Date().toISOString() },
    { saved: false, preset: k, title: pr.name, zine: pr.text,
      note: "A ready-made answer. Today is set to the middle of every scale and the prediction to “" + pr.name + "”, three years from now. Nothing is saved." });
}

// ?m=343554653 opens an answer (today, prediction, years) without saving it; ?preset=3 opens a preset.
const qs = new URLSearchParams(location.search);
const digits = (qs.get("m") || "").replace(/[^1-7]/g, "").split("").map(Number);
if (digits.length === 9) {
  showResult({ today: digits.slice(0, 4), prediction: digits.slice(4, 8), years: digits[8], at: new Date().toISOString() },
    { saved: false, title: "An answer from a link", note: "Opened from a link. Nothing is saved." });
} else if (qs.get("preset") !== null && B.presets[parseInt(qs.get("preset"), 10)]) {
  usePreset(parseInt(qs.get("preset"), 10));
} else render();
