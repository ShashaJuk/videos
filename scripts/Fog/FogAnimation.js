import { Equalizer } from "./Fog.js"

export class EqualizerAnimation {
    canvas;

    constructor(config) {
        this.canvas = config.canvas;

        this.setSize();

        this.equalizer = new Equalizer({
            canvas: this.canvas,
        })

        this.resizeHandler = this.resizeHandler.bind(this);
        window.addEventListener('resize', this.resizeHandler);
        this.loop = this.loop.bind(this);
        this.loop();
    }

    resizeHandler() {
        this.setSize();
        this.draw()
    }

    setSize() {
        this.canvas.width = this.canvas.offsetWidth * window.devicePixelRatio;
        this.canvas.height = this.canvas.offsetHeight * window.devicePixelRatio;
    }

    draw() {
        this.equalizer.draw(performance.now());
    }

    loop() {
        this.draw();
        requestAnimationFrame(this.loop)
    }
}