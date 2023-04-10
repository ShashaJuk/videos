import { detectSafari } from "../helpers/detectSafari.js";
import { VideoAnimation } from "./VideoAnimation.js";
import { percentageLoad } from "../helpers/percentageLoad.js";
import { createObjectURL } from "../helpers/createObjectURL.js"

export class Dance {
    canvas

    avatars

    onLoading
    onLoaded

    buttonPrev
    buttonNext

    isSafari = detectSafari();

    currentAvatarIndex = 0;

    videoAnimation

    constructor(config) {
        this.canvas = config.canvas;

        this.avatars = config.avatars;

        this.onLoading = config.onLoading;
        this.onLoaded = config.onLoaded;

        this.buttonPrev = config.buttonPrev;
        this.buttonNext = config.buttonNext;

        this.loadVideos();
    }

    async loadVideos() {
        const sources = this.avatars.map((avatar) => {
            return this.isSafari ? avatar.endpoints.mov : avatar.endpoints.webm;
        });
        const videosData = await percentageLoad(sources, this.onLoading);
        console.log(videosData)
        await this.initVideos(videosData);

        this.onLoaded()

        this.videoAnimation = new VideoAnimation({
            canvas: this.canvas,
            dimensions: [1080, 1080]
        });

        this.videoAnimation.video = this.avatars[0].element;
        this.videoAnimation.startLoop();
        this.videoAnimation.video.play();

        this.prev = this.prev.bind(this);
        this.next = this.next.bind(this);

        this.buttonPrev.addEventListener('click', this.prev);
        this.buttonNext.addEventListener('click', this.next);
    }

    initVideos(videosData) {
        const videoPromises = [];

        for (let i = 0; i < this.avatars.length; i++) {

            this.avatars[i].element.onerror = (e) => {
                console.warn('video error:', e);
                console.warn('error code:', e.code);
                console.warn('video element:', e.target);
            }

            this.avatars[i].element.src = createObjectURL(
                new Blob([videosData[i]], { type: this.isSafari ? "video/mp4" : "video/webm" })
            );

            this.avatars[i].element.load();

            videoPromises.push(new Promise((resolve) => {
                this.avatars[i].element.onloadedmetadata = () => {
                    this.avatars[i].element.onloadedmetadata = null;
                    if (this.isSafari) {
                        setTimeout(() => {
                            resolve();
                        }, 1000)
                    } else {
                        resolve();
                    }
                };
            }));
        }

        return Promise.all(videoPromises)
    }

    prev() {
        this.swapVideos(false);
    }

    next() {
        this.swapVideos(true);
    }

    swapVideos(direction) {
        const prevAvatarIndex = this.currentAvatarIndex;
        if (direction) {
            this.currentAvatarIndex++;
            if (this.currentAvatarIndex === this.avatars.length) {
                this.currentAvatarIndex = 0;
            }
        } else {
            this.currentAvatarIndex--;
            if (this.currentAvatarIndex === -1) {
                this.currentAvatarIndex = this.avatars.length - 1;
            }
        }
        const prev = this.avatars[prevAvatarIndex].element
        const next = this.avatars[this.currentAvatarIndex].element

        const time = prev.currentTime;
        next.currentTime = time;
        next.ontimeupdate = () => {
            prev.pause();
            next.ontimeupdate = null;
            this.videoAnimation.stopLoop();
            this.videoAnimation.video = next;
            this.videoAnimation.startLoop();
            next.play();
        };
    }
}