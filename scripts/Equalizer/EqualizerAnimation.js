import { Equalizer } from "./Equalizer.js"

export class EqualizerAnimation {
    canvas;

    dimensions;
    time;
    noiseStrength;

    constructor(config) {
        this.canvas = config.canvas;

        this.setSize();

        this.equalizer = new Equalizer({
            canvas: this.canvas,
        })

        this.dimensions = config.dimensions;
        this.time = config.time;
        this.noiseStrength = config.noiseStrength;

        this.resizeHandler = this.resizeHandler.bind(this);
        window.addEventListener('resize', this.resizeHandler);

        this.draw(this.dimensions, this.time, this.noiseStrength)
    }

    setSize() {
        this.canvas.width = window.innerWidth * window.devicePixelRatio;
        this.canvas.height = window.innerHeight * window.devicePixelRatio;

        this.dimensions = [
            window.innerWidth * window.devicePixelRatio,
            window.innerHeight * window.devicePixelRatio
        ]

    }

    resizeHandler() {
        this.setSize();
        this.draw(this.dimensions, this.time, this.noiseStrength)
    }

    draw(dimensions, time, noiseStrength) {
        this.dimensions = dimensions;
        this.time = time;
        this.noiseStrength = noiseStrength;

        this.equalizer.draw(this.dimensions, this.time, this.noiseStrength);
    }
}