export interface SpineWaypoint {
  id: string;
  label: string;
  y: number;
  cx: number;
  threshold: number;
}

export const SPINE_WAYPOINTS: readonly SpineWaypoint[] = [
  { id: 'ch-1', label: '01', y: 66, cx: 64, threshold: 0.02 },
  { id: 'ch-2', label: '02', y: 162, cx: 46, threshold: 0.14 },
  { id: 'ch-3', label: '03', y: 262, cx: 74, threshold: 0.28 },
  { id: 'ch-4', label: '04', y: 362, cx: 56, threshold: 0.42 },
  { id: 'ch-5', label: '05', y: 462, cx: 48, threshold: 0.56 },
  { id: 'ch-6', label: '06', y: 562, cx: 64, threshold: 0.7 },
  { id: 'ch-7', label: '07', y: 658, cx: 50, threshold: 0.82 },
  { id: 'ch-8', label: '08', y: 744, cx: 62, threshold: 0.92 },
] as const;

export function clampScrollProgress(progress: number): number {
  if (!Number.isFinite(progress)) return 0;
  return Math.max(0, Math.min(1, progress));
}

export function getActiveWaypointIndex(
  scrollProgress: number,
  waypoints: readonly SpineWaypoint[] = SPINE_WAYPOINTS
): number {
  const p = clampScrollProgress(scrollProgress);
  let active = 0;
  for (let i = 0; i < waypoints.length; i++) {
    if (p >= waypoints[i].threshold) {
      active = i;
    }
  }
  return active;
}

export function isWaypointReached(
  scrollProgress: number,
  waypoint: SpineWaypoint
): boolean {
  return clampScrollProgress(scrollProgress) >= waypoint.threshold;
}
