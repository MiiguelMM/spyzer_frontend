import React, { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { usePageTransition } from '../loading/PageTransitionContext.jsx'
import authService from '../../service/authService'
import '../../css/Header.css'
import logo from '../../assets/Logo5.png'
import LinkedIn from '../../assets/linkedin.png'
import Instagram from '../../assets/instagram.png'
import Twitter from '../../assets/twitter.png'
import Facebook from '../../assets/facebook.png'


export default function Header({ onLogout }) {
    const [showMenu, setShowMenu] = useState(false)
    const [showProfileMenu, setShowProfileMenu] = useState(false)
    const [userName, setUserName] = useState('U')
    const [userEmail, setUserEmail] = useState('')
    const menuRef = useRef(null)
    const profileMenuRef = useRef(null)
    const navigate = useNavigate()
    const location = useLocation()
    const { startTransition } = usePageTransition()

    // Obtener datos del usuario al cargar
    useEffect(() => {
        const user = authService.obtenerUsuarioActual()
        if (user) {
            setUserName(user.name || 'Usuario')
            setUserEmail(user.email || '')
        }
    }, [])

    const toggleMenu = () => {
        setShowMenu(!showMenu)
        setShowProfileMenu(false)
    }

    const toggleProfileMenu = () => {
        setShowProfileMenu(!showProfileMenu)
        setShowMenu(false)
    }

    // Cerrar menús cuando se hace click fuera o se presiona ESC
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false)
            }
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
                setShowProfileMenu(false)
            }
        }

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                setShowMenu(false)
                setShowProfileMenu(false)
            }
        }

        if (showMenu || showProfileMenu) {
            document.addEventListener('mousedown', handleClickOutside)
            document.addEventListener('keydown', handleKeyDown)
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
            document.removeEventListener('keydown', handleKeyDown)
            document.body.style.overflow = 'unset'
        }
    }, [showMenu, showProfileMenu])

    const handleMenuItemClick = (action, route = null, sectionId = null) => {
        console.log(`Acción seleccionada: ${action}`)

        setShowMenu(false)

        switch (action) {
            case 'navigate':
                if (route) {
                    startTransition() // AÑADIR ESTA LÍNEA - Activar el loader
                    navigate(route)
                }
                break
            case 'scroll':
                if (sectionId) {
                    setTimeout(() => {
                        const element = document.getElementById(sectionId)
                        if (element) {
                            element.scrollIntoView({ behavior: 'smooth' })
                        }
                    }, 100)
                }
                break
            case 'settings':
                console.log('Ir a configuración')
                break
            case 'help':
                console.log('Mostrar ayuda')
                break
            default:
                break
        }
    }

    const handleProfileAction = async (action) => {
        setShowProfileMenu(false)

        switch (action) {
            case 'deleteAccount':
                const confirmDelete = window.confirm(
                    'Are you sure you want to delete your account? This action cannot be undone and you will lose all your data, including your portfolio and transactions.'
                )

                if (confirmDelete) {
                    try {
                        console.log('Deleting account...')
                        const user = authService.obtenerUsuarioActual()

                        if (user && user.userId) {
                            await authService.deleteAccount(user.userId)
                            alert('Your account has been successfully deleted.')

                            // Clear data and redirect
                            authService.logout()
                        } else {
                            throw new Error('Could not obtain user ID')
                        }
                    } catch (error) {
                        console.error('Error deleting account:', error)
                        alert('Error deleting account. Please try again.')
                    }
                }
                break
            case 'logout':
                try {
                    console.log('Cerrando sesión desde Header...')

                    // Llamar al callback de logout del App.jsx
                    if (onLogout) {
                        await onLogout()
                    } else {
                        // Fallback si no hay callback
                        await authService.logout()
                        window.location.href = '/login'
                    }
                } catch (error) {
                    console.error('Error al cerrar sesión:', error)
                    alert('Error al cerrar sesión. Por favor intenta de nuevo.')
                }
                break
            default:
                break
        }
    }

    const isActiveRoute = (route) => {
        return location.pathname === route
    }

    // Obtener iniciales del nombre
    const getUserInitials = () => {
        if (userName && userName !== 'Usuario') {
            return userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        }
        return 'U'
    }

    return (
        <div className='header'>
            <div className='header_container'>
                <div className='header__logo' onClick={() => {
                    startTransition() // AÑADIR - Activar loader al hacer click en logo
                    navigate('/')
                }}>
                    <img src={logo} alt="Logo" />
                    <span className='header__name'>
                        <h1>Spyzer</h1>
                    </span>
                </div>

                <div className='header__wrapper'>
                    {/* BOTÓN DE PERFIL */}
                    <div
                        className='header__profile'
                        onClick={toggleProfileMenu}
                        style={{ cursor: 'pointer' }}
                    >
                        <div className='header__profile-avatar'>
                            <div className='header__profile-initials'>
                                {getUserInitials()}
                            </div>
                        </div>
                    </div>

                    {/* MENÚ HAMBURGUESA PARA NAVEGACIÓN */}
                    <div
                        className={`header__menu ${showMenu ? 'active' : ''}`}
                        onClick={toggleMenu}
                    >
                        <div className='header__menu-icon'>
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                </div>
            </div>

            {/* MENÚ HAMBURGUESA FULLSCREEN */}
            {showMenu && (
                <div className='header__menu-dropdown' ref={menuRef}>
                    <div className='menu-container'>
                        <div className="hamburger-header">
                            <div className="hamburger-logo">
                                <img src={logo} alt="Logo" style={{ width: '42px', height: '39px', marginRight: '12px' }} />
                                SPYZER
                            </div>

                            <button
                                className='close-menu-button'
                                onClick={() => setShowMenu(false)}
                                aria-label="Cerrar menú"
                            >
                                ×
                            </button>
                        </div>

                        <div className="hamburger-nav">
                            <div
                                className={`menu-item ${isActiveRoute('/') ? 'active' : ''}`}
                                onClick={() => handleMenuItemClick('navigate', '/')}
                            >
                                <i className="fas fa-home"></i>
                                Market Data
                                <i className="fas fa-chevron-right menu-arrow"></i>
                            </div>

                            <div
                                className={`menu-item ${isActiveRoute('/my-portfolio') ? 'active' : ''}`}
                                onClick={() => handleMenuItemClick('navigate', '/my-portfolio')}
                            >
                                <i className="fas fa-chart-line"></i>
                                My Portfolio
                                <i className="fas fa-chevron-right menu-arrow"></i>
                            </div>

                            <div
                                className={`menu-item ${isActiveRoute('/trading') ? 'active' : ''}`}
                                onClick={() => handleMenuItemClick('navigate', '/trading')}
                            >
                                <i className="fas fa-trophy"></i>
                                Trading
                                <i className="fas fa-chevron-right menu-arrow"></i>
                            </div>


                            <div
                                className={`menu-item ${isActiveRoute('/rankings') ? 'active' : ''}`}
                                onClick={() => handleMenuItemClick('navigate', '/rankings')}
                            >
                                <i className="fas fa-trophy"></i>
                                Rankings
                                <i className="fas fa-chevron-right menu-arrow"></i>
                            </div>

                            <div
                                className={`menu-item ${isActiveRoute('/my-alerts') ? 'active' : ''}`}
                                onClick={() => handleMenuItemClick('navigate', '/my-alerts')}
                            >
                                <i className="fas fa-bell"></i>
                                My Alerts
                                <i className="fas fa-chevron-right menu-arrow"></i>
                            </div>


                        </div>

                        <div className="hamburger-footer">
                            <div className="hamburger-social">
                                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                                    <img src={LinkedIn} alt="LinkedIn" />
                                </a>
                                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                                    <img src={Instagram} alt="Instagram" />
                                </a>
                                <a href="mailto:contact@spyzer.com" aria-label="Email">
                                    <img src={Facebook} alt="Facebook" />
                                </a>
                                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                                    <img src={Twitter} alt="Twitter" />
                                </a>
                            </div>
                            <p className="hamburger-copyright">&copy; 2025 Spyzer. Todos los derechos reservados.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* MENÚ DE PERFIL FULLSCREEN */}
            {showProfileMenu && (
                <div className='header__profile-dropdown' ref={profileMenuRef}>
                    <div className='profile-container'>
                        {/* Header del perfil */}
                        <div className="profile-header-section">
                            <div className="profile-header-content">
                                <div className="profile-avatar-section">
                                    <div className="profile-avatar-large">{getUserInitials()}</div>
                                    <div className="profile-user-info">
                                        <h2>{userName}</h2>
                                        <span>{userEmail}</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                className='close-profile-button'
                                onClick={() => setShowProfileMenu(false)}
                                aria-label="Cerrar menú de perfil"
                            >
                                ×
                            </button>
                        </div>

                        {/* Opciones del perfil */}
                        <div className="profile-nav">
                            <div
                                className="menu-item"
                                onClick={() => handleProfileAction('deleteAccount')}
                            >
                                <i className="fas fa-trash-alt"></i>
                                Eliminar Cuenta
                                <i className="fas fa-chevron-right menu-arrow"></i>
                            </div>
                        </div>

                        {/* Sección de logout */}
                        <div className="profile-logout-section">
                            <div
                                className="menu-item logout-item"
                                onClick={() => handleProfileAction('logout')}
                            >
                                <i className="fas fa-sign-out-alt"></i>
                                Cerrar Sesión
                                <i className="fas fa-chevron-right menu-arrow"></i>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="hamburger-footer">
                            <div className="hamburger-social">
                                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                                    <img src={LinkedIn} alt="LinkedIn" />
                                </a>
                                <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                                    <img src={Instagram} alt="GitHub" />
                                </a>
                                <a href="mailto:contact@spyzer.com" aria-label="Email">
                                    <img src={Facebook} alt="Email" />
                                </a>
                                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                                    <img src={Twitter} alt="Twitter" />
                                </a>
                            </div>
                            <p className="hamburger-copyright">&copy; 2025 Spyzer. Todos los derechos reservados.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}