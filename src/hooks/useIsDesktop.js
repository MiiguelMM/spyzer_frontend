// useIsDesktop.js - Hook para detectar desktop
import { useState, useEffect } from 'react';

export const useIsDesktop = (breakpoint = 769) => {
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== 'undefined' ? window.innerWidth >= breakpoint : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= breakpoint);
    };

    // Agregar listener
    window.addEventListener('resize', handleResize);
    
    // Llamar una vez para asegurar el estado inicial
    handleResize();

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]);

  return isDesktop;
};
