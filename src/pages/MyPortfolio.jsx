import React, { useEffect } from 'react'
import { usePageTransition } from '../components/loading/PageTransitionContext.jsx'
import Header from '../components/common/Header'
import '../css/Portfolio.css'

import PortfolioSection1 from '../components/MyPortofolio/PortfolioSection1.jsx'
import PortfolioSection2 from '../components/MyPortofolio/PortfolioSection2.jsx'

export default function MyPortfolio({ setCurrentPage, onLogout, currentUser }) {
  const { endTransition } = usePageTransition()
  
  useEffect(() => {
    // Terminar la transición cuando la página cargue
    endTransition()
  }, [endTransition])

  return (
    <div>
      <Header setCurrentPage={setCurrentPage} onLogout={onLogout} />
      <main className="portfolio-main">
        <PortfolioSection1 />
        <PortfolioSection2 />
      </main>
    </div>
  )
}