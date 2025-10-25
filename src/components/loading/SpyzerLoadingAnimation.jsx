import React from 'react';
import logo from '../../assets/Logo5.png'


export default function SpyzerLoadingAnimation({ logoSrc }) {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    // Fade in al montar
    setIsVisible(true);
  }, []);

  return (
    <div style={{
      ...styles.container,
      opacity: isVisible ? 1 : 0,
      transition: 'opacity 0.5s ease-in-out',
    }}>
      {/* Estrellas de fondo sutiles */}
      <div style={styles.stars}>
        {[...Array(15)].map((_, i) => (
          <div 
            key={i} 
            style={{
              ...styles.star,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      <div style={styles.loadingContainer}>
        {/* Círculo central premium */}
        <div style={styles.centralCircle}>
          {/* Onda de energía */}
          <div style={styles.energyWave}></div>
          
          {/* Logo imagen */}
          {logo && (
            <div style={styles.logoImage}>
              <img src={logo} alt="Logo" style={styles.logoImg} />
            </div>
          )}
          
          {/* Logo Spyzer */}
          <div style={styles.logo}>SPYZER</div>
          
          {/* Texto de Loading dentro */}
          <div style={styles.loadingText}>Loading</div>
          
          {/* Puntos de carga minimalistas */}
          <div style={styles.loadingDots}>
            <span style={{...styles.dot, animationDelay: '0s'}}>●</span>
            <span style={{...styles.dot, animationDelay: '0.3s'}}>●</span>
            <span style={{...styles.dot, animationDelay: '0.6s'}}>●</span>
          </div>
        </div>

        {/* Sistema de órbitas con planetas */}
        <div style={styles.orbitContainer}>
          {/* S&P 500 - Azul */}
          <div style={{...styles.orbit, ...styles.orbit1}}>
            <div style={{...styles.planet, ...styles.planet1}}></div>
          </div>
          
          {/* NASDAQ - Verde */}
          <div style={{...styles.orbit, ...styles.orbit2}}>
            <div style={{...styles.planet, ...styles.planet2}}></div>
          </div>
          
          {/* IBEX 35 - Naranja */}
          <div style={{...styles.orbit, ...styles.orbit3}}>
            <div style={{...styles.planet, ...styles.planet3}}></div>
          </div>
          
          {/* VIX - Rojo */}
          <div style={{...styles.orbit, ...styles.orbit4}}>
            <div style={{...styles.planet, ...styles.planet4}}></div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes twinkle {
          0% { opacity: 0.3; transform: scale(1); }
          100% { opacity: 0.8; transform: scale(1.2); }
        }

        @keyframes rotate {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }

        @keyframes planetGlow {
          0% { opacity: 0.6; }
          100% { opacity: 1; }
        }

        @keyframes energyWave {
          0% {
            transform: scale(1);
            opacity: 0.3;
          }
          100% {
            transform: scale(1.4);
            opacity: 0;
          }
        }

        @keyframes logoGlow {
          0%, 100% {
            text-shadow: 
              0 2px 20px rgba(0, 122, 204, 0.3),
              0 0 40px rgba(0, 122, 204, 0.15);
          }
          50% {
            text-shadow: 
              0 2px 25px rgba(0, 122, 204, 0.4),
              0 0 50px rgba(0, 122, 204, 0.2);
          }
        }

        @keyframes dotPulse {
          0%, 60%, 100% {
            opacity: 0.3;
            transform: scale(0.8);
          }
          30% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes textPulse {
          0%, 100% {
            opacity: 0.7;
          }
          50% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    width: '100vw',
    height: '100vh',
    background: 'radial-gradient(ellipse at center, #0a1828 0%, #0D0D0D 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  
  // Estrellas de fondo
  stars: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
    zIndex: 0,
  },
  
  star: {
    position: 'absolute',
    background: 'rgba(255, 255, 255, 0.6)',
    width: '1px',
    height: '1px',
    borderRadius: '50%',
    animation: 'twinkle 4s ease-in-out infinite alternate',
  },
  
  // Contenedor principal
  loadingContainer: {
    position: 'relative',
    width: '500px',
    height: '500px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  
  // Círculo central premium
  centralCircle: {
    width: '180px',
    height: '180px',
    borderRadius: '50%',
    background: `
      radial-gradient(circle at 30% 30%, rgba(0, 122, 204, 0.1), transparent 50%),
      linear-gradient(135deg, #1a1a1a, #0f0f0f)
    `,
    border: '2px solid rgba(0, 122, 204, 0.3)',
    boxShadow: `
      0 0 40px rgba(0, 122, 204, 0.15),
      0 0 80px rgba(0, 122, 204, 0.08),
      inset 0 1px 0 rgba(255, 255, 255, 0.1),
      inset 0 -1px 0 rgba(0, 0, 0, 0.5)
    `,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    position: 'relative',
    zIndex: 10,
    backdropFilter: 'blur(10px)',
    animation: 'fadeIn 1s ease-out',
  },
  
  // Onda de energía
  energyWave: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    border: '1px solid rgba(0, 122, 204, 0.3)',
    animation: 'energyWave 3s ease-out infinite',
  },
  
  // Contenedor del logo imagen
  logoImage: {
    width: '50px',
    height: '50px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '4px',
    zIndex: 2,
    filter: 'drop-shadow(0 2px 8px rgba(0, 122, 204, 0.3))',
  },
  
  // Imagen del logo
  logoImg: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  
  // Logo
  logo: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: '22px',
    textAlign: 'center',
    letterSpacing: '2px',
    textShadow: '0 2px 20px rgba(0, 122, 204, 0.3)',
    animation: 'logoGlow 3s ease-in-out infinite',
    zIndex: 2,
    marginBottom: '2px',
  },
  
  // Texto de Loading
  loadingText: {
    color: '#A0A0A0',
    fontSize: '12px',
    fontWeight: '500',
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
    animation: 'textPulse 2s ease-in-out infinite',
    zIndex: 2,
    marginTop: '2px',
  },
  
  // Puntos de carga
  loadingDots: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    marginTop: '4px',
  },
  
  dot: {
    color: '#007ACC',
    fontSize: '8px',
    animation: 'dotPulse 1.5s ease-in-out infinite',
  },
  
  // Contenedor de órbitas
  orbitContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
  },
  
  // Órbitas base
  orbit: {
    position: 'absolute',
    borderRadius: '50%',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  },
  
  // S&P 500 - Órbita principal azul
  orbit1: {
    width: '280px',
    height: '280px',
    border: '1px solid rgba(0, 122, 204, 0.15)',
    animation: 'rotate 50s linear infinite',
  },
  
  // NASDAQ - Verde tech sutil
  orbit2: {
    width: '360px',
    height: '360px',
    border: '1px solid rgba(0, 212, 170, 0.1)',
    animation: 'rotate 65s linear infinite reverse',
  },
  
  // IBEX 35 - Naranja muy sutil
  orbit3: {
    width: '440px',
    height: '440px',
    border: '1px solid rgba(255, 107, 53, 0.08)',
    animation: 'rotate 80s linear infinite',
  },
  
  // VIX - Rojo muy sutil
  orbit4: {
    width: '520px',
    height: '520px',
    border: '1px solid rgba(255, 71, 87, 0.06)',
    animation: 'rotate 95s linear infinite reverse',
  },
  
  // Planetas base
  planet: {
    position: 'absolute',
    borderRadius: '50%',
    top: '-3px',
    left: '50%',
    transform: 'translateX(-50%)',
    animation: 'planetGlow 3s ease-in-out infinite alternate',
  },
  
  // S&P 500 - Planeta azul
  planet1: {
    width: '6px',
    height: '6px',
    background: '#007ACC',
    boxShadow: '0 0 8px rgba(0, 122, 204, 0.6)',
  },
  
  // NASDAQ - Planeta verde
  planet2: {
    width: '5px',
    height: '5px',
    background: '#00D4AA',
    boxShadow: '0 0 8px rgba(0, 212, 170, 0.5)',
  },
  
  // IBEX 35 - Planeta naranja
  planet3: {
    width: '4px',
    height: '4px',
    background: '#FF6B35',
    boxShadow: '0 0 8px rgba(255, 107, 53, 0.4)',
  },
  
  // VIX - Planeta rojo
  planet4: {
    width: '3px',
    height: '3px',
    background: '#FF4757',
    boxShadow: '0 0 8px rgba(255, 71, 87, 0.3)',
  },
};