// The receipt: 32 characters per line, plain ASCII, so it survives a raw 58 mm thermal printer.
// The same lines are shown on screen and sent to the browser's print dialog.
import { BOOTH as B } from "./content.js";
import { compose, complete, list } from "./compose.js";

export const W = 32;

export function ascii(s) {
  return String(s)
    .replace(/[‘’‚′]/g, "'").replace(/[“”„″]/g, '"')
    .replace(/[–—−]/g, "-").replace(/…/g, "...").replace(/→/g, "->")
    .replace(/·/g, "-").replace(/ß/g, "ss")
    .normalize("NFKD").replace(/[̀-ͯ]/g, "")
    .replace(/[^\x20-\x7E]/g, "?");
}

export function wrap(text, width = W, indent = "") {
  const out = [];
  let line = "";
  const lead = () => (out.length ? indent : "");
  ascii(text).split(/\s+/).filter(Boolean).forEach(word => {
    for (;;) {
      const start = line === "" ? lead() : line + " ";
      if ((start + word).length <= width) { line = start + word; break; }
      if (line !== "") { out.push(line); line = ""; continue; }
      const room = width - lead().length;   // one word longer than the line: cut it
      out.push(lead() + word.slice(0, room));
      word = word.slice(room);
      if (!word) break;
    }
  });
  if (line) out.push(line);
  return out;
}

const center = s => " ".repeat(Math.max(0, Math.floor((W - s.length) / 2))) + s;
const rule = ch => ch.repeat(W);
const lr = (l, r) => l + " ".repeat(Math.max(1, W - l.length - r.length)) + r;
const pad3 = n => String(n).padStart(3, "0");
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const when = iso => {
  const d = iso ? new Date(iso) : new Date();
  const p = n => String(n).padStart(2, "0");
  return d.getDate() + " " + MONTHS[d.getMonth()] + " " + d.getFullYear() + " " + p(d.getHours()) + ":" + p(d.getMinutes());
};

// One row of seven: ( ) today, * prediction, (*) both on the same step.
export function marksRow(today, pred) {
  let s = "  ";
  for (let i = 1; i <= 7; i++) s += today === i && pred === i ? "(*) " : today === i ? "( ) " : pred === i ? " *  " : " .  ";
  return s.trimEnd();
}
const NUMS = "   1   2   3   4   5   6   7";

export const NUMS_ROW = NUMS;
export const center32 = s => center(s);
export const rule32 = ch => rule(ch);
export const lr32 = (l, r) => lr(l, r);

// The receipt as lines: [{ t: text, row: 0-4 when the line belongs to a row of marks }].
// card: a saved card, marks only, or an answer still being given (draft: true), where
// unmarked rows stay empty and the text grows as rows are marked.
export function receiptParts(card, opts = {}) {
  const done = complete(card);
  const text = done ? compose(card) : null;
  const P = [];
  const add = (t, row = null) => P.push({ t: String(t).slice(0, W), row });
  const all = (lines, row = null) => lines.forEach(l => add(l, row));

  add(rule("="));
  add(center(ascii(B.title).toUpperCase()));
  all(wrap(B.line, 26).map(center));
  add(rule("="));
  add("DONATION RECEIPT");
  if (opts.draft) add(lr("No ---", "not given yet"));
  else if (opts.label) { add(ascii(opts.label)); add(when(card.at)); }
  else add(lr("No " + pad3(card.no || 0), when(card.at)));
  if (card.name && !opts.draft) all(wrap('Name: "' + card.name + '"', W, "  "));
  add(rule("-"));
  add("MARKS   ( ) today  * prediction");
  add(NUMS);
  B.axes.forEach((ax, a) => {
    all(wrap((a + 1) + " " + ax.q, W, "  "), a);
    add(marksRow(card.today[a], card.prediction[a]), a);
  });
  all(wrap("5 " + B.time.q + " (years)", W, "  "), 4);
  add(marksRow(null, card.years), 4);
  add(NUMS);
  add(rule("-"));
  add("YOUR VIEW");
  if (text) {
    all(wrap(text.today));
    add("");
    all(wrap(text.prediction));
  } else {
    const got = card.today.map((v, a) => (v ? B.axes[a].steps[v - 1].t : null)).filter(Boolean);
    if (!got.length) all(wrap("Your text starts here with your first mark."));
    else all(wrap("You see " + B.place + " today as a country where " + (got.length === 4 ? list(got) + "." : got.join("; ") + " ...")));
  }
  add(rule("-"));
  add("PRICE");
  all(wrap(text ? text.price : "..."));
  if (opts.draft) { add(rule("=")); return P; }
  add(rule("-"));
  add("GIVEN");
  add("1 x view of today");
  add("1 x prediction");
  if (card.name) add("1 x name");
  if (card.because) all(wrap('1 x reason: "' + card.because + '"', W, "  "));
  add(lr("PAID", "EUR 0.00"));
  add("");
  add("KEPT BY THE BOOTH");
  all(wrap(opts.label ? "Nothing: this one is an example." : "Your marks, the name you gave them and your reason. Never your name."));
  add(rule("-"));
  add("TO KEEP TALKING");
  all(wrap("with someone whose card looks like yours or nothing like it:"));
  B.talk.forEach((q, i) => all(wrap((i + 1) + ". " + q, W, "   ")));
  add(rule("="));
  add(center("Thank you for your donation."));
  add(center("No money changed hands."));
  add(rule("="));
  if (opts.boothCopy) {
    add(""); add("- - - - - - cut here - - - - - -"); add("");
    add(lr("BOOTH COPY", opts.label ? "example" : "No " + pad3(card.no || 0)));
    if (card.name) all(wrap('"' + card.name + '"', W));
    add(NUMS);
    B.axes.forEach((_, a) => add(marksRow(card.today[a], card.prediction[a])));
    add(marksRow(null, card.years));
  }
  return P;
}

