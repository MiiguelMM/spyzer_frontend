import React, { useState, useEffect, useRef, useMemo } from 'react'
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

// Componente placeholder ligero para páginas no cargadas
const PagePlaceholder = () => (
  <div className="desktop-component__page-placeholder">
    <div className="placeholder-content">
      <div className="placeholder-shimmer"></div>
    </div>
  </div>
)

export default function Desktop() {
  const [currentPage, setCurrentPage] = useState(0)
  const [isScrolling, setIsScrolling] = useState(false)
  const [loadedPages, setLoadedPages] = useState(new Set([0])) // Solo página inicial
  const containerRef = useRef(null)
  const totalPages = 4

  // Pre-cargar páginas adyacentes cuando cambia la página actual
  useEffect(() => {
    const pagesToLoad = new Set(loadedPages)
    
    // Cargar página actual
    pagesToLoad.add(currentPage)
    
    // Pre-cargar página siguiente (si existe)
    if (currentPage < totalPages - 1) {
      pagesToLoad.add(currentPage + 1)
    }
    
    // Pre-cargar página anterior (si existe)
    if (currentPage > 0) {
      pagesToLoad.add(currentPage - 1)
    }
    
    setLoadedPages(pagesToLoad)
  }, [currentPage, totalPages])

  // Manejar el scroll con wheel
  useEffect(() => {
    const handleWheel = (e) => {
      if (isScrolling) return
      
      e.preventDefault()
      
      if (e.deltaY > 0 && currentPage < totalPages - 1) {
        setCurrentPage(prev => prev + 1)
        setIsScrolling(true)
      } else if (e.deltaY < 0 && currentPage > 0) {
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
    }, 800)

    return () => clearTimeout(timer)
  }, [currentPage])

  const handleDotClick = (index) => {
    if (!isScrolling) {
      setCurrentPage(index)
      setIsScrolling(true)
    }
  }

  // Función helper para verificar si una página debe renderizarse
  const shouldRenderPage = (pageIndex) => loadedPages.has(pageIndex)

  return (
    <div className="desktop-component" ref={containerRef}>
      <div 
        className="desktop-component__slider"
        style={{
          transform: `translateY(-${currentPage * 100}%)`,
        }}
      >
        {/* Página 0: S&P 500 */}
        <div className="desktop-component__page section1">
          {shouldRenderPage(0) ? (
            <>
              <ChartHeader />
              <RangeSwitcherChart />
              <MetricsCards />
            </>
          ) : <PagePlaceholder />}
        </div>

        {/* Página 1: NASDAQ */}
        <div className="desktop-component__page section3">
          {shouldRenderPage(1) ? (
            <>
              <NasdaqChartHeader />
              <NasdaqRangeSwitcherChart />
              <NasdaqMetricsCards />
            </>
          ) : <PagePlaceholder />}
        </div>

        {/* Página 2: DAX */}
        <div className="desktop-component__page section4">
          {shouldRenderPage(2) ? (
            <>
              <DaxChartHeader />
              <DaxRangeSwitcherChart />
              <DaxMetricsCards />
            </>
          ) : <PagePlaceholder />}
        </div>

        {/* Página 3: FXI China */}
        <div className="desktop-component__page section2">
          {shouldRenderPage(3) ? (
            <>
              <FxiChartHeader />
              <FxiRangeSwitcherChart />
              <FxiMetricsCards />
            </>
          ) : <PagePlaceholder />}
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