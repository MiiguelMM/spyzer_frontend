import React from 'react'
import Header from '../components/common/Header'
import '../css/Portfolio.css'
import PortfolioSection1 from '../components/MyPortofolio/PortfolioSection1.jsx'
import PortfolioSection2 from '../components/MyPortofolio/PortfolioSection2.jsx'
import PortfolioSection4 from '../components/MyPortofolio/PortfolioSection4.jsx'
import TradingSection2 from '../components/trading/TradingSection2.jsx'

export default function MyPortfolio({ setCurrentPage }) {
  return (
    <div>
      <Header setCurrentPage={setCurrentPage} />
      <main className="portfolio-main">
        
        <PortfolioSection2 />
        {/* <PortfolioSection4 /> */}
        <TradingSection2 />
      </main>
    </div>
  )
}