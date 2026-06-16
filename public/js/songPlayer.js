import { songMap } from './songs.js'

// import songs from "./songs.json" with { type: "json" }
const makeSongPath = (name) => `./public/audio/${name}.mp3`

class AudioPlayer {
  unlockiOS() {
  const isIOS = /iP(hone|od|ad)/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  if (!isIOS) return
  const audio = document.createElement('audio')
  audio.setAttribute('x-webkit-airplay', 'deny')
  audio.preload = 'auto'
  audio.loop = true
  audio.src = '/public/audio/silence.mp3'
  audio.play()
}
   constructor() {
    this.songKey = null
    this.enableMastering = false
    this.beforePlayer = null
    this.afterPlayer = null
    this.seek = 0
    this.fadeTime = 200
    this.progressUpdater = null
  }
  EventKeys = {
    Playing: "audioPlayer:isPlaying",
    SongKey: "audioPlayer:songKey",
    Mastering: "audioPlayer:isMastered",
    Progress: "audioPlayer:progressChanged",
  }
  unloadSongs(shouldFade = true) {
    this.stopUpdatingProgress()
    for (const player of ["beforePlayer", "afterPlayer"]) {
      const p = this[player]
      if (!p) continue
      if (shouldFade && p.playing()) {
        p.once("fade", () => {
          p.unload()
          this[player] = null
        })
        p.fade(1, 0, this.fadeTime)
      } else {
        p.unload()
        this[player] = null
      }
    }
    this.seek = 0
    this.emit(this.EventKeys.Progress, 0)
    this.emit(this.EventKeys.Playing, PlayStates.stopped)
  }
  loadSong(dataKey) {
    this.unloadSongs()
    this.songKey = dataKey
    const song = songMap.get(dataKey)
    this.beforePlayer = new Howl({ src: [makeSongPath(song.before)], preload: true })
    this.afterPlayer = new Howl({ src: [makeSongPath(song.after)], preload: true })
    this.emit(this.EventKeys.SongKey, dataKey)
  }
  setMastering(enableMastering) {
    if (this.enableMastering === enableMastering) return

    const wasPlaying = this.isPlaying
    const active = this.activePlayer
    const inactive = this.inactivePlayer

    if (wasPlaying) {
      active.off("fade")
      inactive.off("fade")
      inactive.pause() // ensure it's stopped before we seek/play

      const currentSeek = active.seek()
      inactive.seek(currentSeek)
      inactive.volume(0)
      inactive.play()
      inactive.fade(0, 1, this.fadeTime)
      active.fade(1, 0, this.fadeTime)
      active.once("fade", () => active.pause())
    }

    this.enableMastering = enableMastering
    this.emit(this.EventKeys.Mastering, enableMastering)
  }
  pause() {
    this.seek = this.activePlayer?.seek()
    this.activePlayer?.off("fade")
    this.inactivePlayer?.off("fade")
    this.activePlayer?.volume(1)
    this.inactivePlayer?.volume(0)
    this.activePlayer?.pause()
    this.stopUpdatingProgress()
    this.emit(this.EventKeys.Playing, PlayStates.paused)
  }
  unpause() {
    if (this.activePlayer && this.activePlayer.state() === "loaded" && !this.activePlayer.playing()) {
      this.activePlayer.seek(this.seek)
      setTimeout(() => this.activePlayer.play(), 0)
      this.emit(this.EventKeys.Playing, PlayStates.playing)
      this.startUpdatingProgress()
    }
  }
  play() {
    if (!this.songKey) return
    if (this.isPlaying) return

    const song = songMap.get(this.songKey)
    if (!this.beforePlayer) this.beforePlayer = new Howl({ src: [makeSongPath(song.before)] })
    if (!this.afterPlayer) this.afterPlayer = new Howl({ src: [makeSongPath(song.after)] })

    const active = this.activePlayer
    const inactive = this.inactivePlayer

    const startPlayback = () => {
      inactive.pause()
      active.seek(this.seek)
      active.play()
      this.emit(this.EventKeys.Playing, PlayStates.playing)
      this.startUpdatingProgress()
    }

    if (active.state() === "loaded") {
      startPlayback()
    } else {
      if (active.state() !== "loading") active.load()
      active.once("load", startPlayback)
    }

    active.once("end", () => this.stop())
    this.beforePlayer.once("end", () => this.stop())
  }
  setSeek(percent) {
    this.emit(this.EventKeys.Progress, percent)
    if (!this.activePlayer) return
    this.seek = this.activePlayer.duration() * percent
  }
  stopUpdatingProgress() {
    if (this.progressUpdater) {
      clearInterval(this.progressUpdater)
      this.progressUpdater = null
    }
  }
  startUpdatingProgress() {
    this.progressUpdater = setInterval(() => {
      if (!this.activePlayer) return
      this.emit(
        this.EventKeys.Progress,
        this.activePlayer.seek() / (this.activePlayer.duration() || 1)
      )
    }, 200)
  }
  emit(key, detail) {
    const e = new CustomEvent(key, { detail })
    window.dispatchEvent(e)
  }
  observe(key, callback) {
    if (!key) {
      console.error("Cannot observe AudioPlayer without key.")
    }
    window.addEventListener(key, callback)
    return () => window.removeEventListener(key, callback)
  }


  stop() {
    this.beforePlayer?.off("fade")
    this.afterPlayer?.off("fade")
    this.beforePlayer?.volume(1)  // reset to defaults for next play
    this.afterPlayer?.volume(1)
    this.beforePlayer?.pause()
    this.afterPlayer?.pause()
    this.beforePlayer?.seek(0)
    this.afterPlayer?.seek(0)
    this.seek = 0
    this.stopUpdatingProgress()
    this.emit(this.EventKeys.Progress, 0)
    this.emit(this.EventKeys.Playing, PlayStates.stopped)
  }
  get isPlaying() {
    return Boolean(this.afterPlayer?.playing() || this.beforePlayer?.playing())
  }
  get activePlayer() {
    return this.enableMastering ? this.afterPlayer : this.beforePlayer
  }
  get inactivePlayer() {
    return this.enableMastering ? this.beforePlayer : this.afterPlayer
  }
}

export const PlayStates = {
  makeState({ isPlaying = false, isPaused = false, isStopped = false }) {
    return { isPlaying, isPaused, isStopped }
  },
  get playing() {
    return this.makeState({ isPlaying: true })
  },
  get paused() {
    return this.makeState({ isPaused: true })
  },
  get stopped() {
    return this.makeState({ isStopped: true })
  }
}

const Player = new AudioPlayer()
export default Player
