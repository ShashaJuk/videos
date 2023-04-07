import { Graphics } from "./Graphics.js";

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

    constructor(config) {
        this.danceGraphics = new Graphics({
            canvas: config.canvas,
        });
        this.dimensions = config.dimensions;
    }

    animatePixels(elapsed) {
        this.pixelSize = Math.max(
            this.pixelSizeMin,
            this.pixelSize - elapsed*this.pixelationFadeSpeed
        )
    }

    animateNoise(elapsed) {
        this.noiseStrength = Math.max(
            this.noiseStrengthMin,
            this.noiseStrength - elapsed*this.noiseFadeSpeed
        );
    }

    loop() {
        const time = Date.now();
        const elapsed = time - this.prevTime;
        this.time += elapsed;

        this.danceGraphics.initTexture(this.video);
        this.danceGraphics.draw(this.dimensions, this.time, this.noiseStrength, this.pixelSize)

        this.animateNoise(elapsed);
        this.animatePixels(elapsed);

        if ('requestVideoFrameCallback' in HTMLVideoElement.prototype) {
            this.requestId = this.video.requestVideoFrameCallback(this.loop.bind(this));
        } else {
            this.requestId = requestAnimationFrame(this.loop.bind(this))
        }

        this.prevTime = time;
    }

    startLoop() {
        this.prevTime = Date.now();
        if ('requestVideoFrameCallback' in HTMLVideoElement.prototype) {
            this.requestId = this.video.requestVideoFrameCallback(this.loop.bind(this));
        } else {
            this.requestId = requestAnimationFrame(this.loop.bind(this))
        }
    }

    stopLoop() {
        this.noiseStrength = 0.1;
        this.pixelSize = 100;
        this.noiseFadeSpeed = 0.000068;
        this.pixelationFadeSpeed = 0.06;
    
        this.danceGraphics.draw(this.dimensions, this.time, this.noiseStrength, this.pixelSize)

        if ('requestVideoFrameCallback' in HTMLVideoElement.prototype) {
            this.video.cancelVideoFrameCallback(this.requestId);
        } else {
            cancelAnimationFrame(this.requestId);
        }
    }
}