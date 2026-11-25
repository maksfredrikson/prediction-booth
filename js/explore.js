// Explore: the field (how many people chose each step) and the roll (every card in order).
import { BOOTH as B } from "./content.js";
import { compose } from "./compose.js";
import { el, patternMini, patternNamed, legend, rowNames } from "./dots.js";
import { load, exportFile, importFile, clear, pref } from "./store.js";
import { INVENTED } from "./invented.js";
import { receiptLines, armPrint, disarmPrint } from "./receipt.js";

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
  if (showBox.checked) {
    counts.append(el("span", "tag", "invented"), " " + INVENTED.length + " cards below are made up, so the page is not empty before the booth has visitors.");
  }
  field();
  roll();
}

// ---- the field -------------------------------------------------------------
function field() {
  const box = $("field");
  box.textContent = "";
  // counts[row][step-1] = { t, p }
  const counts = rowNames.map(() => Array.from({ length: 7 }, () => ({ t: 0, p: 0 })));
  cards.forEach(c => {
    c.today.forEach((v, a) => counts[a][v - 1].t++);
    c.prediction.forEach((v, a) => counts[a][v - 1].p++);
    counts[4][c.years - 1].p++;
  });
  const max = Math.max(1, ...counts.flat().map(x => Math.max(x.t, x.p)));
  const size = n => (n === 0 ? 0 : Math.max(0.16, Math.sqrt(n / max)));

  counts.forEach((cells, r) => {
    const row = el("div", "prow");
    const name = el("div", "prow__name");
    name.append(el("b", "", String(r + 1) + " "), document.createTextNode(rowNames[r]));
    const line = el("div", "field-row");
    cells.forEach((x, k) => {
      const b = el("button", "fcell");
      b.type = "button";
      b.setAttribute("aria-label", rowNames[r] + " Step " + (k + 1) + ": today " + x.t + ", prediction " + x.p);
      if (x.t === 0 && x.p === 0) b.appendChild(el("i", "f0"));
      if (x.t > 0) { const i = el("i", "ft"); i.style.setProperty("--s", size(x.t)); b.appendChild(i); }
      if (x.p > 0) { const i = el("i", "fp"); i.style.setProperty("--s", size(x.p)); b.appendChild(i); }
      const show = () => { box.querySelectorAll(".is-on").forEach(n => n.classList.remove("is-on")); b.classList.add("is-on"); describe(r, k + 1, x); };
      b.addEventListener("mouseenter", show);
      b.addEventListener("focus", show);
      b.addEventListener("click", show);
      line.appendChild(b);
    });
    row.append(name, line);
    box.appendChild(row);
  });
  const nums = el("div", "prow");
  const n = el("div", "field-nums");
  for (let i = 1; i <= 7; i++) n.appendChild(el("span", "", String(i)));
  nums.append(el("div"), n);
  box.appendChild(nums);

  const d = $("field-desc");
  d.textContent = "";
  d.append(el("p", "muted", cards.length ? "Touch a dot to read the step and how many chose it." : "No cards to show. Answer the survey, or switch the invented cards on."));
}

function describe(r, step, x) {
  const d = $("field-desc");
  d.textContent = "";
  const isTime = r === 4;
  d.append(el("div", "desc__step", "Row " + (r + 1) + " · step " + step + " of 7"));
  d.append(el("p", "", isTime ? "It gets there " + B.time.phrases[step - 1] + "." : "A country where " + B.axes[r].steps[step - 1].t + "."));
  d.append(el("p", "note", isTime ? "Predicted by " + people(x.p) + "." : "Today: " + people(x.t) + ". Prediction: " + people(x.p) + "."));
}

// ---- the roll --------------------------------------------------------------
function roll() {
  const box = $("roll");
  box.textContent = "";
  if (!cards.length) { box.append(el("p", "note", "The roll is empty.")); return; }
  cards.forEach(c => {
    const b = el("button", "rollcard");
    b.type = "button";
    const no = el("div", "rollcard__no");
    if (c.invented) no.append(el("span", "tag", "invented"));
    else no.textContent = "No " + pad3(c.no || 0);
    b.append(no, patternMini(c), el("div", "rollcard__name", c.name || "Unnamed"));
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
  const eyebrow = el("div", "eyebrow");
  if (c.invented) eyebrow.append(el("span", "tag", "invented"), " not a real visitor");
  else eyebrow.textContent = "No " + pad3(c.no || 0);
  const h = el("h2", "question", c.name || "Unnamed");
  h.id = "card-title";
  title.append(eyebrow, h);
  if (c.because) title.append(el("p", "muted", "Because: " + c.because));
  const close = el("button", "btn btn--quiet", "Close");
  close.type = "button";
  close.addEventListener("click", () => dialog.close());
  head.append(title, close);

  const body = el("div", "stack");
  body.style.marginTop = "24px";
  const pat = el("div");
  pat.append(legend(), patternNamed(c));
  const scen = el("div", "scenario");
  scen.append(el("p", "", text.today), el("p", "", text.prediction), el("p", "price", (text.priceLead ? text.priceLead + " " : "") + text.price));
  body.append(pat, scen);
  if (!c.invented) {
    const print = el("button", "btn", "Print receipt");
    print.type = "button";
    print.addEventListener("click", () => { armPrint(receiptLines(c, { boothCopy: pref.get("booth-copy", "0") === "1" })); window.print(); });
    body.append(print);
  }
  dialog.append(head, body);
  dialog.showModal();
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
