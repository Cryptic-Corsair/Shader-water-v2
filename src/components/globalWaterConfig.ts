export interface GlobalWaterConfigInput {
  isDaylightPaper: boolean;
  pageVisible: boolean;
  reducedMotion: boolean;
  isSoftwareRenderer: boolean;
  hardwareConcurrency?: number;
  viewportWidth?: number;
}

export interface GlobalWaterConfig {
  active: boolean;
  speed: number;
  scale: number;
  maxPixelCount: number;
  minPixelRatio: number;
  layering: number;
  highlights: number;
  caustic: number;
  waves: number;
  edges: number;
  size: number;
}

const GLOBAL_WATER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 900" width="1440" height="900">
  <defs>
    <linearGradient id="lagoonBase" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1E2736"/>
      <stop offset="48%" stop-color="#2B374A"/>
      <stop offset="100%" stop-color="#18202C"/>
    </linearGradient>
    <radialGradient id="moonlightDrift" cx="72%" cy="28%" r="56%">
      <stop offset="0%" stop-color="#EBD4B4" stop-opacity="0.72"/>
      <stop offset="34%" stop-color="#DFBC91" stop-opacity="0.46"/>
      <stop offset="68%" stop-color="#6F6768" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="#1E2736" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="silverCurrent" cx="28%" cy="66%" r="58%">
      <stop offset="0%" stop-color="#AEC2D6" stop-opacity="0.54"/>
      <stop offset="44%" stop-color="#6E839B" stop-opacity="0.34"/>
      <stop offset="100%" stop-color="#1C2432" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="pearlCore" cx="50%" cy="46%" r="48%">
      <stop offset="0%" stop-color="#C8C4BC" stop-opacity="0.26"/>
      <stop offset="56%" stop-color="#4A596E" stop-opacity="0.20"/>
      <stop offset="100%" stop-color="#1B2330" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1440" height="900" fill="url(#lagoonBase)"/>
  <rect width="1440" height="900" fill="url(#silverCurrent)"/>
  <rect width="1440" height="900" fill="url(#moonlightDrift)"/>
  <rect width="1440" height="900" fill="url(#pearlCore)"/>
</svg>`;

export const GLOBAL_WATER_IMAGE_URI = `data:image/svg+xml;utf8,${encodeURIComponent(
  GLOBAL_WATER_SVG
)}`;

export function resolveGlobalWaterConfig({
  isDaylightPaper,
  pageVisible,
  reducedMotion,
  isSoftwareRenderer,
  hardwareConcurrency = 8,
  viewportWidth = 1440,
}: GlobalWaterConfigInput): GlobalWaterConfig {
  const isConstrainedDevice =
    isSoftwareRenderer ||
    (Number.isFinite(hardwareConcurrency) && hardwareConcurrency <= 4);

  const isCompactViewport =
    Number.isFinite(viewportWidth) && viewportWidth < 768;

  const maxPixelCount = isConstrainedDevice
    ? 220_000
    : isCompactViewport
      ? 260_000
      : 400_000;

  const active = !isDaylightPaper && pageVisible && !reducedMotion;

  return {
    active,
    speed: active ? 0.24 : 0,
    scale: 1.38,
    maxPixelCount,
    minPixelRatio: 1,
    layering: isConstrainedDevice ? 0 : 0.34,
    highlights: 0.52,
    caustic: 0.38,
    waves: 0.34,
    edges: 0,
    size: 0.72,
  };
}
