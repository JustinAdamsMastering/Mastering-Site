//////////////
// consts
const observerElement = document.querySelector(".song-select");
const songs = document.querySelectorAll("[data-song]");

//////////////
// lets
let selectTimeout = null;

//////////////
// handlers

const handleIntersection = (entries, observer) => {
  el = entries.filter(({ isIntersecting }) => isIntersecting).at(-1);
  notIntersecting = entries.filter(({ isIntersecting }) => !isIntersecting);
  selectTimeout = setTimeout(() => {
    if (el) {
      const songKey = el.target.dataset.song;
      songs.forEach((el) =>
        el.dataset.song === songKey
          ? el.classList.add("focused")
          : el.classList.remove("focused"),
      );
      if (alertTimeout) clearTimeout(alertTimeout);
      console.log(songKey);
    }
  }, 300);
};

///////////////////
// scroll setup

songs.forEach((el) =>
  el.addEventListener("click", () => {
    el.scrollIntoView({ behavior: "smooth" });
  }),
);
observerElement.scrollLeft = observerElement.scrollWidth * 0.5;

///////////////////
// observer setup
const observer = new IntersectionObserver(handleIntersection, {
  root: observerElement,
  rootMargin: "0% -50%",
  threshold: 0,
});
songs.forEach((el) => observer.observe(el));
