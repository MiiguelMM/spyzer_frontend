import React from 'react'
import Header from '../components/common/Header'
import '../css/Portfolio.css'

import PortfolioSection1 from '../components/MyPortofolio/PortfolioSection1.jsx'

import PortfolioSection2 from '../components/MyPortofolio/PortfolioSection2.jsx'

export default function MyPortfolio({ setCurrentPage }) {
  return (
    <div>
      <Header setCurrentPage={setCurrentPage} />
      <main className="portfolio-main">
        
        <PortfolioSection1 />
        
        <PortfolioSection2 />
      </main>
    </div>
  )
}