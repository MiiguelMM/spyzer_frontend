import React, { useState } from 'react';
import '../css/LandingPage.css';
import Logo from '../assets/Logo5.png';
import Circulo from '../assets/circulo.png';
import authService from '../service/authService';

export default function LandingPage({ onLoginSuccess }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      console.log('Iniciando login con Google...');
      
      // Login con Google usando popup
      const result = await authService.loginWithGoogle();
      
      console.log('Login exitoso:', result);
      
      // Llamar callback de éxito
      if (onLoginSuccess) {
        onLoginSuccess(result.user);
      }
      
    } catch (error) {
      console.error('Error en login:', error);
      setError(error.message || 'Error al iniciar sesión. Intenta nuevamente.');
      setIsLoading(false);
    }
  };

  return (
    <div className='content'>
      {/* Estrellas de fondo */}
      <div className="stars">
        <div className="star star-1"></div>
        <div className="star star-2"></div>
        <div className="star star-3"></div>
        <div className="star star-4"></div>
        <div className="star star-5"></div> 
        <div className="star star-6"></div>
        <div className="star star-7"></div>
        <div className="star star-8"></div>
        <div className="star star-9"></div>
        <div className="star star-10"></div>
        
        {/* Estrellas fugaces */}
        <div className="shooting-star shooting-star-1"></div>
        <div className="shooting-star shooting-star-2"></div>
        <div className="shooting-star shooting-star-3"></div>
      </div>

      {/* Círculo central con logo */}
      <div className='circle' style={{backgroundImage:`url(${Circulo})`}}>
        {/* Líneas de energía decorativas */}
        <div className="energy-lines">
          <div className="energy-line"></div>
          <div className="energy-line"></div>
          <div className="energy-line"></div>
          <div className="energy-line"></div>
          <div className="energy-line"></div>
          <div className="energy-line"></div>
          <div className="energy-line"></div>
          <div className="energy-line"></div>
        </div>
        
        <div className='logo' style={{ backgroundImage: `url(${Logo})` }}></div>
        <div className='name'> SPYZER </div>
        
        {/* Sistema de órbitas y planetas */}
        <div className="orbit-container">
          {/* S&P 500 - Azul principal */}
          <div className="orbit orbit-1">
            <div className="planet planet-1"></div>
          </div>
          {/* NASDAQ - Verde tech */}
          <div className="orbit orbit-2">
            <div className="planet planet-2"></div>
          </div>
          {/* IBEX 35 - Naranja español */}
          <div className="orbit orbit-3">
            <div className="planet planet-3"></div>
          </div>
          {/* VIX - Rojo fear */}
          <div className="orbit orbit-4">
            <div className="planet planet-4"></div>
          </div>
        </div>
      </div>
      
      {/* Mensaje de error si existe */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      {/* Botón único */}
      <div className="buttons-group">
        <button 
          className="login-button"
          onClick={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="button-spinner"></span>
              Loading...
            </>
          ) : (
            'Sign in with Google'
          )}
        </button>
      </div>

      {/* Texto descriptivo */}
      <p className="register-text">
        Sign in with your Google account to start trading
      </p>

      {/* Estilos del spinner según el design system */}
      <style>{`
        .button-spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          margin-right: 10px;
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-top-color: #FFFFFF;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .login-button {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .login-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 
            0 4px 15px rgba(0, 0, 0, 0.8),
            0 0 8px rgba(0, 191, 255, 0.3);
        }

        .login-button:active:not(:disabled) {
          transform: translateY(0);
        }

        .login-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .error-message {
          background-color: rgba(255, 107, 107, 0.1);
          color: #FF4D4F;
          padding: 12px 20px;
          border-radius: 8px;
          border: 1px solid rgba(255, 77, 79, 0.3);
          margin-bottom: 16px;
          font-size: 14px;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}