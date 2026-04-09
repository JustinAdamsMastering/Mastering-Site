import Player from './songPlayer.js'

document.documentElement.addEventListener("click", (e) => {
  switch (e.target.dataset.action) {
    case "toggle-mastering":
      Player.setMastering(
        e.target.parentElement.dataset.toggled === "true",
      )
      break
    case "play":
      Player.setMastering(false)
      Player.play()
      break
    case "play-mastered":
      Player.setMastering(true)
      Player.play()
      break
    case "pause":
      Player.pause()
      break
    case "stop":
      Player.stop()
      break
  }
})

const cassettes = document.querySelectorAll(".cassette")
const initCassette = (cassette) => {
  Player.observe(
    Player.EventKeys.Playing,
    ({ detail: isPlaying }) => (cassette.dataset.playing = isPlaying),
  )
  Player.observe(
    Player.EventKeys.Mastering,
    ({ detail: isMastered }) =>
    (cassette.dataset.active =
      `${isMastered}` === cassette.dataset.ismastered),
  )
}
for (const cassette of cassettes) {
  initCassette(cassette)
}

const controls = document.querySelector(".controlGroup")
Player.observe(
  Player.EventKeys.SongKey, () => {
    const toggles = controls.querySelectorAll("button")
    for (const toggle of toggles) {
      toggle.dataset.selected = "false"
    }
  }
)

const progressBar = controls.querySelector("#progressBar")
progressBar?.classList.add('no-interaction')
Player.observe(
  Player.EventKeys.Progress, (e) => {
    progressBar.value = e.detail.toString()
  }
)
Player.observe(
  Player.EventKeys.Playing, (e) => {
    progressBar.classList.toggle('no-interaction', !e.detail)
  }
)
progressBar.addEventListener('mousedown', () => Player.pause())
progressBar.addEventListener('mouseup', () => {
  Player.setSeek(progressBar.value)
  Player.play()
})