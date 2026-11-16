export const FOOTER_DIAGONAL_CUT_POLYGON =
  'polygon(0 var(--footer-cut-h), 100% 0, 100% 100%, 0 100%)';

const FOOTER_WATER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 420" width="1200" height="420">
  <defs>
    <linearGradient id="waterSlate" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#363E4B"/>
      <stop offset="52%" stop-color="#272F3C"/>
      <stop offset="100%" stop-color="#1B2029"/>
    </linearGradient>
    <radialGradient id="amberHorizon" cx="70%" cy="24%" r="64%">
      <stop offset="0%" stop-color="#FAF0E2" stop-opacity="0.96"/>
      <stop offset="30%" stop-color="#DFBC91" stop-opacity="0.84"/>
      <stop offset="65%" stop-color="#A67F6B" stop-opacity="0.38"/>
      <stop offset="100%" stop-color="#272F3C" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="mistReflection" cx="22%" cy="64%" r="58%">
      <stop offset="0%" stop-color="#B2C2D4" stop-opacity="0.56"/>
      <stop offset="55%" stop-color="#596270" stop-opacity="0.24"/>
      <stop offset="100%" stop-color="#1E242E" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="horizonSheen" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#B2C2D4" stop-opacity="0.14"/>
      <stop offset="38%" stop-color="#DFBC91" stop-opacity="0.32"/>
      <stop offset="68%" stop-color="#FAF0E2" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="#1E242E" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="420" fill="url(#waterSlate)"/>
  <rect width="1200" height="420" fill="url(#amberHorizon)"/>
  <rect width="1200" height="420" fill="url(#mistReflection)"/>
  <rect width="1200" height="420" fill="url(#horizonSheen)"/>
</svg>`;

export const FOOTER_WATER_IMAGE_URI = `data:image/svg+xml;utf8,${encodeURIComponent(
  FOOTER_WATER_SVG
)}`;

export function resolveFooterWaterSpeed({
  inView,
  pageVisible,
  reducedMotion,
}: {
  inView: boolean;
  pageVisible: boolean;
  reducedMotion: boolean;
}): number {
  if (!inView || !pageVisible || reducedMotion) {
    return 0;
  }
  return 0.42;
}
