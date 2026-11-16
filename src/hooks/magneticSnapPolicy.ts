export const MAGNETIC_SNAP_MIN_WIDTH = 768;

export function shouldEnableMagneticSnap(params: {
  viewportWidth: number;
  isTouch: boolean;
  reducedMotion: boolean;
  pathname: string;
}): boolean {
  if (params.reducedMotion || params.isTouch) return false;
  if (params.viewportWidth < MAGNETIC_SNAP_MIN_WIDTH) return false;
  return params.pathname === '/' || params.pathname === '';
}
