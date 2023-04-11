import { Dance } from "./Dance/Dance.js";
import { EqualizerAnimation } from "./Equalizer/EqualizerAnimation.js";

const loader = document.getElementById("loader");

const avatar0 = document.getElementById("avatar0");
const avatar1 = document.getElementById("avatar1");
const avatar2 = document.getElementById("avatar2");

const canvas = document.getElementById("canvas");

const buttonPrev = document.getElementById("buttonPrev");
const buttonNext = document.getElementById("buttonNext");

const equalizerCanvas = document.getElementById("equalizerCanvas");

const avatars = [
  {
    element: avatar0,
    endpoints: { mov: "video/0.mov", webm: "video/0.webm" }
  },
  {
    element: avatar1,
    endpoints: { mov: "video/1.mov", webm: "video/1.webm" }
  },
  {
    element: avatar2,
    endpoints: { mov: "video/2.mov", webm: "video/2.webm" }
  }
];

new Dance({
  canvas: canvas,
  avatars: avatars,
  onLoading: (progress) => {
    loader.style.background = `linear-gradient(90deg, rgba(255,255,255,1) ${progress}%, rgba(255,255,255,0.25) ${progress}%)`;
  },
  onLoaded: () => {
    loader.style.display = 'none';
  },
  buttonPrev: buttonPrev,
  buttonNext: buttonNext
});

new EqualizerAnimation({
  canvas: equalizerCanvas,
  time: performance.now(),
  noiseStrength: 40,
})