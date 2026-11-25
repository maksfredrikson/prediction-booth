// The receipt: 32 characters per line, plain ASCII, so it survives a raw 58 mm thermal printer.
// The same lines are shown on screen and sent to the browser's print dialog.
import { BOOTH as B } from "./content.js";
import { compose } from "./compose.js";

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

function marksBlock(card) {
  const out = [];
  B.axes.forEach((ax, a) => {
    out.push(...wrap((a + 1) + " " + ax.q, W, "  "));
    out.push(marksRow(card.today[a], card.prediction[a]));
  });
  out.push(...wrap("5 " + B.time.q + " (years)", W, "  "));
  out.push(marksRow(null, card.years));
  return out;
}

// card: a saved card, or marks only. opts.label replaces the number line for examples.
export function receiptLines(card, opts = {}) {
  const text = compose(card);
  const L = [];
  L.push(rule("="));
  L.push(center(ascii(B.title).toUpperCase()));
  wrap(B.line, 26).forEach(l => L.push(center(l)));
  L.push(rule("="));
  L.push("DONATION RECEIPT");
  L.push(opts.label ? lr(ascii(opts.label), "") : lr("No " + pad3(card.no || 0), when(card.at)));
  if (opts.label) L.push(when(card.at));
  if (card.name) L.push(...wrap('Name: "' + card.name + '"', W, "  "));
  L.push(rule("-"));
  L.push("MARKS   ( ) today  * prediction");
  L.push(NUMS);
  L.push(...marksBlock(card));
  L.push(NUMS);
  L.push(rule("-"));
  L.push("YOUR VIEW");
  L.push(...wrap(text.today));
  L.push("");
  L.push(...wrap(text.prediction));
  L.push(rule("-"));
  L.push("PRICE");
  L.push(...wrap(text.price));
  L.push(rule("-"));
  L.push("GIVEN");
  L.push("1 x view of today");
  L.push("1 x prediction");
  if (card.name) L.push("1 x name");
  if (card.because) L.push(...wrap('1 x reason: "' + card.because + '"', W, "  "));
  L.push(lr("PAID", "EUR 0.00"));
  L.push("");
  L.push("KEPT BY THE BOOTH");
  L.push(...wrap("Your marks, the name you gave them and your reason. Never your name."));
  L.push(rule("-"));
  L.push("TO KEEP TALKING");
  L.push(...wrap("with someone whose card looks like yours or nothing like it:"));
  B.talk.forEach((q, i) => L.push(...wrap((i + 1) + ". " + q, W, "   ")));
  L.push(rule("="));
  L.push(center("Thank you for your donation."));
  L.push(center("No money changed hands."));
  L.push(rule("="));
  if (opts.boothCopy) {
    L.push("", "- - - - - - cut here - - - - - -", "");
    L.push(lr("BOOTH COPY", opts.label ? "example" : "No " + pad3(card.no || 0)));
    if (card.name) L.push(...wrap('"' + card.name + '"', W));
    L.push(NUMS);
    B.axes.forEach((_, a) => L.push(marksRow(card.today[a], card.prediction[a])));
    L.push(marksRow(null, card.years));
  }
  return L.map(l => l.slice(0, W));
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
