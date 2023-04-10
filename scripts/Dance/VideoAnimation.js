import { Graphics } from "./Graphics.js";
import { detectSafari } from "../helpers/detectSafari.js";

export class VideoAnimation {
    danceGraphics;

    video;

    requestId;

    dimensions;

    time = 0;

    noiseStrength = 0.1;
    noiseStrengthMin = 0;

    pixelSize = 100;
    pixelSizeMin = 1;

    noiseFadeSpeed = 0.000068;
    noiseFluctuationSpeed = 0.01;

    pixelationFadeSpeed = 0.06;

    pixelationStep = 4;

    prevTime;

    loopStrategy;
    stopLoopStrategy;

    constructor(config) {
        this.danceGraphics = new Graphics({
            canvas: config.canvas,
        });
        this.dimensions = config.dimensions;

        if ('requestVideoFrameCallback' in HTMLVideoElement.prototype) {
            this.loopStrategy = () => { this.requestId = this.video.requestVideoFrameCallback(this.loop.bind(this)); }
            this.stopLoopStrategy = () => { this.video.cancelVideoFrameCallback(this.requestId); }
        } else {
            if (detectSafari()) {
                this.loopStrategy = () => { this.requestId = setTimeout(this.loop.bind(this), 41); }
                this.stopLoopStrategy = () => { clearTimeout(this.requestId) }
            } else {
                this.loopStrategy = () => { this.requestId = requestAnimationFrame(this.loop.bind(this)); }
                this.stopLoopStrategy = () => { cancelAnimationFrame(this.requestId); }
            }
        }

    }

    animatePixels(elapsed) {
        this.pixelSize = Math.max(
            this.pixelSizeMin,
            this.pixelSize - elapsed * this.pixelationFadeSpeed
        )
    }

    animateNoise(elapsed) {
        this.noiseStrength = Math.max(
            this.noiseStrengthMin,
            this.noiseStrength - elapsed * this.noiseFadeSpeed
        );
    }

    loop() {
        const time = performance.now();
        const elapsed = time - this.prevTime;
        this.time += elapsed;

        this.danceGraphics.initTexture(this.video);
        this.danceGraphics.draw(this.dimensions, this.time, this.noiseStrength, this.pixelSize)

        this.animateNoise(elapsed);
        this.animatePixels(elapsed);

        this.loopStrategy();

        this.prevTime = time;
    }

    startLoop() {
        this.prevTime = performance.now();
        this.loopStrategy();
    }

    stopLoop() {
        this.noiseStrength = 0.1;
        this.pixelSize = 100;
        this.noiseFadeSpeed = 0.000068;
        this.pixelationFadeSpeed = 0.06;

        this.danceGraphics.draw(this.dimensions, this.time, this.noiseStrength, this.pixelSize)

        this.stopLoopStrategy();
    }
}