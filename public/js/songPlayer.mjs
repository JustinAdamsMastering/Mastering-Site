import songs from "./songs.json" with { type: "json" };

class AudioPlayer {
  constructor() {
    this.playingKey = null;
    this.enableMastering = false;
    this.beforePlayer = null;
    this.afterPlayer = null;
    this.fadeTime = 200;
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
    }
  }
  loadSong(dataKey) {
    this.unloadSongs();
    this.playingKey = dataKey;
    const song = songs[dataKey];
    this.beforePlayer = new Howl({ src: [song.before] });
    this.afterPlayer = new Howl({ src: [song.after] });
  }
  toggleBeforeAfter() {
    this.enableMastering = !this.enableMastering;
    this.playSong(this.playingKey, this.enableMastering);
  }
  pause() {
    this.beforePlayer?.pause();
    this.afterPlayer?.pause();
  }
  play(useMastered = false) {
    if (!this.playingKey) return;
    const player = useMastered ? this.afterPlayer : this.beforePlayer;
    const notPlayer = useMastered ? this.beforePlayer : this.afterPlayer;
    const seek = notPlayer.playing() ? notPlayer.seek() : 0;
    notPlayer.pause();
    if (!player.playing()) {
      player.play();
      player.seek(seek);
    }
  }
  stop = this.unloadSongs;
}

if (!window.Player) {
  window.Player = new AudioPlayer();
}
