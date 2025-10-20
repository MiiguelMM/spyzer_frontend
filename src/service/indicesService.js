// src/service/indicesService.js
import marketDataService from './marketDataService';

const INDICES_SYMBOLS = ['SPY', 'QQQ', 'DAX', 'IBEX'];

const obtenerTodosLosIndices = async () => {
  try {
    const indicesData = await marketDataService.obtenerIndicesPrincipales();
    
    const indicesArray = await Promise.all(
      Object.entries(indicesData).map(async ([symbol, data]) => {
        try {
          const response = await marketDataService.get(`/${symbol}/historical?days=365`);
          
          // Transformar los datos al formato que esperan los gráficos
          const historicalData = response.data.map(point => {
            // Convertir "2024-10-01" a timestamp Unix
            const timestamp = Math.floor(new Date(point.date).getTime() / 1000);
            
            return {
              time: timestamp,
              value: point.close,
              open: point.open,
              high: point.high,
              low: point.low,
              close: point.close
            };
          });
          
          return {
            ...data,
            historicalData: historicalData
          };
        } catch (error) {
          console.warn(`No se pudieron cargar históricos de ${symbol}`);
          return {
            ...data,
            historicalData: []
          };
        }
      })
    );
    
    return indicesArray;
  } catch (error) {
    console.error('Error obteniendo índices:', error);
    throw error;
  }
};

export default { obtenerTodosLosIndices };