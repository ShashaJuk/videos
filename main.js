const loader = document.getElementById("loader");
const avatar1 = document.getElementById("avatar1");
const avatar2 = document.getElementById("avatar2");
const avatar3 = document.getElementById("avatar3");
const progressSpan = document.getElementById("progress");
const pixelateFillter = document.getElementById("pixelate");

const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
const sources = isSafari
  ? ["video/0.mov", "video/1.mov", "video/2.mov", "video/3.mov"]
  : ["video/0.webm", "video/1.webm", "video/2.webm", "video/3.webm"];

const percentageLoad = new PercentageLoad();
const result = await percentageLoad.load(sources, (progress) => {
  console.log("progress:", progress);
  progressSpan.innerHTML = `${Math.round(progress)}% loaded`;
});

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
    new Blob([result[i]], { type: isSafari ? "video/mp4" : "video/webm" })
  );
  // [loader, ...avatars][i].type = isSafari
  //   ? 'video/mp4; codecs="hvc1"'
  //   : "video/webm";
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
    // avatar1.style.filter = "blur(0px) hue-rotate(0deg) contrast(1)";
    avatar1.play();
    // avatar1.ontimeupdate = () => {
    // avatar1.ontimeupdate = null;
    // for (const avatar of avatars) {
    // avatar.style.transition = "opacity 2s, filter 2s";
    // }
    // };
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
      let tick = 0;
      let level = 0;
      const step = 0.2;
      let prevLevel = 0;

      function increase() {
        tick++;
        level += step;
        const roundedLevel = Math.round(level);
        if (roundedLevel !== prevLevel) {
          updateFillter(roundedLevel);
        }
        prevLevel = Math.round(level);
        if (tick === 50) {
          // prev.pause();
          const time = prev.currentTime;
          next.currentTime = time;
          console.log("&");
          next.ontimeupdate = () => {
            //
            prev.pause();
            //
            console.log("!");
            next.ontimeupdate = null;
            prev.style.opacity = 0;
            next.style.opacity = 1;
            next.play();
            decrease();
          };
        } else if (tick < 100) {
          requestAnimationFrame(increase);
        }
      }

      function decrease() {
        tick++;
        level -= step;
        const roundedLevel = Math.round(level);
        if (roundedLevel !== prevLevel) {
          updateFillter(roundedLevel);
        }
        prevLevel = Math.round(level);
        if (tick < 100) {
          requestAnimationFrame(decrease);
        }
      }

      increase();
    }
  };
});

function updateFillter(level) {
  console.log(level);
  const radius = level;
  const size = Math.max(1, level * 2);

  if (level === 0) {
    pixelate.innerHTML = "";
  } else {
    pixelate.innerHTML = `
    <feFlood x="0" y="0" height="1" width="1"/>    
    <feComposite width="${size}" height="${size}"/>
    <feTile result="a"/>
    <feComposite in="SourceGraphic" in2="a" operator="in"/>
    <feMorphology operator="dilate" radius="${radius}">
  `;
  }
}
