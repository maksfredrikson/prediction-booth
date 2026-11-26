// Shared by every page: the light/dark switch and the offline cache.
// The site is dark by default; the small dot in the navigation switches to light and back.
import { BOOTH } from "./content.js";

// The country and the question line live in the content file only; static pages get them here.
document.querySelectorAll("[data-place]").forEach(n => { n.textContent = BOOTH.place; });
document.querySelectorAll("[data-line]").forEach(n => { n.textContent = BOOTH.line; });

const root = document.documentElement;
const btn = document.querySelector(".theme");
const light = () => root.dataset.theme === "light";
const label = () => { if (btn) btn.setAttribute("aria-label", light() ? "Switch to dark" : "Switch to light"); };
if (btn) {
  btn.addEventListener("click", () => {
    if (light()) delete root.dataset.theme; else root.dataset.theme = "light";
    try { localStorage.setItem("prediction-booth-theme", light() ? "light" : "dark"); } catch (e) {}
    label();
  });
  label();
}

if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}
