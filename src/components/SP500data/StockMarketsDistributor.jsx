// StockMarketsDistributor.jsx - Para mercados principales con APIs
import React, { createContext, useContext, useState, useEffect } from 'react';

const SP500DataContext = createContext();
const NasdaqDataContext = createContext();

export const useSP500Data = () => {
  const context = useContext(SP500DataContext);
  if (!context) {
    throw new Error('useSP500Data must be used within a StockMarketsDistributor');
  }
  return context;
};

export const useNasdaqData = () => {
  const context = useContext(NasdaqDataContext);
  if (!context) {
    throw new Error('useNasdaqData must be used within a StockMarketsDistributor');
  }
  return context;
};

// 🔧 CONFIGURACIÓN DE APIs - Aquí defines todas las APIs
const US_MARKETS_CONFIG = {
  SP500: {
    name: 'S&P 500',
    symbol: 'SPX',
    basePrice: 450,
    volatility: 15,
    
    // 🌐 API CONFIGURATION - CONEXIÓN REAL
    api: {
      // Opción 1: Yahoo Finance API (gratis)
      yahooFinance: 'https://query1.finance.yahoo.com/v8/finance/chart/^GSPC',
      
      // Opción 2: Alpha Vantage (necesita API key)
      alphaVantage: 'https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=SPY&apikey=TU_API_KEY',
      
      // Opción 3: Tu backend custom
      backend: '/api/markets/sp500',
      
      // Configuración para la llamada
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': 'Bearer TU_API_KEY' // Si necesitas autenticación
      }
    },
    
    colors: {
      primary: '#007ACC',
      positive: '#00FF85',
      negative: '#FF4D4F'
    }
  },
  NASDAQ: {
    name: 'NASDAQ',
    symbol: 'IXIC',
    basePrice: 15000,
    volatility: 25,
    
    // 🌐 API CONFIGURATION - CONEXIÓN REAL  
    api: {
      yahooFinance: 'https://query1.finance.yahoo.com/v8/finance/chart/^IXIC',
      alphaVantage: 'https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=QQQ&apikey=TU_API_KEY',
      backend: '/api/markets/nasdaq',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    },
    
    colors: {
      primary: '#00D4AA',
      positive: '#00FF85',
      negative: '#FF4D4F'
    }
  }
};

// 🔄 FUNCIÓN PARA CONECTAR CON API REAL
const fetchMarketDataFromAPI = async (marketType) => {
  const config = US_MARKETS_CONFIG[marketType];
  
  try {
    // 📡 AQUÍ ES DONDE SE HACE LA LLAMADA REAL A LA API
    console.log(`🔌 Fetching ${marketType} data from API...`);
    
    // Paso 1: Hacer la llamada HTTP
    const response = await fetch(config.api.yahooFinance, {
      method: config.api.method,
      headers: config.api.headers,
      // Si necesitas enviar datos en el body:
      // body: JSON.stringify({ symbol: config.symbol, period: '1y' })
    });

    // Paso 2: Verificar que la respuesta sea exitosa
    if (!response.ok) {
      throw new Error(`❌ API Error: ${response.status} - ${response.statusText}`);
    }

    // Paso 3: Parsear la respuesta JSON
    const apiData = await response.json();
    console.log(`✅ API Response for ${marketType}:`, apiData);

    // 🔄 AQUÍ TRANSFORMAS LOS DATOS DE LA API AL FORMATO QUE NECESITAS
    const transformedData = transformAPIDataToChartFormat(apiData, marketType);
    
    return transformedData;

  } catch (error) {
    console.error(`🚨 Error fetching ${marketType} from API:`, error);
    
    // 🔄 FALLBACK: Si la API falla, usar datos simulados
    console.log(`🔄 Using simulated data for ${marketType} as fallback`);
    return generateUSMarketData(marketType);
  }
};

