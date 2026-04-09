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
    this.EventKeys = {
      Playing: "audioPlayer:isPlaying",
      SongKey: "audioPlayer:songKey",
      Mastering: "audioPlayer:isMastered",
      Progress: "audioPlayer:progressChanged",
    }
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
    this.emit(this.EventKeys.Playing, false)
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
    this.seek = this.activePlayer.seek()
    this.activePlayer.pause()
    this.emit(this.EventKeys.Playing, false)
    this.stopUpdatingProgress()
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
      this.emit(this.EventKeys.Playing, true)
      this.startUpdatingProgress()
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
    this.stopUpdatingProgress()
    this.setSeek(0)
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


const Player = new AudioPlayer()
export default Player