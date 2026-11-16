import { useEffect, useRef, useState, type MutableRefObject } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { prefersReducedMotion } from '../../lib/motion';
import {
  generateParticleFormations,
  interpolateOdysseyStageState,
} from './odysseyChoreography';
import {
  createAstrolabeDialTexture,
  createBrushedMetalBumpTexture,
} from './odysseyTextures';

export interface OdysseyMoodOverride {
  primaryHex: string;
  secondaryHex: string;
}

export interface OdysseyWebGLCanvasProps {
  scrollProgressRef: MutableRefObject<number>;
  scrollVelocityRef: MutableRefObject<number>;
  pointerRef: MutableRefObject<{ x: number; y: number }>;
  moodOverrideRef: MutableRefObject<OdysseyMoodOverride | null>;
}

const RIBBON_VERTEX_SHADER = /* glsl */ `
  uniform float uTime;
  uniform float uVelocity;
  uniform vec2 uMouse;
  varying vec2 vUv;
  varying float vElevation;
  varying vec3 vNormalView;
  varying vec3 vViewPos;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float amp = 0.5;
    for (int i = 0; i < 3; i++) {
      v += amp * noise(p);
      p = p * 2.04 + vec2(1.7, 9.2);
      amp *= 0.5;
    }
    return v;
  }

  void main() {
    vUv = uv;
    vec3 pos = position;

    float flow = uTime * 0.24;
    float waveA = fbm(vec2(pos.x * 0.24 + flow, pos.y * 0.34 - flow * 0.5));
    float waveB = sin(pos.x * 0.42 - uTime * 0.45 + uMouse.x * 1.1) * 0.42;
    float elev = (waveA - 0.5) * (2.6 + min(uVelocity * 1.6, 1.4)) + waveB;

    pos.z += elev;
    pos.y += cos(pos.x * 0.32 + uTime * 0.3) * 0.22;

    vElevation = elev;
    vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
    vViewPos = -mvPos.xyz;
    vNormalView = normalize(normalMatrix * normal);

    gl_Position = projectionMatrix * mvPos;
  }
`;

const RIBBON_FRAGMENT_SHADER = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uTime;
  varying vec2 vUv;
  varying float vElevation;
  varying vec3 vNormalView;
  varying vec3 vViewPos;

  void main() {
    vec3 deepObsidian = vec3(0.025, 0.032, 0.056);
    float ridge = smoothstep(-0.8, 1.4, vElevation);

    vec3 viewDir = normalize(vViewPos);
    float fresnel = pow(1.0 - abs(dot(viewDir, normalize(vNormalView))), 2.2);

    vec3 baseMix = mix(deepObsidian, uColorB * 0.55, ridge * 0.72);
    vec3 crestColor = mix(baseMix, uColorA, smoothstep(0.35, 1.0, ridge) * 0.58 + fresnel * 0.45);

    // Edge feather transparency so horizon mesh melts into deep space
    float edgeFadeX = smoothstep(0.0, 0.22, vUv.x) * (1.0 - smoothstep(0.78, 1.0, vUv.x));
    float edgeFadeY = smoothstep(0.0, 0.28, vUv.y) * (1.0 - smoothstep(0.72, 1.0, vUv.y));
    float ribbonBand = smoothstep(0.05, 0.95, sin(vUv.y * 3.14159));

    float alpha = edgeFadeX * edgeFadeY * (0.28 + 0.36 * ribbonBand + fresnel * 0.16);
    gl_FragColor = vec4(crestColor, clamp(alpha, 0.0, 0.78));
  }