// 🔄 TRANSFORMAR DATOS DE API AL FORMATO INTERNO
const transformAPIDataToChartFormat = (apiResponse, marketType) => {
  try {
    // 📊 EJEMPLO PARA YAHOO FINANCE API
    // La estructura típica de Yahoo Finance es:
    // apiResponse.chart.result[0].indicators.quote[0]
    
    const result = apiResponse.chart.result[0];
    const timestamps = result.timestamp; // Array de timestamps
    const quote = result.indicators.quote[0];
    const open = quote.open;
    const high = quote.high; 
    const low = quote.low;
    const close = quote.close;
    
    const transformedData = timestamps.map((timestamp, index) => {
      // Convertir timestamp Unix a fecha string
      const date = new Date(timestamp * 1000);
      const timeString = date.toISOString().split('T')[0];
      
      return {
        time: timeString,
        value: Number((close[index] || 0).toFixed(2)),
        open: Number((open[index] || 0).toFixed(2)),
        high: Number((high[index] || 0).toFixed(2)),
        low: Number((low[index] || 0).toFixed(2)),
        close: Number((close[index] || 0).toFixed(2))
      };
    }).filter(item => 
      // Filtrar datos válidos (sin null/undefined)
      item.open > 0 && item.high > 0 && item.low > 0 && item.close > 0
    );

    console.log(`✅ Transformed ${transformedData.length} data points for ${marketType}`);
    return transformedData;

  } catch (error) {
    console.error(`❌ Error transforming API data for ${marketType}:`, error);
    
    // Si falla la transformación, usar datos simulados
    return generateUSMarketData(marketType);
  }
};

// 🎲 DATOS SIMULADOS COMO FALLBACK (tu función actual)
const generateUSMarketData = (marketType, days = 800) => {
  console.log(`🎲 Generating simulated data for ${marketType}`);
  
  const config = US_MARKETS_CONFIG[marketType];
  const data = [];
  let price = config.basePrice + Math.random() * (config.basePrice * 0.2);

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    const trend = Math.sin(i / 50) * 2;
    const volatility = (Math.random() - 0.5) * config.volatility;
    const momentum = Math.sin(i / 10) * (config.volatility * 0.3);

    price = Math.max(config.basePrice * 0.5, price + trend + volatility + momentum);

    const timeString = date.toISOString().split('T')[0];
    const open = price;
    const close = price + (Math.random() - 0.5) * (config.volatility * 0.5);
    const high = Math.max(open, close) + Math.random() * (config.volatility * 0.3);
    const low = Math.min(open, close) - Math.random() * (config.volatility * 0.3);

    data.push({
      time: timeString,
      value: Number(close.toFixed(2)),
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2))
    });

    price = close;
  }

  return data;
};

// 🏗️ PROVIDER CON CONEXIÓN API
const USMarketProvider = ({ children, marketType, ContextComponent }) => {
  const [state, setState] = useState({
    historicalData: null,
    isLoading: true,
    hasError: false,
    error: null,
    marketInfo: US_MARKETS_CONFIG[marketType],
    lastUpdated: null,
    dataSource: 'unknown' // 'api' | 'simulated' | 'cache'
  });

  // 🔄 FUNCIÓN PRINCIPAL DE CARGA DE DATOS
  const loadMarketData = async (forceRefresh = false) => {
    try {
      console.log(`📊 Loading ${marketType} data...`);
      setState(prev => ({ 
        ...prev, 
        isLoading: true, 
        hasError: false, 
        error: null 
      }));

      // 🔄 PUNTO DE DECISIÓN: API vs DATOS SIMULADOS
      const USE_REAL_API = process.env.REACT_APP_USE_REAL_API === 'true'; // Variable de entorno
      
      let historicalData;
      let dataSource;

      if (USE_REAL_API && !forceRefresh) {
        // 🌐 INTENTAR CARGAR DESDE API REAL
        console.log(`🔌 Attempting to load ${marketType} from real API...`);
        historicalData = await fetchMarketDataFromAPI(marketType);
        dataSource = 'api';
      } else {
        // 🎲 USAR DATOS SIMULADOS
        console.log(`🎲 Using simulated data for ${marketType}`);
        historicalData = generateUSMarketData(marketType);
        dataSource = 'simulated';
      }

      // ✅ ACTUALIZAR ESTADO CON DATOS CARGADOS
      setState({
        historicalData,
        isLoading: false,
        hasError: false,
        error: null,
        marketInfo: US_MARKETS_CONFIG[marketType],
        lastUpdated: new Date().toISOString(),
        dataSource
      });

      console.log(`✅ ${marketType} loaded successfully from ${dataSource}`);

    } catch (error) {
      console.error(`❌ Error loading ${marketType}:`, error);
      
      // 🚨 MANEJO DE ERRORES
      setState(prev => ({
        ...prev,
        isLoading: false,
        hasError: true,
        error: error.message,
        dataSource: 'error'
      }));
    }
  };

  // 🔄 FUNCIÓN PARA REFRESCAR DATOS
  const refreshData = () => {
    console.log(`🔄 Refreshing ${marketType} data...`);
    loadMarketData(true); // Force refresh
  };

  // 🔄 CARGAR DATOS AL INICIALIZAR
  useEffect(() => {
    loadMarketData();
    
    // 🕒 OPCIONAL: Auto-refresh cada 5 minutos
    const interval = setInterval(() => {
      if (process.env.REACT_APP_AUTO_REFRESH === 'true') {
        console.log(`🔄 Auto-refreshing ${marketType}...`);
        loadMarketData();
      }
    }, 5 * 60 * 1000); // 5 minutos

    return () => clearInterval(interval);
  }, []);

  // 🎯 VALOR DEL CONTEXTO
  const contextValue = { 
    ...state, 
    refreshData, 
    loadMarketData,
    marketType 
  };

  return (
    <ContextComponent.Provider value={contextValue}>
      {children}
    </ContextComponent.Provider>
  );
};

