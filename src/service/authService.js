class AuthService {
    constructor() {
        this.tokenKey = 'jwt_token';
        this.userKey = 'user_data';
    }

    loginWithGoogle() {
        // Redirigir al endpoint de OAuth2 del backend
        window.location.href = 'http://localhost:8080/oauth2/authorization/google';
    }

    handleLoginSuccess(token) {
        if (!token) {
            throw new Error('Token no proporcionado');
        }

        this.saveToken(token);

        // Decodificar el token para obtener los datos del usuario
        try {
            const decoded = this.decodeToken(token);
            console.log('🔍 Decoded JWT:', decoded);

            if (decoded) {
                // Extraer datos del JWT con los nuevos claims del backend
                const user = {
                    userId: decoded.userId,
                    id: decoded.userId, // Alias para compatibilidad
                    email: decoded.email || decoded.sub,
                    name: decoded.name,
                    sub: decoded.sub
                };

                this.saveUser(user);
                console.log('✅ User data saved from JWT:', user);
            } else {
                console.warn('⚠️ Token decoded but no user data found');
            }
        } catch (error) {
            console.error('❌ Error decodificando token:', error);
        }
    }

    saveToken(token) {
        localStorage.setItem(this.tokenKey, token);
    }

    getToken() {
        return localStorage.getItem(this.tokenKey);
    }

    removeToken() {
        localStorage.removeItem(this.tokenKey);
    }

    saveUser(user) {
        localStorage.setItem(this.userKey, JSON.stringify(user));
        // Mantener compatibilidad con código existente que busca estos keys
        if (user.userId) localStorage.setItem('userId', user.userId.toString());
        if (user.email) localStorage.setItem('userEmail', user.email);
        if (user.name) localStorage.setItem('userName', user.name);
        if (user.avatar) localStorage.setItem('userAvatar', user.avatar);
    }

    getUser() {
        const userStr = localStorage.getItem(this.userKey);
        return userStr ? JSON.parse(userStr) : null;
    }

    removeUser() {
        localStorage.removeItem(this.userKey);
        localStorage.removeItem('userId');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');
        localStorage.removeItem('userAvatar');
    }

    logout() {
        this.removeToken();
        this.removeUser();
        window.location.href = '/login';
    }

    isAuthenticated() {
        const token = this.getToken();
        if (!token) return false;

        // Opcional: Verificar expiración del token
        return !this.isTokenExpired(token);
    }

    isTokenExpired(token) {
        try {
            const decoded = this.decodeToken(token);
            if (decoded.exp) {
                return Date.now() >= decoded.exp * 1000;
            }
            return false;
        } catch (e) {
            return true;
        }
    }

    decodeToken(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error('Error parsing token', error);
            return null;
        }
    }

    // Métodos de compatibilidad para App.js
    checkRedirectResult() {
        // Ya no es necesario con el nuevo flujo, pero lo mantenemos para evitar errores si se llama
        return Promise.resolve(null);
    }

    obtenerUsuarioActual() {
        return this.getUser();
    }

    verificarSesion() {
        return Promise.resolve(this.isAuthenticated());
    }

    limpiarSesion() {
        this.removeToken();
        this.removeUser();
    }

    async deleteAccount(userId) {
        try {
            const token = this.getToken();

            if (!token) {
                throw new Error('No se encontró el token de autenticación');
            }

            const response = await fetch(`http://localhost:8080/api/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Error al eliminar la cuenta');
            }

            // Limpiar sesión local
            this.limpiarSesion();

            return true;
        } catch (error) {
            console.error('Error en deleteAccount:', error);
            throw error;
        }
    }
}

export default new AuthService();
