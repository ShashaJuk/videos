import { VideoAnimation } from "./VideoAnimation.js";
import { PercentageLoad } from "./helpers/PercentageLoad.js";
import { createObjectURL } from "./helpers/createObjectURL.js";
import { detectSafari } from "./helpers/detectSafari.js";

const avatar0 = document.getElementById("avatar0");
const avatar1 = document.getElementById("avatar1");
const avatar2 = document.getElementById("avatar2");
const avatars = [avatar0, avatar1, avatar2];

const isSafari = detectSafari();

const sources = isSafari
  ? ["assets/video/0.mov", "assets/video/1.mov", "assets/video/2.mov"]
  : ["assets/video/0.webm", "assets/video/1.webm", "assets/video/2.webm"];

const result = await new PercentageLoad().load(sources, (progress) => {
  console.log("progress:", progress);
});

const videoPromises = [];

for (let i = 0; i < avatars.length; i++) {
  avatars[i].src = createObjectURL(
    new Blob([result[i]], { type: isSafari ? "video/mp4" : "video/webm" })
  );
  avatars[i].load();
  videoPromises.push(
    new Promise((resolve) => {
      avatars[i].oncanplaythrough = () => {
        avatars[i].oncanplaythrough = null;
        resolve();
      };
    })
  );
}

Promise.all(videoPromises).then(() => {

  const videoAnimation = new VideoAnimation({
    canvas: document.getElementById('canvas'),
    dimensions: [1080, 1080]
  });

  videoAnimation.video = avatar0;
  videoAnimation.startLoop();
  videoAnimation.video.play();

  buttonPrev.disabled = false;
  buttonNext.disabled = false;

  let currentAvatarIndex = 0;

  buttonPrev.onclick = () => {
    const prevAvatarIndex = currentAvatarIndex;
    currentAvatarIndex--;
    if (currentAvatarIndex === -1) {
      currentAvatarIndex = avatars.length - 1;
    }
    swapVideos(avatars[prevAvatarIndex], avatars[currentAvatarIndex]);
  };

  buttonNext.onclick = () => {
    const prevAvatarIndex = currentAvatarIndex;
    currentAvatarIndex++;
    if (currentAvatarIndex === avatars.length) {
      currentAvatarIndex = 0;
    }
    swapVideos(avatars[prevAvatarIndex], avatars[currentAvatarIndex]);
  };

  function swapVideos(prev, next) {
    const time = prev.currentTime;
    next.currentTime = time;
    next.ontimeupdate = () => {
      prev.pause();
      next.ontimeupdate = null;
      videoAnimation.stopLoop();
      videoAnimation.video = next;
      videoAnimation.startLoop();
      next.play();
    };
  }

});