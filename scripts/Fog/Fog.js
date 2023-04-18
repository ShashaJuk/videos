import { createProgram } from "../helpers/webGLHelpers/createProgram.js";
import { setAttributes } from "../helpers/webGLHelpers/setAttributes.js";

import { vertexShader } from "../shaders/vertex.js";
import { fogShader } from "../shaders/fog.js";

export class Equalizer {

    canvas;
    gl;

    fogProgramm = null;

    uniformParams = {
        fogTime: null,
        fogDimensions: null,
    };

    constructor(config) {
        this.canvas = config.canvas;
        this.gl = this.canvas.getContext("webgl");

        this.fogProgramm = createProgram(this.gl, vertexShader, fogShader);

        // init uniform params
        this.uniformParams.fogDimensions = this.gl.getUniformLocation(
            this.fogProgramm,
            "dimensions"
        );
        this.uniformParams.fogTime = this.gl.getUniformLocation(
            this.fogProgramm,
            "time"
        );

        setAttributes(this.gl, this.fogProgramm);
    }

    draw(tick) {
        // handle resizes
        this.gl.viewport(
            0,
            0,
            this.canvas.offsetWidth * window.devicePixelRatio,
            this.canvas.offsetHeight * window.devicePixelRatio
        );

        // fog
        this.gl.useProgram(this.fogProgramm);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);

        // set fog params
        this.gl.uniform2fv(this.uniformParams.fogDimensions, [
            this.canvas.offsetWidth * window.devicePixelRatio,
            this.canvas.offsetHeight * window.devicePixelRatio
        ]);
        this.gl.uniform1f(this.uniformParams.fogTime, tick);
    }

}