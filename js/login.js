// ===== INICIALIZACIÓN =====
window.addEventListener('DOMContentLoaded', () => {
    // Verificar si ya hay sesión activa
    if (Session.isAuthenticated()) {
        window.location.href = 'message.html';
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
        // Llamar al API usando api.js
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