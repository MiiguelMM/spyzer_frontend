import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../service/authService';
import SpyzerLoadingAnimation from '../components/loading/SpyzerLoadingAnimation';

const OAuth2RedirectHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const errorParam = params.get('error');

    if (token) {
      try {
        authService.handleLoginSuccess(token);
        // Force a hard reload to ensure App.js picks up the new authentication state
        window.location.href = '/dashboard';
      } catch (e) {
        console.error('Error saving token:', e);
        setError('Error processing login. Please try again.');
        setTimeout(() => navigate('/login'), 3000);
      }
    } else {
      console.error('No token found in redirect URL');
      setError(errorParam || 'Login failed. No token received.');
      setTimeout(() => navigate('/login'), 3000);
    }
  }, [location, navigate]);

  if (error) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        color: 'white',
        backgroundColor: '#0f172a',
        padding: '20px',
        textAlign: 'center'
      }}>
        <h2 style={{ color: '#ff4d4f', marginBottom: '16px' }}>Login Failed</h2>
        <p style={{ marginBottom: '8px' }}>{error}</p>
        <p>Redirecting to login...</p>
      </div>
    );
  }

  return <SpyzerLoadingAnimation />;
};

export default OAuth2RedirectHandler;
