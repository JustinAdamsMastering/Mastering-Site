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
Player.observe(
  Player.EventKeys.Progress, (e) => {
    console.log(progressBar.value)
    progressBar.value = e.detail.toString()
  }
)
progressBar.addEventListener('mousedown', () => Player.pause())
progressBar.addEventListener('mouseup', () => {
  console.log(progressBar.value)
  Player.setSeek(progressBar.value)
  Player.play()
})