import Player from './songPlayer.js'

document.documentElement.addEventListener("click", (e) => {
  // console.log(e.target.dataset)
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
    ({ detail }) => (cassette.dataset.playing = detail.isPlaying),
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
Player.observe(
  Player.EventKeys.Playing, ({ detail }) => {
    if (detail.isStopped) {

      const toggles = controls.querySelectorAll("button")
      for (const toggle of toggles) {
        toggle.dataset.selected = "false"
      }
    }
  }
)

const progressBar = controls.querySelector("#progressBar")
progressBar.classList.add('no-interaction')
Player.observe(
  Player.EventKeys.Progress, (e) => {
    progressBar.value = e.detail.toString()
  }
)
Player.observe(
  Player.EventKeys.Playing, ({ detail }) => {
    progressBar.classList.toggle('no-interaction', !detail.isPlaying)
  }
)

const doUnpause = () => {
  Player.setSeek(progressBar.value)
  Player.unpause()
}

let seekingInProgress = false
progressBar.addEventListener('pointerdown', (e) => {
  seekingInProgress = true
  progressBar.setPointerCapture(e.pointerId)
  Player.pause()
})

progressBar.addEventListener('pointerup', (e) => {
  if (!seekingInProgress) return
  seekingInProgress = false
  Player.setSeek(progressBar.value)
  Player.unpause()
})

window.addEventListener('keypress', (e) => {
  if (e.key === ' ') {
    if (!e.target.dataset?.action) {
      // Let buttons handle their own keypress
      Player.stop()
    }
  }
})
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".cassette").forEach((cassette) => {
    cassette.classList.add("intro");
  });
});
