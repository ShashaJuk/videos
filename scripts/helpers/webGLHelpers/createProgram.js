function createShader(gl, source, type) {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    // Compilation successful
    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;

    console.warn(`could not compile ${type} shader:\n\n${gl.getShaderInfoLog(shader) ?? 'no info'}`);
    gl.deleteShader(shader);
    return null;
}

export function createProgram(gl, vs, fs) {
    const compiledVert = createShader(gl, vs, gl.VERTEX_SHADER);
    const compiledFrag = createShader(gl, fs, gl.FRAGMENT_SHADER);

    if (!compiledVert || !compiledFrag) return null;

    const program = gl.createProgram();
    if (!program) return null;
    gl.attachShader(program, compiledVert);
    gl.attachShader(program, compiledFrag);
    gl.linkProgram(program);

    if (gl.getProgramParameter(program, gl.LINK_STATUS)) return program;

    console.warn('could not link the shader program!');
    gl.deleteProgram(program);
    gl.deleteProgram(compiledVert);
    gl.deleteProgram(compiledFrag);
    return null;
}