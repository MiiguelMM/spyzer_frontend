import React, { useEffect, useState } from 'react'
import { usePageTransition } from '../components/loading/PageTransitionContext.jsx'

// Headers
import Header from '../components/common/Header'
import HeaderDesktop from '../components/common/HeaderDesktop'

// Componentes Mobile
import Section1 from '../components/index/Section1/Section1'
import Section2 from '../components/index/Section2/Section2'
import Section3 from '../components/index/Section3/Section3'
import Section4 from '../components/index/Section4/Section4'

// Componentes Desktop
import Desktop from '../components/indexDesktop/indexDesktop.jsx'

export default function Index({ onLogout, currentUser }) {
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
            <Desktop />
          </div>
        </>
      ) : (
        <>
          <Header onLogout={onLogout} />
          <Section1 />
          <Section2 />
          <Section3 />
          <Section4 />
        </>
      )}
    </div>
  )
}