`;

const PARTICLE_VERTEX_SHADER = /* glsl */ `
  attribute vec3 aPos0;
  attribute vec3 aPos1;
  attribute vec3 aPos2;
  attribute vec3 aPos3;
  attribute vec2 aSeed;

  uniform float uTime;
  uniform float uVelocity;
  uniform vec4 uMorphWeights;
  uniform vec2 uMouse;
  uniform float uPixelRatio;

  varying float vSeed;
  varying float vDepth;

  void main() {
    vSeed = aSeed.x;

    vec3 morphed =
      aPos0 * uMorphWeights.x +
      aPos1 * uMorphWeights.y +
      aPos2 * uMorphWeights.z +
      aPos3 * uMorphWeights.w;

    float phase = aSeed.x * 6.283185 + aSeed.y * 3.14159;
    float orbit = uTime * (0.18 + aSeed.y * 0.24);
    morphed.x += sin(orbit + phase) * 0.09;
    morphed.y += cos(orbit * 0.85 + phase) * 0.09;

    // Gentle cursor field repulsion
    vec2 pointerWorld = vec2(uMouse.x * 4.2, uMouse.y * 2.6);
    float dist = distance(morphed.xy, pointerWorld);
    float influence = smoothstep(2.4, 0.0, dist);
    vec2 away = normalize(morphed.xy - pointerWorld + vec2(0.0001));
    morphed.xy += away * influence * 0.42;
    morphed.z += influence * 0.55 + min(uVelocity * 0.35, 0.65) * (aSeed.y - 0.5);

    vec4 mvPos = modelViewMatrix * vec4(morphed, 1.0);
    vDepth = clamp((-mvPos.z - 2.0) / 10.0, 0.0, 1.0);

    float baseSize = mix(22.0, 44.0, aSeed.y) * uPixelRatio;
    gl_PointSize = clamp(baseSize / max(1.2, -mvPos.z), 1.5, 9.5);
    gl_Position = projectionMatrix * mvPos;
  }
`;

const PARTICLE_FRAGMENT_SHADER = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  varying float vSeed;
  varying float vDepth;

  void main() {
    vec2 uv = gl_PointCoord - vec2(0.5);
    float d = length(uv);
    if (d > 0.5) discard;

    float core = smoothstep(0.5, 0.04, d);
    float halo = pow(core, 1.85);
    vec3 tint = mix(uColorB, uColorA, vSeed);
    vec3 finalCol = mix(tint, vec3(0.98, 0.96, 0.93), halo * 0.45);

    gl_FragColor = vec4(finalCol, halo * (1.0 - vDepth * 0.52) * 0.88);
  }
`;

const _targetColorA = new THREE.Color();
const _targetColorB = new THREE.Color();
const _lookTarget = new THREE.Vector3(0, 0, 0);
const _dummyMatrix = new THREE.Matrix4();
const _dummyQuat = new THREE.Quaternion();
const _dummyPos = new THREE.Vector3();
const _dummyScale = new THREE.Vector3(1, 1, 1);

function detectSoftwareGl(): boolean {
  if (typeof document === 'undefined') return true;
  try {
    const probeCanvas = document.createElement('canvas');
    const gl = probeCanvas.getContext('webgl2') || probeCanvas.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const rendererStr = String(gl.getParameter(param) ?? '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(
      rendererStr
    );
  } catch {
    return true;
  }
}

