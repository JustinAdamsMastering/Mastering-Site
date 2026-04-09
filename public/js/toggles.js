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
  const buttons = group.querySelector(".buttons")
  const childButtons = buttons.querySelectorAll("button");
  buttons.addEventListener("mousedown", (e) => {
    for (const btn of childButtons) {
      if (btn.dataset.action !== 'stop')
        btn.dataset.selected = btn === e.target;
    }
  });
}
