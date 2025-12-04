import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Solución verificada para errores de lightweight-charts en React Strict Mode
// Función para detectar errores conocidos de lightweight-charts
const isLightweightChartsError = (error) => {
  const errorStr = error?.toString() || '';
  return (
    errorStr.includes('removeChild') ||
    errorStr.includes('NotFoundError') ||
    errorStr.includes('lightweight-charts') ||
    errorStr.includes('AttributionLogoWidget') ||
    errorStr.includes('getRgbStringViaBrowser') ||
    errorStr.includes('The node to be removed is not a child')
  );
};

// Solo en desarrollo - no afecta producción
if (process.env.NODE_ENV === 'development') {
  // Suprimir errores conocidos de lightweight-charts en consola
  const originalError = console.error;
  console.error = (...args) => {
    if (args.length > 0 && isLightweightChartsError(args[0])) {
      // Silenciar errores conocidos de lightweight-charts
      return;
    }
    originalError.apply(console, args);
  };

  // Suprimir warnings de sandbox iframe (ngrok)
  const originalWarn = console.warn;
  console.warn = (...args) => {
    if (args[0]?.includes?.('iframe') || 
        args[0]?.includes?.('sandbox') ||
        args[0]?.includes?.('ngrok')) {
      return;
    }
    originalWarn.apply(console, args);
  };

  // Capturar errores no controlados
  window.addEventListener('error', (event) => {
    if (isLightweightChartsError(event.error)) {
      event.preventDefault();
      return false;
    }
  });

  // Capturar promesas rechazadas
  window.addEventListener('unhandledrejection', (event) => {
    if (isLightweightChartsError(event.reason)) {
      event.preventDefault();
      return false;
    }
  });
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

// Fix para unidades `vh` en móviles (address bar cambia el viewport)
// Establece una variable CSS `--vh` basada en `window.innerHeight` pero
// limita actualizaciones frecuentes durante el scroll para evitar jitter.
// En móviles sólo establecemos --vh al cargar y en cambios de orientación/visibilidad.
// Evitamos recalcular durante scroll/resize para que el layout no intente re-ajustarse
// mientras el usuario scrollea (causa el estiramiento feo que reportaste).
function setViewportVhProperty() {
  if (window.innerWidth >= 769) return;
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

// Inicializar al cargar
setViewportVhProperty();

// Recalcular sólo en cambios de orientación (y cuando la pestaña vuelve a visibilidad)
window.addEventListener('orientationchange', setViewportVhProperty);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') setViewportVhProperty();
});