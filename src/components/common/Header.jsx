import React, { useState } from 'react'
import '../../css/Header.css'
import logo from '../../assets/Logo3.png'

export default function Header() {
    const [showMenu, setShowMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);

    const toggleMenu = () => {
        setShowMenu(!showMenu);
    };

    const toggleNotifications = () => {
        setShowNotifications(!showNotifications);
    };

    return (
        <div className='header'>
            <div className='header__logo'>
                <img src={logo} alt="Logo" />
                <span className='header__name'>  <h1>Spyzer</h1>  </span>
            </div>

            <div className='header__wrapper'> 
                <div className='header__profile'>
                    <div className='header__profile-avatar'>
                        {/* Opcional: agregar imagen */}
                        <div className='header__profile-initials'>
                            U
                        </div>
                    </div>
                </div>

                <div className='header__menu' onClick={toggleMenu}>
                    <div className='header__menu-icon'>
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                    {/* {showMenu && (
                        <div className='header__menu-dropdown'>
                            <div className='menu-item'>Notificaciones</div>
                            <div className='menu-item'>Configuración</div>
                            <div className='menu-item'>Ayuda</div>
                            <div className='menu-item'>Cerrar Sesión</div>
                        </div>
                    )} */}
                </div>
            </div>
        </div>
    )
}