// ===== INICIALIZACIÓN =====
window.addEventListener('DOMContentLoaded', () => {
    // Si ya está autenticado, redirigir directamente
    if (Session.isAuthenticated()) {
        window.location.href = 'chats.html';
    }

    // Event listeners para Enter
    document.getElementById('password').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleLogin();
    });

    document.getElementById('username').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleLogin();
    });
});

// ===== MOSTRAR/OCULTAR CONTRASEÑA =====
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const eyeIcon = document.getElementById('eyeIcon');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        eyeIcon.classList.remove('fa-eye');
        eyeIcon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        eyeIcon.classList.remove('fa-eye-slash');
        eyeIcon.classList.add('fa-eye');
    }
}

// ===== FUNCIÓN PRINCIPAL DE LOGIN =====
async function handleLogin() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const errorAlert = document.getElementById('errorAlert');
    const loginBtn = document.getElementById('loginBtn');
    const btnText = document.getElementById('btnText');

    // Limpiar errores previos
    errorAlert.classList.add('d-none');

    // Validación
    if (!username || !password) {
        showError('Por favor complete todos los campos');
        return;
    }

    // Deshabilitar botón y mostrar loading
    loginBtn.disabled = true;
    btnText.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Autenticando...';

    try {
        // Llamar al API
        const result = await API.login(username, password);

        if (result.ok && result.data.token) {
            // Guardar sesión
            Session.guardar(result.data.token, username);
            
            console.log('Login exitoso. Token guardado');
            
            // Mostrar token por 5 segundos y luego redirigir
            mostrarTokenYRedirigir(result.data.token);
        } else {
            showError(result.data.message || 'Credenciales incorrectas. Verifique usuario y contrasena.');
        }
    } catch (error) {
        console.error('Error en login:', error);
        showError('Error de conexion. Verifique su internet e intente nuevamente.');
    } finally {
        loginBtn.disabled = false;
        btnText.innerHTML = '<i class="fas fa-sign-in-alt me-2"></i>Iniciar Sesion';
    }
}

// ===== MOSTRAR ERROR =====
function showError(message) {
    const errorAlert = document.getElementById('errorAlert');
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = message;
    errorAlert.classList.remove('d-none');
}

// ===== MOSTRAR TOKEN Y REDIRIGIR AUTOMÁTICAMENTE =====
function mostrarTokenYRedirigir(token) {
    // Crear overlay de éxito
    const overlay = document.createElement('div');
    overlay.id = 'successOverlay';
    overlay.innerHTML = `
        <div style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
        ">
            <div style="
                background: white;
                padding: 40px;
                border-radius: 20px;
                text-align: center;
                max-width: 500px;
                width: 90%;
            ">
                <div style="
                    width: 80px;
                    height: 80px;
                    background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 20px;
                ">
                    <i class="fas fa-check" style="font-size: 40px; color: white;"></i>
                </div>
                <h2 style="color: #333; margin-bottom: 10px;">Autenticacion Exitosa!</h2>
                <p style="color: #666; margin-bottom: 20px;">Token generado correctamente</p>
                <div style="
                    background: #f8f9fa;
                    padding: 15px;
                    border-radius: 10px;
                    border-left: 4px solid #667eea;
                    margin-bottom: 20px;
                    text-align: left;
                ">
                    <small style="color: #495057; font-weight: 600;">Token (primeros 50 caracteres):</small>
                    <p style="
                        font-family: monospace;
                        font-size: 11px;
                        color: #6c757d;
                        word-break: break-all;
                        margin: 10px 0 0 0;
                    ">${token.substring(0, 50)}...</p>
                </div>
                <div style="
                    background: #e3f2fd;
                    padding: 10px;
                    border-radius: 8px;
                    color: #1565c0;
                    font-size: 14px;
                ">
                    <i class="fas fa-clock me-2"></i>
                    Redirigiendo en <span id="countdownTimer">5</span> segundos...
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Countdown y redirección automática
    let seconds = 5;
    
    const interval = setInterval(() => {
        seconds--;
        const countdownEl = document.getElementById('countdownTimer');
        if (countdownEl) {
            countdownEl.textContent = seconds;
        }
        
        if (seconds <= 0) {
            clearInterval(interval);
            console.log('Redirigiendo a chats.html...');
            window.location.href = 'chats.html';
        }
    }, 1000);
}