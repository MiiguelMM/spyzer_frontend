import { useState } from 'react';
import './App.css';
import Index from './pages/Index.jsx';

// 🔧 IMPORTAR AMBOS DISTRIBUIDORES
import StockMarketsDistributor from './components/SP500data/StockMarketsDistributor.jsx';
import InternationalMarketsDistributor from './components/SP500data/InternationalMarketsDistributor.jsx';
import LandingPage from './pages/LandingPage.jsx';

function App() {
  // 🏠 Estado para controlar qué página mostrar
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 🔑 Función para manejar el inicio de sesión
  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  // 🚪 Función para manejar el cierre de sesión (opcional)
  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    // 🏗️ ANIDAR AMBOS DISTRIBUIDORES
    <StockMarketsDistributor>
      <InternationalMarketsDistributor>
        <div className="App">
          {/* 🎭 Renderizado condicional basado en el estado de login */}
          {!isLoggedIn ? (
            // 🏠 Mostrar Landing Page cuando NO está logueado
            <LandingPage onLogin={handleLogin} />
          ) : (
            // 📊 Mostrar Index cuando SÍ está logueado
            <Index onLogout={handleLogout} />
          )}
        </div>
      </InternationalMarketsDistributor>
    </StockMarketsDistributor>
  );
}

export default App;