// Invented cards, so Explore is not empty before the booth has visitors.
// They are made up, not answers from real people, and the page labels them as invented.
// Marks are on the five-step scale; the third number is the step on the time frame.
const rows = [
  [[2, 3, 2, 4], [4, 4, 4, 4], 2, "every service I use moved online"],
  [[3, 4, 3, 4], [4, 4, 4, 5], 3, "budgets already follow the numbers"],
  [[4, 4, 4, 4], [4, 4, 4, 4], 1, "the country is slower than its plans"],
  [[2, 2, 3, 3], [2, 2, 3, 2], 3, "people around me started sharing tools and childcare"],
  [[4, 4, 4, 4], [4, 5, 4, 5], 1, "registration already decides most things"],
  [[3, 3, 4, 4], [2, 2, 4, 3], 4, "politics keeps asking who was here first"],
  [[2, 2, 2, 2], [4, 4, 4, 4], 5, "the village I know is already half paperwork"],
  [[4, 4, 4, 4], [3, 4, 4, 4], 3, "waiting lists make people call a neighbour"],
  [[3, 3, 3, 3], [3, 4, 3, 3], 2, "the housing shortage makes an address the only thing that counts"],
  [[4, 3, 4, 4], [4, 3, 5, 5], 3, "I sign more than I talk"],
  [[2, 4, 3, 3], [2, 4, 3, 4], 1, "city councils already buy forecasts"],
  [[4, 4, 3, 4], [2, 4, 3, 4], 4, "institutions cannot find staff"],
  [[3, 2, 2, 3], [4, 3, 4, 4], 3, "change here is always small and steady"],
  [[4, 4, 4, 5], [5, 5, 5, 5], 2, "there is no brake left"],
  [[4, 4, 4, 4], [2, 2, 2, 2], 5, "trust in systems breaks faster than they can mend it"],
  [[3, 4, 2, 4], [3, 4, 4, 4], 3, "platform work turns every relation into terms"],
  [[2, 3, 3, 2], [3, 3, 3, 4], 2, "even the community garden has a spreadsheet"],
  [[4, 4, 4, 4], [4, 3, 4, 4], 1, "the tone about newcomers hardened this year"],
  [[3, 3, 4, 4], [4, 3, 4, 5], 1, "it is not a prediction, it is next year"],
  [[2, 3, 2, 3], [2, 4, 2, 3], 3, "my street still helps, and it got more mixed"],
  [[4, 4, 4, 4], [4, 4, 4, 4], 4, "the Netherlands likes things arranged"],
  [[3, 4, 4, 3], [2, 4, 4, 2], 3, "people stop believing the models after each miss"],
  [[4, 4, 4, 4], [4, 4, 4, 4], 1, "coalitions cancel each other out"],
  [[2, 2, 2, 2], [3, 4, 4, 4], 5, "the young move to cities and take contracts with them"]
];

export const INVENTED = rows.map(([today, prediction, years, because], i) => ({
  id: "invented-" + String(i + 1).padStart(2, "0"), invented: true, no: null, at: null,
  today, prediction, years, because
}));
