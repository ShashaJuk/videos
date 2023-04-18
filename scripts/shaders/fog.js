export const fogShader = `
precision highp float;

#define TWOPI 6.28318530718

varying vec2 v_texCoord;

uniform float time;
uniform vec2 dimensions;

vec3 mod289(vec3 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x) {
    return mod289(((x * 34.0) + 10.0) * x);
}

vec4 taylorInvSqrt(vec4 r) {
    return 1.79284291400159 - 0.85373472095314 * r;
}

float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    // First corner
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

    // Other corners
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = vec3(1.0) - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    i = mod289(i);
    vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);

    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = vec4(1.0) - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);

    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);

    // Normalise gradients
    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    // Mix final noise value
    vec4 m = max(0.5 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;

    return 105.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}











void main() {
    // CREATE COORD SYSTEM

    vec2 coord = vec2(
        gl_FragCoord.x - dimensions.x / 2.0,
        (gl_FragCoord.y - dimensions.y / 2.0)
    );

    coord.y *= 4.0;



    // CREATE DISPLACEMENT

    float speedDisplace = 0.00001;
    float noiseDisplaceTime = time * speedDisplace;
    float noiseDisplaceScale = 0.0008;
    float noiseDisplaceStrength = 64.0;

    float noiseDisplace = snoise(vec3(
        coord.x * noiseDisplaceScale * 0.1* 4.0,
        coord.y * noiseDisplaceScale * 0.1,
        noiseDisplaceTime
    ));
    noiseDisplace *= 2.0;

    float noiseDisplace2 = snoise(vec3(
        coord.x * noiseDisplaceScale * 2.0,
        coord.y * noiseDisplaceScale * 2.0 ,
        noiseDisplaceTime
    ));
    noiseDisplace2 *= 0.5;

    float noiseDisplace3 = snoise(vec3(
        coord.x * noiseDisplaceScale * 4.0,
        coord.y * noiseDisplaceScale * 4.0,
        noiseDisplaceTime
    ));
    noiseDisplace3 *= 0.25;

    float noiseDisplace4 = snoise(vec3(
        coord.x * noiseDisplaceScale * 64.0,
        coord.y * noiseDisplaceScale * 64.0,
        noiseDisplaceTime * 4.0
    ));
    noiseDisplace4 *= 0.025;

    noiseDisplace = noiseDisplace + noiseDisplace2 + noiseDisplace3 + noiseDisplace4;





    // apply displacement

    coord = vec2(
        coord.x + noiseDisplaceStrength * sin(noiseDisplace * TWOPI),
        coord.y + noiseDisplaceStrength * cos(noiseDisplace * TWOPI)
    );





    // CREATE FOG

    float speed = 0.00003;
    float noiseTime = time * speed;
    float noiseScale = 0.0008;

    float noise = snoise(vec3(
        coord.x * noiseScale,
        coord.y * noiseScale,
        noiseTime
    ));
    noise = noise * 0.5 + 0.5;
    noise = noise * noise * noise;
    noise *= 4.0;

    float noise2 = snoise(vec3(
        coord.x * noiseScale * 2.0,
        coord.y * noiseScale * 2.0,
        noiseTime
    ));
    noise2 = noise2 * 0.5 + 0.5;
    noise2 = noise2 * noise2 * noise2 * noise2;

    float noise3 = snoise(vec3(
        coord.x * noiseScale * 8.0,
        coord.y * noiseScale * 8.0,
        noiseTime
    ));
    noise3 = noise3 * 0.5 + 0.5;
    noise3 *= 0.5;

    noise = (noise + noise2 + noise3) / 3.0;
    noise *= 0.5;
    noise -= 0.05;

    



    noise *= v_texCoord.y * v_texCoord.y;

    gl_FragColor = vec4(noise, noise, noise, noise);
}
`;