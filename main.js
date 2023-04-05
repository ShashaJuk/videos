const loader = document.getElementById("loader");
const avatar1 = document.getElementById("avatar1");
const avatar2 = document.getElementById("avatar2");
const avatar3 = document.getElementById("avatar3");
const progressSpan = document.getElementById('progress');

const percentageLoad = new PercentageLoad();
const result = await percentageLoad.load(
  [
    "https://shashajuk.github.io/videos/0.mov",
    "https://shashajuk.github.io/videos/1.mov",
    "https://shashajuk.github.io/videos/2.mov",
    "https://shashajuk.github.io/videos/3.mov",
  ],
  (progress) => {
    console.log("progress:", progress);
    progressSpan.innerHTML = `${Math.round(progress)}% loaded`
  }
);


const avatars = [avatar1, avatar2, avatar3];

const videoPromises = [];

function createObjectURL(file) {
  if (window.webkitURL) {
    return window.webkitURL.createObjectURL(file);
  } else if (window.URL && window.URL.createObjectURL) {
    return window.URL.createObjectURL(file);
  } else {
    console.warn("❌ no window.URL / window.webkitURL");
    return null;
  }
}

for (let i = 0; i < [loader, ...avatars].length; i++) {
  [loader, ...avatars][i].src = createObjectURL(
    new Blob([result[i]], { type: 'video/mp4; codecs="hvc1"' })
  );
  [loader, ...avatars][i].load();
  videoPromises.push(
    new Promise((resolve) => {
      [loader, ...avatars][i].oncanplaythrough = () => {
        [loader, ...avatars][i].oncanplaythrough = null;
        resolve();
      };
    })
  );
}

loader.playbackRate = 8;

Promise.all(videoPromises).then(() => {
  console.log("all videos loaded");

  loader.play();

  loader.onended = () => {
    loader.style.opacity = 0;
    avatar1.style.opacity = 1;
    avatar1.style.filter = "blur(0px) hue-rotate(0deg) contrast(1)";
    avatar1.play();
    avatar1.ontimeupdate = () => {
      avatar1.ontimeupdate = null;
      for (const avatar of avatars) {
        avatar.style.transition = "opacity 2s, filter 2s";
      }
    };
    buttonPrev.disabled = false;
    buttonNext.disabled = false;

    let currentAvatarIndex = 0;

    buttonPrev.onclick = () => {
      const prevAvatarIndex = currentAvatarIndex;
      currentAvatarIndex--;
      if (currentAvatarIndex === -1) {
        currentAvatarIndex = 2;
      }
      swapVideos(avatars[prevAvatarIndex], avatars[currentAvatarIndex]);
    };

    buttonNext.onclick = () => {
      const prevAvatarIndex = currentAvatarIndex;
      currentAvatarIndex++;
      if (currentAvatarIndex === 3) {
        currentAvatarIndex = 0;
      }
      swapVideos(avatars[prevAvatarIndex], avatars[currentAvatarIndex]);
    };

    function swapVideos(prev, next) {
      // applyFillter();
      // setTimeout(() => {
      prev.pause();
      const time = prev.currentTime;
      next.currentTime = time;
      next.ontimeupdate = () => {
        next.ontimeupdate = null;
        prev.style.opacity = 0;
        prev.style.filter = "blur(32px) hue-rotate(180deg) contrast(10)";
        next.style.opacity = 1;
        next.style.filter = "blur(0px) hue-rotate(0deg) contrast(1)";
        next.play();
      };
      // }, 1500);
    }
  };
});

// function applyFillter() {
//   const element = document.createElement("div");
//   element.innerHTML = `
//   <svg class="filter" xmlns="http://www.w3.org/2000/svg">
//     <filter id="displacementFilter">
//       <feTurbulence type="turbulence" baseFrequency="0" numOctaves="1" result="turbulence">
//         <animate
//         attributeName="baseFrequency"
//         values="0;0.05;0"
//         dur="5s"
//         repeatCount="indefinite" />
//       </feTurbulence>
//       <feDisplacementMap in2="turbulence" in="SourceGraphic" scale="1" xChannelSelector="R" yChannelSelector="G">
//         <animate
//         attributeName="scale"
//         values="0;50;0"
//         dur="5s"
//         repeatCount="indefinite" />
//       </feDisplacementMap>
//     </filter>
//   </svg>
//   `;
//   const fillter = element.firstElementChild;
//   document.documentElement.appendChild(fillter);
//   setTimeout(() => {
//     fillter.remove();
//   }, 5000);
// }
