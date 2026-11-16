import { Volume2, VolumeX } from 'lucide-react';
import { useAmbientSound } from '../context/AmbientSoundContext';
import { useLanguage } from '../context/LanguageContext';
import { getUiCopy } from '../data/uiCopy';

export function AmbientSound() {
  const { isPlaying, toggleSound } = useAmbientSound();
  const { lang } = useLanguage();
  const soundCopy = getUiCopy(lang).sound;

  return (
    <button
      type="button"
      onClick={toggleSound}
      aria-pressed={isPlaying}
      aria-label={isPlaying ? soundCopy.ariaOn : soundCopy.ariaOff}
      data-testid="ambient-sound-toggle"
      className={`inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-full border px-3 py-1.5 text-[12px] font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91] ${
        isPlaying
          ? 'border-[#171A21]/25 bg-[#171A21] text-[#F6F4EF] shadow-sm'
          : 'border-[#171A21]/14 bg-white/45 text-[#171A21] hover:bg-white/75'
      }`}
    >
      {isPlaying ? (
        <Volume2 className="h-3.5 w-3.5 text-[#DFBC91]" aria-hidden="true" />
      ) : (
        <VolumeX className="h-3.5 w-3.5 text-[#4C5361]" aria-hidden="true" />
      )}
      <span>{isPlaying ? soundCopy.on : soundCopy.off}</span>
    </button>
  );
}
