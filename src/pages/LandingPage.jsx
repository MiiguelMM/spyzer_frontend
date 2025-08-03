import React from 'react'
import '../css/LandingPage.css'
import Logo from '../assets/Logo5.png'
import Circulo from '../assets/circulo.png'

export default function LandingPage({ onLogin }) {
 return (
   <div className='content'>
     {/* ✨ ESTRELLAS DE FONDO */}
     <div className="stars">
       <div className="star star-1"></div>
       <div className="star star-2"></div>
       <div className="star star-3"></div>
       <div className="star star-4"></div>
       <div className="star star-5"></div> 
       <div className="star star-6"></div>
     </div>

     {/* 🌀 CÍRCULO CENTRAL CON LOGO */}
     <div className='circle' style={{backgroundImage:`url(${Circulo})`}}>
       <div className='logo' style={{ backgroundImage: `url(${Logo})` }}></div>
       <div className='name'> SPYZER </div>
       
       {/* 🪐 SISTEMA DE ÓRBITAS Y PLANETAS CON COLORES DE MERCADOS */}
       <div className="orbit-container">
         {/* S&P 500 - Azul principal */}
         <div className="orbit orbit-1">
           <div className="planet planet-1"></div>
         </div>
         {/* NASDAQ - Verde tech */}
         <div className="orbit orbit-2">
           <div className="planet planet-2"></div>
         </div>
         {/* IBEX 35 - Naranja español */}
         <div className="orbit orbit-3">
           <div className="planet planet-3"></div>
         </div>
         {/* VIX - Rojo fear */}
         <div className="orbit orbit-4">
           <div className="planet planet-4"></div>
         </div>
       </div>
     </div>
     
     
     {/* 🔑 GRUPO DE BOTONES */}
     <div className="buttons-group">
       <button 
         className="login-button"
         onClick={onLogin}
       >
         Iniciar Sesión
       </button>
       
       <button 
         className="register-button"
         onClick={onLogin}
       >
         Registrar Sesión
       </button>
     </div>

     {/* 💬 TEXTO DE REGISTRO */}
     <p className="register-text">
       ¿No tienes cuenta? Regístrate
     </p>
   </div>
 )
}