import React, { useState, useEffect, useRef } from 'react'
import '../../css_desktop/IndexDesktop.css'
import RangeSwitcherChart from '../index/Sp500/RangeSwitcherChart'
import ChartHeader from '../index/Sp500/ChartHeader'
import MetricsCards from '../index/Sp500/MetricsCards'
import NasdaqChartHeader from '../index/Nasdaq/NasdaqChartHeader'
import NasdaqRangeSwitcherChart from '../index/Nasdaq/NasdaqRangeSwitcherChart'
import NasdaqMetricsCards from '../index/Nasdaq/NasdaqMetricsCards'
import DaxChartHeader from '../index/Dax/DaxChartHeader'
import DaxRangeSwitcherChart from '../index/Dax/DaxRangeSwitcherChart'
import DaxMetricsCards from '../index/Dax/DaxMetricCards'
import FxiChartHeader from '../index/China/FXIChartHeader'
import FxiRangeSwitcherChart from '../index/China/FXIRangeSwitcherChart'
import FxiMetricsCards from '../index/China/FXIMetricCards'

export default function Desktop() {
  const [currentPage, setCurrentPage] = useState(0)
  const [isScrolling, setIsScrolling] = useState(false)
  const containerRef = useRef(null)
  const totalPages = 4

  // Manejar el scroll con wheel
  useEffect(() => {
    const handleWheel = (e) => {
      if (isScrolling) return
      
      e.preventDefault()
      
      if (e.deltaY > 0 && currentPage < totalPages - 1) {
        // Scroll hacia abajo
        setCurrentPage(prev => prev + 1)
        setIsScrolling(true)
      } else if (e.deltaY < 0 && currentPage > 0) {
        // Scroll hacia arriba
        setCurrentPage(prev => prev - 1)
        setIsScrolling(true)
      }
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false })
    }

    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel)
      }
    }
  }, [currentPage, isScrolling, totalPages])

  // Resetear el estado de scrolling después de la transición
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsScrolling(false)
    }, 800) // Duración de la transición

    return () => clearTimeout(timer)
  }, [currentPage])

  const handleDotClick = (index) => {
    if (!isScrolling) {
      setCurrentPage(index)
      setIsScrolling(true)
    }
  }

  return (
    <div className="desktop-component" ref={containerRef}>
      <div 
        className="desktop-component__slider"
        style={{
          transform: `translateY(-${currentPage * 100}%)`,
        }}
      >
        <div className="desktop-component__page section1">
          <ChartHeader />
          <RangeSwitcherChart />
          <MetricsCards />
        </div>

        <div className="desktop-component__page section3">
          <NasdaqChartHeader/>
          <NasdaqRangeSwitcherChart/>
          <NasdaqMetricsCards/>
        </div>

        <div className="desktop-component__page section4">
          <DaxChartHeader/>
          <DaxRangeSwitcherChart/>
          <DaxMetricsCards/>
        </div>

        <div className="desktop-component__page section2">
          <FxiChartHeader/>
          <FxiRangeSwitcherChart/>
          <FxiMetricsCards/>
        </div>
      </div>

      <div className="desktop-component__pagination">
        {[...Array(totalPages)].map((_, index) => (
          <button
            key={index}
            className={`pagination-dot ${currentPage === index ? 'active' : ''}`}
            onClick={() => handleDotClick(index)}
            aria-label={`Ir a página ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}