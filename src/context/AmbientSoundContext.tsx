import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

interface SoundEngine {
  ctx: AudioContext;
  masterGain: GainNode;
  cleanup: () => void;
}

function createCoastalSoundEngine(): SoundEngine | null {
  if (typeof window === 'undefined') return null;
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AudioCtx) return null;

  const ctx = new AudioCtx();
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0.0001, ctx.currentTime);
  masterGain.connect(ctx.destination);

  // 1. Soft pink-weighted monsoon rain & twilight wind wash via filtered noise buffer
  const sampleRate = ctx.sampleRate;
  const bufferLength = sampleRate * 4;
  const noiseBuffer = ctx.createBuffer(1, bufferLength, sampleRate);
  const channel = noiseBuffer.getChannelData(0);

  let b0 = 0;
  let b1 = 0;
  let b2 = 0;
  let b3 = 0;
  for (let i = 0; i < bufferLength; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99765 * b0 + white * 0.099046;
    b1 = 0.963 * b1 + white * 0.2965164;
    b2 = 0.57 * b2 + white * 1.0526913;
    channel[i] = (b0 + b1 + b2 + b3 + white * 0.1848) * 0.05;
    b3 = white * 0.115926;
  }

  const noiseSource = ctx.createBufferSource();
  noiseSource.buffer = noiseBuffer;
  noiseSource.loop = true;

  const windFilter = ctx.createBiquadFilter();
  windFilter.type = 'lowpass';
  windFilter.frequency.setValueAtTime(260, ctx.currentTime);
  windFilter.Q.setValueAtTime(0.65, ctx.currentTime);

  const surfLfo = ctx.createOscillator();
  surfLfo.type = 'sine';
  surfLfo.frequency.setValueAtTime(0.075, ctx.currentTime);

  const surfLfoGain = ctx.createGain();
  surfLfoGain.gain.setValueAtTime(115, ctx.currentTime);
  surfLfo.connect(surfLfoGain);
  surfLfoGain.connect(windFilter.frequency);

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.32, ctx.currentTime);

  noiseSource.connect(windFilter);
  windFilter.connect(noiseGain);
  noiseGain.connect(masterGain);

  // 2. Warm nocturnal harmonic drone (D2 - A2 - E3)
  const harmonicConfigs = [
    { freq: 73.42, type: 'sine' as OscillatorType, gain: 0.24, lfoHz: 0.09 },
    { freq: 110.0, type: 'sine' as OscillatorType, gain: 0.16, lfoHz: 0.12 },
    { freq: 164.81, type: 'triangle' as OscillatorType, gain: 0.07, lfoHz: 0.06 },
  ];

  const droneFilter = ctx.createBiquadFilter();
  droneFilter.type = 'lowpass';
  droneFilter.frequency.setValueAtTime(340, ctx.currentTime);
  droneFilter.connect(masterGain);

  const stopCallbacks: Array<() => void> = [];

  harmonicConfigs.forEach((cfg) => {
    const osc = ctx.createOscillator();
    osc.type = cfg.type;
    osc.frequency.setValueAtTime(cfg.freq, ctx.currentTime);

    const oscGain = ctx.createGain();
    oscGain.gain.setValueAtTime(cfg.gain, ctx.currentTime);

    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(cfg.lfoHz, ctx.currentTime);

    const lfoDepth = ctx.createGain();
    lfoDepth.gain.setValueAtTime(cfg.gain * 0.35, ctx.currentTime);

    lfo.connect(lfoDepth);
    lfoDepth.connect(oscGain.gain);

    osc.connect(oscGain);
    oscGain.connect(droneFilter);

    osc.start();
    lfo.start();

    stopCallbacks.push(() => {
      try {
        osc.stop();
        lfo.stop();
        osc.disconnect();
        lfo.disconnect();
      } catch {
        // Ignore already stopped nodes
      }
    });
  });

  noiseSource.start();
  surfLfo.start();

  return {
    ctx,
    masterGain,
    cleanup: () => {
      try {
        noiseSource.stop();
        surfLfo.stop();
        noiseSource.disconnect();
        surfLfo.disconnect();
      } catch {
        // Ignore cleanup errors
      }
      stopCallbacks.forEach((fn) => fn());
      ctx.close().catch(() => {});
    },
  };
}

interface AmbientSoundContextValue {
  isPlaying: boolean;
  toggleSound: () => Promise<void>;
}

const AmbientSoundContext = createContext<AmbientSoundContextValue>({
  isPlaying: false,
  toggleSound: async () => {},
});

export function AmbientSoundProvider({ children }: { children: ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const engineRef = useRef<SoundEngine | null>(null);
  const suspendTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (suspendTimerRef.current !== null) {
        window.clearTimeout(suspendTimerRef.current);
      }
      engineRef.current?.cleanup();
      engineRef.current = null;
    };
  }, []);

  const toggleSound = useCallback(async () => {
    if (suspendTimerRef.current !== null) {
      window.clearTimeout(suspendTimerRef.current);
      suspendTimerRef.current = null;
    }

    setIsPlaying((prev) => {
      const next = !prev;

      if (next) {
        let engine = engineRef.current;
        if (!engine) {
          engine = createCoastalSoundEngine();
          engineRef.current = engine;
        }
        if (engine) {
          (async () => {
            try {
              if (engine.ctx.state === 'suspended') {
                await engine.ctx.resume();
              }
              const now = engine.ctx.currentTime;
              engine.masterGain.gain.cancelScheduledValues(now);
              engine.masterGain.gain.setValueAtTime(
                Math.max(0.0001, engine.masterGain.gain.value),
                now
              );
              engine.masterGain.gain.linearRampToValueAtTime(0.16, now + 1.15);
            } catch {
              // Audio playback blocked or unavailable in headless browser
            }
          })();
        }
      } else {
        const engine = engineRef.current;
        if (engine) {
          try {
            const now = engine.ctx.currentTime;
            engine.masterGain.gain.cancelScheduledValues(now);
            engine.masterGain.gain.setValueAtTime(
              Math.max(0.0001, engine.masterGain.gain.value),
              now
            );
            engine.masterGain.gain.linearRampToValueAtTime(0.0001, now + 0.65);

            suspendTimerRef.current = window.setTimeout(() => {
              engine.ctx.suspend().catch(() => {});
            }, 700);
          } catch {
            // Ignore audio context errors
          }
        }
      }

      return next;
    });
  }, []);

  return (
    <AmbientSoundContext.Provider value={{ isPlaying, toggleSound }}>
      {children}
    </AmbientSoundContext.Provider>
  );
}

export function useAmbientSound(): AmbientSoundContextValue {
  return useContext(AmbientSoundContext);
}
