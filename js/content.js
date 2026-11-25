// The single content source for the site, the receipt and the paper card (paper/card.html).
// Each axis has seven discrete steps. A step description completes the sentence
// "a country where ...". src: "zine" = wording taken from Zine_MD_v6b.pdf page 2 (May 2026),
// "draft" = written on 25 Nov 2026 to fill the steps the zine left empty. Edit freely.
export const BOOTH = {
  title: "Prediction Booth",
  line: "Donate your view of the Netherlands",
  place: "the Netherlands",
  axes: [
    {
      id: "help", zine: "Community → Society",
      q: "When someone needs help, who is expected to give it?",
      l: "Family, neighbours, people you know", r: "Institutions and systems",
      steps: [
        { t: "local community is the primary social unit, and help comes from family and neighbours", src: "zine" },
        { t: "community strongly shapes life: you ask people you know first and institutions last", src: "zine" },
        { t: "people you know carry most of the care, with institutions as a safety net", src: "draft" },
        { t: "help is split evenly between people you know and institutions", src: "draft" },
        { t: "formal society begins to dominate: institutions help first and family fills the gaps", src: "zine" },
        { t: "institutions and systems carry almost all care, and neighbours are a courtesy", src: "draft" },
        { t: "help is a service: every need has a system, and nobody is expected to ask a person", src: "draft" }
      ],
      toLeft: "Care becomes personal again, and so does being left out: whoever has no family has nobody.",
      toRight: "Nobody depends on a neighbour's goodwill, and nobody needs to know their neighbour."
    },
    {
      id: "belong", zine: "Common kinship → Common territory",
      q: "What makes someone belong here?",
      l: "Shared descent and family ties", r: "Living in the same place",
      steps: [
        { t: "belonging is inherited: you are from here if your family is", src: "draft" },
        { t: "kinship dominates, though the place you live counts a little", src: "zine" },
        { t: "family ties come first, but long residence can earn a place", src: "draft" },
        { t: "descent and residence weigh the same", src: "draft" },
        { t: "territory becomes the main basis of belonging, and living here counts more than roots", src: "zine" },
        { t: "civic-territorial identity dominates: you belong because you live and take part here", src: "zine" },
        { t: "belonging is an address: whoever lives here is from here, and descent is a private matter", src: "draft" }
      ],
      toLeft: "Belonging runs deep and stays closed: nobody can earn it.",
      toRight: "Everyone can belong, and belonging asks nothing and promises little."
    },
    {
      id: "place", zine: "Status → Contract",
      q: "What sets your place?",
      l: "Who you are and where you come from", r: "What you signed: contracts, terms, accounts",
      steps: [
        { t: "status decides: who you are and where you come from sets your place, and that is not up for discussion", src: "draft" },
        { t: "status dominates, with limited negotiation", src: "zine" },
        { t: "status remains important but can be modified by what you agree to", src: "zine" },
        { t: "who you are and what you signed weigh the same", src: "draft" },
        { t: "agreements count more than background, though background still opens doors", src: "draft" },
        { t: "most relations are formalised through agreements: contracts, terms, accounts", src: "zine" },
        { t: "you are what you signed: every relation is a contract, and nothing is owed outside it", src: "draft" }
      ],
      toLeft: "People are known, and people are fixed in place.",
      toRight: "Everyone is held to the same terms, and whoever cannot read the terms loses."
    },
    {
      id: "decide", zine: "Tradition → Rationality",
      q: "What settles a public decision?",
      l: "How it has always been done here", r: "Models and measurements",
      steps: [
        { t: "custom decides: things are done as they have always been done", src: "draft" },
        { t: "tradition strongly structures life, and public decisions follow it", src: "zine" },
        { t: "tradition dominates but adapts when the numbers insist", src: "zine" },
        { t: "custom and calculation are weighed against each other, case by case", src: "draft" },
        { t: "measurements lead, and custom is consulted", src: "draft" },
        { t: "tradition becomes a resource, kept where it is useful to the model", src: "zine" },
        { t: "tradition is instrumentalised: models and measurements settle every public decision", src: "zine" }
      ],
      toLeft: "Decisions feel like ours, and evidence cannot correct them.",
      toRight: "Decisions can be checked, and nobody who was measured was asked."
    }
  ],
  // The time frame: asked first, five steps. labels are years from now.
  time: {
    q: "How far ahead do you predict?",
    l: "5 years", r: "30 years",
    labels: ["5", "10", "15", "25", "30"],
    phrases: ["in five years", "in ten years", "in fifteen years", "in twenty-five years", "in thirty years"]
  },
  // Chips for exploring the screen without a card. They set the prediction row.
  // The first three are the two edges and the middle of the card; B and C are the zine's
  // scenarios at the positions marked on its page 2, with the zine's own text.
  presets: [
    { name: "Left edge", pred: [1, 1, 1, 1] },
    { name: "Middle", pred: [4, 4, 4, 4] },
    { name: "Right edge", pred: [7, 7, 7, 7] },
    { name: "B · Cooperative society", pred: [1, 2, 3, 3], src: "zine",
      text: "Identity is seasonal. Knowledge as flood. Colour as abundance. Genealogy measured in contribution, not bloodline." },
    { name: "C · Federated agentic state", pred: [5, 5, 6, 6], src: "zine",
      text: "Identity is scalable. The ornament as civic infrastructure. Meaning as a menu item. The world when participation becomes extraction." }
  ],
  talk: [
    "Who helped you last: a person or a system?",
    "What would make a newcomer belong here by then?",
    "Which agreement set your place this year?",
    "Which decision should never be left to a model?"
  ]
};
