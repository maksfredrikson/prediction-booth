// Invented cards, so Explore is not empty before the booth has visitors.
// They are made up, not answers from real people, and the page labels them as invented.
const rows = [
  [[3, 4, 3, 5], [5, 5, 5, 6], 2, "every service I use moved online"],
  [[4, 5, 4, 5], [6, 6, 6, 7], 3, "budgets already follow the numbers"],
  [[5, 5, 5, 6], [5, 5, 5, 6], 1, "the country is slower than its plans"],
  [[3, 3, 4, 4], [2, 3, 4, 3], 3, "people around me started sharing tools and childcare"],
  [[5, 6, 5, 6], [6, 7, 6, 7], 1, "registration already decides most things"],
  [[4, 4, 5, 5], [3, 2, 5, 4], 4, "politics keeps asking who was here first"],
  [[2, 3, 3, 3], [5, 5, 6, 6], 5, "the village I know is already half paperwork"],
  [[6, 5, 6, 6], [4, 5, 5, 5], 3, "waiting lists make people call a neighbour"],
  [[4, 4, 4, 4], [4, 6, 4, 4], 2, "the housing shortage makes an address the only thing that counts"],
  [[5, 4, 6, 5], [6, 4, 7, 7], 3, "I sign more than I talk"],
  [[3, 5, 4, 4], [3, 5, 4, 6], 1, "city councils already buy forecasts"],
  [[5, 5, 4, 6], [3, 5, 4, 6], 4, "institutions cannot find staff"],
  [[4, 3, 3, 4], [5, 4, 5, 5], 3, "change here is always small and steady"],
  [[6, 6, 6, 7], [7, 7, 7, 7], 2, "there is no brake left"],
  [[5, 5, 5, 5], [2, 2, 3, 2], 5, "trust in systems breaks faster than they can mend it"],
  [[4, 5, 3, 5], [4, 5, 6, 5], 3, "platform work turns every relation into terms"],
  [[3, 4, 4, 3], [4, 4, 4, 5], 2, "even the community garden has a spreadsheet"],
  [[5, 6, 5, 5], [5, 4, 5, 5], 1, "the tone about newcomers hardened this year"],
  [[4, 4, 5, 6], [5, 4, 6, 7], 1, "it is not a prediction, it is next year"],
  [[2, 4, 3, 4], [2, 5, 3, 4], 3, "my street still helps, and it got more mixed"],
  [[5, 5, 6, 5], [6, 6, 6, 6], 4, "the Netherlands likes things arranged"],
  [[4, 5, 5, 4], [3, 5, 5, 3], 3, "people stop believing the models after each miss"],
  [[6, 5, 5, 6], [6, 5, 5, 6], 1, "coalitions cancel each other out"],
  [[3, 3, 2, 3], [4, 5, 5, 5], 5, "the young move to cities and take contracts with them"]
];

export const INVENTED = rows.map(([today, prediction, years, because], i) => ({
  id: "invented-" + String(i + 1).padStart(2, "0"), invented: true, no: null, at: null,
  today, prediction, years, because
}));
