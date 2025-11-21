import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import './App.css'

// Páginas
import Index from './pages/Index.jsx'
import MyPortfolio from './pages/MyPortfolio.jsx'
import LandingPage from './pages/LandingPage.jsx'
import Trading from './pages/Trading.jsx'
import Rankings from './pages/Rankings.jsx'
import Alert from './pages/Alert.jsx'
import OAuth2RedirectHandler from './pages/OAuth2RedirectHandler.jsx'

// Context providers
import { IndicesProvider } from './components/context/IndicesProvider.jsx'
import { PageTransitionProvider } from './components/loading/PageTransitionContext.jsx'

// Components
import SpyzerLoadingAnimation from './components/loading/SpyzerLoadingAnimation.jsx'
import PageTransitionLoader from './components/loading/PageTransitionLoader.jsx'

// Assets
import Logo from './assets/Logo5.png'

// Services
import authService from '../src/service/authService.js'

// Componente para rutas protegidas
function ProtectedRoute({ children, isLoggedIn }) {
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login', { replace: true })
    }
  }, [isLoggedIn, navigate])

  if (!isLoggedIn) {
    return null
  }

  return children
}

// Componente para redirigir cuando ya está logueado
function PublicRoute({ children, isLoggedIn }) {
  const navigate = useNavigate()

  useEffect(() => {
    if (isLoggedIn) {
      navigate('/dashboard', { replace: true })
    }
  }, [isLoggedIn, navigate])

  if (isLoggedIn) {
    return null
  }

  return children
}

function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAuthAndRedirect()
  }, [])

  const checkAuthAndRedirect = async () => {
    try {
      console.log('=== Verificando autenticación ===')

      const isAuthenticated = authService.isAuthenticated();

      if (isAuthenticated) {
        const user = authService.getUser();
        console.log('Usuario autenticado:', user);
        setCurrentUser(user);
        setIsLoggedIn(true);
      } else {
        console.log('No hay sesión activa');
        setIsLoggedIn(false);
        setCurrentUser(null);
      }
    } catch (error) {
      console.error('Error verificando autenticación:', error)
      setIsLoggedIn(false)
      setCurrentUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      console.log('Iniciando logout...')
      authService.logout()

      setCurrentUser(null)
      setIsLoggedIn(false)
    } catch (error) {
      console.error('Error en logout:', error)
      setCurrentUser(null)
      setIsLoggedIn(false)
      window.location.href = '/login'
    }
  }

  if (isLoading) {
    return <SpyzerLoadingAnimation logoSrc={Logo} />
  }

  return (
    <div className="App">
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute isLoggedIn={isLoggedIn}>
              <LandingPage />
            </PublicRoute>
          }
        />

        <Route
          path="/oauth2/redirect"
          element={<OAuth2RedirectHandler />}
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <Index
                onLogout={handleLogout}
                currentUser={currentUser}
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <Index
                onLogout={handleLogout}
                currentUser={currentUser}
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-portfolio"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <MyPortfolio
                onLogout={handleLogout}
                currentUser={currentUser}
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/trading"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <Trading
                onLogout={handleLogout}
                currentUser={currentUser}
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/rankings"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <Rankings
                onLogout={handleLogout}
                currentUser={currentUser}
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-alerts"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <Alert
                onLogout={handleLogout}
                currentUser={currentUser}
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={
            <Navigate to={isLoggedIn ? "/dashboard" : "/login"} replace />
          }
        />
      </Routes>
    </div>
  )
}

function App() {
  return (
    <PageTransitionProvider>
      <IndicesProvider>
        <Router>
          <AppContent />
          <PageTransitionLoader />
        </Router>
      </IndicesProvider>
    </PageTransitionProvider>
  )
}

export default App