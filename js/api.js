// ===== CONFIGURACIÓN DE APIs =====
// Para desarrollo local usa: 'http://localhost:3000'
// Para producción en Render, cambia a tu URL de Render
const API_BACKEND = 'http://localhost:3000';  // Cambiar por URL de Render cuando despliegues
const API_AZURE = 'https://backcvbgtmdesa.azurewebsites.net/api';  // API del ingeniero

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

    // Obtener mensajes (Tu servidor local - SQL Server)
    obtenerMensajes: async () => {
        try {
            const response = await fetch(`${API_BACKEND}/mensajes`, {
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
            console.error('Error conectando a servidor local:', error);
            return {
                ok: false,
                data: [],
                error: 'Asegurese de ejecutar: node server/server.js'
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