// ===== CONFIGURACIÓN DE APIs =====
const API_MENSAJES = 'https://desarrollowebfinal.onrender.com/api/mensajes-chat';  // API de mensajes (Render)
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

    // Obtener mensajes (API de Render - SQL Server)
    obtenerMensajes: async () => {
        try {
            const response = await fetch(`${API_MENSAJES}/mensajes`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                return {
                    ok: true,
                    data: await response.json()
                };
            } else {
                throw new Error('Error del servidor');
            }
        } catch (error) {
            console.error('Error conectando al servidor:', error);
            return {
                ok: false,
                data: [],
                error: 'Error al conectar con el servidor de mensajes'
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