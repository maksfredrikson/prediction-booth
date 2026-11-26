// The landing page's Explore part: the field (how many people chose each step, as a mirrored bar chart per question)
// and the roll (every card in order of arrival, each as a few receipt lines).
import { BOOTH as B } from "./content.js";
import { compose, titleOf } from "./compose.js";
import { el, legend, rowNames } from "./dots.js";
import { patternNamed, poles, stepSentence, stepLabels } from "./pattern.js";
import { load, loadEmails, exportFile, importFile, clear, pref } from "./store.js";
import { INVENTED } from "./invented.js";
import { receiptLines, armPrint, disarmPrint, marksRow, yearsRows, wrap, W } from "./receipt.js";

const $ = id => document.getElementById(id);
const pad3 = n => String(n).padStart(3, "0");
const people = n => n + (n === 1 ? " person" : " people");
const showBox = $("show-invented");
showBox.checked = pref.get("show-invented", "1") === "1";

let real = [];
let cards = [];

function refresh() {
  real = load();
  cards = [...(showBox.checked ? INVENTED : []), ...real];
  const counts = $("counts");
  counts.textContent = "";
  counts.append(real.length === 0 ? "No real cards yet. " : real.length + (real.length === 1 ? " real card. " : " real cards. "));
  if (showBox.checked) counts.append(el("span", "tag", "invented"), " " + INVENTED.length + " cards are made up, so the page is not empty before the booth has visitors.");
  periods();
  field();
  roll();
}

// ---- "How soon" is the way through Explore: all cards, or one time frame ------------
let period = 0;   // 0 = all cards, 1-5 = a step on the time frame
const shown = () => (period ? cards.filter(c => c.years === period) : cards);
const mean = (list, f) => (list.length ? list.reduce((s, c) => s + f(c), 0) / list.length : 0);
const signed = v => (v > 0.04 ? "+" : v < -0.04 ? "-" : "") + Math.abs(v).toFixed(1);

function periods() {
  const box = $("periods");
  box.textContent = "";
  if (period && !cards.some(c => c.years === period)) period = 0;
  const chip = (k, text, n) => {
    const b = el("button", "chip", text + "  " + n);
    b.type = "button";
    b.setAttribute("aria-pressed", k === period ? "true" : "false");
    b.disabled = n === 0;
    b.addEventListener("click", () => { period = k; periods(); field(); roll(); });
    box.appendChild(b);
  };
  chip(0, "All", cards.length);
  B.time.labels.forEach((l, k) => chip(k + 1, k === 0 ? "Now" : k === B.time.labels.length - 1 ? "Never" : l + " years", cards.filter(c => c.years === k + 1).length));
  const n = shown().length;
  $("period-note").textContent = period
    ? "Showing " + n + " of " + cards.length + " cards: predictions for " + B.time.phrases[period - 1] + "."
    : "Showing all " + cards.length + " cards. Choose a time frame to see how near and far predictions differ.";
}

// ---- the field: per question, bars up for today and bars down for the prediction ----
function field() {
  const box = $("field");
  box.textContent = "";
  const list = shown();
  if (!list.length) { box.append(el("p", "muted", "No cards to show. Answer the survey, or switch the invented cards on.")); return; }
  const counts = B.axes.map(() => Array.from({ length: B.steps }, () => ({ t: 0, p: 0 })));
  list.forEach(c => {
    c.today.forEach((v, a) => counts[a][v - 1].t++);
    c.prediction.forEach((v, a) => counts[a][v - 1].p++);
  });
  const max = Math.max(1, ...counts.flat().map(x => Math.max(x.t, x.p)));

  counts.forEach((cells, r) => {
    const chart = el("div", "chart");
    const name = el("div", "chart__name", (r + 1) + " " + rowNames[r]);
    const bars = el("div", "bars");
    bars.style.setProperty("--n", cells.length);
    const cap = el("div", "chart__cap");
    cap.setAttribute("aria-live", "polite");
    // what the group does on this question, and how that differs from all cards
    const t = mean(list, c => c.today[r]), p = mean(list, c => c.prediction[r]);
    const all = mean(cards, c => c.prediction[r] - c.today[r]);
    const summary = () => {
      cap.textContent = "";
      cap.append(el("b", "", "On average: today " + t.toFixed(1) + ", prediction " + p.toFixed(1) + ", a move of " + signed(p - t) + " steps."));
      if (period) cap.append(document.createElement("br"), "All cards together move " + signed(all) + ".");
    };
    cells.forEach((x, k) => {
      const b = el("button", "bcell");
      b.type = "button";
      b.setAttribute("aria-label", "Step " + (k + 1) + ": today " + x.t + ", prediction " + x.p);
      const up = el("span", "bup"), down = el("span", "bdown");
      if (x.t > 0) { const i = el("i"); i.style.setProperty("--s", x.t / max); up.append(el("b", "", String(x.t)), i); }
      if (x.p > 0) { const i = el("i"); i.style.setProperty("--s", x.p / max); down.append(i, el("b", "", String(x.p))); }
      b.append(up, down);
      const show = () => {
        const on = b.classList.contains("is-on");
        bars.querySelectorAll(".is-on").forEach(n => n.classList.remove("is-on"));
        if (on) { summary(); return; }   // tapping the chosen step again brings the average back
        b.classList.add("is-on");
        cap.textContent = "";
        cap.append(el("b", "", "Step " + (k + 1) + ": " + stepSentence(r, k + 1)), document.createElement("br"),
          "Today: " + people(x.t) + ". Prediction: " + people(x.p) + ".");
      };
      b.addEventListener("click", show);
      bars.appendChild(b);
    });
    const nums = el("div", "bnums");
    nums.style.setProperty("--n", cells.length);
    stepLabels(r).forEach(l => nums.appendChild(el("span", "", l)));
    summary();
    chart.append(name, bars, nums, poles(r), cap);
    box.appendChild(chart);
  });
}

