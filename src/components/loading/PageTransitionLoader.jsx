import React, { useState, useEffect } from 'react';
import { usePageTransition } from '../loading/PageTransitionContext.jsx';

export default function PageTransitionLoader() {
  const { isTransitioning } = usePageTransition();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isTransitioning) {
      setIsVisible(true);
    } else {
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
      {/* Spinner minimalista */}
      <div style={styles.spinnerWrapper}>
        <div style={styles.spinner}></div>
        <div style={styles.spinnerInner}></div>
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
            opacity: 0.4;
            transform: scale(0.92);
          }
          50% {
            opacity: 0.8;
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
    background: 'linear-gradient(145deg, rgba(26, 26, 26, 0.95) 0%, rgba(21, 21, 21, 0.97) 100%)',
    backdropFilter: 'blur(12px) saturate(180%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999999,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  
  spinnerWrapper: {
    position: 'relative',
    width: '56px',
    height: '56px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  spinner: {
    position: 'absolute',
    width: '56px',
    height: '56px',
    border: '2px solid transparent',
    borderTopColor: '#007ACC',
    borderRightColor: '#00BFFF',
    borderRadius: '50%',
    animation: 'spin 0.9s cubic-bezier(0.4, 0, 0.2, 1) infinite',
    boxShadow: `
      0 0 20px rgba(0, 122, 204, 0.2),
      0 0 40px rgba(0, 191, 255, 0.1),
      inset 0 0 10px rgba(0, 191, 255, 0.05)
    `,
  },
  
  spinnerInner: {
    width: '36px',
    height: '36px',
    background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.8) 0%, rgba(21, 21, 21, 0.9) 100%)',
    border: '1px solid rgba(0, 122, 204, 0.15)',
    borderRadius: '50%',
    animation: 'pulse 2s ease-in-out infinite',
    boxShadow: `
      inset 0 1px 0 rgba(255, 255, 255, 0.03),
      0 0 15px rgba(0, 122, 204, 0.08)
    `,
  },
};