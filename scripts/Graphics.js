import { createProgram } from "./helpers/webGLHelpers/createProgram.js";
import { createTexture } from "./helpers/webGLHelpers/createTexture.js";
import { addTexture } from "./helpers/webGLHelpers/addTexture.js";
import { createTextureAndFramebuffer } from "./helpers/webGLHelpers/createTextureAndFrameBuffer.js";
import { setAttributes } from "./helpers/webGLHelpers/setAttributes.js";
import { bindTexture } from "./helpers/webGLHelpers/bindTexture.js";

import { vertexShader } from "./shaders/vertex.js";
import { noiseShader } from "./shaders/noise.js";
import { pixelateShader } from "./shaders/pixelate.js";

export class Graphics {

  canvas;
  gl;

  noiseProgram = null;
  pixelsAndFadeProgram = null;

  textureAndFrameBuffer = {
    texture: null,
    frameBuffer: null,
  };

  originTexture = null;

  uniformParams = {
    time: null,
    noiseDimensions: null,
    noiseStrength: null,
    pixelsDimensions: null,
    pixelSize: null,
  };

  constructor(config) {
    this.canvas = config.canvas;
    this.gl = this.canvas.getContext("webgl", {
      premultipliedAlpha: false,
    });

    this.gl.viewport(0, 0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);

    this.noiseProgram = createProgram(this.gl, vertexShader, noiseShader);
    this.pixelsAndFadeProgram = createProgram(this.gl, vertexShader, pixelateShader);

    this.textureAndFrameBuffer = createTextureAndFramebuffer(this.gl);

    this.initUniformParams();

    this.originTexture = createTexture(this.gl);

    setAttributes(this.gl, this.noiseProgram);
    setAttributes(this.gl, this.pixelsAndFadeProgram);
  }

  initUniformParams() {
    this.uniformParams.noiseDimensions = this.gl.getUniformLocation(
      this.noiseProgram,
      "dimensions"
    );
    this.uniformParams.time = this.gl.getUniformLocation(
      this.noiseProgram,
      "time"
    );
    this.uniformParams.noiseStrength = this.gl.getUniformLocation(
      this.noiseProgram,
      "noiseStrength"
    );
    this.uniformParams.pixelsDimensions = this.gl.getUniformLocation(
      this.pixelsAndFadeProgram,
      "dimensions"
    );
    this.uniformParams.pixelSize = this.gl.getUniformLocation(
      this.pixelsAndFadeProgram,
      "pixelSize"
    );
  }

  setNoiseParams(dimensions, tick, noiseStrengthValue) {
    const { noiseDimensions, time, noiseStrength } = this.uniformParams;
    this.gl.uniform2fv(noiseDimensions, dimensions);
    this.gl.uniform1f(time, tick);
    this.gl.uniform1f(noiseStrength, noiseStrengthValue);
  }

  setPixelsFadeParams(dimensions, pixelSizeValue) {
    const { pixelsDimensions, pixelSize } = this.uniformParams;
    this.gl.uniform2fv(pixelsDimensions, dimensions);
    this.gl.uniform1f(pixelSize, pixelSizeValue);
  }

  initTexture(texture) {
    bindTexture(this.gl, this.originTexture);
    addTexture(this.gl, texture);
  }

  drawNoise() {
    this.gl.useProgram(this.noiseProgram);
    this.gl.bindFramebuffer(
      this.gl.FRAMEBUFFER,
      this.textureAndFrameBuffer.frameBuffer
    );

    bindTexture(this.gl, this.originTexture);
    this.gl.clearColor(0.0, 0.0, 0.0, 0.0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    this.gl.viewport(0, 0, this.gl.canvas.height, this.gl.canvas.height);
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
  }

  drawPixels() {
    this.gl.useProgram(this.pixelsAndFadeProgram);
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);

    bindTexture(this.gl, this.textureAndFrameBuffer.texture);
    this.gl.clearColor(0.0, 0.0, 0.0, 0.0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    this.gl.viewport(0, 0, this.gl.canvas.height, this.gl.canvas.height);
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
  }

}
