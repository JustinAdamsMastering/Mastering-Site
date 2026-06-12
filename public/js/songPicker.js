//////////////

import Player from './songPlayer.js'
import { songMap } from './songs.js'

// rendering setup

const songSelect = document.querySelector(".song-select > ul")
// songMap = Map<key, value>
// <li data-song="{key}" tabindex="0">value.display</li>
songSelect.innerHTML = ''
songMap.forEach((value, key) => {
  const li = document.createElement('li')

  // Set attributes
  li.setAttribute('data-song', key)
  li.setAttribute('tabindex', '0')

  // Set text content
  li.textContent = value.display

  // Append to the list
  songSelect.appendChild(li)
})


// setup
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

const handleKey = (e) => {
  const dataset = e.target.dataset
  if (dataset?.song && e.key === " ") {
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
songSelect.addEventListener('keypress', handleKey)

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