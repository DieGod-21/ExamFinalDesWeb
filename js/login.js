window.addEventListener('DOMContentLoaded', () => {
    const token = sessionStorage.getItem('authToken');
    if (token) {
        showSuccessView();
    }
});

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

async function handleLogin() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const errorAlert = document.getElementById('errorAlert');
    const loginBtn = document.getElementById('loginBtn');
    const btnText = document.getElementById('btnText');

    errorAlert.classList.add('d-none');

    if (!username || !password) {
        showError('Por favor complete todos los campos');
        return;
    }

    loginBtn.disabled = true;
    btnText.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Autenticando...';

    try {
        const result = await API.login(username, password);

        if (result.ok && result.data.token) {
            Session.guardar(result.data.token, username);
            
            console.log('Login exitoso. Token guardado');
            console.log('Token:', result.data.token.substring(0, 30) + '...');
            
            showSuccessView();
        } else {
            showError(result.data.message || 'Credenciales incorrectas. Verifique usuario y contrasena.');
        }
    } catch (error) {
        console.error('Error en login:', error);
        showError('Error de conexion. Verifique su conexion a internet e intente nuevamente.');
    } finally {
        loginBtn.disabled = false;
        btnText.innerHTML = '<i class="fas fa-sign-in-alt me-2"></i>Iniciar Sesion';
    }
}

function showError(message) {
    const errorAlert = document.getElementById('errorAlert');
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = message;
    errorAlert.classList.remove('d-none');
}

function showSuccessView() {
    const username = Session.getUsername();
    const loginTime = new Date(sessionStorage.getItem('loginTime'));
    const token = Session.getToken();

    const timeString = loginTime.toLocaleString('es-GT', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    document.getElementById('displayUsername').textContent = username;
    document.getElementById('displayTime').textContent = timeString;
    document.getElementById('displayToken').textContent = token.substring(0, 50) + '...';

    document.getElementById('loginView').classList.add('d-none');
    document.getElementById('successView').classList.remove('d-none');
}

function handleLogout() {
    Session.cerrar();

    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    document.getElementById('errorAlert').classList.add('d-none');

    document.getElementById('successView').classList.add('d-none');
    document.getElementById('loginView').classList.remove('d-none');

    console.log('Sesion cerrada correctamente');
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('password').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleLogin();
        }
    });

    document.getElementById('username').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleLogin();
        }
    });
});
