# Prediction Booth

Donate your view of the Netherlands. A visitor marks how they see the country today and where
they predict it is heading, on four questions with seven steps each, plus how many years it
will take. The site turns the answer into a pattern of dots, a short scenario text and a
donation receipt.

A plain static site: HTML, CSS and JavaScript modules. No framework, no build step, no server
code. Nothing is sent anywhere; answers stay in the visitor's browser.

## Run it

```bash
python3 -m http.server 8137
```

Then open http://localhost:8137. (It needs a local server because browsers do not load
JavaScript modules from a double-clicked file.) After the first load it also works with the
network off.

## Pages

| Page | File | What it does |
|---|---|---|
| Survey | `index.html`, `js/survey.js` | One question per screen: today, then the prediction, on the same seven-step scale. Then the years, a name and one line. The receipt in the left column fills in while you answer and each of its rows jumps to that question. |
| Explore | `explore.html`, `js/explore.js` | The field (a bar chart per question: today up, prediction down) and the roll (every card in order of arrival, as one strip). Save cards to a file, add cards from a file. |
| About | `about.html`, `js/about.js` | The towel story, then every sentence the scenario text can be made of. |

## Look

The whole interface follows the receipt: one monospace size, packed narrow columns, rules
made of = and -, ink on paper. Two framed panels sit side by side with a menu bar above and a
bar of keys below. Today is a big halftone dot, the prediction a small solid dot.

Keys on the Survey page: Enter = next, Esc = back, 1 to 7 = choose a step, P = print.

## Where things live

- `js/content.js` is the single content source: the four questions, the 28 step descriptions, the
  price lines, the presets, the years phrases and the take-home questions. Site, receipt and
  paper card all read it. Edit text there and nowhere else.
- `js/compose.js` assembles the scenario text from the chosen steps. No AI, no network.
- `js/receipt.js` builds the receipt: 32 characters per line, plain ASCII, for a 58 mm thermal
  printer. It prints through the browser's print dialog.
- `js/scale.js` is the seven-dot control; `js/pattern.js` draws an answer as five labelled rows
  (question, step numbers and the two end labels on every row).
- `js/store.js` keeps answers in the browser (localStorage) and handles the JSON file.
- `js/invented.js` holds made-up cards so Explore is not empty before there are visitors. The
  page labels them as invented.
- `paper/card.html` is the printable paper card (A6, four per A4). Open it through the local
  server: http://localhost:8137/paper/card.html
- `sw.js` is the offline cache. When you add a file, add it to the list there.

## Links that open an answer

- `index.html?m=343566374` opens an answer without saving it: four digits for today, four for
  the prediction, one for the years.
- `index.html?preset=3` opens a preset (0 to 4).

## What is kept

Marks, the name a visitor gives their prediction, one line of reasoning and three ticks. Never
a name or a contact detail.
