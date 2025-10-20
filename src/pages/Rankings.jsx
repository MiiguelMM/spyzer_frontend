import React from 'react'
import Header from '../components/common/Header'
import RankingSection1 from '../components/rankings/RankingSection1.jsx'
import '../css/Trading.css'

export default function Trading({ setCurrentPage }) {
  return (
    <div>
      <Header setCurrentPage={setCurrentPage} />
      <main className="portfolio-main">
     
        <RankingSection1 />
       
      </main>
    </div>
  )
}
