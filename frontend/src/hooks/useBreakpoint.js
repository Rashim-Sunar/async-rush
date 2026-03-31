import { useState, useEffect } from 'react';

function classify(w) {
  if (w < 640)  return 'mobile';
  if (w < 1024) return 'tablet';
  return 'desktop';
}

export function useBreakpoint() {
  const [bp, setBp] = useState(() =>
    typeof window !== 'undefined' ? classify(window.innerWidth) : 'desktop'
  );

  useEffect(() => {
    const handler = () => setBp(classify(window.innerWidth));
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  return {
    bp,
    isMobile:         bp === 'mobile',
    isTablet:         bp === 'tablet',
    isDesktop:        bp === 'desktop',
    isMobileOrTablet: bp !== 'desktop',
  };
}
