import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'
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

    // Cerrar menú cuando se presiona ESC y controlar overflow del body
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                setShowProfileMenu(false)
            }
        }

        if (showProfileMenu) {
            document.addEventListener('keydown', handleKeyDown)
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown)
            document.body.style.overflow = 'unset'
        }
    }, [showProfileMenu])

    const handleNavigation = (route) => {
        startTransition()
        navigate(route)
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

    // Componente Modal usando Portal
    const ProfileModal = () => {
        if (!showProfileMenu) return null

        return ReactDOM.createPortal(
            <div className='header-desktop__profile-modal'>
                <div className='profile-modal-container'>
                    {/* Header del perfil */}
                    <div className="profile-modal-header">
                        <div className="profile-modal-avatar-section">
                            <div className="profile-modal-avatar-large">{getUserInitials()}</div>
                            <div className="profile-modal-user-info">
                                <h2>{userName}</h2>
                                <span>{userEmail}</span>
                            </div>
                        </div>

                        <button
                            className='close-profile-modal-button'
                            onClick={() => setShowProfileMenu(false)}
                            aria-label="Cerrar menú de perfil"
                        >
                            ×
                        </button>
                    </div>

                    {/* Opciones del perfil */}
                    <div className="profile-modal-nav">
                        <div
                            className="profile-modal-item"
                            onClick={() => handleProfileAction('deleteAccount')}
                        >
                            <i className="fas fa-trash-alt"></i>
                            Eliminar Cuenta
                            <i className="fas fa-chevron-right menu-arrow"></i>
                        </div>
                    </div>

                    {/* Sección de logout */}
                    <div className="profile-modal-logout-section">
                        <div
                            className="profile-modal-item logout-item"
                            onClick={() => handleProfileAction('logout')}
                        >
                            <i className="fas fa-sign-out-alt"></i>
                            Cerrar Sesión
                            <i className="fas fa-chevron-right menu-arrow"></i>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="profile-modal-footer">
                        <div className="profile-modal-social">
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
                        <p className='profile-modal-copyright'>&copy; 2025 Spyzer</p>
                    </div>
                </div>
            </div>,
            document.body
        )
    }

    return (
        <>
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
                    <div className='header-desktop__profile-section'>
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
                    </div>
                </div>
            </div>

            {/* Modal renderizado fuera del sidebar usando Portal */}
            <ProfileModal />
        </>
    )
}