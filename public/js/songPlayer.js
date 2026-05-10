import songs from "./songs.json" with { type: "json" }

class AudioPlayer {
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
    this.emit(this.EventKeys.SongKey, dataKey)
  }
  setMastering(enableMastering) {
    if (this.enableMastering === enableMastering) return

    // Capture players before the swap happens via the setter assignment below
    const active = this.activePlayer
    const inactive = this.inactivePlayer

    if (this.isPlaying) {
      active.pause()
      inactive.seek(active.seek())
      inactive.play()
    }

    this.enableMastering = enableMastering
    this.emit(this.EventKeys.Mastering, enableMastering)
  }
  pause() {
    this.seek = this.activePlayer?.seek()
    this.activePlayer?.pause()
    this.stopUpdatingProgress()
    this.emit(this.EventKeys.Playing, PlayStates.paused)
  }
  unpause() {
    if (this.activePlayer && this.activePlayer.state() === "loaded" && !this.activePlayer.playing()) {
      this.activePlayer.seek(this.seek)
      this.activePlayer.play()
      this.emit(this.EventKeys.Playing, PlayStates.playing)
      this.startUpdatingProgress()
    }
  }
  play() {
    if (!this.songKey) return
    if (this.isPlaying) return
    if (this.activePlayer?.state() === "loading") return

    const song = songs[this.songKey]
    this.beforePlayer = new Howl({ src: [song.before] })
    this.afterPlayer = new Howl({ src: [song.after] })

    const active = this.activePlayer
    const inactive = this.inactivePlayer

    const startPlayback = () => {
      if (this.beforePlayer !== active && this.afterPlayer !== active) return
      inactive.pause()
      active.seek(this.seek)
      active.play()
      this.emit(this.EventKeys.Playing, PlayStates.playing)
      this.startUpdatingProgress()
    }

    if (active.state() === "loaded") {
      startPlayback()
    } else {
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
    this.stopUpdatingProgress()
    this.unloadSongs(false)
    this.emit(this.EventKeys.Progress, 0)
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