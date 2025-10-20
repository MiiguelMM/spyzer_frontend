import React from 'react'
import Header from '../components/common/Header'
import TradingSection1 from '../components/trading/TradingSection1.jsx'

import '../css/Trading.css'

export default function Trading({ setCurrentPage }) {
  return (
    <div>
      <Header setCurrentPage={setCurrentPage} />
      <main className="trading-page">
     
        <TradingSection1 />
       
      </main>
    </div>
  )
}
