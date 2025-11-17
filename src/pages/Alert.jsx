import React, { useEffect, useState } from 'react'
import { usePageTransition } from '../components/loading/PageTransitionContext.jsx'

// Headers
import Header from '../components/common/Header'
import HeaderDesktop from '../components/common/HeaderDesktop'

// Componentes Mobile
import AlertSection1 from '../components/alert/AlertSection1.jsx'

// Componentes Desktop


import '../css/Trading.css'
import AlertDesktop from '../components/alertDesktop/AlertDesktop.jsx'

export default function Alert({ setCurrentPage, onLogout, currentUser }) {
  const { endTransition } = usePageTransition()
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024)
  
  useEffect(() => {
    // Terminar la transición cuando la página cargue
    endTransition()
  }, [endTransition])

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="index-page">
      {isDesktop ? (
        <>
          <HeaderDesktop onLogout={onLogout} currentUser={currentUser} />
          <div className="index-page__content-desktop">
            <AlertDesktop/>
          </div>
        </>
      ) : (
        <>
          <Header setCurrentPage={setCurrentPage} onLogout={onLogout} />
          <main className="trading-page">
            <AlertSection1 />
          </main>
        </>
      )}
    </div>
  )
}