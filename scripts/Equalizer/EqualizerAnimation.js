import { Equalizer } from "./Equalizer.js"

export class EqualizerAnimation {
    canvas;

    time;
    noiseStrength;

    constructor(config) {
        this.canvas = config.canvas;

        this.setSize();

        this.equalizer = new Equalizer({
            canvas: this.canvas,
        })

        this.time = config.time;
        this.noiseStrength = config.noiseStrength;

        this.resizeHandler = this.resizeHandler.bind(this);
        window.addEventListener('resize', this.resizeHandler);

        this.draw(this.time, this.noiseStrength);
        this.loop();
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
        this.draw(this.time, this.noiseStrength)
    }

    draw(time, noiseStrength) {
        this.time = time;
        this.noiseStrength = noiseStrength;

        this.equalizer.draw(this.time, this.noiseStrength);
    }

    loop(){
        this.draw(performance.now(), this.noiseStrength);
        requestAnimationFrame(this.loop.bind(this))
    }
}