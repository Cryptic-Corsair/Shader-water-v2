import { useEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from '../../lib/motion';
import { detectWebGLCapabilities } from './LiveAtmosphere';
import {
  hexToRgbTuple,
  type ShaderEngineId,
  type ShaderPalettePreset,
} from './shaderGalleryData';

export type CustomGlslEngine = Extract<
  ShaderEngineId,
  'glsl-wet-ink' | 'glsl-raymarch' | 'glsl-fbm' | 'glsl-crt'
>;

export interface CustomGlslCanvasProps {
  engine: CustomGlslEngine;
  palette: ShaderPalettePreset;
  speed: number;
  intensity: number;
  scale: number;
  paused?: boolean;
  interactive?: boolean;
  className?: string;
}

const VERTEX_SHADER_SRC = `
  attribute vec2 a_pos;
  varying vec2 v_uv;
  void main() {
    v_uv = a_pos * 0.5 + 0.5;
    gl_Position = vec4(a_pos, 0.0, 1.0);
  }
`;

const COMMON_GLSL_HELPERS = `
  precision highp float;
  varying vec2 v_uv;
  uniform float u_time;
  uniform vec2 u_resolution;
  uniform vec2 u_mouse;
  uniform float u_intensity;
  uniform float u_scale;
  uniform vec3 u_colorA;
  uniform vec3 u_colorB;
  uniform vec3 u_colorC;
  uniform vec3 u_accent;

  float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise2(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash21(i);
    float b = hash21(i + vec2(1.0, 0.0));
    float c = hash21(i + vec2(0.0, 1.0));
    float d = hash21(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
    for (int i = 0; i < 5; i++) {
      v += a * noise2(p);
      p = rot * p * 2.02;
      a *= 0.5;
    }
    return v;
  }
`;

const FRAGMENT_SHADERS: Record<CustomGlslEngine, string> = {
  'glsl-wet-ink': `
    ${COMMON_GLSL_HELPERS}
    void main() {
      float aspect = u_resolution.x / max(1.0, u_resolution.y);
      vec2 p = (v_uv - 0.5) * vec2(aspect, 1.0) * (1.75 * u_scale);
      vec2 m = (u_mouse - 0.5) * vec2(aspect, 1.0) * (1.75 * u_scale);
      float t = u_time * 0.58;

      float distM = length(p - m);
      vec2 dirM = distM > 0.001 ? (p - m) / distM : vec2(0.0);
      float rippleWave = sin(distM * 16.0 - t * 4.4) * exp(-distM * 2.9);
      vec2 pDisplaced = p + dirM * rippleWave * (0.09 * u_intensity);

      vec2 q = vec2(
        fbm(pDisplaced + vec2(0.4, t * 0.22)),
        fbm(pDisplaced + vec2(5.2, 1.3 - t * 0.18))
      );
      vec2 r = vec2(
        fbm(pDisplaced + 2.35 * q + vec2(1.7, 9.2) + 0.16 * t),
        fbm(pDisplaced + 2.35 * q + vec2(8.3, 2.8) - 0.13 * t)
      );

      float ink = fbm(pDisplaced + 1.95 * r);
      float inkEdge = smoothstep(0.42, 0.56, ink) - smoothstep(0.56, 0.72, ink);
      float waveCaustic = pow(clamp(0.5 + 0.5 * sin(pDisplaced.x * 5.2 + q.y * 6.5 - t * 1.4), 0.0, 1.0), 4.0);

      vec3 col = mix(u_colorA, u_colorB, smoothstep(0.18, 0.74, ink));
      col = mix(col, u_colorC, smoothstep(0.45, 0.92, dot(q, r)) * 0.78);
      col += u_accent * (inkEdge * (0.45 + 0.45 * u_intensity) + waveCaustic * 0.28 * u_intensity + max(0.0, rippleWave) * 0.55);

      float vig = 1.0 - smoothstep(0.48, 1.32, length(v_uv - 0.5) * 1.35);
      col *= (0.8 + 0.2 * vig);
      gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
    }
  `,

  'glsl-raymarch': `
    ${COMMON_GLSL_HELPERS}
    mat2 rot2(float a) {
      float s = sin(a);
      float c = cos(a);
      return mat2(c, -s, s, c);
    }

    float sdTorus(vec3 p, vec2 t) {
      vec2 q = vec2(length(p.xz) - t.x, p.y);
      return length(q) - t.y;
    }

    float mapScene(vec3 p) {
      float t = u_time * 0.55;
      p.xz *= rot2(t * 0.48 + (u_mouse.x - 0.5) * 2.2);
      p.xy *= rot2(t * 0.31 + (u_mouse.y - 0.5) * 1.4);
      float twist = sin(p.x * 2.4 + t) * 0.06 * u_intensity;
      p.y += twist;

      float d1 = sdTorus(p, vec2(0.82, 0.22 + 0.05 * u_intensity));
      vec3 p2 = p;
      p2.yz *= rot2(1.5708 + t * 0.25);
      float d2 = sdTorus(p2, vec2(1.18, 0.065));
      float d3 = length(p) - (0.28 + 0.06 * sin(t * 1.4));
      return min(d1, min(d2, d3));
    }

    vec3 calcNormal(vec3 p) {
      vec2 e = vec2(0.002, 0.0);
      return normalize(vec3(
        mapScene(p + e.xyy) - mapScene(p - e.xyy),
        mapScene(p + e.yxy) - mapScene(p - e.yxy),
        mapScene(p + e.yyx) - mapScene(p - e.yyx)
      ));
    }

    void main() {
      float aspect = u_resolution.x / max(1.0, u_resolution.y);
      vec2 uv = (v_uv - 0.5) * vec2(aspect, 1.0);
      vec3 ro = vec3(0.0, 0.0, 2.75 / clamp(u_scale, 0.65, 1.6));
      vec3 rd = normalize(vec3(uv, -1.45));

      float tDist = 0.0;
      float hit = 0.0;
      float glow = 0.0;
      for (int i = 0; i < 36; i++) {
        vec3 pos = ro + rd * tDist;
        float d = mapScene(pos);
        glow += exp(-abs(d) * 7.0) * 0.032;
        if (d < 0.003) {
          hit = 1.0;
          break;
        }
        if (tDist > 6.5) break;
        tDist += d * 0.85;
      }

      vec3 bg = mix(u_colorA, u_colorB, smoothstep(-0.6, 0.7, uv.y + 0.2));
      vec3 col = bg + u_accent * glow * (0.65 + u_intensity * 0.75);

      if (hit > 0.5) {
        vec3 p = ro + rd * tDist;
        vec3 n = calcNormal(p);
        vec3 lightDir = normalize(vec3(0.7, 0.85, 0.9));
        float diff = max(dot(n, lightDir), 0.0);
        float fresnel = pow(1.0 - max(dot(n, -rd), 0.0), 3.0);
        float spec = pow(max(dot(reflect(-lightDir, n), -rd), 0.0), 22.0);
        vec3 matCol = mix(u_colorB, u_colorC, diff * 0.85);
        matCol += u_accent * (fresnel * 0.92 + spec * 0.75);
        float fog = exp(-tDist * 0.18);
        col = mix(bg, matCol, fog);
      }

      gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
    }
  `,

  'glsl-fbm': `
    ${COMMON_GLSL_HELPERS}
    void main() {
      float aspect = u_resolution.x / max(1.0, u_resolution.y);
      vec2 uv = (v_uv - 0.5) * vec2(aspect, 1.0) * (1.45 * u_scale);
      vec2 ptr = (u_mouse - 0.5) * 0.45;
      float t = u_time * 0.35;

      vec2 warpA = vec2(fbm(uv + t + ptr), fbm(uv + vec2(3.1, 1.4) - t * 0.6));
      vec2 warpB = vec2(fbm(uv + 2.5 * warpA + vec2(t * 0.4, -t * 0.2)), fbm(uv + 2.2 * warpA));
      float silk = fbm(uv + (1.6 + u_intensity * 1.4) * warpB);

      float folds = smoothstep(0.15, 0.88, silk);
      float rim = pow(clamp(1.0 - abs(warpB.x - warpB.y) * 2.6, 0.0, 1.0), 2.5);

      vec3 col = mix(u_colorA, u_colorB, folds);
      col = mix(col, u_colorC, smoothstep(0.35, 0.85, warpA.y));
      col += u_accent * rim * (0.28 + u_intensity * 0.38);

      gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
    }
  `,

  'glsl-crt': `
    ${COMMON_GLSL_HELPERS}
    float signalField(vec2 p, float t) {
      float w1 = sin(p.x * 5.2 + t * 1.4) * cos(p.y * 4.6 - t * 1.1);
      float w2 = fbm(p * (2.6 * u_scale) + vec2(t * 0.35, -t * 0.22));
      return mix(w2, 0.5 + 0.5 * w1, 0.35 * u_intensity);
    }

    void main() {
      vec2 centered = v_uv - 0.5;
      float r2 = dot(centered, centered);
      vec2 curved = centered * (1.0 + r2 * (0.14 + 0.16 * u_intensity)) + 0.5;
      float t = u_time * 0.7;

      float chroma = (0.004 + 0.012 * u_intensity) * (1.0 + length(u_mouse - 0.5));
      float red = signalField(curved + vec2(chroma, 0.0), t);
      float green = signalField(curved, t);
      float blue = signalField(curved - vec2(chroma, 0.0), t);

      vec3 baseR = mix(u_colorA, u_accent, red);
      vec3 baseG = mix(u_colorB, u_colorC, green);
      vec3 baseB = mix(u_colorA, u_colorC, blue);
      vec3 col = vec3(baseR.r, baseG.g, baseB.b);

      float scanline = 0.84 + 0.16 * sin(curved.y * u_resolution.y * 0.75 + t * 8.0);
      float barSweep = exp(-pow(fract(curved.y - t * 0.12) - 0.5, 2.0) * 80.0) * 0.14;
      float grain = (hash21(v_uv * u_resolution + fract(u_time) * 100.0) - 0.5) * 0.06;

      col = col * scanline + u_accent * barSweep + grain;
      float mask = step(0.0, curved.x) * step(curved.x, 1.0) * step(0.0, curved.y) * step(curved.y, 1.0);
      col *= mask * (1.0 - r2 * 0.55);

      gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
    }
  `,
};

function compileShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export function CustomGlslCanvas({
  engine,
  palette,
  speed,
  intensity,
  scale,
  paused = false,
  interactive = true,
  className = '',
}: CustomGlslCanvasProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);

  const uniformsRef = useRef({
    speed,
    intensity,
    scale,
    paused,
    palette,
  });
  uniformsRef.current = { speed, intensity, scale, paused, palette };

  const pointerTargetRef = useRef({ x: 0.52, y: 0.48 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = hostRef.current;
    if (!canvas || !host) return;

    const caps = detectWebGLCapabilities();
    if (!caps.supported) {
      setFailed(true);
      return;
    }

    const gl = canvas.getContext('webgl', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: 'low-power',
    });

    if (!gl) {
      setFailed(true);
      return;
    }

    const vs = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER_SRC);
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADERS[engine]);
    if (!vs || !fs) {
      if (vs) gl.deleteShader(vs);
      if (fs) gl.deleteShader(fs);
      setFailed(true);
      return;
    }

    const program = gl.createProgram();
    if (!program) {
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      setFailed(true);
      return;
    }

    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      setFailed(true);
      return;
    }

    setFailed(false);
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const posLoc = gl.getAttribLocation(program, 'a_pos');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const locTime = gl.getUniformLocation(program, 'u_time');
    const locRes = gl.getUniformLocation(program, 'u_resolution');
    const locMouse = gl.getUniformLocation(program, 'u_mouse');
    const locIntensity = gl.getUniformLocation(program, 'u_intensity');
    const locScale = gl.getUniformLocation(program, 'u_scale');
    const locColorA = gl.getUniformLocation(program, 'u_colorA');
    const locColorB = gl.getUniformLocation(program, 'u_colorB');
    const locColorC = gl.getUniformLocation(program, 'u_colorC');
    const locAccent = gl.getUniformLocation(program, 'u_accent');

    let width = 640;
    let height = 400;
    const dpr = caps.isSoftwareRenderer
      ? 0.75
      : Math.min(window.devicePixelRatio || 1, 1.75);

    const applySize = (nextW: number, nextH: number) => {
      width = Math.max(200, Math.round(nextW));
      height = Math.max(150, Math.round(nextH));
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    const rect = host.getBoundingClientRect();
    applySize(rect.width, rect.height);

    const resizeObserver =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver((entries) => {
            const entry = entries[0];
            if (!entry) return;
            applySize(entry.contentRect.width, entry.contentRect.height);
            draw(performance.now());
          })
        : null;
    resizeObserver?.observe(host);

    let inView = true;
    const io =
      typeof IntersectionObserver !== 'undefined'
        ? new IntersectionObserver(
            ([entry]) => {
              inView = entry.isIntersecting;
            },
            { threshold: 0.02 }
          )
        : null;
    io?.observe(host);

    const smoothMouse = { x: 0.52, y: 0.48 };
    let simTime = 1.8;
    let lastTs = performance.now();
    let lastDrawTs = 0;
    const reduced = prefersReducedMotion();

    const draw = (nowTs: number) => {
      const dt = Math.min(0.05, Math.max(0.001, (nowTs - lastTs) / 1000));
      lastTs = nowTs;

      const u = uniformsRef.current;
      if (!u.paused && !reduced) {
        simTime += dt * u.speed;
      }

      smoothMouse.x += (pointerTargetRef.current.x - smoothMouse.x) * 0.1;
      smoothMouse.y += (pointerTargetRef.current.y - smoothMouse.y) * 0.1;

      const rgbA = hexToRgbTuple(u.palette.colorA);
      const rgbB = hexToRgbTuple(u.palette.colorB);
      const rgbC = hexToRgbTuple(u.palette.colorC);
      const rgbAcc = hexToRgbTuple(u.palette.accent);

      gl.uniform1f(locTime, simTime);
      gl.uniform2f(locRes, canvas.width, canvas.height);
      gl.uniform2f(locMouse, smoothMouse.x, 1.0 - smoothMouse.y);
      gl.uniform1f(locIntensity, u.intensity);
      gl.uniform1f(locScale, u.scale);
      gl.uniform3f(locColorA, rgbA[0], rgbA[1], rgbA[2]);
      gl.uniform3f(locColorB, rgbB[0], rgbB[1], rgbB[2]);
      gl.uniform3f(locColorC, rgbC[0], rgbC[1], rgbC[2]);
      gl.uniform3f(locAccent, rgbAcc[0], rgbAcc[1], rgbAcc[2]);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    draw(performance.now());

    if (reduced) {
      return () => {
        resizeObserver?.disconnect();
        io?.disconnect();
        gl.deleteBuffer(buffer);
        gl.deleteProgram(program);
        gl.deleteShader(vs);
        gl.deleteShader(fs);
      };
    }

    let rafId = 0;
    const minFrameMs = caps.isSoftwareRenderer ? 42 : 16;
    const tick = (nowTs: number) => {
      if (inView && !document.hidden && !uniformsRef.current.paused) {
        if (nowTs - lastDrawTs >= minFrameMs) {
          lastDrawTs = nowTs;
          draw(nowTs);
        }
      } else {
        lastTs = nowTs;
      }
      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(rafId);
      resizeObserver?.disconnect();
      io?.disconnect();
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, [engine]);

  const handlePointerMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive) return;
    const rect = event.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    pointerTargetRef.current = {
      x: Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)),
      y: Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height)),
    };
  };

  return (
    <div
      ref={hostRef}
      onMouseMove={handlePointerMove}
      data-testid={`custom-glsl-${engine}`}
      className={`relative h-full w-full overflow-hidden ${className}`}
      style={{
        backgroundColor: palette.colorA,
        backgroundImage: `radial-gradient(65% 65% at 30% 35%, ${palette.accent}44 0%, transparent 64%), linear-gradient(155deg, ${palette.colorA} 0%, ${palette.colorB} 60%, ${palette.colorC} 100%)`,
      }}
    >
      {!failed ? (
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="block h-full w-full"
        />
      ) : null}
    </div>
  );
}
