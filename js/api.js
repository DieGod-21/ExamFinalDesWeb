// ===== CONFIGURACIÓN DE APIs =====
// Para pruebas locales, usa: 'http://localhost:3000'
// Para producción, usa tu URL de Render: 'https://examfinaldesweb.onrender.com'
const API_MENSAJES = 'https://examfinaldesweb.onrender.com';  // TU propio servidor en Render
const API_AZURE = 'https://backcvbgtmdesa.azurewebsites.net/api';  // API del ingeniero (Login y Envío)

// ===== OBJETO DE CONEXIONES =====
const API = {
    
    // Autenticación (API del ingeniero)
    login: async (username, password) => {
        const response = await fetch(`${API_AZURE}/login/authenticate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                Username: username,
                Password: password
            })
        });
        
        return {
            ok: response.ok,
            data: await response.json()
        };
    },

    // Enviar mensaje (API del ingeniero)
    enviarMensaje: async (loginEmisor, contenido) => {
        const token = Session.getToken();
        
        const response = await fetch(`${API_AZURE}/Mensajes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                Cod_Sala: 0,
                Login_Emisor: loginEmisor,
                Contenido: contenido
            })
        });
        
        return {
            ok: response.ok,
            data: await response.json()
        };
    },

    // Obtener mensajes (usando TU PROPIO backend)
    obtenerMensajes: async () => {
        const token = Session.getToken();
        if (!token) {
            return { ok: false, data: [], error: 'Token no encontrado' };
        }

        try {
            const response = await fetch(`${API_MENSAJES}/api/historial`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                return {
                    ok: true,
                    data: await response.json()
                };
            } else {
                const errorData = await response.json().catch(() => ({ message: 'Error del servidor al obtener historial' }));
                throw new Error(errorData.error || errorData.message);
            }
        } catch (error) {
            console.error('Error conectando a tu servidor para obtener historial:', error);
            return {
                ok: false,
                data: [],
                error: error.message || 'No se pudo obtener el historial'
            };
        }
    }
};

// ===== UTILIDADES DE SESIÓN =====
const Session = {
    
    guardar: (token, username) => {
        sessionStorage.setItem('authToken', token);
        sessionStorage.setItem('username', username);
        sessionStorage.setItem('loginTime', new Date().toISOString());
    },

    getToken: () => {
        return sessionStorage.getItem('authToken');
    },

    getUsername: () => {
        return sessionStorage.getItem('username');
    },

    isAuthenticated: () => {
        return sessionStorage.getItem('authToken') !== null;
    },

    cerrar: () => {
        sessionStorage.removeItem('authToken');
        sessionStorage.removeItem('username');
        sessionStorage.removeItem('loginTime');
    }
};