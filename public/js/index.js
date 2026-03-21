document.documentElement.addEventListener("click", (e) => {
  switch (e.target.dataset.action) {
    case "toggle-mastering":
      window.Player.setMastering(
        e.target.parentElement.dataset.toggled === "true",
      );
      break;
    case "play":
      window.Player.play();
      break;
    case "pause":
      window.Player.pause();
      break;
  }
});
