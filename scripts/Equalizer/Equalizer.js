import { createProgram } from "../helpers/webGLHelpers/createProgram.js";
import { setAttributes } from "../helpers/webGLHelpers/setAttributes.js";

import { vertexShader } from "../shaders/vertex.js";
import { equalizerShader } from "../shaders/equalizer/equalizer.js";

export class Equalizer {

    canvas;
    gl;

    equalizerProgram = null;

    uniformParams = {
        time: null,
        dimensions: null,
        noiseStrength: null,
    };

    constructor(config) {
        this.canvas = config.canvas;
        this.gl = this.canvas.getContext("webgl");

        this.equalizerProgram = createProgram(this.gl, vertexShader, equalizerShader);

        // init uniform params
        this.uniformParams.dimensions = this.gl.getUniformLocation(
            this.equalizerProgram,
            "dimensions"
        );
        this.uniformParams.time = this.gl.getUniformLocation(
            this.equalizerProgram,
            "time"
        );
        this.uniformParams.noiseStrength = this.gl.getUniformLocation(
            this.equalizerProgram,
            "noiseStrength"
        );

        setAttributes(this.gl, this.equalizerProgram);
    }

    draw(dimensions, tick, noiseStrengthValue) {

        // equalizer
        this.gl.useProgram(this.equalizerProgram);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);

        // handle resizes
        this.gl.viewport(0, 0, this.gl.canvas.height, this.gl.canvas.height);

        // set equalizer params
        this.gl.uniform2fv(this.uniformParams.dimensions, dimensions);
        this.gl.uniform1f(this.uniformParams.time, tick);
        this.gl.uniform1f(this.uniformParams.noiseStrength, noiseStrengthValue);
    }

}
