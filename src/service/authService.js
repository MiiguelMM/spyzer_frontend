import { GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { auth } from '../config/firebase';
import userService from './userService';

class AuthService {
  constructor() {
    this.provider = new GoogleAuthProvider();
    this.provider.addScope('profile');
    this.provider.addScope('email');
  }

  async loginWithGoogle() {
    try {
      console.log('Iniciando login con Google...');
      
      try {
        // Intentar popup primero
        const result = await signInWithPopup(auth, this.provider);
        console.log('Login exitoso con popup');
        return await this.processAuthResult(result);
      } catch (popupError) {
        // Si falla el popup, usar redirect como fallback
        if (popupError.code === 'auth/popup-blocked') {
          console.log('Popup bloqueado, usando redirect...');
          localStorage.setItem('pendingGoogleAuth', 'true');
          await signInWithRedirect(auth, this.provider);
          return { pending: true };
        }
        throw popupError;
      }
      
    } catch (error) {
      console.error('Error en login con Google:', error);
      throw this.handleAuthError(error);
    }
  }

  // Verificar resultado de redirect
  async checkRedirectResult() {
    try {
      const isPending = localStorage.getItem('pendingGoogleAuth');
      
      if (!isPending) {
        return null;
      }

      console.log('Verificando redirect result...');
      const result = await getRedirectResult(auth);
      
      if (result && result.user) {
        console.log('Redirect result encontrado:', result.user.email);
        localStorage.removeItem('pendingGoogleAuth');
        return await this.processAuthResult(result);
      }

      return null;
    } catch (error) {
      console.error('Error en redirect result:', error);
      localStorage.removeItem('pendingGoogleAuth');
      return null;
    }
  }

  async processAuthResult(result) {
    try {
      const user = result.user;
      console.log('Procesando usuario autenticado:', user.email);

      const userData = {
        googleId: user.uid,
        email: user.email,
        name: user.displayName,
        avatar: user.photoURL
      };

      console.log('Enviando datos al backend:', userData);
      
      let backendUser;
      try {
        backendUser = await userService.crearOEncontrarUsuario(userData);
        console.log('Respuesta del backend:', backendUser);
      } catch (backendError) {
        console.error('Error del backend:', backendError);
        throw new Error('Error al comunicarse con el servidor: ' + backendError.message);
      }
      
      // Verificar que el backend devolvió un usuario válido
      if (!backendUser) {
        console.error('El backend devolvió null o undefined');
        throw new Error('El servidor no devolvió datos de usuario');
      }

      if (!backendUser.id) {
        console.error('El backend no devolvió un ID de usuario:', backendUser);
        throw new Error('El servidor no devolvió un ID de usuario válido');
      }

      if (!backendUser.email) {
        console.error('El backend no devolvió un email:', backendUser);
        throw new Error('El servidor no devolvió un email válido');
      }

      if (!backendUser.name) {
        console.error('El backend no devolvió un nombre:', backendUser);
        throw new Error('El servidor no devolvió un nombre válido');
      }
      
      console.log('Usuario válido del backend:', {
        id: backendUser.id,
        email: backendUser.email,
        name: backendUser.name
      });
      
      // Obtener el token de Firebase
      console.log('Obteniendo token de Firebase...');
      const token = await user.getIdToken();
      console.log('Token obtenido');
      
      this.guardarSesion(backendUser, token);

      return {
        success: true,
        user: backendUser,
        firebaseUser: user
      };
    } catch (error) {
      console.error('Error procesando resultado de autenticación:', error);
      throw error;
    }
  }

  handleAuthError(error) {
    console.error('Código de error:', error.code);
    console.error('Mensaje de error:', error.message);

    if (error.code === 'auth/popup-closed-by-user') {
      return new Error('Login cancelado por el usuario');
    } else if (error.code === 'auth/popup-blocked') {
      return new Error('Popup bloqueado. Permite popups en tu navegador');
    } else if (error.code === 'auth/cancelled-popup-request') {
      return new Error('Solicitud de popup cancelada');
    } else if (error.code === 'auth/network-request-failed') {
      return new Error('Error de conexión. Verifica tu internet');
    } else {
      return new Error(`Error de autenticación: ${error.message}`);
    }
  }

  guardarSesion(user, token) {
    console.log('Guardando sesión en localStorage...');
    
    try {
      localStorage.setItem('authToken', token);
      localStorage.setItem('userId', user.id.toString());
      localStorage.setItem('userEmail', user.email);
      localStorage.setItem('userName', user.name);
      if (user.avatar) {
        localStorage.setItem('userAvatar', user.avatar);
      }
      
      console.log('Sesión guardada correctamente');
    } catch (error) {
      console.error('Error guardando sesión:', error);
      throw error;
    }
  }

  async logout() {
    try {
      console.log('Cerrando sesión de Firebase...');
      await auth.signOut();
      this.limpiarSesion();
      console.log('Sesión cerrada exitosamente');
      return { success: true };
    } catch (error) {
      console.error('Error en logout:', error);
      throw error;
    }
  }

  limpiarSesion() {
    console.log('Limpiando sesión del localStorage...');
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('userAvatar');
    console.log('Sesión limpiada');
  }

  obtenerUsuarioActual() {
    const userId = localStorage.getItem('userId');
    const userEmail = localStorage.getItem('userEmail');
    const userName = localStorage.getItem('userName');
    const userAvatar = localStorage.getItem('userAvatar');

    if (userId && userEmail && userName) {
      return {
        id: parseInt(userId),
        email: userEmail,
        name: userName,
        avatar: userAvatar
      };
    }

    return null;
  }

  estaAutenticado() {
    return this.obtenerUsuarioActual() !== null;
  }

  async verificarSesion() {
    try {
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken(true);
        localStorage.setItem('authToken', token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error verificando sesión:', error);
      return false;
    }
  }
}

export default new AuthService();