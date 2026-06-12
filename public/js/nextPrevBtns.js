import Player from './songPlayer.js'
import { songMap } from './songs.js'

const songKeys = Array.from(songMap.keys())
const songCount = songKeys.length
let index = 0

const nextPrevBtns = document.querySelector('.song-controls')
const handleClick = (e) => {
    const change = e.target.dataset?.action === "next" ? 1 : -1
    index = (index + change) % songCount
    Player.loadSong(songKeys.at(index))
}

const handleKey = (e) => {
    const dataset = e.target.dataset
    if (e.key === " ") {
        const change = dataset?.action === "next" ? 1 : -1
        index = (index + change) % songCount
        Player.loadSong(songKeys.at(index))
    }
}

const songChanged = (e) =>
    index = songKeys.findIndex(s => s === e.detail)

nextPrevBtns.addEventListener('click', handleClick)
nextPrevBtns.addEventListener('key', handleKey)
Player.observe(Player.EventKeys.SongKey, songChanged)