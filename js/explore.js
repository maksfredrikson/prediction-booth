// Explore: the field (how many people chose each step, as a mirrored bar chart per question)
// and the roll (every card in order of arrival, as one long receipt strip in the left column).
import { BOOTH as B } from "./content.js";
import { compose } from "./compose.js";
import { el, legend, rowNames } from "./dots.js";
import { patternNamed, poles, stepSentence } from "./pattern.js";
import { load, exportFile, importFile, clear, pref } from "./store.js";
import { INVENTED } from "./invented.js";
import { receiptLines, armPrint, disarmPrint, marksRow, wrap, W, NUMS_ROW, center32, rule32 } from "./receipt.js";

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
  const counts = rowNames.map(() => Array.from({ length: 7 }, () => ({ t: 0, p: 0 })));
  cards.forEach(c => {
    c.today.forEach((v, a) => counts[a][v - 1].t++);
    c.prediction.forEach((v, a) => counts[a][v - 1].p++);
    counts[4][c.years - 1].p++;
  });
  const max = Math.max(1, ...counts.flat().map(x => Math.max(x.t, x.p)));

  counts.forEach((cells, r) => {
    const row = el("div", "prow");
    const name = el("div", "prow__name", (r + 1) + " " + rowNames[r]);
    const bars = el("div", "bars" + (r === 4 ? " bars--time" : ""));
    cells.forEach((x, k) => {
      const b = el("button", "bcell");
      b.type = "button";
      b.setAttribute("aria-label", "Step " + (k + 1) + ": " + (r === 4 ? "" : "today " + x.t + ", ") + "prediction " + x.p);
      const up = el("span", "bup"), down = el("span", "bdown");
      if (r !== 4 && x.t > 0) { const i = el("i"); i.style.setProperty("--s", x.t / max); up.append(el("b", "", String(x.t)), i); }
      if (x.p > 0) { const i = el("i"); i.style.setProperty("--s", x.p / max); down.append(i, el("b", "", String(x.p))); }
      b.append(up, down);
      const show = () => { box.querySelectorAll(".is-on").forEach(n => n.classList.remove("is-on")); b.classList.add("is-on"); describe(r, k + 1, x); };
      b.addEventListener("mouseenter", show);
      b.addEventListener("focus", show);
      b.addEventListener("click", show);
      bars.appendChild(b);
    });
    const nums = el("div", "bnums");
    for (let i = 1; i <= 7; i++) nums.appendChild(el("span", "", String(i)));
    row.append(name, bars, nums, poles(r));
    box.appendChild(row);
  });

  const d = $("field-desc");
  d.textContent = "";
  d.append(el("p", "", cards.length ? "Touch a step to read what it stands for and how many chose it." : "No cards to show. Answer the survey, or switch the invented cards on."));
}

function describe(r, step, x) {
  const d = $("field-desc");
  d.textContent = "";
  d.append(el("div", "desc__step", "Row " + (r + 1) + ", step " + step + " of 7"));
  d.append(el("p", "", stepSentence(r, step)));
  d.append(el("p", "", r === 4 ? "Predicted by " + people(x.p) + "." : "Today: " + people(x.t) + ". Prediction: " + people(x.p) + "."));
}

// ---- the roll: one long strip, a few lines per card ----------------------------
function roll() {
  const side = $("side");
  side.textContent = "";
  const strip = el("div", "receipt");
  const line = (t, cls) => strip.appendChild(el("span", "rl" + (cls ? " " + cls : ""), t));
  line(rule32("="));
  line(center32("THE ROLL"));
  line(center32("every card, in order of arrival"));
  line(rule32("="));
  line("( ) today  * prediction");
  line(NUMS_ROW);
  if (!cards.length) { line(rule32("-")); line("The roll is empty."); }
  cards.forEach(c => {
    line(rule32("-"));
    const b = el("button", "rrow");
    b.type = "button";
    const add = t => b.appendChild(el("span", "rl", t));
    add(c.invented ? "INVENTED" : "No " + pad3(c.no || 0));
    wrap('"' + (c.name || "Unnamed") + '"', W).forEach(add);
    c.today.forEach((t, a) => add(marksRow(t, c.prediction[a])));
    add(marksRow(null, c.years));
    b.addEventListener("click", () => open(c));
    strip.appendChild(b);
  });
  line(rule32("="));
  side.appendChild(strip);
  $("side-title").textContent = "The roll, " + cards.length + (cards.length === 1 ? " card" : " cards");
}

const dialog = $("card");
function open(c) {
  const text = compose(c);
  dialog.textContent = "";
  const head = el("div", "dialog-head");
  const title = el("div", "stack stack--s");
  const eyebrow = el("div", "");
  if (c.invented) eyebrow.append(el("span", "tag", "invented"), " not a real visitor");
  else eyebrow.textContent = "No " + pad3(c.no || 0);
  const h = el("h2", "big", c.name || "Unnamed");
  h.id = "card-title";
  title.append(eyebrow, h);
  if (c.because) title.append(el("p", "", "Because: " + c.because));
  const close = el("button", "btn btn--plain", "Close");
  close.type = "button";
  close.addEventListener("click", () => dialog.close());
  head.append(title, close);

  const scen = el("section", "sec text");
  scen.append(el("p", "", text.today), el("p", "", text.prediction), el("p", "", (text.priceLead ? text.priceLead + " " : "") + text.price));
  const pat = el("section", "sec");
  pat.append(legend(), patternNamed(c));
  const top = el("section", "sec");
  top.append(head);
  dialog.append(top, scen, pat);
  if (!c.invented) {
    const print = el("button", "btn", "Print receipt");
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

refresh();
