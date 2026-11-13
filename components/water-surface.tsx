"use client";
import { useEffect, useRef } from "react";
import { useReducedMotion } from "./use-reduced-motion";

const vertex = `attribute vec2 position;void main(){gl_Position=vec4(position,0.,1.);}`;
const fragment = `precision mediump float;
uniform sampler2D paper;uniform vec2 size;uniform float time;uniform float dark;uniform vec4 drops[8];
void main(){vec2 p=vec2(gl_FragCoord.x,size.y-gl_FragCoord.y);vec2 shift=vec2(0.);float light=0.;
for(int i=0;i<8;i++){float age=time-drops[i].z;float d=distance(p,drops[i].xy);if(drops[i].w>0. && age>=0. && age<2.2){float envelope=exp(-age*2.)*exp(-abs(d-age*100.)*.018);float wave=sin(d*.09-age*11.)*envelope*drops[i].w;shift+=normalize(p-drops[i].xy+vec2(.01))*wave*18.;light+=wave*.032;}}
vec2 uv=fract((p+shift)/640.);vec3 textureColor=texture2D(paper,uv).rgb;
float fiber=dot(textureColor,vec3(.299,.587,.114));
vec3 day=vec3(.957,.944,.906)*(fiber*.55+.48);vec3 night=vec3(.105,.112,.108)*(fiber*.9+.5);
vec3 color=mix(day,night,dark)+light*mix(vec3(.5,.4,.25),vec3(.35,.4,.32),dark);
float edge=pow(abs(p.x/size.x-.5)*2.,8.);color-=edge*mix(.035,.014,dark);
gl_FragColor=vec4(color,1.);}`;

/** Texture displacement, capped resolution and eight impulses; no idle render loop. */
export function WaterSurface() {
  const ref = useRef<HTMLCanvasElement>(null),
    reduced = useReducedMotion();
  useEffect(() => {
    const canvas = ref.current;
    const save = (
      navigator as Navigator & { connection?: { saveData?: boolean } }
    ).connection?.saveData;
    if (!canvas || reduced || save || !matchMedia("(pointer:fine)").matches)
      return;
    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      preserveDrawingBuffer: false,
    });
    if (!gl) return;
    let ready = false;
    let generation = 0;
    let disposed = false,
      frame = 0,
      last = 0,
      index = 0,
      until = 0,
      dark = 0;
    const drops = new Float32Array(32),
      images: HTMLImageElement[] = [];
    const shaders: WebGLShader[] = [];
    const compile = (type: number, source: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, source);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        gl.deleteShader(s);
        return null;
      }
      shaders.push(s);
      return s;
    };
    const vs = compile(gl.VERTEX_SHADER, vertex),
      fs = compile(gl.FRAGMENT_SHADER, fragment);
    if (!vs || !fs) {
      shaders.forEach((s) => gl.deleteShader(s));
      return;
    }
    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      shaders.forEach((s) => gl.deleteShader(s));
      gl.deleteProgram(program);
      return;
    }
    gl.useProgram(program);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );
    const pos = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
    const loc = {
      size: gl.getUniformLocation(program, "size"),
      time: gl.getUniformLocation(program, "time"),
      dark: gl.getUniformLocation(program, "dark"),
      drops: gl.getUniformLocation(program, "drops[0]"),
    };
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGB,
      1,
      1,
      0,
      gl.RGB,
      gl.UNSIGNED_BYTE,
      new Uint8Array([245, 243, 235]),
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    function draw(now: number) {
      frame = 0;
      if (disposed || document.hidden) return;
      gl!.uniform2f(loc.size, canvas!.width, canvas!.height);
      gl!.uniform1f(loc.time, now / 1000);
      gl!.uniform1f(loc.dark, dark);
      gl!.uniform4fv(loc.drops, drops);
      gl!.drawArrays(gl!.TRIANGLES, 0, 6);
      if (ready && canvas!.dataset.renderer !== "webgl")
        canvas!.dataset.renderer = "webgl";
      if (now < until) frame = requestAnimationFrame(draw);
    }
    const wake = () => {
      if (!frame && !disposed && !document.hidden)
        frame = requestAnimationFrame(draw);
    };
    function mode() {
      const version = ++generation;
      dark =
        getComputedStyle(document.documentElement).colorScheme === "light"
          ? 0
          : 1;
      const image = new Image();
      images.push(image);
      image.onload = () => {
        if (disposed || version !== generation) return;
        gl!.bindTexture(gl!.TEXTURE_2D, texture);
        gl!.texImage2D(
          gl!.TEXTURE_2D,
          0,
          gl!.RGB,
          gl!.RGB,
          gl!.UNSIGNED_BYTE,
          image,
        );
        ready = true;
        wake();
      };
      image.src = dark ? "/art/ink-paper.webp" : "/art/rice-paper.webp";
      wake();
    }
    function resize() {
      const scale = Math.min(1, 1200 / innerWidth);
      canvas!.width = Math.round(innerWidth * scale);
      canvas!.height = Math.round(innerHeight * scale);
      gl!.viewport(0, 0, canvas!.width, canvas!.height);
      drops.fill(0);
      wake();
    }
    function move(e: PointerEvent) {
      if (document.hidden || e.pointerType !== "mouse") return;
      const now = performance.now();
      if (e.type !== "pointerdown" && now - last < 55) return;
      last = now;
      const scale = canvas!.width / innerWidth;
      drops.set(
        [
          e.clientX * scale,
          e.clientY * scale,
          now / 1000,
          e.type === "pointerdown" ? 1.9 : 1,
        ],
        index * 4,
      );
      index = (index + 1) % 8;
      until = now + 2200;
      wake();
    }
    function visibility() {
      if (document.hidden) {
        cancelAnimationFrame(frame);
        frame = 0;
        drops.fill(0);
      } else wake();
    }
    const observer = new MutationObserver(mode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-appearance"],
    });
    const scheme = matchMedia("(prefers-color-scheme:light)");
    scheme.addEventListener("change", mode);
    const lost = (e: Event) => {
      e.preventDefault();
      cancelAnimationFrame(frame);
      frame = 0;
      canvas!.style.visibility = "hidden";
    };
    canvas.addEventListener("webglcontextlost", lost);
    resize();
    mode();
    document.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerdown", move, { passive: true });
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("resize", resize, { passive: true });
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      scheme.removeEventListener("change", mode);
      images.forEach((i) => {
        i.onload = null;
      });
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerdown", move);
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("webglcontextlost", lost);
      gl.deleteTexture(texture);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      shaders.forEach((s) => gl.deleteShader(s));
    };
  }, [reduced]);
  return (
    <canvas
      ref={ref}
      className="water-surface paper-water"
      aria-hidden="true"
    />
  );
}
