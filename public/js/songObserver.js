//////////////
// consts
const observerElement = document.querySelector(".song-select");
const songs = document.querySelectorAll("[data-song]");

//////////////
// lets
let alertTimeout = null;

//////////////
// handlers
const handleIntersection = (entries, observer) => {
  el = entries.filter(({ isIntersecting }) => isIntersecting).at(-1);
  notIntersecting = entries.filter(({ isIntersecting }) => !isIntersecting);
  if (el) {
    const songKey = el.target.dataset.song;
    songs.forEach((el) =>
      el.dataset.song === songKey
        ? el.classList.add("focused")
        : el.classList.remove("focused"),
    );
    if (alertTimeout) clearTimeout(alertTimeout);
    alertTimeout = setTimeout(() => {
      console.log(songKey);
    }, 300);
  }
};

///////////////////
// observer setup
const observer = new IntersectionObserver(handleIntersection, {
  root: observerElement,
  rootMargin: "0% -50%",
  threshold: 0,
});
songs.forEach((el) => observer.observe(el));
