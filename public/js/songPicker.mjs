//////////////

import { dispatchSongSelect, observeSongSelect } from "./eventsBus.mjs"

// setup
const songSelect = document.querySelector(".song-select > ul")
const songElements = songSelect.querySelectorAll("[data-song]")
songElements[0].scrollIntoView({ container: "nearest", block: "center", inline: 'center' })

//////////////
// handlers
const handleClick = (e) => {
  const dataset = e.target.dataset
  if (dataset?.song) {
    const songKey = dataset.song
    dispatchSongSelect(songKey)
  }
}

let selectedSong = null
const handleSongChanged = (e) => {
  selectedSong = e.detail.songKey
  songElements.forEach(songEl => {
    if (songEl.dataset.song === selectedSong) {
      songEl.scrollIntoView({ behavior: "smooth", container: "nearest", block: "center", inline: 'center' })
      songEl.classList.add("focused")
    }
    else
      songEl.classList.remove("focused")
  })
}

///////////////////
// more setup
songSelect.addEventListener('click', handleClick)

document.addEventListener("DOMContentLoaded", function () {
  observeSongSelect(handleSongChanged)
  dispatchSongSelect(songElements[0].dataset.song)

  window.addEventListener("resize", () => {
    for (const el of songElements) {
      if (el.dataset.song === selectedSong) {
        el.scrollIntoView({ behavior: "smooth", container: "nearest", block: "center", inline: 'center' })
      }
    }
  })
})