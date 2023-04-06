import { Graphics } from "./Graphics.js";
// import { detectSafari } from "./helpers/detectSafari.js";

// const isSafari = detectSafari();

export class VideoAnimation {
    danceGraphics;

    video;

    requestId;

    dimensions;

    tick = 0;

    noiseStrength = 0.1;
    noiseStrengthMin = 0;

    pixelSize = 100;
    pixelSizeMin = 1;

    noiseFadeSpeed = 0.017;

    pixelationFadeSpeed = 6;

    pixelationStep = 4;

    constructor(config) {
        this.danceGraphics = new Graphics({
            canvas: config.canvas,
        });
        this.dimensions = config.dimensions;
    }

    animatePixels() {
        this.pixelSize = Math.max(
            this.pixelSizeMin,
            this.pixelSize - this.pixelationFadeSpeed
        )
    }

    animateNoise() {
        this.noiseStrength = Math.max(
            this.noiseStrengthMin,
            this.noiseStrength - this.noiseFadeSpeed 
        );
    }

    loop() {
        this.danceGraphics.initTexture(this.video);

        this.danceGraphics.drawNoise();
        this.danceGraphics.setNoiseParams(this.dimensions, this.tick, this.noiseStrength);

        this.danceGraphics.drawPixels();
        this.danceGraphics.setPixelsFadeParams(this.dimensions, this.pixelSize);

        this.animateNoise();
        this.animatePixels();

        this.tick += 1;

        this.requestId = this.video.requestVideoFrameCallback(this.loop.bind(this));
    }

    startLoop() {
        this.requestId = this.video.requestVideoFrameCallback(this.loop.bind(this));
    }

    stopLoop() {
        this.noiseStrength = 0.1;
        this.pixelSize = 100;
        this.pixelationFadeSpeed = 8
        this.noiseFadeSpeed =0.023

        this.danceGraphics.drawNoise();
        this.danceGraphics.setNoiseParams(this.dimensions, this.tick, this.noiseStrength);
        this.danceGraphics.drawPixels();
        this.danceGraphics.setPixelsFadeParams(this.dimensions, this.pixelSize);

        this.video.cancelVideoFrameCallback(this.requestId)
    }
}