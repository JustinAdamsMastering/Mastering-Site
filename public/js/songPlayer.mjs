import { observeSongSelect } from "./eventsBus.mjs";
import songs from "./songs.json" with { type: "json" };

class AudioPlayer {
  constructor() {
    this.songKey = null;
    this.enableMastering = false;
    this.beforePlayer = null;
    this.afterPlayer = null;
    this.seek = 0;
    this.fadeTime = 200;
    this.EventKeys = {
      Playing: "audioPlayer:isPlaying",
      SongKey: "audioPlayer:songKey",
      Mastering: "audioPlayer:isMastered",
    };
  }
  unloadSongs(shouldFade) {
    for (const player of ["beforePlayer", "afterPlayer"]) {
      const p = this[player];
      if (!p) return;
      if (p.playing()) {
        p.on("fade", () => {
          p.unload();
          this[player] = null;
        });
        p.fade(1, 0, this.fadeTime);
      } else {
        p.unload();
        this[player] = null;
      }
      this.seek = 0;
    }
  }
  loadSong(dataKey) {
    this.unloadSongs();
    this.songKey = dataKey;
    const song = songs[dataKey];
    this.beforePlayer = new Howl({ src: [song.before] });
    this.afterPlayer = new Howl({ src: [song.after] });
  }
  setMastering(enableMastering) {
    if (this.enableMastering === enableMastering) return;
    if (this.isPlaying) {
      this.activePlayer.pause();
      this.inactivePlayer.play();
      this.inactivePlayer.seek(this.activePlayer.seek());
    }
    this.enableMastering = enableMastering;
    this.emit(this.EventKeys.Mastering, enableMastering);
  }
  pause() {
    this.seek = this.activePlayer.seek();
    this.activePlayer.pause();
    this.emit(this.EventKeys.Playing, false);
  }
  play() {
    if (!this.songKey) return;
    if (!this.activePlayer.playing()) {
      this.inactivePlayer.pause();
      this.activePlayer.play();
      this.activePlayer.seek(this.seek);
      this.emit(this.EventKeys.Playing, true);
    }
  }

  emit(key, detail) {
    const e = new CustomEvent(key, {
      detail,
    });
    window.dispatchEvent(e);
  }
  observe(key, callback) {
    if (!key) {
      console.error("Cannot observe AudioPlayer without key.");
    }
    window.addEventListener(key, callback);
    return () => window.removeEventListener(key, callback);
  }
  stop = this.unloadSongs;
  get isPlaying() {
    return this.afterPlayer.playing() || this.beforePlayer.playing();
  }
  get activePlayer() {
    return this.enableMastering ? this.afterPlayer : this.beforePlayer;
  }
  get inactivePlayer() {
    return this.enableMastering ? this.beforePlayer : this.afterPlayer;
  }
}

if (!window.Player) {
  window.Player = new AudioPlayer();
  observeSongSelect((e) => window.Player.loadSong(e.detail.songKey));
}
