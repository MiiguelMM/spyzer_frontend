import React, { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { usePageTransition } from '../loading/PageTransitionContext.jsx'
import authService from '../../service/authService'
import '../../css_desktop/HeaderDesktop.css'
import logo from '../../assets/Logo5.png'
import LinkedIn from '../../assets/linkedin.png'
import Instagram from '../../assets/instagram.png'
import Twitter from '../../assets/twitter.png'
import Facebook from '../../assets/facebook.png'

export default function HeaderDesktop({ onLogout, currentUser }) {
    const [showProfileMenu, setShowProfileMenu] = useState(false)
    const [userName, setUserName] = useState('U')
    const [userEmail, setUserEmail] = useState('')
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

    const toggleProfileMenu = () => {
        setShowProfileMenu(!showProfileMenu)
    }

    // Cerrar menú cuando se hace click fuera o se presiona ESC
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
                setShowProfileMenu(false)
            }
        }

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                setShowProfileMenu(false)
            }
        }

        if (showProfileMenu) {
            document.addEventListener('mousedown', handleClickOutside)
            document.addEventListener('keydown', handleKeyDown)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [showProfileMenu])

    const handleNavigation = (route) => {
        startTransition()
        navigate(route)
    }

    const handleProfileAction = async (action) => {
        setShowProfileMenu(false)

        switch (action) {
            case 'profile':
                console.log('Ver perfil')
                // navigate('/profile')
                break
            case 'account':
                console.log('Mi cuenta')
                // navigate('/account')
                break
            case 'settings':
                console.log('Ir a configuración')
                // navigate('/settings')
                break
            case 'help':
                console.log('Centro de ayuda')
                // navigate('/help')
                break
            case 'logout':
                try {
                    console.log('Cerrando sesión desde HeaderDesktop...')
                    
                    if (onLogout) {
                        await onLogout()
                    } else {
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
        <div className='header-desktop'>
            <div className='header-desktop__container'>
                {/* Logo Section */}
                <div className='header-desktop__logo-section'>
                    <div className='header-desktop__logo' onClick={() => handleNavigation('/')}>
                        <img src={logo} alt="Logo" />
                        <span className='header-desktop__name'>SPYZER</span>
                    </div>
                </div>

                {/* Navigation Section */}
                <nav className='header-desktop__nav'>
                    <div
                        className={`header-desktop__nav-item ${isActiveRoute('/') ? 'active' : ''}`}
                        onClick={() => handleNavigation('/')}
                        title="Market Data"
                    >
                        <i className="fas fa-home"></i>
                        <span>Market Data</span>
                    </div>

                    <div
                        className={`header-desktop__nav-item ${isActiveRoute('/my-portfolio') ? 'active' : ''}`}
                        onClick={() => handleNavigation('/my-portfolio')}
                        title="My Portfolio"
                    >
                        <i className="fas fa-chart-line"></i>
                        <span>My Portfolio</span>
                    </div>

                    <div
                        className={`header-desktop__nav-item ${isActiveRoute('/trading') ? 'active' : ''}`}
                        onClick={() => handleNavigation('/trading')}
                        title="Trading"
                    >
                        <i className="fas fa-exchange-alt"></i>
                        <span>Trading</span>
                    </div>

                    <div
                        className={`header-desktop__nav-item ${isActiveRoute('/rankings') ? 'active' : ''}`}
                        onClick={() => handleNavigation('/rankings')}
                        title="Rankings"
                    >
                        <i className="fas fa-trophy"></i>
                        <span>Rankings</span>
                    </div>

                    <div
                        className={`header-desktop__nav-item ${isActiveRoute('/my-alerts') ? 'active' : ''}`}
                        onClick={() => handleNavigation('/my-alerts')}
                        title="My Alerts"
                    >
                        <i className="fas fa-bell"></i>
                        <span>My Alerts</span>
                    </div>
                </nav>

                {/* Profile Section */}
                <div className='header-desktop__profile-section' ref={profileMenuRef}>
                    <div
                        className='header-desktop__profile'
                        onClick={toggleProfileMenu}
                    >
                        <div className='header-desktop__profile-avatar'>
                            <div className='header-desktop__profile-initials'>
                                {getUserInitials()}
                            </div>
                        </div>
                    </div>

                    {/* Profile Dropdown */}
                    {showProfileMenu && (
                        <div className='header-desktop__profile-dropdown'>
                            <div className='profile-dropdown__header'>
                                <div className='profile-dropdown__avatar-large'>
                                    {getUserInitials()}
                                </div>
                                <div className='profile-dropdown__user-info'>
                                    <h3>{userName}</h3>
                                    <span>{userEmail}</span>
                                </div>
                            </div>

                            <div className='profile-dropdown__divider'></div>

                            <div className='profile-dropdown__menu'>
                                <div
                                    className='profile-dropdown__item'
                                    onClick={() => handleProfileAction('profile')}
                                >
                                    <i className="fas fa-user"></i>
                                    <span>Mi Perfil</span>
                                </div>

                                <div
                                    className='profile-dropdown__item'
                                    onClick={() => handleProfileAction('settings')}
                                >
                                    <i className="fas fa-cog"></i>
                                    <span>Configuración</span>
                                </div>
                            </div>

                            <div className='profile-dropdown__divider'></div>

                            <div className='profile-dropdown__logout'>
                                <div
                                    className='profile-dropdown__item logout-item'
                                    onClick={() => handleProfileAction('logout')}
                                >
                                    <i className="fas fa-sign-out-alt"></i>
                                    <span>Cerrar Sesión</span>
                                </div>
                            </div>

                            <div className='profile-dropdown__divider'></div>

                            <div className='profile-dropdown__footer'>
                                <div className='profile-dropdown__social'>
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
                                <p className='profile-dropdown__copyright'>&copy; 2025 Spyzer</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
