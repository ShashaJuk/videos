import { VideoAnimation } from "./VideoAnimation.js";
import { createObjectURL } from "./helpers/createObjectURL.js";
import { detectSafari } from "./helpers/detectSafari.js";

// ---- ---- ---- ---- //

async function percentageLoad(urlArray, setProgress) {
  async function downloadBlob(url, increaseProgress) {
    try {
      const response = await fetch(url);
      const res = new Response(
        new ReadableStream({
          async start(controller) {
            const reader = response.body.getReader();
            for (; ;) {
              const { done, value } = await reader.read();
              if (done) break;
              increaseProgress(value.byteLength);
              controller.enqueue(value);
            }
            controller.close();
          },
        })
      );
      return await res.blob();
    } catch (e) {
      console.error("fetch download error:", e, "url:", url);
    }
  }

  async function getfilesize(url) {
    try {
      let response = await fetch(url, {
        method: "HEAD",
      });
      return parseInt(response.headers.get("content-length"), 10);
    } catch (e) {
      console.error("fetch get content length error:", e, "url:", url);
    }
  }

  async function getFilesSize(urlArray) {
    let filesSize = 0;
    for (let url of urlArray) {
      filesSize += await getfilesize(url);
    }
    return filesSize;
  }

  function increaseProgress(value) {
    progress += value;
    const percentage = (progress / filesSize) * 100;
    setProgress(percentage);
  }

  let progress = 0;
  const filesSize = await getFilesSize(urlArray);
  let result = [];

  for (let i = 0; i < urlArray.length; i++) {
    const blob = await downloadBlob(urlArray[i], increaseProgress);
    result.push(blob);
  }

  return result;
}

// ---- ---- ---- ---- //

const loader = document.getElementById("loader");
const avatar0 = document.getElementById("avatar0");
const avatar1 = document.getElementById("avatar1");
const avatar2 = document.getElementById("avatar2");
const avatars = [avatar0, avatar1, avatar2];

const isSafari = detectSafari();

const sources = isSafari ?
  ["video/0.mov", "video/1.mov", "video/2.mov"] :
  ["video/0.webm", "video/1.webm", "video/2.webm"];

async function main() {
  const result = await percentageLoad(sources, (progress) => {
    loader.style.background = `linear-gradient(90deg, rgba(255,255,255,1) ${progress}%, rgba(255,255,255,0.25) ${progress}%)`;
  });

  const videoPromises = [];

  for (let i = 0; i < avatars.length; i++) {

    avatars[i].onerror = (e) => {
      console.warn('video error:', e);
      console.warn('error code:', e.code);
      console.warn('video element:', e.target);
    }

    avatars[i].src = createObjectURL(
      new Blob([result[i]], { type: isSafari ? "video/mp4" : "video/webm" })
    );

    avatars[i].load();

    videoPromises.push(new Promise((resolve) => {

      avatars[i].onloadedmetadata = () => {

        avatars[i].onloadedmetadata = null;

        if (isSafari) {
          setTimeout(() => {
            resolve();
          }, 1000)
        } else {
          resolve();
        }

      };

    }));
  }

  Promise.all(videoPromises).then(() => {

    loader.style.display = 'none';

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
}

main();