// The single content source for the site, the receipt and the paper card (paper/card.html).
// Five steps on every scale. Each step description completes "a country where ...".
// Wording as decided on 26 Nov 2026: the booth asks about the impact of technology on
// society, run locally. Drafts until the wording is frozen after the pilot of 2 Dec.

// ---- The local edition: everything that names the country, in one place --------------
// To run the booth for another country, change these three things and nothing else.
const PLACE = "the Netherlands";
// The question line under the title. Also the first line read when the survey starts.
const QUESTION = "Where is technology taking " + PLACE + "?";
// One line per question of what is already happening in this country (drafts).
const ALREADY = [
  "Some GP practices now sort your request with an app before a person reads it.",
  "Self-service and AI now do tasks we used to need another person for.",
  "In the childcare benefits scandal, a risk model scored parents by nationality.",
  "A building permit can depend on what the national nitrogen model calculates."
];

export const BOOTH = {
  title: "Prediction Booth",
  line: QUESTION,
  place: PLACE,
  // The frame: read once, when the survey starts. It is not a question to answer.
  frame: QUESTION,
  steps: 5,
  axes: [
    {
      id: "help", zine: "Community → Society",
      q: "When someone needs help, who answers?",
      l: "People you know: family, neighbours, friends", r: "Systems: services, apps, machines",
      already: ALREADY[0],
      steps: [
        "help comes from people you know",
        "people you know come first; services fill the gaps",
        "people you know and systems answer equally",
        "systems come first; people you know fill the gaps",
        "help comes from systems: services, apps, machines"
      ],
      toLeft: "Care becomes personal again, and so does being left out: whoever has no family has nobody.",
      toRight: "Nobody depends on a neighbour's goodwill, and nobody needs to know their neighbour."
    },
    {
      // New on 26 Nov: it replaces "What makes someone belong here?".
      id: "together",
      q: "What holds people together here?",
      l: "Shared rituals", r: "Relying on each other's work",
      already: ALREADY[1],
      steps: [
        "people are held together by shared rituals: the same holidays, habits and stories",
        "shared rituals still lead, but roles differ",
        "shared rituals and relying on each other's work count equally",
        "relying on each other's work leads; shared rituals count less",
        "people are held together by relying on each other's different work"
      ],
      toLeft: "Less room for people who live differently.",
      toRight: "You depend on people you never meet."
    },
    {
      id: "place", zine: "Status → Contract",
      q: "What decides how you are treated?",
      l: "Who you are and where you come from", r: "What you have signed: contracts, terms, accounts",
      already: ALREADY[2],
      steps: [
        "who you are decides your place",
        "background counts most, agreements a little",
        "background and agreements count the same",
        "agreements count more than background",
        "what you signed decides your place"
      ],
      toLeft: "People are known, and people are fixed in place.",
      toRight: "Everyone is held to the same terms, and whoever cannot read the terms loses."
    },
    {
      id: "decide", zine: "Tradition → Rationality",
      q: "What settles a public decision?",
      l: "How it has always been done here", r: "Models and measurements",
      already: ALREADY[3],
      steps: [
        "things are done as they always were",
        "custom leads, and numbers can adjust it",
        "custom and numbers are weighed equally",
        "numbers lead, and custom is consulted",
        "models and measurements decide everything"
      ],
      toLeft: "Decisions feel like ours, and evidence cannot correct them.",
      toRight: "Decisions can be checked, and nobody who was measured was asked."
    }
  ],
  // The years: a slider from 0 (it is already happening) to ∞ (it never gets there), which
  // settles on six stops. Decided by the user on 26 Nov; the poster and the paper card use the
  // same labels.
  time: {
    q: "How soon will it get there?",
    // the site asks the time frame first, before the questions, so it needs its own wording there
    ask: "How far ahead would you like to predict?",
    l: "0: already happening", r: "∞: it never gets there",
    labels: ["0", "5", "10", "25", "50", "∞"],
    phrases: ["now", "in about five years", "in about ten years", "in about twenty-five years", "in about fifty years", "never"],
    // the prediction sentence for each stop; {where} is replaced by the chosen steps
    sentences: [
      "You predict that it is already becoming a country where {where}.",
      "You predict that in about five years it will be a country where {where}.",
      "You predict that in about ten years it will be a country where {where}.",
      "You predict that in about twenty-five years it will be a country where {where}.",
      "You predict that in about fifty years it will be a country where {where}.",
      "You predict that it is heading for a country where {where}, and that it never gets there."
    ]
  },
  // Asked once, after the prediction: the gap between what a visitor predicts and what they
  // want. Shown on the receipt and kept with the card. [value kept, label shown]
  wish: {
    q: "Is this where you want it to go?",
    options: [["yes", "Yes"], ["partly", "Partly"], ["no", "No"]]
  },
  // Presets on the 1-5 scale. B and C are the zine's scenarios, their positions rescaled to
  // five steps (on the second question: B = 2, C = 4).
  presets: [
    { name: "Left edge", pred: [1, 1, 1, 1] },
    { name: "Middle", pred: [3, 3, 3, 3] },
    { name: "Right edge", pred: [5, 5, 5, 5] },
    { name: "B · Cooperative society", pred: [1, 2, 2, 2], src: "zine",
      text: "Identity is seasonal. Knowledge as flood. Colour as abundance. Genealogy measured in contribution, not bloodline." },
    { name: "C · Federated agentic state", pred: [4, 4, 4, 4], src: "zine",
      text: "Identity is scalable. The ornament as civic infrastructure. Meaning as a menu item. The world when participation becomes extraction." }
  ],
  // Optional extras on the site ("tip your data"). [value kept with the card, label shown]
  lived: {
    q: "I live in " + PLACE,
    options: [
      ["no", "Not living here"],
      ["lt1", "Less than 1 year"],
      ["1to5", "1 to 5 years"],
      ["gt5", "More than 5 years"],
      ["born", "Born and living here"]
    ]
  },
  tech: {
    q: "How much do you work with digital technology?",
    options: [["daily", "Daily"], ["sometimes", "Sometimes"], ["rarely", "Rarely"]]
  },
  talk: [
    "Who helped you last: a person or a system?",
    "What would make a newcomer belong here by then?",
    "Which agreement set your place this year?",
    "Which decision should never be left to a model?"
  ]
};
