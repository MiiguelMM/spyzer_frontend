import React from 'react'
import Header from '../components/common/Header'
import AlertSection1 from '../components/alert/AlertSection1.jsx'


import '../css/Trading.css'

export default function Alert({ setCurrentPage }) {
  return (
    <div>
      <Header setCurrentPage={setCurrentPage} />
      <main className="trading-page">

        <AlertSection1 />
        
       
      </main>
    </div>
  )
}
