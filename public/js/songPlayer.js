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
  PlayingStates = {
    Play: "play",
    Pause: "pause",
    Stop: "stop"
  }
  unloadSongs(shouldFade) {
    for (const player of ["beforePlayer", "afterPlayer"]) {
      const p = this[player]
      if (!p) return
      if (p.playing()) {
        p.on("fade", () => {
          p.unload()
          this[player] = null
        })
        p.fade(1, 0, this.fadeTime)
      } else {
        p.unload()
        this[player] = null
      }
      this.seek = 0
    }
    this.emit(this.EventKeys.Playing, PlayStates.stopped)
  }
  loadSong(dataKey) {
    this.unloadSongs()
    this.songKey = dataKey
    this.emit(this.EventKeys.SongKey, dataKey)
  }
  setMastering(enableMastering) {
    if (this.enableMastering === enableMastering) return
    if (this.isPlaying) {
      this.activePlayer.pause()
      this.inactivePlayer.seek(this.activePlayer.seek())
      this.inactivePlayer.play()
    }
    this.enableMastering = enableMastering
    this.emit(this.EventKeys.Mastering, enableMastering)
  }
  pause() {
    this.seek = this.activePlayer?.seek()
    this.activePlayer?.pause()
    this.emit(this.EventKeys.Playing, PlayStates.paused)
    this.stopUpdatingProgress()
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
    if (!this.isPlaying) {
      const song = songs[this.songKey]
      this.beforePlayer = new Howl({ src: [song.before] })
      this.afterPlayer = new Howl({ src: [song.after] })
      this.inactivePlayer.pause()
      this.activePlayer.play()
      this.activePlayer.seek(this.seek)
      this.emit(this.EventKeys.Playing, PlayStates.playing)
      this.startUpdatingProgress()
      this.activePlayer.on('end', () => this.stop())
      this.beforePlayer.on('end', () => this.stop())
    }
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
      this.emit(this.EventKeys.Progress, this.activePlayer.seek() / (this.activePlayer.duration() || 1))
    }, 200)
  }

  emit(key, detail) {
    // if (![this.EventKeys.Progress].includes(key))
    // console.log("Emitting", { key, detail })
    const e = new CustomEvent(key, {
      detail,
    })
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
    this.pause()
    this.emit(this.EventKeys.Progress, 0)
    this.activePlayer?.seek(0)
    this.inactivePlayer?.seek(0)
    this.seek = 0
    this.stopUpdatingProgress()
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
    return {
      isPlaying,
      isPaused,
      isStopped
    }
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