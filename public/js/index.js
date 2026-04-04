
document.addEventListener("DOMContentLoaded", function () {
  document.documentElement.addEventListener("click", (e) => {
    switch (e.target.dataset.action) {
      case "toggle-mastering":
        window.Player.setMastering(
          e.target.parentElement.dataset.toggled === "true",
        )
        break
      case "play":
        window.Player.setMastering(false)
        window.Player.play()
        break
      case "play-mastered":
        window.Player.setMastering(true)
        window.Player.play()
        break
      case "pause":
        window.Player.pause()
        break
    }
  })

  const cassettes = document.querySelectorAll(".cassette")
  const initCassette = (cassette) => {
    window.Player.observe(
      window.Player.EventKeys.Playing,
      ({ detail: isPlaying }) => (cassette.dataset.playing = isPlaying),
    )
    window.Player.observe(
      window.Player.EventKeys.Mastering,
      ({ detail: isMastered }) =>
      (cassette.dataset.active =
        `${isMastered}` === cassette.dataset.ismastered),
    )
  }
  for (const cassette of cassettes) {
    initCassette(cassette)
  }

  const controls = document.querySelector(".controlGroup")
  window.Player.observe(
    window.Player.EventKeys.SongKey, () => {
      const toggles = controls.querySelectorAll("button")
      for (const toggle of toggles) {
        toggle.dataset.selected = "false"
      }
    }
  )
})
