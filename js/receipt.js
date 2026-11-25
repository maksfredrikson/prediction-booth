// The receipt: 32 characters per line, plain ASCII, so it survives a raw 58 mm thermal printer.
// The same lines are shown on screen and sent to the browser's print dialog.
import { BOOTH as B } from "./content.js";
import { compose, titleOf, moves } from "./compose.js";

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

// One row of marks: ( ) today, * prediction, (*) both on the same step. The cells are as
// wide as the 32 characters allow: six characters each for five steps.
function cells(n, glyph) {
  const w = Math.max(4, Math.floor(30 / n)), left = Math.floor((w - 3) / 2);
  let s = "  ";
  for (let i = 1; i <= n; i++) { const g = glyph(i); s += " ".repeat(left) + g + " ".repeat(Math.max(0, w - left - g.length)); }
  return s.trimEnd();
}
export function marksRow(today, pred, n = B.steps) {
  return cells(n, i => (today === i && pred === i ? "(*)" : today === i ? "( )" : pred === i ? " * " : " . "));
}
const labelsRow = labels => cells(labels.length, i => { const l = labels[i - 1]; return l.length === 1 ? " " + l + " " : l.length === 2 ? l + " " : l; });
const NUMS = labelsRow(Array.from({ length: B.steps }, (_, i) => String(i + 1)));
// the time frame: its row of marks, and its own labels underneath
export const yearsRows = card => [marksRow(null, card.years, B.time.labels.length), labelsRow(B.time.labels)];

// The receipt as lines: [{ t: text, s: section number, k: "total" for the total block }].
// card: a saved card, or marks only. opts.label replaces the number line for examples.
export function receiptParts(card, opts = {}) {
  const text = compose(card);
  const P = [];
  let sec = 0, kind = null;
  const add = t => P.push({ t: String(t).slice(0, W), s: sec, k: kind });
  const all = lines => lines.forEach(add);
  const cut = k => { sec++; kind = k || null; };

  add(rule("="));
  add(center(ascii(B.title).toUpperCase()));
  all(wrap(B.line, 26).map(center));
  add(rule("="));
  add("DONATION RECEIPT");
  if (opts.label) { add(ascii(opts.label)); add(when(card.at)); }
  else add(lr("No " + pad3(card.no || 0), when(card.at)));
  cut(); add(rule("-"));
  add("MARKS   ( ) today  * prediction");
  all(wrap(B.time.q + " (years)", W, "  "));
  all(yearsRows(card));
  add(NUMS);
  B.axes.forEach((ax, a) => {
    all(wrap((a + 1) + " " + ax.q, W, "  "));
    add(marksRow(card.today[a], card.prediction[a]));
  });
  add(NUMS);
  cut(); add(rule("-"));
  add("YOUR VIEW");
  all(wrap(text.today));
  add("");
  all(wrap(text.prediction));
  cut(); add(rule("-"));
  const d = moves(card);
  add(lr("MOVED", d.map((v, a) => (a + 1) + ":" + (v > 0 ? "+" + v : v === 0 ? " 0" : String(v))).join("  ")));
  if (text.priceLead) add(lr("DUE", B.time.phrases[card.years - 1]));
  cut("total"); add(rule("="));
  add("TOTAL");
  all(wrap(text.price));
  add(rule("="));
  cut();
  add("GIVEN");
  add("1 x view of today");
  add("1 x prediction");
  if (card.because) all(wrap('1 x reason: "' + card.because + '"', W, "  "));
  const lived = card.lived && B.lived.options.find(o => o[0] === card.lived);
  if (lived) {
    add("TIP (your data)");
    all(wrap("+ in the Netherlands: " + lived[1].toLowerCase(), W, "  "));
  }
  add(lr("PAID", "EUR 0.00"));
  add("");
  add("KEPT BY THE BOOTH");
  all(wrap(opts.label ? "Nothing: this one is an example." : "Your marks, your reason and any data you tipped. Never your name."));
  if (opts.mailed) all(wrap("Your email, kept apart from this card."));
  if (!opts.label && typeof card.consent === "boolean") {
    add("");
    add("CONSENT");
    all(wrap("A photo of my card, my marks and my words, shown without my name in a master's research publication:"));
    add(lr("", card.consent ? "YES" : "NO"));
  }
  cut(); add(rule("-"));
  add("TO KEEP TALKING");
  all(wrap("with someone whose card looks like yours or nothing like it:"));
  B.talk.forEach((q, i) => all(wrap((i + 1) + ". " + q, W, "   ")));
  cut(); add(rule("="));
  add(center("Thank you for your donation."));
  add(center("No money changed hands."));
  add(rule("="));
  if (opts.boothCopy) {
    cut(); add(""); add("- - - - - - cut here - - - - - -"); add("");
    add(lr("BOOTH COPY", opts.label ? "example" : "No " + pad3(card.no || 0)));
    all(wrap(titleOf(card), W));
    all(yearsRows(card));
    add(NUMS);
    B.axes.forEach((_, a) => add(marksRow(card.today[a], card.prediction[a])));
  }
  return P;
}

export const receiptLines = (card, opts = {}) => receiptParts(card, opts).map(p => p.t);

// The receipt on screen: one unbroken strip, the same lines as the print. The total is set bold.
export function receiptView(parts) {
  const box = document.createElement("div");
  box.className = "receipt";
  box.setAttribute("role", "document");
  box.setAttribute("aria-label", "Receipt");
  let group = null, cur = null;
  parts.forEach(p => {
    if (p.s !== cur) { group = document.createElement("div"); group.className = "rsec" + (p.k ? " rsec--" + p.k : ""); box.appendChild(group); cur = p.s; }
    const line = document.createElement("span");
    line.className = "rl";
    line.textContent = p.t;
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
