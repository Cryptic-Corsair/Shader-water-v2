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
  'glsl-literary-book' | 'glsl-wet-ink' | 'glsl-raymarch' | 'glsl-fbm' | 'glsl-crt'
>;

export interface CustomGlslCanvasProps {
  engine: CustomGlslEngine;
  palette: ShaderPalettePreset;
  speed: number;
  intensity: number;
  scale: number;
  paused?: boolean;
  interactive?: boolean;
  externalPointer?: { x: number; y: number };
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
  'glsl-literary-book': `
    ${COMMON_GLSL_HELPERS}
    mat2 rot2(float a) {
      float s = sin(a);
      float c = cos(a);
      return mat2(c, -s, s, c);
    }

    float smin(float a, float b, float k) {
      float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
      return mix(b, a, h) - k * h * (1.0 - h);
    }

    float sdRoundBox(vec3 p, vec3 b, float r) {
      vec3 q = abs(p) - b;
      return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0) - r;
    }

    float sdCapsule(vec3 p, vec3 a, vec3 b, float r) {
      vec3 pa = p - a;
      vec3 ba = b - a;
      float h = clamp(dot(pa, ba) / max(0.0001, dot(ba, ba)), 0.0, 1.0);
      return length(pa - ba * h) - r;
    }

    float sdTorus(vec3 p, vec2 t) {
      vec2 q = vec2(length(p.xz) - t.x, p.y);
      return length(q) - t.y;
    }

    // Returns vec2(signedDistance, materialId)
    // mat 1.0 = bound leather cover & spine
    // mat 2.0 = arched cream paper block & carved stanza grooves
    // mat 3.0 = turning parchment folio leaf
    // mat 4.0 = brass astrolabe meridian ring & floating ink orb
    vec2 mapBookScene(vec3 pos, out vec3 localP) {
      float t = u_time * 0.45;
      vec3 p = pos;

      // Subtle floating levitation + elevated 3/4 reading perspective facing open +Y spreads
      p.y -= sin(t * 0.85) * 0.04;
      p.xz *= rot2(-0.34 + (u_mouse.x - 0.5) * 0.56 + sin(t * 0.32) * 0.06);
      p.yz *= rot2(-0.74 + (u_mouse.y - 0.5) * 0.32 + cos(t * 0.28) * 0.035);
      localP = p;

      // Mirror X across spine for open book geometry
      vec3 sp = vec3(abs(p.x), p.y, p.z);

      // Bound hardcover boards angled gently upward like an open folio on a lectern
      vec3 coverP = sp - vec3(0.45, -0.055, 0.0);
      coverP.xy *= rot2(-0.18);
      float dBoards = sdRoundBox(coverP, vec3(0.455, 0.022, 0.575), 0.014);
      float dSpine = sdCapsule(p - vec3(0.0, -0.11, 0.0), vec3(0.0, 0.0, -0.575), vec3(0.0, 0.0, 0.575), 0.066);
      float dCover = smin(dBoards, dSpine, 0.04);

      // Soft arched cream paper block curving up out of center gutter
      float pageSpan = clamp(sp.x / 0.82, 0.0, 1.0);
      float archLift = 0.088 * sin(pageSpan * 3.14159) + 0.032 * smoothstep(0.0, 0.28, pageSpan);
      vec3 pageP = sp - vec3(0.43, archLift - 0.004, 0.0);
      pageP.xy *= rot2(-0.18 + 0.13 * cos(pageSpan * 3.14159));
      float dPages = sdRoundBox(pageP, vec3(0.415, 0.048, 0.535), 0.011);
      // Fore-edge micro paper-leaf fluting
      float leafRipple = sin(p.y * 150.0) * 0.002 * smoothstep(0.28, 0.78, sp.x);
      dPages += leafRipple;

      // Graceful curved turning folio leaf suspended over center gutter
      float turnWave = 0.5 + 0.44 * sin(t * 0.58);
      float turnAngle = mix(-0.92, 0.92, turnWave);
      vec3 tp = p - vec3(0.0, 0.065, 0.0);
      tp.xy *= rot2(turnAngle);
      float uTurn = clamp(tp.x / 0.76, 0.0, 1.0);
      tp.x -= 0.38;
      tp.y -= 0.075 * sin(uTurn * 3.14159);
      float dTurnLeaf = sdRoundBox(tp, vec3(0.38, 0.0045, 0.515), 0.0035);

      // Inclined brass astrolabe meridian halo + luminous floating ink drop above spine
      vec3 rp = p - vec3(0.0, 0.12, 0.0);
      rp.xy *= rot2(0.36 + sin(t * 0.25) * 0.07);
      rp.yz *= rot2(0.44 + t * 0.16);
      float dRing = sdTorus(rp, vec2(1.06, 0.013));
      vec3 orbPos = p - vec3(sin(t * 0.68) * 0.18, 0.46 + cos(t * 0.9) * 0.04, cos(t * 0.68) * 0.12);
      float dOrb = length(orbPos) - 0.052;
      float dAstro = min(dRing, dOrb);

      vec2 res = vec2(dCover, 1.0);
      if (dPages < res.x) res = vec2(dPages, 2.0);
      if (dTurnLeaf < res.x) res = vec2(dTurnLeaf, 3.0);
      if (dAstro < res.x) res = vec2(dAstro, 4.0);
      return res;
    }

    vec3 calcBookNormal(vec3 p) {
      vec3 tmp;
      vec2 e = vec2(0.0022, 0.0);
      return normalize(vec3(
        mapBookScene(p + e.xyy, tmp).x - mapBookScene(p - e.xyy, tmp).x,
        mapBookScene(p + e.yxy, tmp).x - mapBookScene(p - e.yxy, tmp).x,
        mapBookScene(p + e.yyx, tmp).x - mapBookScene(p - e.yyx, tmp).x
      ));
    }

    float calcAO(vec3 p, vec3 n) {
      vec3 tmp;
      float occ = 0.0;
      float sca = 1.0;
      for (int i = 0; i < 3; i++) {
        float h = 0.03 + 0.08 * float(i);
        float d = mapBookScene(p + h * n, tmp).x;
        occ += (h - d) * sca;
        sca *= 0.65;
      }
      return clamp(1.0 - 1.75 * occ, 0.22, 1.0);
    }

    void main() {
      float aspect = u_resolution.x / max(1.0, u_resolution.y);
      vec2 uv = (v_uv - 0.5) * vec2(aspect, 1.0);

      // Frame full open book + brass astrolabe halo inside right optical specimen arch on desktop, and uncropped on mobile portrait
      vec2 framedOffset = aspect > 1.08 ? vec2(-0.88, -0.09) : vec2(0.0, 0.38);
      float baseCamZ = aspect > 1.08 ? 3.85 : 5.05;
      vec3 ro = vec3(framedOffset.x, framedOffset.y, baseCamZ / clamp(u_scale, 0.72, 1.45));
      vec3 rd = normalize(vec3(uv, -1.56));

      float tDist = 0.0;
      float matId = 0.0;
      float haloGlow = 0.0;
      vec3 hitLocal = vec3(0.0);

      for (int i = 0; i < 44; i++) {
        vec3 pos = ro + rd * tDist;
        vec2 m = mapBookScene(pos, hitLocal);
        haloGlow += exp(-abs(m.x) * 8.5) * 0.022;
        if (m.x < 0.0025) {
          matId = m.y;
          break;
        }
        if (tDist > 7.4) break;
        tDist += m.x * 0.88;
      }

      // Deep monsoon-twilight editorial sky wash (darker on left under hero text)
      float leftMask = smoothstep(-0.72, 0.55, uv.x);
      vec3 bg = mix(u_colorA * 0.86, u_colorB * 0.96, smoothstep(-0.55, 0.75, uv.y + 0.12));
      bg = mix(u_colorA * 0.74, bg, leftMask * 0.74 + 0.26);
      vec2 auraCenter = aspect > 1.08 ? vec2(0.36, 0.03) : vec2(0.0, -0.14);
      float aura = exp(-length(uv - auraCenter) * 2.1);
      vec3 col = bg + u_accent * (haloGlow * 0.52 + aura * 0.16) * u_intensity;

      if (matId > 0.5) {
        vec3 p = ro + rd * tDist;
        vec3 n = calcBookNormal(p);
        float ao = calcAO(p, n);

        vec3 keyDir = normalize(vec3(0.55, 0.92, 0.65));
        vec3 rimDir = normalize(vec3(-0.75, 0.45, -0.45));
        float diff = max(dot(n, keyDir), 0.0);
        float rimDiff = max(dot(n, rimDir), 0.0);
        float fresnel = pow(1.0 - max(dot(n, -rd), 0.0), 3.0);
        float spec = pow(max(dot(reflect(-keyDir, n), -rd), 0.0), 22.0);

        vec3 matCol = u_colorB;
        if (matId < 1.5) {
          // Bound leather cover + warm brass edge bevels
          matCol = mix(u_colorA * 0.95, u_colorB * 1.18, diff) + u_accent * (fresnel * 0.42 + spec * 0.28);
        } else if (matId < 2.5) {
          // Cream rag paper spreads with delicate poetic stanza rules & golden margin glow
          vec3 warmPaper = mix(u_colorC, vec3(0.96, 0.93, 0.87), 0.76);
          vec3 pageTone = warmPaper * (0.52 + 0.52 * diff) * ao;
          float marginMask = step(0.08, abs(hitLocal.x)) * step(abs(hitLocal.x), 0.74) * step(abs(hitLocal.z), 0.43);
          float topFace = smoothstep(0.35, 0.75, abs(n.y));
          float stanzaBands = smoothstep(-0.25, 0.35, sin(hitLocal.z * 10.5));
          float inkRule = smoothstep(0.88, 0.975, abs(sin(hitLocal.z * 36.0))) * stanzaBands * marginMask * topFace;
          // Center binding gutter shadow
          float gutterShadow = mix(0.66, 1.0, smoothstep(0.0, 0.14, abs(hitLocal.x)));
          matCol = mix(pageTone * gutterShadow, u_colorA * 0.42 + u_accent * 0.48, inkRule * 0.55) + u_accent * fresnel * 0.14;
        } else if (matId < 3.5) {
          // Translucent illuminated turning leaf catching golden backlight
          vec3 leafPaper = mix(u_colorC, vec3(0.98, 0.95, 0.90), 0.84);
          float backLight = pow(max(dot(-keyDir, rd), 0.0), 2.0) * 0.36 + rimDiff * 0.32;
          matCol = leafPaper * (0.60 + 0.46 * diff + backLight) * ao + u_accent * fresnel * 0.45;
        } else {
          // Brushed brass astrolabe meridian ring & luminous golden ink pearl
          matCol = mix(u_colorB, u_accent, 0.75 + 0.25 * diff) + vec3(1.0, 0.96, 0.88) * (spec * 0.85 + fresnel * 0.45);
        }

        float fog = exp(-max(0.0, tDist - 2.2) * 0.22);
        col = mix(bg, matCol, fog);
      }

      gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
    }
  `,

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
  externalPointer,
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
  });
  uniformsRef.current = { speed, intensity, scale, paused };

  const paletteRgbRef = useRef({
    a: hexToRgbTuple(palette.colorA),
    b: hexToRgbTuple(palette.colorB),
    c: hexToRgbTuple(palette.colorC),
    accent: hexToRgbTuple(palette.accent),
  });
  useEffect(() => {
    paletteRgbRef.current = {
      a: hexToRgbTuple(palette.colorA),
      b: hexToRgbTuple(palette.colorB),
      c: hexToRgbTuple(palette.colorC),
      accent: hexToRgbTuple(palette.accent),
    };
  }, [palette.colorA, palette.colorB, palette.colorC, palette.accent]);

  const pointerTargetRef = useRef({ x: 0.52, y: 0.48 });
  if (externalPointer) {
    pointerTargetRef.current = {
      x: Math.max(0, Math.min(1, externalPointer.x)),
      y: Math.max(0, Math.min(1, externalPointer.y)),
    };
  }

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

      const { a: rgbA, b: rgbB, c: rgbC, accent: rgbAcc } = paletteRgbRef.current;

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
