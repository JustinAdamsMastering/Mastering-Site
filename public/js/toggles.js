// Setup Toggles
const toggles = document.querySelectorAll(".toggle");

for (const toggle of toggles) {
  const btn = toggle.querySelector("button");
  btn.addEventListener("click", () => {
    toggle.dataset.toggled =
      toggle.dataset.toggled === "true" ? "false" : "true";
  });
}

const controlGroups = document.querySelectorAll(".controlGroup");

for (const group of controlGroups) {
  const childButtons = group.querySelectorAll("button");
  group.addEventListener("mousedown", (e) => {
    for (btn of childButtons) {
      btn.dataset.selected = btn === e.target;
    }
  });
}
