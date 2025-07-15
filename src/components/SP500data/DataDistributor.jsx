// DataDistributor.jsx - Centralizador de datos de mercado
import React, { createContext, useContext, useState, useEffect } from 'react';

// Crear el contexto para compartir datos
const MarketDataContext = createContext();

// Hook personalizado para usar los datos de mercado
export const useMarketData = () => {
  const context = useContext(MarketDataContext);
  if (!context) {
    throw new Error('useMarketData must be used within a MarketDataProvider');
  }
  return context;
};

// Provider component que manejará todos los datos
export const MarketDataProvider = ({ children }) => {
  console.log('MarketDataProvider renderizado'); // Debug
  const [marketData, setMarketData] = useState({
    historicalData: null,
    currentPrice: null,
    dailyChange: null,
    percentChange: null,
    volume: null,
    marketCap: null,
    loading: true,
    error: null,
    lastUpdated: null
  });

  // Configuración de la API
  const API_CONFIG = {
    baseUrl: 'YOUR_API_BASE_URL', // Reemplazar con tu URL de API
    endpoints: {
      historical: '/historical',
      realTime: '/current',
      metrics: '/metrics'
    },
    refreshInterval: 30000 // 30 segundos
  };

  // Función para hacer llamadas a la API
  const fetchFromAPI = async (endpoint, options = {}) => {
    try {
      const response = await fetch(`${API_CONFIG.baseUrl}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Agregar headers de autenticación si es necesario
          // 'Authorization': `Bearer ${YOUR_API_KEY}`,
          ...options.headers
        },
        ...options
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Fetch Error:', error);
      throw error;
    }
  };

  // Función para obtener datos históricos
  const fetchHistoricalData = async () => {
    try {
      const data = await fetchFromAPI(API_CONFIG.endpoints.historical);
      
      // Procesar y validar los datos según el formato esperado
      const processedData = data.map(item => ({
        time: item.timestamp || item.date,
        open: parseFloat(item.open),
        high: parseFloat(item.high),
        low: parseFloat(item.low),
        close: parseFloat(item.close),
        volume: parseFloat(item.volume || 0),
        value: parseFloat(item.close) // Para el gráfico
      }));

      return processedData;
    } catch (error) {
      console.error('Error fetching historical data:', error);
      throw error;
    }
  };

  // Función para obtener datos en tiempo real
  const fetchRealTimeData = async () => {
    try {
      const data = await fetchFromAPI(API_CONFIG.endpoints.realTime);
      
      return {
        currentPrice: parseFloat(data.price),
        dailyChange: parseFloat(data.change),
        percentChange: parseFloat(data.changePercent),
        volume: parseFloat(data.volume || 0),
        marketCap: parseFloat(data.marketCap || 0)
      };
    } catch (error) {
      console.error('Error fetching real-time data:', error);
      throw error;
    }
  };

  // Función para generar datos mock (mientras no tengas la API)
  const generateMockData = () => {
    const data = [];
    let price = 450;
    
    // Generar 30 días de datos históricos
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const dayVariation = price * 0.02;
      const open = Number(price.toFixed(2));
      const high = Number((price + Math.random() * dayVariation).toFixed(2));
      const low = Number((price - Math.random() * dayVariation).toFixed(2));
      const close = Number((price + (Math.random() - 0.5) * dayVariation * 0.5).toFixed(2));
      const volume = Math.floor(Math.random() * 1000000);
      
      data.push({
        time: date.toISOString().split('T')[0],
        open,
        high,
        low,
        close,
        volume,
        value: close
      });
      
      price = close;
    }
    
    const latest = data[data.length - 1];
    const previous = data[data.length - 2];
    const dailyChange = latest.close - previous.close;
    const percentChange = (dailyChange / previous.close) * 100;
    
    return {
      historicalData: data,
      currentPrice: latest.close,
      dailyChange,
      percentChange,
      volume: latest.volume,
      marketCap: latest.close * 1000000 // Mock market cap
    };
  };

  // Función principal para cargar todos los datos
  const loadMarketData = async () => {
    try {
      setMarketData(prev => ({ ...prev, loading: true, error: null }));

      // USAR SOLO DATOS MOCK (API no existe aún)
      const mockData = generateMockData();

      setMarketData({
        ...mockData,
        loading: false,
        error: null,
        lastUpdated: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error loading market data:', error);
      
      // Fallback a datos mock
      const mockData = generateMockData();
      
      setMarketData({
        ...mockData,
        loading: false,
        error: error.message,
        lastUpdated: new Date().toISOString()
      });
    }
  };

  // Función para refrescar datos específicos
  const refreshData = async (dataType = 'all') => {
    try {
      // SOLO MOCK DATA por ahora
      const mockData = generateMockData();
      
      setMarketData(prev => ({ 
        ...prev, 
        ...mockData,
        lastUpdated: new Date().toISOString() 
      }));
      
    } catch (error) {
      console.error('Error refreshing data:', error);
      setMarketData(prev => ({ ...prev, error: error.message }));
    }
  };

  // Cargar datos al inicializar
  useEffect(() => {
    loadMarketData();
  }, []);

  // Configurar actualizaciones automáticas (deshabilitado para mock)
  useEffect(() => {
    // Deshabilitado mientras usamos datos mock
    // const interval = setInterval(() => {
    //   refreshData('realtime');
    // }, API_CONFIG.refreshInterval);
    // return () => clearInterval(interval);
  }, []);

  // Valor del contexto que se compartirá
  const contextValue = {
    ...marketData,
    refreshData,
    loadMarketData,
    isLoading: marketData.loading,
    hasError: !!marketData.error
  };

  return (
    <MarketDataContext.Provider value={contextValue}>
      {children}
    </MarketDataContext.Provider>
  );
};

// HOC opcional para componentes que necesiten los datos
export const withMarketData = (Component) => {
  return function WrappedComponent(props) {
    const marketData = useMarketData();
    return <Component {...props} marketData={marketData} />;
  };
};

// Componente distribuidor principal
export default function DataDistributor({ children }) {
  console.log('DataDistributor renderizado'); // Debug
  return (
    <MarketDataProvider>
      {children}
    </MarketDataProvider>
  );
}