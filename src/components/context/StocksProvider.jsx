// src/context/StocksProvider.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import stocksService from '../service/stocksService';

const StocksContext = createContext();

export function StocksProvider({ children }) {
  const [state, setState] = useState({
    stocks: null,
    loading: true,
    error: null,
    lastUpdated: null
  });

  const loadStocks = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const data = await stocksService.obtenerAccionesPopulares();

      setState({
        stocks: data,
        loading: false,
        error: null,
        lastUpdated: new Date()
      });

      console.log('✅ Acciones cargadas:', data.length);
    } catch (error) {
      console.error('❌ Error cargando acciones:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Error al cargar acciones'
      }));
    }
  };

  useEffect(() => {
    loadStocks();
    const interval = setInterval(loadStocks, 5 * 60 * 1000); // Actualizar cada 5 min
    return () => clearInterval(interval);
  }, []);

  return (
    <StocksContext.Provider value={{ ...state, refresh: loadStocks }}>
      {children}
    </StocksContext.Provider>
  );
}

export function useStocks() {
  const context = useContext(StocksContext);
  if (!context) {
    throw new Error('useStocks debe usarse dentro de StocksProvider');
  }
  return context;
}