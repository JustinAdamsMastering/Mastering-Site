//////////////

import { dispatchSongSelect } from "./eventsBus.mjs";

// consts
const observerElement = document.querySelector(".song-select");
const songElements = document.querySelectorAll("[data-song]");

//////////////
// lets
let selectTimeout = null;

//////////////
// handlers

const handleIntersection = (entries, observer) => {
  const el = entries.filter(({ isIntersecting }) => isIntersecting).at(-1);
  selectTimeout = setTimeout(() => {
    if (el) {
      const songKey = el.target.dataset.song;
      songElements.forEach((el) =>
        el.dataset.song === songKey
          ? el.classList.add("focused")
          : el.classList.remove("focused"),
      );
      if (selectTimeout) clearTimeout(selectTimeout);
      dispatchSongSelect(songKey);
    }
  }, 300);
};

///////////////////
// scroll setup

songElements.forEach((el) =>
  el.addEventListener("click", () => {
    el.scrollIntoView({ behavior: "smooth", container: "nearest" }); // TODO Fix scrolling on chromium
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
songElements.forEach((el) => observer.observe(el));
