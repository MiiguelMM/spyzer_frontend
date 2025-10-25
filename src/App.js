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
import SpyzerLoadingAnimation from '../src/components/loading/SpyzerLoadingAnimation.jsx' 
import Logo from '../src/assets/Logo5.png' 

// Context provider único para índices
import { IndicesProvider } from './components/context/IndicesProvider.jsx'

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
      
      // Verificar si hay resultado de redirect primero
      const redirectResult = await authService.checkRedirectResult()
      
      if (redirectResult && redirectResult.success) {
        console.log('Login exitoso desde redirect:', redirectResult.user)
        setCurrentUser(redirectResult.user)
        setIsLoggedIn(true)
        setIsLoading(false)
        return
      }
      
      // Si no hay redirect, verificar sesión existente
      const user = authService.obtenerUsuarioActual()
      console.log('Usuario en localStorage:', user)
      
      if (user) {
        console.log('Usuario encontrado, verificando validez...')
        const isValid = await authService.verificarSesion()
        
        if (isValid) {
          console.log('Sesión válida')
          setCurrentUser(user)
          setIsLoggedIn(true)
        } else {
          console.log('Sesión expirada')
          authService.limpiarSesion()
          setIsLoggedIn(false)
          setCurrentUser(null)
        }
      } else {
        console.log('No hay usuario')
        setIsLoggedIn(false)
        setCurrentUser(null)
      }
    } catch (error) {
      console.error('Error verificando autenticación:', error)
      setIsLoggedIn(false)
      setCurrentUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLoginSuccess = (user) => {
    console.log('Usuario logueado:', user)
    setCurrentUser(user)
    setIsLoggedIn(true)
  }

  const handleLogout = async () => {
    try {
      console.log('Iniciando logout...')
      await authService.logout()
      
      setCurrentUser(null)
      setIsLoggedIn(false)
      
      setTimeout(() => {
        window.location.href = '/login'
      }, 100)
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
              <LandingPage onLoginSuccess={handleLoginSuccess} />
            </PublicRoute>
          } 
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
    <IndicesProvider>
      <Router>
        <AppContent />
      </Router>
    </IndicesProvider>
  )
}

export default App