export function OdysseyWebGLCanvas({
  scrollProgressRef,
  scrollVelocityRef,
  pointerRef,
  moodOverrideRef,
}: OdysseyWebGLCanvasProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [webglFailed, setWebglFailed] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isSoftGl] = useState(() => detectSoftwareGl());

  useEffect(() => {
    const host = mountRef.current;
    if (!host) return;

    const isSoftwareGl = isSoftGl;
    const reduced = prefersReducedMotion();

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
        alpha: false,
      });
    } catch {
      setWebglFailed(true);
      return;
    }

    const width = host.clientWidth || window.innerWidth;
    const height = host.clientHeight || window.innerHeight;
    const pixelRatio = isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2);

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = false;
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(width, height);
    renderer.setClearColor(0x06080f, 1);

    const canvas = renderer.domElement;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    host.appendChild(canvas);

    // Scene, Fog & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x06080f);
    scene.fog = new THREE.FogExp2(0x06080f, 0.042);

    const camera = new THREE.PerspectiveCamera(46, width / height, 0.1, 80);
    camera.position.set(0, 0.15, 7.2);

    // Studio Environment Reflection (RoomEnvironment)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envTarget = pmremGenerator.fromScene(roomEnv, 0.04);
    scene.environment = envTarget.texture;
    roomEnv.dispose();
    pmremGenerator.dispose();

    // Three-point Warm/Cool Studio Light Rig
    const hemiLight = new THREE.HemisphereLight(0xa2bad8, 0x161922, 0.95);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffe1bc, 2.35);
    keyLight.position.set(5.5, 6.2, 4.8);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x7ca2d1, 1.55);
    rimLight.position.set(-5.8, -2.8, -3.6);
    scene.add(rimLight);

    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    const dialTexture = createAstrolabeDialTexture(maxAniso);
    const bumpTexture = createBrushedMetalBumpTexture(maxAniso);

    // ------------------------------------------------------------------
    // 1. COMPOSITE 6-PART ASTRONOMICAL POETRY ASTROLABE (THREE.Group)
    // ------------------------------------------------------------------
    const astrolabeGroup = new THREE.Group();
    scene.add(astrolabeGroup);

    const brassMaterial = new THREE.MeshStandardMaterial({
      color: 0xdfbc91,
      metalness: 0.92,
      roughness: 0.22,
      bumpMap: bumpTexture,
      bumpScale: 0.008,
    });

    const silverMaterial = new THREE.MeshStandardMaterial({
      color: 0xb8c6d8,
      metalness: 0.88,
      roughness: 0.3,
      bumpMap: bumpTexture,
      bumpScale: 0.006,
    });

    const onyxDiscMaterial = new THREE.MeshStandardMaterial({
      color: dialTexture ? 0xffffff : 0x141924,
      map: dialTexture,
      metalness: 0.35,
      roughness: 0.62,
    });

    const filamentMaterial = new THREE.MeshStandardMaterial({
      color: 0xf4dcbb,
      emissive: 0xdfbc91,
      emissiveIntensity: 0.72,
      metalness: 0.2,
      roughness: 0.28,
    });

    // Part 1: Outer Meridian Ring
    const outerRingGeo = new THREE.TorusGeometry(2.25, 0.045, 22, 96);
    const outerRing = new THREE.Mesh(outerRingGeo, brassMaterial);
    astrolabeGroup.add(outerRing);

    // Part 2: 36 Calibration Studs (InstancedMesh)
    const studGeo = new THREE.BoxGeometry(0.036, 0.09, 0.06);
    const studMesh = new THREE.InstancedMesh(studGeo, silverMaterial, 36);
    for (let i = 0; i < 36; i++) {
      const a = (i / 36) * Math.PI * 2;
      _dummyPos.set(Math.cos(a) * 2.25, Math.sin(a) * 2.25, 0);
      _dummyQuat.setFromAxisAngle(_lookTarget.set(0, 0, 1), a);
      _dummyMatrix.compose(_dummyPos, _dummyQuat, _dummyScale);
      studMesh.setMatrixAt(i, _dummyMatrix);
    }
    studMesh.computeBoundingSphere();
    astrolabeGroup.add(studMesh);

    // Part 3: Counter-Rotating Gimbal Ring
    const innerGimbalGeo = new THREE.TorusGeometry(1.74, 0.03, 18, 84);
    const innerGimbal = new THREE.Mesh(innerGimbalGeo, silverMaterial);
    innerGimbal.rotation.x = Math.PI * 0.18;
    astrolabeGroup.add(innerGimbal);

    // Part 4 & 5: Twin Split-Axis Obsidian Monolith Half-Discs
    const leftHalfGeo = new THREE.CylinderGeometry(
      1.05,
      1.05,
      0.06,
      40,
      1,
      false,
      0,
      Math.PI
    );
    leftHalfGeo.rotateX(Math.PI / 2);
    const leftHalf = new THREE.Mesh(leftHalfGeo, onyxDiscMaterial);

    const rightHalfGeo = new THREE.CylinderGeometry(
      1.05,
      1.05,
      0.06,
      40,
      1,
      false,
      Math.PI,
      Math.PI
    );
    rightHalfGeo.rotateX(Math.PI / 2);
    const rightHalf = new THREE.Mesh(rightHalfGeo, onyxDiscMaterial);
    astrolabeGroup.add(leftHalf, rightHalf);

    // Part 6: Sculpted Beveled Crescent Needles (ExtrudeGeometry)
    const crescentShape = new THREE.Shape();
    crescentShape.absarc(0, 0, 1.38, -Math.PI * 0.4, Math.PI * 0.4, false);
    crescentShape.absarc(
      -0.16,
      0,
      1.26,
      Math.PI * 0.38,
      -Math.PI * 0.38,
      true
    );
    crescentShape.closePath();

    const crescentGeo = new THREE.ExtrudeGeometry(crescentShape, {
      depth: 0.035,
      bevelEnabled: true,
      bevelThickness: 0.012,
      bevelSize: 0.012,
      bevelSegments: 2,
    });
    crescentGeo.center();
    const crescentNeedle = new THREE.Mesh(crescentGeo, brassMaterial);
    crescentNeedle.position.z = 0.09;
    astrolabeGroup.add(crescentNeedle);

    // Part 7: Luminous Inner Filament Ring
    const coreRingGeo = new THREE.TorusGeometry(0.62, 0.018, 14, 64);
    const coreRing = new THREE.Mesh(coreRingGeo, filamentMaterial);
    coreRing.position.z = 0.14;
    astrolabeGroup.add(coreRing);

    // ------------------------------------------------------------------
    // 2. CUSTOM GLSL LIQUID HORIZON AURORA RIBBON
    // ------------------------------------------------------------------
    const ribbonGeo = new THREE.PlaneGeometry(24, 11, 44, 22);
    const ribbonUniforms = {
      uTime: { value: 0 },
      uVelocity: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uColorA: { value: new THREE.Color('#DFBC91') },
      uColorB: { value: new THREE.Color('#6F89A8') },
    };
    const ribbonMat = new THREE.ShaderMaterial({
      uniforms: ribbonUniforms,
      vertexShader: RIBBON_VERTEX_SHADER,
      fragmentShader: RIBBON_FRAGMENT_SHADER,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const ribbonMesh = new THREE.Mesh(ribbonGeo, ribbonMat);
    ribbonMesh.position.set(0, -0.35, -3.8);
    ribbonMesh.rotation.x = -0.32;
    scene.add(ribbonMesh);

    // ------------------------------------------------------------------
    // 3. CUSTOM GLSL MORPHING PARTICLE COSMOS (1,280 PARTICLES)
    // ------------------------------------------------------------------
    const formations = generateParticleFormations(1280);
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute(
      'position',
      new THREE.BufferAttribute(formations.pos0.slice(), 3)
    );
    particleGeo.setAttribute(
      'aPos0',
      new THREE.BufferAttribute(formations.pos0, 3)
    );
    particleGeo.setAttribute(
      'aPos1',
      new THREE.BufferAttribute(formations.pos1, 3)
    );
    particleGeo.setAttribute(
      'aPos2',
      new THREE.BufferAttribute(formations.pos2, 3)
    );
    particleGeo.setAttribute(
      'aPos3',
      new THREE.BufferAttribute(formations.pos3, 3)
    );
    particleGeo.setAttribute(
      'aSeed',
      new THREE.BufferAttribute(formations.seeds, 2)
    );

    const particleUniforms = {
      uTime: { value: 0 },
      uVelocity: { value: 0 },
      uMorphWeights: { value: new THREE.Vector4(1, 0, 0, 0) },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uPixelRatio: { value: pixelRatio },
      uColorA: { value: new THREE.Color('#DFBC91') },
      uColorB: { value: new THREE.Color('#B2C2D4') },
    };
    const particleMat = new THREE.ShaderMaterial({
      uniforms: particleUniforms,
      vertexShader: PARTICLE_VERTEX_SHADER,
      fragmentShader: PARTICLE_FRAGMENT_SHADER,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const particleCloud = new THREE.Points(particleGeo, particleMat);
    particleCloud.frustumCulled = false;
    scene.add(particleCloud);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }
    setIsReady(true);

    // ResizeObserver & Context Loss Safeguards
    let disposed = false;
    let contextLost = false;
    let frameId = 0;
    let lastTs = performance.now();
    let elapsed = 0;

    const smoothedMouse = { x: 0, y: 0 };
    const smoothedMorph = new THREE.Vector4(1, 0, 0, 0);
    let smoothedSplit = 0.08;

    const handleResize = () => {
      if (disposed || !mountRef.current) return;
      const w = mountRef.current.clientWidth || window.innerWidth;
      const h = mountRef.current.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(handleResize)
        : null;
    resizeObserver?.observe(host);

    const onContextLost = (event: Event) => {
      event.preventDefault();
      contextLost = true;
    };
    const onContextRestored = () => {
      contextLost = false;
    };
    canvas.addEventListener('webglcontextlost', onContextLost);
    canvas.addEventListener('webglcontextrestored', onContextRestored);

    function afterDraw(cb: () => void) {
      if (disposed) return;
      try {
        const gl = renderer.getContext() as WebGL2RenderingContext;
        if (typeof gl.fenceSync === 'function') {
          const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
          gl.flush();
          const poll = () => {
            if (disposed) return;
            const status = sync
              ? gl.getSyncParameter(sync, gl.SYNC_STATUS)
              : gl.SIGNALED;
            if (status === gl.UNSIGNALED) {
              frameId = window.setTimeout(poll, 5);
            } else {
              if (sync) gl.deleteSync(sync);
              frameId = window.setTimeout(cb, 80);
            }
          };
          frameId = window.setTimeout(poll, 5);
          return;
        }
      } catch {
        // Fallback below if fenceSync unavailable
      }
      frameId = window.setTimeout(cb, 80);
    }

    const renderSingleStep = (dt: number) => {
      if (disposed || contextLost) return;

      elapsed += dt;
      const progress = scrollProgressRef.current;
      const state = interpolateOdysseyStageState(progress);

      const pointer = pointerRef.current;
      const dampMouse = 1 - Math.exp(-5.2 * dt);
      smoothedMouse.x += (pointer.x - smoothedMouse.x) * dampMouse;
      smoothedMouse.y += (pointer.y - smoothedMouse.y) * dampMouse;

      // Damped camera glide + subtle pointer parallax
      const camDamp = 1 - Math.exp(-4.0 * dt);
      const targetCamX = state.cameraX + smoothedMouse.x * 0.42;
      const targetCamY = state.cameraY + smoothedMouse.y * 0.28;
      camera.position.x += (targetCamX - camera.position.x) * camDamp;
      camera.position.y += (targetCamY - camera.position.y) * camDamp;
      camera.position.z += (state.cameraZ - camera.position.z) * camDamp;
      _lookTarget.set(smoothedMouse.x * 0.16, state.lookY, 0);
      camera.lookAt(_lookTarget);

      // Damped Astrolabe rotation & split-axis disassembly
      smoothedSplit += (state.astrolabeSplit - smoothedSplit) * camDamp;
      leftHalf.position.x = -smoothedSplit * 0.56;
      rightHalf.position.x = smoothedSplit * 0.56;
      leftHalf.rotation.y = -smoothedSplit * 0.34;
      rightHalf.rotation.y = smoothedSplit * 0.34;

      outerRing.rotation.z = elapsed * 0.12 + progress * Math.PI * 1.4;
      outerRing.rotation.x = Math.sin(elapsed * 0.2) * 0.14;
      innerGimbal.rotation.y = -elapsed * 0.26 - progress * Math.PI * 2.1;
      innerGimbal.rotation.x = Math.PI * 0.18 + Math.cos(elapsed * 0.22) * 0.18;
      crescentNeedle.rotation.z = -elapsed * 0.34 + progress * Math.PI * 1.8;
      coreRing.rotation.z = elapsed * 0.48;

      astrolabeGroup.rotation.y =
        smoothedMouse.x * 0.36 + Math.sin(elapsed * 0.18) * 0.12;
      astrolabeGroup.rotation.x = -smoothedMouse.y * 0.24;

      // Damped particle morph weights
      smoothedMorph.x += (state.morphWeights[0] - smoothedMorph.x) * camDamp;
      smoothedMorph.y += (state.morphWeights[1] - smoothedMorph.y) * camDamp;
      smoothedMorph.z += (state.morphWeights[2] - smoothedMorph.z) * camDamp;
      smoothedMorph.w += (state.morphWeights[3] - smoothedMorph.w) * camDamp;

      const mood = moodOverrideRef.current;
      _targetColorA.set(mood ? mood.primaryHex : state.primaryHex);
      _targetColorB.set(mood ? mood.secondaryHex : state.secondaryHex);

      const colorDamp = 1 - Math.exp(-3.5 * dt);
      ribbonUniforms.uColorA.value.lerp(_targetColorA, colorDamp);
      ribbonUniforms.uColorB.value.lerp(_targetColorB, colorDamp);
      particleUniforms.uColorA.value.lerp(_targetColorA, colorDamp);
      particleUniforms.uColorB.value.lerp(_targetColorB, colorDamp);

      const vel = Math.abs(scrollVelocityRef.current);
      ribbonUniforms.uTime.value = elapsed;
      ribbonUniforms.uVelocity.value = vel;
      ribbonUniforms.uMouse.value.set(smoothedMouse.x, smoothedMouse.y);

      particleUniforms.uTime.value = elapsed;
      particleUniforms.uVelocity.value = vel;
      particleUniforms.uMorphWeights.value.copy(smoothedMorph);
      particleUniforms.uMouse.value.set(smoothedMouse.x, smoothedMouse.y);

      renderer.render(scene, camera);
    };

    const tick = () => {
      if (disposed) return;
      const now = performance.now();
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTs) / 1000));
      lastTs = now;

      if (!document.hidden) {
        renderSingleStep(dt);
      }

      if (reduced) {
        return;
      }

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = window.requestAnimationFrame(tick);
      }
    };

    // Initial render
    renderSingleStep(0.016);
    if (!reduced) {
      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = window.requestAnimationFrame(tick);
      }
    }

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(frameId);
      resizeObserver?.disconnect();
      canvas.removeEventListener('webglcontextlost', onContextLost);
      canvas.removeEventListener('webglcontextrestored', onContextRestored);

      outerRingGeo.dispose();
      studGeo.dispose();
      innerGimbalGeo.dispose();
      leftHalfGeo.dispose();
      rightHalfGeo.dispose();
      crescentGeo.dispose();
      coreRingGeo.dispose();
      ribbonGeo.dispose();
      particleGeo.dispose();

      brassMaterial.dispose();
      silverMaterial.dispose();
      onyxDiscMaterial.dispose();
      filamentMaterial.dispose();
      ribbonMat.dispose();
      particleMat.dispose();

      dialTexture?.dispose();
      bumpTexture?.dispose();
      envTarget.dispose();

      renderer.dispose();
      if (canvas.parentElement === host) {
        host.removeChild(canvas);
      }
    };
  }, [isSoftGl, scrollProgressRef, scrollVelocityRef, pointerRef, moodOverrideRef]);

  return (
    <div
      data-testid="odyssey-webgl-stage"
      data-ready={isReady ? 'true' : 'false'}
      data-software-gl={isSoftGl ? 'true' : 'false'}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#06080F]"
    >
      {webglFailed ? (
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(80% 70% at 50% 42%, rgba(223, 188, 145, 0.14) 0%, rgba(45, 58, 82, 0.35) 48%, #06080F 100%)',
          }}
        />
      ) : (
        <div ref={mountRef} className="h-full w-full" />
      )}

      {/* Subtle Perimeter Vignette Preserving Center Astrolabe Clarity */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(75% 70% at 50% 46%, transparent 32%, rgba(6, 8, 15, 0.62) 100%)',
        }}
      />
    </div>
  );
}