// ---- the roll: a few receipt lines per card ------------------------------------
function roll() {
  const box = $("roll");
  box.textContent = "";
  const list = shown();
  if (!list.length) { box.append(el("p", "muted", "The roll is empty.")); return; }
  list.forEach(c => {
    const b = el("button", "rollcard");
    b.type = "button";
    const lines = [c.invented ? "INVENTED" : "No " + pad3(c.no || 0), ...wrap(titleOf(c), W), "",
      ...c.today.map((t, a) => marksRow(t, c.prediction[a])), ...yearsRows(c)];
    b.textContent = lines.join("\n");
    b.setAttribute("aria-label", (c.invented ? "Invented card: " : "Card " + (c.no || "") + ": ") + titleOf(c));
    b.addEventListener("click", () => open(c));
    box.appendChild(b);
  });
}

const dialog = $("card");
function open(c) {
  const text = compose(c);
  dialog.textContent = "";
  const head = el("div", "dialog-head");
  const title = el("div", "stack stack--s");
  const kicker = el("div", "kicker");
  if (c.invented) kicker.append(el("span", "tag", "invented"), " not a real visitor");
  else kicker.textContent = "No " + pad3(c.no || 0);
  const h = el("h2", "big", titleOf(c));
  h.id = "card-title";
  title.append(kicker, h);
  if (c.because) title.append(el("p", "muted", "Because: " + c.because));
  const wish = c.wish && B.wish.options.find(o => o[0] === c.wish);
  if (wish) title.append(el("p", "muted", B.wish.q + " " + wish[1] + "."));
  const close = el("button", "btn btn--plain btn--s", "Close");
  close.type = "button";
  close.addEventListener("click", () => dialog.close());
  head.append(title, close);

  const top = el("section", "sec");
  top.append(head);
  const scen = el("section", "sec text");
  scen.append(el("p", "", text.today), el("p", "", text.prediction), el("p", "", (text.priceLead ? text.priceLead + " " : "") + text.price));
  const pat = el("section", "sec stack");
  const rows = el("div");
  rows.append(patternNamed(c));
  pat.append(legend(), rows);
  dialog.append(top, scen, pat);
  if (!c.invented) {
    const print = el("button", "btn btn--s", "Print receipt");
    print.type = "button";
    print.addEventListener("click", () => { armPrint(receiptLines(c, { boothCopy: pref.get("booth-copy", "0") === "1" })); window.print(); });
    const last = el("section", "sec");
    last.append(print);
    dialog.append(last);
  }
  dialog.showModal();
  dialog.scrollTop = 0;
}
dialog.addEventListener("close", disarmPrint);
dialog.addEventListener("click", e => { if (e.target === dialog) dialog.close(); });

// ---- data ------------------------------------------------------------------
const status = t => { $("data-status").textContent = t; };
showBox.addEventListener("change", () => { pref.set("show-invented", showBox.checked ? "1" : "0"); refresh(); });
$("export").addEventListener("click", () => {
  if (!real.length && !loadEmails().length) { status("There are no real cards or emails here to save yet. The invented ones are not saved."); return; }
  const n = exportFile();
  status(n + (n === 1 ? " card" : " cards") + " and " + loadEmails().length + " email addresses saved to a file in your downloads.");
});
$("import").addEventListener("click", () => $("import-file").click());
$("import-file").addEventListener("change", async e => {
  const file = e.target.files[0];
  e.target.value = "";
  if (!file) return;
  try {
    const { added, skipped } = await importFile(file);
    status(added + " added" + (skipped ? ", " + skipped + " skipped (already here, or not a valid card)" : "") + ".");
    refresh();
  } catch (err) { status("That file could not be read as cards. " + (err.message || "")); }
});
$("clear").addEventListener("click", () => {
  if (!real.length && !loadEmails().length) { status("There are no real cards or emails here."); return; }
  if (!confirm("Delete all " + real.length + " real cards and " + loadEmails().length + " email addresses kept on this device? This cannot be undone. Save them to a file first if you need them.")) return;
  clear();
  status("Deleted.");
  refresh();
});

// the save and add-from-file tools are for the booth: they show only at index.html#data
const tools = () => { $("data").hidden = location.hash !== "#data"; };
window.addEventListener("hashchange", tools);
tools();

refresh();
