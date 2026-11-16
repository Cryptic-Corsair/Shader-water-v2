import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { useLocation } from 'react-router-dom';

export type ReadingSurface = 'nocturnal' | 'paper';

const SURFACE_STORAGE_KEY = 'ml-reading-surface';

function readStoredSurface(): ReadingSurface {
  try {
    const raw = window.localStorage.getItem(SURFACE_STORAGE_KEY);
    if (raw === 'paper') return 'paper';
    if (raw === 'ink' || raw === 'nocturnal') return 'nocturnal';
  } catch {
    // Ignore storage access errors in restricted environments
  }
  return 'nocturnal';
}

function writeStoredSurface(surface: ReadingSurface): void {
  try {
    window.localStorage.setItem(
      SURFACE_STORAGE_KEY,
      surface === 'paper' ? 'paper' : 'ink'
    );
  } catch {
    // Ignore storage access errors
  }
}

interface ReadingSurfaceContextValue {
  surface: ReadingSurface;
  setSurface: (surface: ReadingSurface) => void;
  toggleSurface: () => void;
  quietMode: boolean;
  setQuietMode: (quiet: boolean) => void;
  toggleQuietMode: () => void;
}

const ReadingSurfaceContext = createContext<ReadingSurfaceContextValue>({
  surface: 'nocturnal',
  setSurface: () => {},
  toggleSurface: () => {},
  quietMode: false,
  setQuietMode: () => {},
  toggleQuietMode: () => {},
});

export function useReadingSurface(): ReadingSurfaceContextValue {
  return useContext(ReadingSurfaceContext);
}

export function ReadingSurfaceProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [surface, setSurfaceState] = useState<ReadingSurface>(readStoredSurface);
  const [quietMode, setQuietMode] = useState(false);

  const setSurface = (next: ReadingSurface) => {
    setSurfaceState(next);
    writeStoredSurface(next);
  };

  const toggleSurface = () => {
    setSurfaceState((prev) => {
      const next = prev === 'nocturnal' ? 'paper' : 'nocturnal';
      writeStoredSurface(next);
      return next;
    });
  };

  const toggleQuietMode = () => {
    setQuietMode((prev) => !prev);
  };

  // Automatically restore navigation chrome when leaving a reading room
  useEffect(() => {
    const isReadingRoom =
      location.pathname.startsWith('/poems/') &&
      location.pathname !== '/poems/';
    if (!isReadingRoom && quietMode) {
      setQuietMode(false);
    }
  }, [location.pathname, quietMode]);

  return (
    <ReadingSurfaceContext.Provider
      value={{
        surface,
        setSurface,
        toggleSurface,
        quietMode,
        setQuietMode,
        toggleQuietMode,
      }}
    >
      {children}
    </ReadingSurfaceContext.Provider>
  );
}
