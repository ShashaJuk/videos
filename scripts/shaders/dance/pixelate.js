export const pixelateShader = `
precision highp float;

varying vec2 v_texCoord;
uniform sampler2D texture;

uniform vec2 dimensions;
uniform float pixelSize;

void main() {

  vec2 coord = v_texCoord;

  coord *= dimensions;
  coord = dimensions/2.0 + pixelSize * floor((coord - dimensions/2.0) / vec2(pixelSize, pixelSize));
  coord /= dimensions;

  gl_FragColor = texture2D(texture, coord);
}
`;