export const receiptLines = (card, opts = {}) => receiptParts(card, opts).map(p => p.t);

// The receipt on screen. With onRow, each row of marks is a button: the receipt is the navigation.
export function receiptView(parts, { active = null, onRow = null, canGo = () => true } = {}) {
  const box = document.createElement("div");
  box.className = "receipt";
  let group = null, groupRow = null;
  parts.forEach(p => {
    const line = document.createElement("span");
    line.className = "rl";
    line.textContent = p.t;
    if (p.row == null || !onRow) { group = null; groupRow = null; box.appendChild(line); return; }
    if (groupRow !== p.row) {
      group = document.createElement("button");
      group.type = "button";
      group.className = "rrow" + (p.row === active ? " is-now" : "");
      group.disabled = !canGo(p.row);
      if (p.row === active) group.setAttribute("aria-current", "step");
      const r = p.row;
      group.addEventListener("click", () => onRow(r));
      groupRow = p.row;
      box.appendChild(group);
    }
    group.appendChild(line);
  });
  return box;
}

// Puts the lines where the print stylesheet finds them, and sizes the page to the strip.
export function armPrint(lines) {
  let root = document.getElementById("print-root");
  if (!root) { root = document.createElement("pre"); root.id = "print-root"; root.setAttribute("aria-hidden", "true"); document.body.appendChild(root); }
  root.textContent = lines.join("\n");
  document.documentElement.classList.add("print-receipt");

  // Fit 32 characters into the 48 mm a 58 mm printer can print, whatever monospace font is installed.
  const probe = document.createElement("span");
  probe.style.cssText = "position:absolute;visibility:hidden;white-space:pre;font:100px Menlo,Consolas,'Courier New',monospace";
  probe.textContent = "0".repeat(W);
  document.body.appendChild(probe);
  const ratio = probe.getBoundingClientRect().width / (W * 100) || 0.6;
  probe.remove();
  const size = Math.min(2.6, 47.5 / (W * ratio));          // mm
  root.style.fontSize = size.toFixed(3) + "mm";
  const height = Math.ceil(lines.length * size * 1.25 + 3 + 10); // top padding and a feed to tear
  let st = document.getElementById("print-page");
  if (!st) { st = document.createElement("style"); st.id = "print-page"; document.head.appendChild(st); }
  st.textContent = "@page { size: 58mm " + height + "mm; margin: 0; }";
}

export function disarmPrint() {
  document.documentElement.classList.remove("print-receipt");
  const st = document.getElementById("print-page");
  if (st) st.textContent = "";
}
