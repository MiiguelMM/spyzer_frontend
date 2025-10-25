import React, { createContext, useContext, useState } from 'react';

const PageTransitionContext = createContext();

export function PageTransitionProvider({ children }) {
  const [isTransitioning, setIsTransitioning] = useState(false);

  const startTransition = () => {
    setIsTransitioning(true);
  };

  const endTransition = () => {
    // Pequeño delay para asegurar que se vea la transición
    setTimeout(() => {
      setIsTransitioning(false);
    }, 300);
  };

  return (
    <PageTransitionContext.Provider value={{ isTransitioning, startTransition, endTransition }}>
      {children}
    </PageTransitionContext.Provider>
  );
}

export function usePageTransition() {
  const context = useContext(PageTransitionContext);
  if (!context) {
    throw new Error('usePageTransition debe usarse dentro de PageTransitionProvider');
  }
  return context;
}
