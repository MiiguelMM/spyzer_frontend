import React, { useEffect, useState } from 'react'
import { usePageTransition } from '../components/loading/PageTransitionContext.jsx'

// Headers
import Header from '../components/common/Header'
import HeaderDesktop from '../components/common/HeaderDesktop'

// Componentes Mobile
import PortfolioSection1 from '../components/MyPortofolio/PortfolioSection1.jsx'
import PortfolioSection2 from '../components/MyPortofolio/PortfolioSection2.jsx'

// Componentes Desktop
import PortfolioDesktop from '../components/MyPortofolioDesktop/PortfolioDesktop.jsx'


import '../css/Portfolio.css'

export default function MyPortfolio({ setCurrentPage, onLogout, currentUser }) {
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
            <PortfolioDesktop/>
          </div>
        </>
      ) : (
        <>
          <Header setCurrentPage={setCurrentPage} onLogout={onLogout} />
          <main className="portfolio-main">
            <PortfolioSection1 />
            <PortfolioSection2 />
          </main>
        </>
      )}
    </div>
  )
}