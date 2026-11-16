import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react';

export interface AtmosphereOverride {
  realmId: string;
  realmName: string;
  backgroundImage: string;
  veilTint: string;
  waterColorBack: string;
  waterColorHighlight: string;
  accentHex: string;
}

interface AtmosphereContextValue {
  atlasOverride: AtmosphereOverride | null;
  setAtlasOverride: (next: AtmosphereOverride | null) => void;
}

const AtmosphereContext = createContext<AtmosphereContextValue>({
  atlasOverride: null,
  setAtlasOverride: () => {},
});

export function AtmosphereProvider({ children }: { children: ReactNode }) {
  const [atlasOverride, setAtlasOverrideState] =
    useState<AtmosphereOverride | null>(null);

  const setAtlasOverride = useCallback((next: AtmosphereOverride | null) => {
    setAtlasOverrideState((prev) => {
      if (prev === null && next === null) return prev;
      if (prev && next && prev.realmId === next.realmId) return prev;
      return next;
    });
  }, []);

  return (
    <AtmosphereContext.Provider value={{ atlasOverride, setAtlasOverride }}>
      {children}
    </AtmosphereContext.Provider>
  );
}

export function useAtmosphere(): AtmosphereContextValue {
  return useContext(AtmosphereContext);
}
