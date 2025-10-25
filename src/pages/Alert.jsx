import React, { useEffect } from 'react'
import { usePageTransition } from '../components/loading/PageTransitionContext.jsx'
import Header from '../components/common/Header'
import AlertSection1 from '../components/alert/AlertSection1.jsx'

import '../css/Trading.css'

export default function Alert({ setCurrentPage, onLogout, currentUser }) {
  const { endTransition } = usePageTransition()
  
  useEffect(() => {
    // Terminar la transición cuando la página cargue
    endTransition()
  }, [endTransition])

  return (
    <div>
      <Header setCurrentPage={setCurrentPage} onLogout={onLogout} />
      <main className="trading-page">
        <AlertSection1 />
      </main>
    </div>
  )
}