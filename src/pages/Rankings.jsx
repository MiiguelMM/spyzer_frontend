import React, { useEffect } from 'react'
import { usePageTransition } from '../components/loading/PageTransitionContext.jsx'
import Header from '../components/common/Header'
import RankingSection1 from '../components/rankings/RankingSection1.jsx'
import '../css/Trading.css'

export default function Rankings({ setCurrentPage, onLogout, currentUser }) {
  const { endTransition } = usePageTransition()
  
  useEffect(() => {
    // Terminar la transición cuando la página cargue
    endTransition()
  }, [endTransition])

  return (
    <div>
      <Header setCurrentPage={setCurrentPage} onLogout={onLogout} />
      <main className="portfolio-main">
        <RankingSection1 />
      </main>
    </div>
  )
}