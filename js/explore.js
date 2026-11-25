// The landing page's Explore part: the field (how many people chose each step, as a mirrored bar chart per question)
// and the roll (every card in order of arrival, each as a few receipt lines).
import { BOOTH as B } from "./content.js";
import { compose, titleOf } from "./compose.js";
import { el, legend, rowNames } from "./dots.js";
import { patternNamed, poles, stepSentence, stepLabels } from "./pattern.js";
import { load, exportFile, importFile, clear, pref } from "./store.js";
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
  counts.append(real.length === 0 ? "No real cards in this browser yet. " : real.length + (real.length === 1 ? " real card" : " real cards") + " in this browser. ");
  if (showBox.checked) counts.append(el("span", "tag", "invented"), " " + INVENTED.length + " cards are made up, so the page is not empty before the booth has visitors.");
  field();
  roll();
}

// ---- the field: per question, bars up for today and bars down for the prediction ----
function field() {
  const box = $("field");
  box.textContent = "";
  if (!cards.length) { box.append(el("p", "muted", "No cards to show. Answer the survey, or switch the invented cards on.")); return; }
  const counts = rowNames.map((_, r) => Array.from({ length: stepLabels(r).length }, () => ({ t: 0, p: 0 })));
  cards.forEach(c => {
    c.today.forEach((v, a) => counts[a][v - 1].t++);
    c.prediction.forEach((v, a) => counts[a][v - 1].p++);
    counts[4][c.years - 1].p++;
  });
  const max = Math.max(1, ...counts.flat().map(x => Math.max(x.t, x.p)));

  counts.forEach((cells, r) => {
    const chart = el("div", "chart");
    const name = el("div", "chart__name", (r + 1) + " " + rowNames[r]);
    const bars = el("div", "bars" + (r === 4 ? " bars--time" : ""));
    bars.style.setProperty("--n", cells.length);
    const cap = el("div", "chart__cap");
    cap.setAttribute("aria-live", "polite");
    cells.forEach((x, k) => {
      const b = el("button", "bcell");
      b.type = "button";
      b.setAttribute("aria-label", "Step " + (k + 1) + ": " + (r === 4 ? "" : "today " + x.t + ", ") + "prediction " + x.p);
      const up = el("span", "bup"), down = el("span", "bdown");
      if (r !== 4 && x.t > 0) { const i = el("i"); i.style.setProperty("--s", x.t / max); up.append(el("b", "", String(x.t)), i); }
      if (x.p > 0) { const i = el("i"); i.style.setProperty("--s", x.p / max); down.append(i, el("b", "", String(x.p))); }
      b.append(up, down);
      const show = () => {
        bars.querySelectorAll(".is-on").forEach(n => n.classList.remove("is-on"));
        b.classList.add("is-on");
        cap.textContent = "";
        cap.append(el("b", "", (r === 4 ? "" : "Step " + (k + 1) + ": ") + stepSentence(r, k + 1)), document.createElement("br"),
          r === 4 ? "Predicted by " + people(x.p) + "." : "Today: " + people(x.t) + ". Prediction: " + people(x.p) + ".");
      };
      b.addEventListener("mouseenter", show);
      b.addEventListener("focus", show);
      b.addEventListener("click", show);
      bars.appendChild(b);
    });
    const nums = el("div", "bnums");
    nums.style.setProperty("--n", cells.length);
    stepLabels(r).forEach(l => nums.appendChild(el("span", "", l)));
    chart.append(name, bars, nums, poles(r), cap);
    box.appendChild(chart);
  });
}

// ---- the roll: a few receipt lines per card ------------------------------------
function roll() {
  const box = $("roll");
  box.textContent = "";
  if (!cards.length) { box.append(el("p", "muted", "The roll is empty.")); return; }
  cards.forEach(c => {
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
  if (!real.length) { status("There are no real cards here to save yet. The invented ones are not saved."); return; }
  const n = exportFile();
  status(n + (n === 1 ? " card" : " cards") + " saved to a file in your downloads.");
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
  if (!real.length) { status("There are no real cards here."); return; }
  if (!confirm("Delete all " + real.length + " real cards kept in this browser? This cannot be undone. Save them to a file first if you need them.")) return;
  clear();
  status("Deleted.");
  refresh();
});

// the ready-made answers open as example receipts on the survey page
B.presets.forEach((pr, k) => {
  const a = el("a", "chip", pr.name);
  a.href = "survey.html?preset=" + k;
  $("presets").appendChild(a);
});

refresh();
