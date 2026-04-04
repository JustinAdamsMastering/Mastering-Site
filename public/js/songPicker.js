//////////////

import Player from './songPlayer.js'

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
    Player.loadSong(songKey)
  }
}

let selectedSong = null
const handleSongChanged = (e) => {
  selectedSong = e.detail
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
  Player.observe(Player.EventKeys.SongKey, handleSongChanged)
  Player.loadSong(songElements[0].dataset.song)

  window.addEventListener("resize", () => {
    for (const el of songElements) {
      if (el.dataset.song === selectedSong) {
        el.scrollIntoView({ behavior: "smooth", container: "nearest", block: "center", inline: 'center' })
      }
    }
  })
})