// Shared by every page: the theme switch and the offline cache.
const root = document.documentElement;
const btn = document.querySelector(".theme");
const dark = () => (root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches);
const label = () => { if (btn) btn.textContent = dark() ? "Light" : "Dark"; };
if (btn) {
  btn.addEventListener("click", () => {
    root.dataset.theme = dark() ? "light" : "dark";
    try { localStorage.setItem("prediction-booth-theme", root.dataset.theme); } catch (e) {}
    label();
  });
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", label);
  label();
}

if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}
