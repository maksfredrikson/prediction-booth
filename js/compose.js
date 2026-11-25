// The scenario text. No AI and no network: the text is assembled from the step
// descriptions in content.js. Logic taken from the first prototype (narrative.html).
// Marks are step numbers 1 to 7, as printed on the paper card.
import { BOOTH as B } from "./content.js";

export const list = parts =>
  parts.length === 1 ? parts[0] : parts.slice(0, -1).join("; ") + "; and " + parts[parts.length - 1];

// s = { today: [1-7 x4], prediction: [1-7 x4], years: 1-7 }
export function compose(s) {
  const step = (a, v) => B.axes[a].steps[v - 1].t;
  const today = "You see " + B.place + " today as a country where " + list(s.today.map((v, a) => step(a, v))) + ".";

  const moved = s.prediction.map((v, a) => ({ a, d: v - s.today[a] })).filter(m => m.d !== 0);
  if (moved.length === 0) {
    return {
      today,
      prediction: "You predict that it stays exactly as it is.",
      priceLead: "",
      price: "If nothing moves, something is holding it in place. What is?"
    };
  }
  const where = list(moved.map(m => step(m.a, s.prediction[m.a])));
  const rest = moved.length < B.axes.length ? " The rest stays as you see it now." : "";
  const prediction = "You predict that " + B.time.phrases[s.years - 1] + " it will be a country where " + where + "." + rest;

  const far = Math.max(...moved.map(m => Math.abs(m.d)));
  const prices = moved.filter(m => Math.abs(m.d) === far).slice(0, 2)
    .map(m => (m.d < 0 ? B.axes[m.a].toLeft : B.axes[m.a].toRight));
  return { today, prediction, priceLead: "The price of that move:", price: prices.join(" ") };
}

export const asText = c => [c.today, c.prediction, (c.priceLead ? c.priceLead + " " : "") + c.price].join("\n");

export const complete = s =>
  s.today.every(v => v >= 1 && v <= 7) && s.prediction.every(v => v >= 1 && v <= 7) && s.years >= 1 && s.years <= 7;
