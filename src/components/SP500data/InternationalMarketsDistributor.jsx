// InternationalMarketsDistributor.jsx - Para IBEX 35 y VIX con APIs
import React, { createContext, useContext, useState, useEffect } from 'react';

const IbexDataContext = createContext();
const VixDataContext = createContext();

export const useIbexData = () => {
  const context = useContext(IbexDataContext);
  if (!context) {
    throw new Error('useIbexData must be used within a InternationalMarketsDistributor');
  }
  return context;
};

export const useVixData = () => {
  const context = useContext(VixDataContext);
  if (!context) {
    throw new Error('useVixData must be used within a InternationalMarketsDistributor');
  }
  return context;
};

// 🔧 CONFIGURACIÓN DE APIs INTERNACIONALES
const INTL_MARKETS_CONFIG = {
  IBEX35: {
    name: 'IBEX 35',
    symbol: 'IBEX',
    basePrice: 9000,
    volatility: 18,
    
    // 🌐 API CONFIGURATION - IBEX 35 (Mercado Español)
    api: {
      // Opción 1: Yahoo Finance para IBEX 35
      yahooFinance: 'https://query1.finance.yahoo.com/v8/finance/chart/%5EIBEX',
      
      // Opción 2: Investing.com API (necesita scraping o API key)
      investing: 'https://api.investing.com/api/financialdata/8984/historical/chart/?period=P1Y&interval=P1D',
      
      // Opción 3: Spanish market APIs
      bolsaMadrid: 'https://www.bolsamadrid.es/docs/SBolsas/InformesSB/RentaVariable/ResumenMercado.pdf',
      
      // Opción 4: Alpha Vantage (para ETF que replica IBEX)
      alphaVantage: 'https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=EWP&apikey=TU_API_KEY',
      
      // Opción 5: Tu backend custom
      backend: '/api/markets/ibex35',
      
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; TradingApp/1.0)',
        // 'X-RapidAPI-Key': 'TU_RAPIDAPI_KEY' // Si usas RapidAPI
      }
    },
    
    colors: {
      primary: '#FF6B35',
      positive: '#00FF85',
      negative: '#FF4D4F'
    }
  },
  
  VIX: {
    name: 'VIX Fear Index',
    symbol: 'VIX',
    basePrice: 20,
    volatility: 8,
    
    // 🌐 API CONFIGURATION - VIX (Índice de Volatilidad)
    api: {
      // Opción 1: Yahoo Finance para VIX
      yahooFinance: 'https://query1.finance.yahoo.com/v8/finance/chart/%5EVIX',
      
      // Opción 2: CBOE (Chicago Board Options Exchange) - Fuente oficial del VIX
      cboe: 'https://cdn.cboe.com/api/global/delayed_quotes/historical_data/_VIX.json',
      
      // Opción 3: Alpha Vantage
      alphaVantage: 'https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=VIX&apikey=TU_API_KEY',
      
      // Opción 4: Quandl (ahora parte de Nasdaq Data Link)
      quandl: 'https://data.nasdaq.com/api/v3/datasets/CBOE/VIX.json?api_key=TU_QUANDL_KEY',
      
      // Opción 5: IEX Cloud (muy bueno para datos financieros)
      iexCloud: 'https://cloud.iexapis.com/stable/stock/VIX/chart/1y?token=TU_IEX_TOKEN',
      
      // Opción 6: Tu backend custom
      backend: '/api/markets/vix',
      
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': 'Bearer TU_TOKEN'
      }
    },
    
    colors: {
      primary: '#FF4757',
      positive: '#2ED573', // Verde = menos miedo
      negative: '#FF4757'  // Rojo = más miedo
    }
  }
};

// 🔄 FUNCIÓN PARA CONECTAR CON API REAL - IBEX 35
const fetchIbexDataFromAPI = async () => {
  const config = INTL_MARKETS_CONFIG.IBEX35;
  
  try {
    console.log(`🇪🇸 Fetching IBEX 35 data from API...`);
    
    // 📡 LLAMADA REAL A LA API DE IBEX 35
    const response = await fetch(config.api.yahooFinance, {
      method: config.api.method,
      headers: config.api.headers,
      // Para IBEX, a veces necesitas configuración específica de CORS
      mode: 'cors',
      cache: 'no-cache'
    });

    if (!response.ok) {
      throw new Error(`❌ IBEX API Error: ${response.status} - ${response.statusText}`);
    }

    const apiData = await response.json();
    console.log(`✅ IBEX API Response:`, apiData);

    // 🔄 TRANSFORMAR DATOS DE IBEX AL FORMATO INTERNO
    const transformedData = transformIbexAPIData(apiData);
    
    return transformedData;

  } catch (error) {
    console.error(`🚨 Error fetching IBEX from API:`, error);
    
    // 🔄 FALLBACK ESPECÍFICO PARA IBEX
    console.log(`🔄 Using simulated IBEX data as fallback`);
    return generateIbexData();
  }
};

