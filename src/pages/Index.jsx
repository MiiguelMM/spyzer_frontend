import React, { useEffect } from 'react'
import { usePageTransition } from '../components/loading/PageTransitionContext.jsx'
import Header from '../components/common/Header'

import Section1 from '../components/index/Section1/Section1'
import Section2 from '../components/index/Section2/Section2'
import Section3 from '../components/index/Section3/Section3'
import Section4 from '../components/index/Section4/Section4'

export default function Index({ onLogout, currentUser }) {
  const { endTransition } = usePageTransition()
  
  useEffect(() => {
    // Terminar la transición cuando la página cargue
    endTransition()
  }, [endTransition])

  return (
    <div>
      <Header onLogout={onLogout} />
      <Section1 />
      <Section2 />
      <Section3 />
      <Section4 />
    </div>
  )
}