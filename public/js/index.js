import Player from './songPlayer.js'
import { songMap } from './songs.js'

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
    ({ detail }) => (cassette.dataset.playing = detail.isPlaying),
  )
  Player.observe(
    Player.EventKeys.Mastering,
    ({ detail: isMastered }) =>
    (cassette.dataset.active =
      `${isMastered}` === cassette.dataset.ismastered),
  )
  Player.observe(
    Player.EventKeys.SongKey,
    ({ detail }) => {
      const songDetails = songMap.get(detail)
      const title = songDetails?.title
      const band = songDetails?.band
      const titleEl = cassette.querySelector('.songName')
      const bandEl = cassette.querySelector('.band')
      titleEl.innerHTML = `"${title}"`
      bandEl.innerHTML = `${band}`
    }
  )
}
for (const cassette of cassettes) {
  initCassette(cassette)
}

const credits = document.querySelector(".credits")

Player.observe(
  Player.EventKeys.SongKey,
  ({ detail }) => {
    const songDetails = songMap.get(detail)
    const artistEl = credits.querySelector('.artist')
    const producerEl = credits.querySelector('.producer')
    const artist = songDetails?.artist
    const producer = songDetails?.producer
    if (artist && producer) {
      artistEl.innerHTML = `Artist: <a target="_blank" rel="noopener noreferrer" href="https://instagram.com/${artist.instagram_handle}/">@${artist.instagram_handle}</a>`
      producerEl.innerHTML = `Producer: <a target="_blank" rel="noopener noreferrer" href="https://instagram.com/${producer.instagram_handle}/">@${producer.instagram_handle}</a>`
    } else {
      artistEl.innerHTML = ''
      producerEl.innerHTML = ''
    }
  }
)

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
    if (seekingInProgress) return
    progressBar.value = e.detail.toString()
  }
)
Player.observe(
  Player.EventKeys.Playing, ({ detail }) => {
    progressBar.classList.toggle('no-interaction', !detail.isPlaying)
  }
)

let seekingInProgress = false
progressBar.addEventListener('pointerdown', (e) => {
  seekingInProgress = true
 
  Player.pause()
})
progressBar.addEventListener('pointerdown', (e) => {
  const rect = progressBar.getBoundingClientRect()
  const percent = (e.clientX - rect.left) / rect.width
  const clamped = Math.min(1, Math.max(0, percent))
  progressBar.value = clamped.toString()
})
const finishSeek = () => {
  if (!seekingInProgress) return
  seekingInProgress = false
  Player.setSeek(progressBar.value)
  Player.unpause()
}

progressBar.addEventListener('pointerup', finishSeek)
progressBar.addEventListener('change', finishSeek)


window.addEventListener('keypress', (e) => {
  if (e.key === ' ') {
    if (!e.target.dataset?.action) {
      // Let buttons handle their own keypress
      Player.stop()
    }
  }
})
