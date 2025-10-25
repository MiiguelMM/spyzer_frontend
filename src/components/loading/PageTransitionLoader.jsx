import React, { useState, useEffect } from 'react';
import { usePageTransition } from '../context/PageTransitionContext';

export default function PageTransitionLoader() {
  const { isTransitioning } = usePageTransition();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isTransitioning) {
      setIsVisible(true);
    } else {
      // Esperar a que termine el fade out antes de ocultar
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isTransitioning]);

  if (!isVisible) return null;

  return (
    <div style={{
      ...styles.container,
      opacity: isTransitioning ? 1 : 0,
      transition: 'opacity 0.3s ease-in-out',
    }}>
      {/* Spinner circular minimalista */}
      <div style={styles.spinnerContainer}>
        <div style={styles.spinner}></div>
        <div style={styles.innerCircle}></div>
      </div>
      
      <style>{`
        @keyframes spin {
          0% { 
            transform: rotate(0deg);
          }
          100% { 
            transform: rotate(360deg);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 0.6;
            transform: scale(0.95);
          }
          50% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(13, 13, 13, 0.8)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999999,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  
  spinnerContainer: {
    position: 'relative',
    width: '60px',
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  spinner: {
    position: 'absolute',
    width: '60px',
    height: '60px',
    border: '3px solid transparent',
    borderTop: '3px solid #007ACC',
    borderRight: '3px solid #007ACC',
    borderRadius: '50%',
    animation: 'spin 1s cubic-bezier(0.4, 0, 0.2, 1) infinite',
    boxShadow: '0 0 15px rgba(0, 122, 204, 0.3)',
  },
  
  innerCircle: {
    width: '40px',
    height: '40px',
    backgroundColor: '#181818',
    border: '1px solid rgba(0, 122, 204, 0.2)',
    borderRadius: '50%',
    animation: 'pulse 2s ease-in-out infinite',
    boxShadow: `
      inset 0 1px 0 rgba(255, 255, 255, 0.05),
      0 0 20px rgba(0, 122, 204, 0.1)
    `,
  },
};