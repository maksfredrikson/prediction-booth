# Prediction Booth

Donate your view of the Netherlands. A visitor says how far ahead they predict, then marks on
four questions how they see the country today and where they predict it is heading. The site
turns the answer into a donation receipt: the marks, a short scenario text and what the
prediction costs.

A plain static site: HTML, CSS and JavaScript modules. No framework, no build step, no server
code. Nothing is sent anywhere; answers stay in the visitor's browser.

Live: https://maksfredrikson.github.io/prediction-booth/ (GitHub Pages serves the `main` branch,
so every push to `main` updates the public page).

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
| Landing and Explore | `index.html`, `js/explore.js` | One scrolling page. On top: the invitation to the survey. Below: a row of time frames that filters everything under it, the field (a bar chart per question, today up and prediction down, with the group's average move), the roll (every card in order of arrival). Saving cards to a file and adding cards from a file are hidden from visitors: open `index.html#data`. |
| Survey | `survey.html`, `js/survey.js` | Made for touch. First the time frame (5, 10, 15, 20 or 25 years). Then four questions on a five-step scale, each on two lines: today and the prediction; the meaning of a chosen step shows under its line. Then one last step: consent (required), one line of reasoning and a "tip" of data (how long they have lived in the Netherlands), both optional. Then the receipt on its own screen. |
| Scenarios | `scenarios.html`, `js/scenarios.js` | The five ready-made predictions from the content file: two scenarios from the zine, and the two edges and the middle of the scale. Each can be opened as an example receipt. |
| About | `about.html`, `js/about.js` | Opens on "ornament is not decoration" and the towel story, then the three questions of the research as a table, then every sentence the scenario text can be made of. |

## Look

A plain navigation column on the left (on top on a phone) with four sections and one wide working area. One kind
of information and one clear action per screen. Type and marks follow the receipt: one
monospace face, no colour, dark by default (the small half dot in the navigation switches to
light). Today is a big halftone dot, the prediction a small solid dot.

Quiet keyboard helpers on the Survey page: Enter = the main action, Esc = back, 1 to 5 = choose a step.

## Where things live

- `js/content.js` is the single content source: the four questions, the 20 step descriptions (five steps per question), the
  price lines, the time frame, the ready-made answers and the take-home questions. Site, receipt
  and paper card all read it. Edit text there and nowhere else.
- `js/compose.js` assembles the scenario text from the chosen steps, and generates a card's name
  from the price of its biggest move. No AI, no network.
- `js/receipt.js` builds the receipt: 32 characters per line, plain ASCII, for a 58 mm thermal
  printer. On screen it is one unbroken strip; it prints through the browser's print dialog.
- `js/scale.js` is the dot control; `js/pattern.js` draws an answer as five labelled rows.
- `js/store.js` keeps answers in the browser (localStorage) and handles the JSON file.
- `js/invented.js` holds made-up cards so Explore is not empty before there are visitors. The
  page labels them as invented.
- `paper/card.html` is the printable paper card (A6, four per A4). Open it through the local
  server: http://localhost:8137/paper/card.html
- `sw.js` is the offline cache. When you add a file, add it to the list there.

## Links that open an answer

- `survey.html?m=232344532` opens an answer without saving it: four digits for today, four for
  the prediction, one for the step on the time frame (each 1 to 5).
- `survey.html?preset=3` opens a ready-made answer (0 to 4).

## What is kept

Marks, the time frame, the consent answer, and what a visitor chooses to add: one line of
reasoning and a tip of data (how long they have lived in the Netherlands). Never a name or a
contact detail.
Cards carry their scale; cards from the earlier seven-step version are never mixed in.
