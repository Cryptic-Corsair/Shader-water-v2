import { ArrowUp, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import type { SiteLang } from '../../context/LanguageContext';
import { getUiCopy } from '../../data/uiCopy';
import { ODYSSEY_ACTS, getActLabel } from './odysseyChoreography';

export interface OdysseyActRailProps {
  lang: SiteLang;
  activeActIndex: number;
  progress: number;
  onJumpToAct: (actId: string) => void;
  onJumpTop: () => void;
}

export function OdysseyActRail({
  lang,
  activeActIndex,
  progress,
  onJumpToAct,
  onJumpTop,
}: OdysseyActRailProps) {
  const [collapsed, setCollapsed] = useState(false);
  const copy = getUiCopy(lang).odyssey.rail;
  const activeAct = ODYSSEY_ACTS[activeActIndex] ?? ODYSSEY_ACTS[0];
  const pct = Math.round(Math.min(100, Math.max(0, progress * 100)));

  return (
    <div
      data-testid="odyssey-act-rail"
      className="pointer-events-none fixed inset-x-0 bottom-3 z-40 flex flex-col items-center px-3 md:bottom-5"
    >
      {/* Collapse / Expand Pill */}
      <button
        type="button"
        onClick={() => setCollapsed((prev) => !prev)}
        aria-expanded={!collapsed}
        data-testid="odyssey-rail-toggle"
        className="pointer-events-auto mb-1.5 inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-white/16 bg-[#0B0E17]/90 px-3 py-1 text-[11px] font-medium text-[#B2C2D4] transition-colors hover:border-[#DFBC91]/60 hover:text-[#FAF6EE] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91]"
      >
        {collapsed ? (
          <>
            <ChevronUp className="h-3 w-3" aria-hidden="true" />
            <span>{copy.expand}</span>
          </>
        ) : (
          <>
            <ChevronDown className="h-3 w-3" aria-hidden="true" />
            <span>{copy.collapse}</span>
          </>
        )}
      </button>

      {/* Main Dock Bar (Solid high-contrast obsidian rgba - zero backdrop-blur over WebGL) */}
      {!collapsed && (
        <nav
          aria-label="Odyssey chapters"
          className="pointer-events-auto flex w-full max-w-[46rem] items-center justify-between gap-2 rounded-full border border-white/18 bg-[#0B0E17]/92 px-3 py-1.5 shadow-[0_14px_40px_rgba(4,6,12,0.56)] md:px-4"
        >
          <span className="hidden text-[11px] font-medium text-[#DFBC91] tabular-nums sm:inline whitespace-nowrap shrink-0">
            {activeAct.coordLabel}
          </span>

          <div className="flex flex-1 items-center justify-center gap-1 overflow-x-auto">
            {ODYSSEY_ACTS.map((act, idx) => {
              const isActive = idx === activeActIndex;
              const targetId = `odyssey-act-${act.id}`;
              return (
                <button
                  key={act.id}
                  type="button"
                  onClick={() => onJumpToAct(targetId)}
                  aria-current={isActive ? 'step' : undefined}
                  data-testid={`odyssey-rail-act-${act.id}`}
                  className={`inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91] ${
                    isActive
                      ? 'bg-[#DFBC91] text-[#11151E]'
                      : 'text-[#F6F4EF]/78 hover:bg-white/[0.08] hover:text-[#FAF6EE]'
                  }`}
                >
                  <span className="tabular-nums">{act.roman}</span>
                  <span className="hidden md:inline">
                    · {getActLabel(act, lang)}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] font-medium text-[#B2C2D4] tabular-nums">
              {pct}%
            </span>
            <button
              type="button"
              onClick={onJumpTop}
              aria-label={copy.top}
              className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-white/16 text-[#F6F4EF]/82 transition-colors hover:border-[#DFBC91] hover:text-[#DFBC91] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91]"
            >
              <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}
