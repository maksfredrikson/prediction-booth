// The single content source for the site, the receipt and the paper card (paper/card.html).
// Copied from axes5.js: the FIVE-step version (25 Nov 2026, evening).
// Supersedes the seven-step axes.js for the site, the card, the receipt and the poster.
// Every row is the same scale, 1 to 5. Each step description completes "a country where ..."
// and is short enough to print on a poster. All 20 are rewritten, simplified drafts;
// they follow one pattern across the questions: 1 = fully the left pole, 3 = both equally,
// 5 = fully the right pole.
export const BOOTH = {
  title: "Prediction Booth",
  line: "Donate your view of the Netherlands",
  place: "the Netherlands",
  steps: 5,
  axes: [
    {
      id: "help", zine: "Community → Society",
      q: "When someone needs help, who is expected to give it?",
      l: "Family, neighbours, people you know", r: "Institutions and systems",
      steps: [
        "family and neighbours give all the help",
        "people you know help first, institutions second",
        "people and institutions share the help equally",
        "institutions help first, family fills the gaps",
        "a system answers every need"
      ],
      toLeft: "Care becomes personal again, and so does being left out: whoever has no family has nobody.",
      toRight: "Nobody depends on a neighbour's goodwill, and nobody needs to know their neighbour."
    },
    {
      id: "belong", zine: "Common kinship → Common territory",
      q: "What makes someone belong here?",
      l: "Shared descent and family ties", r: "Living in the same place",
      steps: [
        "you belong only if your family is from here",
        "family roots count most, long residence a little",
        "roots and residence count the same",
        "living here counts more than roots",
        "whoever lives here belongs"
      ],
      toLeft: "Belonging runs deep and stays closed: nobody can earn it.",
      toRight: "Everyone can belong, and belonging asks nothing and promises little."
    },
    {
      id: "place", zine: "Status → Contract",
      q: "What sets your place?",
      l: "Who you are and where you come from", r: "What you signed: contracts, terms, accounts",
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
  time: {
    q: "How soon will it get there?",
    // the site asks the time frame first, before the questions, so it needs its own wording there
    ask: "How far ahead would you like to predict?",
    // timescale changed by the user on 25 Nov, late evening: 5, 10, 15, 20, 25 years (was 1 to 5)
    l: "5 years", r: "25 years",
    labels: ["5", "10", "15", "20", "25"],
    phrases: ["in about five years", "in about ten years", "in about fifteen years", "in about twenty years", "in about twenty-five years"]
  },
  // Presets on the 1-5 scale. B and C are the zine's scenarios, their 1-7 positions
  // (B: 1,2,3,3  C: 5,5,6,6) rescaled to 1-5.
  presets: [
    { name: "Left edge", pred: [1, 1, 1, 1] },
    { name: "Middle", pred: [3, 3, 3, 3] },
    { name: "Right edge", pred: [5, 5, 5, 5] },
    { name: "B · Cooperative society", pred: [1, 2, 2, 2], src: "zine",
      text: "Identity is seasonal. Knowledge as flood. Colour as abundance. Genealogy measured in contribution, not bloodline." },
    { name: "C · Federated agentic state", pred: [4, 4, 4, 4], src: "zine",
      text: "Identity is scalable. The ornament as civic infrastructure. Meaning as a menu item. The world when participation becomes extraction." }
  ],
  // An optional extra on the site ("tip your data"): how long the visitor has lived in the
  // country, as a spectrum. [value kept with the card, label shown]
  lived: {
    q: "I live in the Netherlands",
    options: [
      ["no", "Not living here"],
      ["lt1", "Less than 1 year"],
      ["1to5", "1 to 5 years"],
      ["gt5", "More than 5 years"],
      ["born", "Born and living here"]
    ]
  },
  talk: [
    "Who helped you last: a person or a system?",
    "What would make a newcomer belong here by then?",
    "Which agreement set your place this year?",
    "Which decision should never be left to a model?"
  ]
};
