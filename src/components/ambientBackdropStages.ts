export interface AmbientStage {
  id: number;
  name: string;
  colors: [string, string, string];
  backgroundImage: string;
  backgroundColor: string;
}

export const AMBIENT_STAGES: readonly AmbientStage[] = [
  {
    id: 0,
    name: 'Dawn Fog',
    colors: ['#4C5563', '#858E9C', '#D2CCC3'],
    backgroundColor: '#4C5563',
    backgroundImage: [
      'radial-gradient(88% 72% at 22% 16%, rgba(210, 204, 195, 0.36) 0%, transparent 62%)',
      'radial-gradient(74% 66% at 84% 28%, rgba(133, 142, 156, 0.56) 0%, transparent 64%)',
      'radial-gradient(90% 78% at 52% 92%, rgba(76, 85, 99, 0.88) 0%, transparent 72%)',
      'linear-gradient(164deg, #4C5563 0%, #687280 48%, #858E9C 80%, #586270 100%)',
    ].join(', '),
  },
  {
    id: 1,
    name: 'Silver Water',
    colors: ['#3E4755', '#737F8F', '#BCC4CE'],
    backgroundColor: '#3E4755',
    backgroundImage: [
      'radial-gradient(82% 70% at 78% 20%, rgba(188, 196, 206, 0.34) 0%, transparent 60%)',
      'radial-gradient(76% 68% at 18% 74%, rgba(115, 127, 143, 0.55) 0%, transparent 64%)',
      'radial-gradient(86% 74% at 48% 50%, rgba(62, 71, 85, 0.52) 0%, transparent 74%)',
      'linear-gradient(168deg, #3E4755 0%, #586475 50%, #737F8F 82%, #475161 100%)',
    ].join(', '),
  },
  {
    id: 2,
    name: 'Sandstone Dusk',
    colors: ['#6A605A', '#A3978E', '#DFD7CD'],
    backgroundColor: '#6A605A',
    backgroundImage: [
      'radial-gradient(84% 68% at 24% 24%, rgba(223, 215, 205, 0.32) 0%, transparent 60%)',
      'radial-gradient(72% 66% at 82% 70%, rgba(163, 151, 142, 0.52) 0%, transparent 65%)',
      'radial-gradient(92% 80% at 50% 96%, rgba(84, 75, 70, 0.84) 0%, transparent 72%)',
      'linear-gradient(162deg, #564D48 0%, #6A605A 44%, #8E8279 78%, #635953 100%)',
    ].join(', '),
  },
  {
    id: 3,
    name: 'Twilight Slate',
    colors: ['#343D4B', '#5F6B7E', '#A3AEBE'],
    backgroundColor: '#343D4B',
    backgroundImage: [
      'radial-gradient(80% 66% at 76% 18%, rgba(163, 174, 190, 0.30) 0%, transparent 60%)',
      'radial-gradient(76% 70% at 20% 78%, rgba(95, 107, 126, 0.56) 0%, transparent 64%)',
      'radial-gradient(88% 76% at 50% 50%, rgba(52, 61, 75, 0.55) 0%, transparent 75%)',
      'linear-gradient(166deg, #343D4B 0%, #495466 48%, #5F6B7E 82%, #394352 100%)',
    ].join(', '),
  },
  {
    id: 4,
    name: 'Balanced Mist',
    colors: ['#4A5362', '#818996', '#CBC5BC'],
    backgroundColor: '#4A5362',
    backgroundImage: [
      'radial-gradient(86% 72% at 30% 20%, rgba(203, 197, 188, 0.32) 0%, transparent 62%)',
      'radial-gradient(74% 64% at 82% 76%, rgba(129, 137, 150, 0.52) 0%, transparent 64%)',
      'radial-gradient(86% 74% at 50% 92%, rgba(74, 83, 98, 0.86) 0%, transparent 72%)',
      'linear-gradient(164deg, #4A5362 0%, #646D7C 50%, #818996 80%, #525B6A 100%)',
    ].join(', '),
  },
] as const;

export function clampStageIndex(
  index: number,
  total: number = AMBIENT_STAGES.length
): number {
  if (!Number.isFinite(index) || total <= 0) return 0;
  return Math.max(0, Math.min(total - 1, Math.round(index)));
}

export function computeStageOpacities(
  activeIndex: number,
  total: number = AMBIENT_STAGES.length
): number[] {
  const safeIndex = clampStageIndex(activeIndex, total);
  return Array.from({ length: total }, (_, idx) => (idx === safeIndex ? 1 : 0));
}

export function resolveRouteDefaultStage(pathname: string): number {
  if (pathname.startsWith('/poems')) {
    return 3; // Twilight Slate for archive & nocturnal reading rooms
  }
  return 0; // Dawn Fog for exhibition opening
}