// Providers específicos
const SP500Provider = ({ children }) => (
  <USMarketProvider marketType="SP500" ContextComponent={SP500DataContext}>
    {children}
  </USMarketProvider>
);

const NasdaqProvider = ({ children }) => (
  <USMarketProvider marketType="NASDAQ" ContextComponent={NasdaqDataContext}>
    {children}
  </USMarketProvider>
);

// 🏗️ DISTRIBUIDOR PRINCIPAL
export default function StockMarketsDistributor({ children }) {
  return (
    <SP500Provider>
      <NasdaqProvider>
        {children}
      </NasdaqProvider>
    </SP500Provider>
  );
}

// =============================================================================
// 📝 CÓMO CONFIGURAR LAS APIs:

/*
🔧 VARIABLES DE ENTORNO (.env file):

REACT_APP_USE_REAL_API=true
REACT_APP_AUTO_REFRESH=false
REACT_APP_YAHOO_API_KEY=tu_api_key_aqui
REACT_APP_ALPHA_VANTAGE_KEY=tu_alpha_vantage_key

🌐 APIS RECOMENDADAS GRATUITAS:

1. Yahoo Finance (sin API key):
   - URL: https://query1.finance.yahoo.com/v8/finance/chart/^GSPC
   - Límite: ~2000 requests/hour
   - Datos: OHLC, volumen, histórico

2. Alpha Vantage (con API key gratis):
   - URL: https://www.alphavantage.co/
   - Límite: 5 calls/minute, 500 calls/day
   - Registro: alphavantage.co/support/#api-key

3. Finnhub (con API key gratis):
   - URL: https://finnhub.io/
   - Límite: 60 calls/minute
   - Muy buena documentación

📊 FORMATO DE DATOS ESPERADO:
Tu función transformAPIDataToChartFormat() debe devolver:
[
  {
    time: "2024-01-01",
    value: 4756.50,
    open: 4750.20,
    high: 4760.80,
    low: 4745.10,
    close: 4756.50
  },
  // ... más datos
]

🚀 CÓMO ACTIVAR APIs:
1. Pon REACT_APP_USE_REAL_API=true en tu .env
2. Consigue API keys si es necesario
3. Configura las URLs en US_MARKETS_CONFIG
4. Ajusta transformAPIDataToChartFormat() según la API

🔄 FALLBACKS AUTOMÁTICOS:
- Si API falla → datos simulados
- Si transformación falla → datos simulados  
- Si no hay internet → datos simulados
*/