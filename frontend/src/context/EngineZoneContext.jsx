import { createContext, useCallback, useContext, useRef } from 'react';

const EngineZoneContext = createContext(null);

export function EngineZoneProvider({ children }) {
  const zonesRef = useRef({});

  const registerZone = useCallback((id, api) => {
    zonesRef.current[id] = api;
  }, []);

  const triggerPulse = useCallback((id) => {
    zonesRef.current[id]?.pulse();
  }, []);

  const triggerError = useCallback((id) => {
    zonesRef.current[id]?.flash();
  }, []);

  const setZoneHover = useCallback((id, val) => {
    zonesRef.current[id]?.setHover(val);
  }, []);

  return (
    <EngineZoneContext.Provider value={{ registerZone, triggerPulse, triggerError, setZoneHover }}>
      {children}
    </EngineZoneContext.Provider>
  );
}

export function useEngineZone() {
  const ctx = useContext(EngineZoneContext);
  if (!ctx) throw new Error('useEngineZone must be inside EngineZoneProvider');
  return ctx;
}