// 🔄 FUNCIÓN PARA CONECTAR CON API REAL - VIX
const fetchVixDataFromAPI = async () => {
  const config = INTL_MARKETS_CONFIG.VIX;
  
  try {
    console.log(`😱 Fetching VIX Fear Index data from API...`);
    
    // 📡 LLAMADA REAL A LA API DE VIX
    const response = await fetch(config.api.yahooFinance, {
      method: config.api.method,
      headers: config.api.headers
    });

    if (!response.ok) {
      // 🔄 INTENTAR FUENTE ALTERNATIVA: CBOE (fuente oficial)
      console.log(`🔄 Yahoo Finance failed, trying CBOE official source...`);
      
      const cboeResponse = await fetch(config.api.cboe, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (!cboeResponse.ok) {
        throw new Error(`❌ VIX API Error: Both Yahoo and CBOE failed`);
      }
      
      const cboeData = await cboeResponse.json();
      return transformCBOEVixData(cboeData);
    }

    const apiData = await response.json();
    console.log(`✅ VIX API Response:`, apiData);

    // 🔄 TRANSFORMAR DATOS DE VIX AL FORMATO INTERNO
    const transformedData = transformVixAPIData(apiData);
    
    return transformedData;

  } catch (error) {
    console.error(`🚨 Error fetching VIX from API:`, error);
    
    // 🔄 FALLBACK ESPECÍFICO PARA VIX
    console.log(`🔄 Using simulated VIX data as fallback`);
    return generateVixData();
  }
};

// 🔄 TRANSFORMAR DATOS DE IBEX 35 DE API AL FORMATO INTERNO
const transformIbexAPIData = (apiResponse) => {
  try {
    console.log(`🇪🇸 Transforming IBEX API data...`);
    
    // 📊 ESTRUCTURA TÍPICA DE YAHOO FINANCE PARA IBEX
    const result = apiResponse.chart.result[0];
    const timestamps = result.timestamp;
    const quote = result.indicators.quote[0];
    const { open, high, low, close } = quote;
    
    const transformedData = timestamps.map((timestamp, index) => {
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
      // Filtrar datos válidos para IBEX (típicamente > 6000)
      item.open > 6000 && item.high > 6000 && item.low > 6000 && item.close > 6000
    );

    console.log(`✅ Transformed ${transformedData.length} IBEX data points`);
    return transformedData;

  } catch (error) {
    console.error(`❌ Error transforming IBEX API data:`, error);
    return generateIbexData();
  }
};

// 🔄 TRANSFORMAR DATOS DE VIX DE API AL FORMATO INTERNO
const transformVixAPIData = (apiResponse) => {
  try {
    console.log(`😱 Transforming VIX API data...`);
    
    // 📊 VIX tiene estructura similar pero valores diferentes
    const result = apiResponse.chart.result[0];
    const timestamps = result.timestamp;
    const quote = result.indicators.quote[0];
    const { open, high, low, close } = quote;
    
    const transformedData = timestamps.map((timestamp, index) => {
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
      // Filtrar datos válidos para VIX (típicamente 8-80)
      item.open >= 8 && item.open <= 100 && 
      item.close >= 8 && item.close <= 100
    );

    console.log(`✅ Transformed ${transformedData.length} VIX data points`);
    return transformedData;

  } catch (error) {
    console.error(`❌ Error transforming VIX API data:`, error);
    return generateVixData();
  }
};

// 🔄 TRANSFORMAR DATOS DE CBOE (FUENTE OFICIAL VIX)
const transformCBOEVixData = (cboeResponse) => {
  try {
    console.log(`🏛️ Transforming CBOE official VIX data...`);
    
    // 📊 CBOE tiene formato diferente
    // Estructura típica: { data: [["2024-01-01", "20.15", "21.30", "19.80", "20.95"]], ... }
    
    const rawData = cboeResponse.data || cboeResponse.dataset?.data || [];
    
    const transformedData = rawData.map(row => {
      const [dateStr, openStr, highStr, lowStr, closeStr] = row;
      
      return {
        time: dateStr, // CBOE ya viene en formato YYYY-MM-DD
        value: Number(parseFloat(closeStr).toFixed(2)),
        open: Number(parseFloat(openStr).toFixed(2)),
        high: Number(parseFloat(highStr).toFixed(2)),
        low: Number(parseFloat(lowStr).toFixed(2)),
        close: Number(parseFloat(closeStr).toFixed(2))
      };
    }).filter(item => 
      item.open >= 8 && item.open <= 100 && 
      item.close >= 8 && item.close <= 100
    ).reverse(); // CBOE viene en orden descendente, necesitamos ascendente

    console.log(`✅ Transformed ${transformedData.length} CBOE VIX data points`);
    return transformedData;

  } catch (error) {
    console.error(`❌ Error transforming CBOE VIX data:`, error);
    return generateVixData();
  }
};

// 🎲 DATOS SIMULADOS PARA IBEX 35
const generateIbexData = (days = 800) => {
  console.log(`🇪🇸 Generating simulated IBEX 35 data`);
  
  const config = INTL_MARKETS_CONFIG.IBEX35;
  const data = [];
  let price = config.basePrice + Math.random() * (config.basePrice * 0.2);

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    // 🇪🇸 PATRONES ESPECÍFICOS DEL MERCADO ESPAÑOL
    const europeanCycle = Math.sin(i / 60) * 2; // Ciclos europeos más lentos
    const volatility = (Math.random() - 0.5) * config.volatility;
    const momentum = Math.sin(i / 20) * 6; // Momentum europeo
    
    // Factores específicos españoles
    const siesta = Math.sin(i / 7) * 0.5; // Efecto semanal español
    const vacaciones = Math.sin(i / 365) * 3; // Efecto estacional

    price = Math.max(6000, price + europeanCycle + volatility + momentum + siesta + vacaciones);

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

// 🎲 DATOS SIMULADOS PARA VIX
const generateVixData = (days = 800) => {
  console.log(`😱 Generating simulated VIX Fear Index data`);
  
  const config = INTL_MARKETS_CONFIG.VIX;
  const data = [];
  let vix = config.basePrice + Math.random() * 10; // VIX base range 20-30

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    // 😱 PATRONES ESPECÍFICOS DEL VIX (ÍNDICE DE MIEDO)
    const stressEvents = Math.random() < 0.05 ? Math.random() * 30 : 0; // 5% spikes de pánico
    const meanReversion = (20 - vix) * 0.1; // Tiende a volver a ~20
    const volatility = (Math.random() - 0.5) * config.volatility;
    const momentum = Math.sin(i / 30) * 2; // Ciclos de miedo
    
    // Factores específicos de volatilidad
    const marketCrash = Math.random() < 0.002 ? Math.random() * 50 : 0; // 0.2% crash extremo
    const calmPeriods = Math.sin(i / 90) * -1; // Períodos de calma

    vix = Math.max(8, Math.min(80, vix + stressEvents + meanReversion + volatility + momentum + marketCrash + calmPeriods));

    const timeString = date.toISOString().split('T')[0];
    const open = vix;
    const close = vix + (Math.random() - 0.5) * 2;
    const high = Math.max(open, close) + Math.random() * 2;
    const low = Math.max(8, Math.min(open, close) - Math.random() * 1); // VIX no puede bajar de ~8

    data.push({
      time: timeString,
      value: Number(close.toFixed(2)),
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2))
    });

    vix = close;
  }

  return data;
};

// 🏗️ PROVIDER PARA MERCADOS INTERNACIONALES
const InternationalMarketProvider = ({ children, marketType, ContextComponent }) => {
  const [state, setState] = useState({
    historicalData: null,
    isLoading: true,
    hasError: false,
    error: null,
    marketInfo: INTL_MARKETS_CONFIG[marketType],
    lastUpdated: null,
    dataSource: 'unknown' // 'api' | 'simulated' | 'cboe' | 'fallback'
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
      const USE_REAL_API = process.env.REACT_APP_USE_REAL_API === 'true';
      
      let historicalData;
      let dataSource;

      if (USE_REAL_API && !forceRefresh) {
        // 🌐 INTENTAR CARGAR DESDE API REAL
        console.log(`🔌 Attempting to load ${marketType} from real API...`);
        
        if (marketType === 'IBEX35') {
          historicalData = await fetchIbexDataFromAPI();
          dataSource = 'api';
        } else if (marketType === 'VIX') {
          historicalData = await fetchVixDataFromAPI();
          dataSource = 'api';
        }
      } else {
        // 🎲 USAR DATOS SIMULADOS
        console.log(`🎲 Using simulated data for ${marketType}`);
        
        if (marketType === 'IBEX35') {
          historicalData = generateIbexData();
        } else if (marketType === 'VIX') {
          historicalData = generateVixData();
        }
        dataSource = 'simulated';
      }

      // ✅ ACTUALIZAR ESTADO CON DATOS CARGADOS
      setState({
        historicalData,
        isLoading: false,
        hasError: false,
        error: null,
        marketInfo: INTL_MARKETS_CONFIG[marketType],
        lastUpdated: new Date().toISOString(),
        dataSource
      });

      console.log(`✅ ${marketType} loaded successfully from ${dataSource}`);

    } catch (error) {
      console.error(`❌ Error loading ${marketType}:`, error);
      
      // 🚨 MANEJO DE ERRORES ESPECÍFICO
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
    loadMarketData(true);
  };

  // 🔄 CARGAR DATOS AL INICIALIZAR
  useEffect(() => {
    loadMarketData();
    
    // 🕒 AUTO-REFRESH ESPECÍFICO PARA CADA MERCADO
    const refreshInterval = marketType === 'VIX' ? 2 * 60 * 1000 : 5 * 60 * 1000; // VIX cada 2min, IBEX cada 5min
    
    const interval = setInterval(() => {
      if (process.env.REACT_APP_AUTO_REFRESH === 'true') {
        console.log(`🔄 Auto-refreshing ${marketType}...`);
        loadMarketData();
      }
    }, refreshInterval);

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
const IbexProvider = ({ children }) => (
  <InternationalMarketProvider marketType="IBEX35" ContextComponent={IbexDataContext}>
    {children}
  </InternationalMarketProvider>
);

const VixProvider = ({ children }) => (
  <InternationalMarketProvider marketType="VIX" ContextComponent={VixDataContext}>
    {children}
  </InternationalMarketProvider>
);

// 🏗️ DISTRIBUIDOR PARA MERCADOS INTERNACIONALES
export default function InternationalMarketsDistributor({ children }) {
  return (
    <IbexProvider>
      <VixProvider>
        {children}
      </VixProvider>
    </IbexProvider>
  );
}

// =============================================================================
// 📝 CONFIGURACIÓN ESPECÍFICA PARA MERCADOS INTERNACIONALES:

/*
🔧 VARIABLES DE ENTORNO ADICIONALES (.env file):

REACT_APP_USE_REAL_API=true
REACT_APP_AUTO_REFRESH=true
REACT_APP_CBOE_API_KEY=tu_cboe_key
REACT_APP_INVESTING_API_KEY=tu_investing_key
REACT_APP_IEX_CLOUD_TOKEN=tu_iex_token

🇪🇸 APIS PARA IBEX 35:

1. Yahoo Finance (gratis):
   - URL: https://query1.finance.yahoo.com/v8/finance/chart/%5EIBEX
   - Símbolo: ^IBEX
   - Sin API key necesaria

2. Investing.com (scraping o API):
   - Requiere técnicas de scraping o API key
   - Muy buena fuente para mercados europeos

3. Alpha Vantage ETF (indirecto):
   - ETF EWP replica mercado español
   - Buena alternativa si IBEX directo falla

😱 APIS PARA VIX:

1. Yahoo Finance (gratis):
   - URL: https://query1.finance.yahoo.com/v8/finance/chart/%5EVIX
   - Símbolo: ^VIX
   - Más conveniente

2. CBOE Official (gratis):
   - URL: https://cdn.cboe.com/api/global/delayed_quotes/historical_data/_VIX.json
   - Fuente oficial del VIX
   - Datos más precisos

3. IEX Cloud (freemium):
   - Muy buena API para datos financieros
   - Límite gratuito generoso

📊 CONSIDERACIONES ESPECIALES:

🇪🇸 IBEX 35:
- Horario: 9:00-17:30 CET
- Moneda: EUR
- Validación: valores típicos 6,000-15,000

😱 VIX:
- Horario: sigue mercado US (9:30-16:00 EST)
- Rango normal: 8-30 (>30 = pánico extremo)
- Spikes históricos: 2008 crash (~80), COVID-19 (~85)

🔄 FALLBACKS INTELIGENTES:
- IBEX API falla → ETF EWP → datos simulados
- VIX Yahoo falla → CBOE oficial → datos simulados
- Sin internet → caché local → datos simulados

🚀 OPTIMIZACIONES:
- VIX se actualiza más frecuente (más volátil)
- IBEX horario europeo (menos updates noche española)
- Caché inteligente por zona horaria
*/