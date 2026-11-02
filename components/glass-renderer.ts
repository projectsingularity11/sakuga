const vertex = `attribute vec2 position; varying vec2 uv; void main(){uv=position*.5+.5;gl_Position=vec4(position,0.,1.);}`;
const fragment = `precision mediump float;
varying vec2 uv;uniform vec2 pointer;uniform float time;uniform float scroll;uniform float light;
void main(){
 vec2 p=vec2(uv.x,1.-uv.y);
 float bend=.06*sin(p.y*5.+time*.23+scroll*1.8);
 float rib=fract((p.x+bend*.14)*13.0)-.5;
 float thickness=sqrt(max(.001,.25-rib*rib));
 float normal=rib*2.;
 float edge=pow(abs(normal),12.);
 float lens=normal*.035+sin(p.y*3.+time*.18)*.012;
 vec2 q=vec2(p.x+lens,p.y);
 vec2 blue=vec2(.2+pointer.x*.1,.25+pointer.y*.08);
 vec2 orange=vec2(.82-pointer.x*.06,.74-pointer.y*.05);
 float a=exp(-length((q-blue)*vec2(1.2,.8))*3.5);
 float b=exp(-length((q-orange)*vec2(1.1,.85))*4.0);
 vec3 cool=vec3(.08,.39,1.0),warm=vec3(1.,.30,.07);
 vec3 color=vec3(.026,.039,.062)+(cool*a*.23+warm*b*.2)*(0.6+thickness*1.4);
 color+=edge*(cool*a*.2+warm*b*.16+vec3(.04));
 float glint=pow(max(0.,1.-abs(normal-.72)*3.5),5.);
 color+=glint*vec3(.12,.16,.22)*(a+b+.13);
 vec3 day=vec3(.93,.95,.98)-(cool*(1.-a)*.028+warm*b*.05)+edge*vec3(.035);
 gl_FragColor=vec4(mix(color,day,light),1.);
}`;
export function startGlass(
  canvas: HTMLCanvasElement,
  onUnavailable: () => void,
) {
  const gl = canvas.getContext("webgl", {
    alpha: false,
    antialias: false,
    powerPreference: "low-power",
    depth: false,
    stencil: false,
  });
  if (!gl) {
    onUnavailable();
    return () => {};
  }
  const shaders: WebGLShader[] = [];
  let program: WebGLProgram | null = null,
    buffer: WebGLBuffer | null = null,
    frame = 0,
    stopped = false,
    last = 0,
    elapsed = 0,
    awake = performance.now() + 7000,
    scroll = window.scrollY,
    px = 0.5,
    py = 0.4;
  const reduce = matchMedia("(prefers-reduced-motion:reduce)"),
    scheme = matchMedia("(prefers-color-scheme:dark)");
  try {
    const extension = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = extension
      ? String(gl.getParameter(extension.UNMASKED_RENDERER_WEBGL))
      : "";
    if (/swiftshader|llvmpipe|software/i.test(renderer)) {
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      onUnavailable();
      return () => {};
    }
    for (const [type, source] of [
      [gl.VERTEX_SHADER, vertex],
      [gl.FRAGMENT_SHADER, fragment],
    ] as const) {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
        throw Error("Shader unavailable");
      shaders.push(shader);
    }
    program = gl.createProgram()!;
    shaders.forEach((shader) => gl.attachShader(program!, shader));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS))
      throw Error("Glass unavailable");
    gl.useProgram(program);
    buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );
    const position = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  } catch {
    shaders.forEach((s) => gl.deleteShader(s));
    if (program) gl.deleteProgram(program);
    if (buffer) gl.deleteBuffer(buffer);
    onUnavailable();
    return () => {};
  }
  const uniforms = {
    pointer: gl.getUniformLocation(program!, "pointer"),
    time: gl.getUniformLocation(program!, "time"),
    scroll: gl.getUniformLocation(program!, "scroll"),
    light: gl.getUniformLocation(program!, "light"),
  };
  function resize() {
    canvas.width = Math.min(1440, Math.round(innerWidth * 0.7));
    canvas.height = Math.min(900, Math.round(innerHeight * 0.7));
    gl!.viewport(0, 0, canvas.width, canvas.height);
    wake();
  }
  function draw(now: number) {
    frame = 0;
    if (stopped || document.hidden || reduce.matches) return;
    if (now - last >= 1000 / 30) {
      elapsed += Math.min((now - last) / 1000, 0.05);
      last = now;
      const appearance = document.documentElement.dataset.appearance;
      gl!.uniform2f(uniforms.pointer, px, py);
      gl!.uniform1f(uniforms.time, elapsed);
      gl!.uniform1f(uniforms.scroll, scroll * 0.0004);
      gl!.uniform1f(
        uniforms.light,
        appearance === "light" || (appearance === "system" && !scheme.matches)
          ? 1
          : 0,
      );
      gl!.drawArrays(gl!.TRIANGLES, 0, 6);
      if (canvas.dataset.ready !== "true") canvas.dataset.ready = "true";
    }
    if (now < awake) frame = requestAnimationFrame(draw);
  }
  function wake() {
    awake = performance.now() + 1800;
    if (!frame && !stopped && !document.hidden && !reduce.matches)
      frame = requestAnimationFrame(draw);
  }
  const move = (event: PointerEvent) => {
    if (event.pointerType !== "mouse") return;
    px = event.clientX / innerWidth;
    py = event.clientY / innerHeight;
    wake();
  };
  const onScroll = () => {
    scroll = window.scrollY;
    wake();
  };
  const visibility = () => {
    if (document.hidden || reduce.matches) {
      cancelAnimationFrame(frame);
      frame = 0;
    } else wake();
  };
  const contextLost = (event: Event) => {
    event.preventDefault();
    stopped = true;
    cancelAnimationFrame(frame);
    onUnavailable();
  };
  const observer = new MutationObserver(wake);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-appearance"],
  });
  window.addEventListener("pointermove", move, { passive: true });
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", visibility);
  reduce.addEventListener("change", visibility);
  scheme.addEventListener("change", wake);
  canvas.addEventListener("webglcontextlost", contextLost);
  resize();
  awake = performance.now() + 7000;
  return () => {
    stopped = true;
    cancelAnimationFrame(frame);
    observer.disconnect();
    window.removeEventListener("pointermove", move);
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", resize);
    document.removeEventListener("visibilitychange", visibility);
    reduce.removeEventListener("change", visibility);
    scheme.removeEventListener("change", wake);
    canvas.removeEventListener("webglcontextlost", contextLost);
    shaders.forEach((s) => gl!.deleteShader(s));
    if (program) gl!.deleteProgram(program);
    if (buffer) gl!.deleteBuffer(buffer);
  };
}
