import type { ShaderPalettePreset } from './shaderGalleryData';
import { ShaderViewport } from './ShaderViewport';
import {
  SITE_BACKGROUND_SHADERS,
  type SiteSectionShaderKey,
} from './siteShaderChoreography';

export interface SectionShaderBackdropProps {
  sectionKey: SiteSectionShaderKey;
  paletteOverride?: ShaderPalettePreset;
  speedMultiplier?: number;
  feather?: boolean;
  className?: string;
}

export function SectionShaderBackdrop({
  sectionKey,
  paletteOverride,
  speedMultiplier = 1,
  feather = true,
  className = '',
}: SectionShaderBackdropProps) {
  const cfg = SITE_BACKGROUND_SHADERS[sectionKey];
  const activePalette = paletteOverride ?? cfg.palette;

  return (
    <div
      aria-hidden="true"
      data-testid={`section-shader-${sectionKey}`}
      data-shader-engine={cfg.engine}
      className={`pointer-events-none absolute inset-0 z-0 overflow-hidden ${
        feather ? 'shader-feather-y' : ''
      } ${className}`}
    >
      <div
        className="absolute inset-0"
        style={{ opacity: cfg.opacity }}
      >
        <ShaderViewport
          engine={cfg.engine}
          palette={activePalette}
          speed={cfg.speed * speedMultiplier}
          intensity={cfg.intensity}
          scale={cfg.scale}
          paused={false}
          interactive={false}
          unmountOffscreen
        />
      </div>

      <div
        className="absolute inset-0"
        style={{ background: cfg.scrim }}
      />
    </div>
  );
}
