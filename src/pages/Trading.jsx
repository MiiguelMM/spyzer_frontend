import React, { useEffect, useState } from 'react'
import { usePageTransition } from '../components/loading/PageTransitionContext.jsx'

// Headers
import Header from '../components/common/Header'
import HeaderDesktop from '../components/common/HeaderDesktop'

// Componentes Mobile
import TradingSection1 from '../components/trading/TradingSection1.jsx'

// Componentes Desktop
import TradingDesktop from '../components/tradingDesktop/TradingDesktop.jsx'

import '../css/Trading.css'

export default function Trading({ setCurrentPage, onLogout, currentUser }) {
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
         
              <TradingDesktop/>
           
          </div>
        </>
      ) : (
        <>
          <Header setCurrentPage={setCurrentPage} onLogout={onLogout} />
          <main>
            <TradingSection1 />
          </main>
        </>
      )}
    </div>
  )
}