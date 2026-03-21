export const EventKeys = {
  SongSelect: "customEvent:songSelect",
};

export const dispatchSongSelect = (songKey) => {
  const songSelectEvent = new CustomEvent(EventKeys.SongSelect, {
    detail: { songKey },
  });
  window.dispatchEvent(songSelectEvent);
};

export const observeSongSelect = (callback) => {
  window.addEventListener(EventKeys.SongSelect, callback);
  return () => window.removeEventListener(EventKeys.SongSelect, callback);
};
