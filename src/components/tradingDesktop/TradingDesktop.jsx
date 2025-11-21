import React, { useState, useEffect, useRef } from 'react'
import '../../css_desktop/IndexDesktop.css'
import TradingSection1 from '../trading/TradingSection1'

export default function TradingDesktop() {
    const [currentPage, setCurrentPage] = useState(0)
    const [isScrolling, setIsScrolling] = useState(false)
    const containerRef = useRef(null)
    const totalPages = 1 // Solo una página por ahora, puedes agregar más secciones después

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
                {/* Página 1: Trading Section 1 */}
                <div className="desktop-component__page">
                    <TradingSection1 />
                </div>

                {/* Puedes agregar más páginas aquí si tienes más secciones */}
                {/* 
        <div className="desktop-component__page">
          <TradingSection2/>
        </div>
        */}
            </div>

            {/* Indicadores de página - Solo se muestran si hay más de 1 página */}
            {totalPages > 1 && (
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
            )}
        </div>
    )
}