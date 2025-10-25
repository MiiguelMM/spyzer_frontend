// src/context/IndicesProvider.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import marketDataService from '../../service/marketDataService';

const IndicesContext = createContext();

export function IndicesProvider({ children }) {
  const [state, setState] = useState({
    indices: null,
    loading: true,
    error: null,
    lastUpdated: null
  });

  const loadIndices = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Obtener índices principales desde el backend
      const indicesData = await marketDataService.obtenerIndicesPrincipales();

      // Obtener históricos para cada índice
      const indicesWithHistory = await Promise.all(
        Object.entries(indicesData).map(async ([symbol, data]) => {
          try {
            const historicalResponse = await marketDataService.get(`/${symbol}/historical?days=365`);

            // Transformar datos al formato que esperan los gráficos
            const historicalData = historicalResponse.data
              .map(point => ({
                time: Math.floor(new Date(point.date).getTime() / 1000),
                value: point.close,
                open: point.open,
                high: point.high,
                low: point.low,
                close: point.close
              }))
              .sort((a, b) => a.time - b.time);
            return {
              ...data,
              symbol,
              historicalData
            };
          } catch (error) {
            console.warn(`No históricos disponibles para ${symbol}:`, error);
            return {
              ...data,
              symbol,
              historicalData: []
            };
          }
        })
      );

      setState({
        indices: indicesWithHistory,
        loading: false,
        error: null,
        lastUpdated: new Date()
      });

      console.log('✅ Índices cargados:', indicesWithHistory.map(i => i.symbol).join(', '));
    } catch (error) {
      console.error('❌ Error cargando índices:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Error al cargar índices'
      }));
    }
  };

  useEffect(() => {
    loadIndices();
    const interval = setInterval(loadIndices, 5 * 60 * 1000); // Cada 5 minutos
    return () => clearInterval(interval);
  }, []);

  return (
    <IndicesContext.Provider value={{ ...state, refresh: loadIndices }}>
      {children}
    </IndicesContext.Provider>
  );
}

// Hook principal para obtener todos los índices
export function useIndices() {
  const context = useContext(IndicesContext);
  if (!context) {
    throw new Error('useIndices debe usarse dentro de IndicesProvider');
  }
  return context;
}

// Hooks individuales para cada índice
export function useSP500() {
  const { indices, loading, error } = useIndices();

  const sp500 = indices?.find(i => i.symbol === 'SPY');

  return {
    data: sp500,
    historicalData: sp500?.historicalData || [],
    isLoading: loading,
    hasError: !!error,
    error,
    currentPrice: sp500?.precio,
    dailyChange: sp500?.variacionAbsoluta,
    percentChange: sp500?.variacionPorcentual,
    volume: sp500?.volumen,
    lastUpdated: sp500?.timestamp,
    marketInfo: {
      name: 'S&P 500',
      symbol: 'SPY',
      country: 'USA',
      currency: 'USD',
      colors: {
        primary: '#007ACC',
        positive: '#00FF85',
        negative: '#FF4D4F'
      }
    }
  };
}

export function useNASDAQ() {
  const { indices, loading, error } = useIndices();

  const nasdaq = indices?.find(i => i.symbol === 'QQQ');

  return {
    data: nasdaq,
    historicalData: nasdaq?.historicalData || [],
    isLoading: loading,
    hasError: !!error,
    error,
    currentPrice: nasdaq?.precio,
    dailyChange: nasdaq?.variacionAbsoluta,
    percentChange: nasdaq?.variacionPorcentual,
    volume: nasdaq?.volumen,
    lastUpdated: nasdaq?.timestamp,
    marketInfo: {
      name: 'NASDAQ',
      symbol: 'QQQ',
      country: 'USA',
      currency: 'USD',
      colors: {
        primary: '#00D4AA',
        positive: '#00FF85',
        negative: '#FF4D4F'
      }
    }
  };
}

export function useVIX() {
  const { indices, loading, error } = useIndices();

  const vix = indices?.find(i => i.symbol === 'VIX');

  return {
    data: vix,
    historicalData: vix?.historicalData || [],
    isLoading: loading,
    hasError: !!error,
    error,
    currentPrice: vix?.precio,
    dailyChange: vix?.variacionAbsoluta,
    percentChange: vix?.variacionPorcentual,
    volume: vix?.volumen,
    lastUpdated: vix?.timestamp,
    marketInfo: {
      name: 'VIX',
      symbol: 'VIX',
      country: 'USA',
      currency: 'USD',
      colors: {
        primary: '#FF4757',
        positive: '#00FF85',
        negative: '#FF4D4F'
      }
    }
  };
}
export function useDAX() {
  const { indices, loading, error } = useIndices();
  
  const dax = indices?.find(i => i.symbol === 'DAX');
  
  return {
    data: dax,
    historicalData: dax?.historicalData || [],
    isLoading: loading,
    hasError: !!error,
    error,
    currentPrice: dax?.precio,
    dailyChange: dax?.variacionAbsoluta,
    percentChange: dax?.variacionPorcentual,
    volume: dax?.volumen,
    lastUpdated: dax?.timestamp,
    marketInfo: {
      name: 'DAX',
      symbol: 'DAX',
      country: 'Germany',
      currency: 'EUR',
      colors: {
        primary: '#00B8D4',
        positive: '#00FF85',
        negative: '#FF4D4F'
      }
    }
  };
}

export function useFXI() {
  const { indices, loading, error } = useIndices();

  const fxi = indices?.find(i => i.symbol === 'FXI');

  return {
    data: fxi,
    historicalData: fxi?.historicalData || [],
    isLoading: loading,
    hasError: !!error,
    error,
    currentPrice: fxi?.precio,
    dailyChange: fxi?.variacionAbsoluta,
    percentChange: fxi?.variacionPorcentual,
    volume: fxi?.volumen,
    lastUpdated: fxi?.timestamp,
    marketInfo: {
      name: 'FXI China Large-Cap',
      symbol: 'FXI',
      country: 'China',
      currency: 'USD',
      colors: {
        primary: '#FF6B35',
        positive: '#00FF85',
        negative: '#FF4D4F'
      }
    }
  };
}