// ===== VARIABLES GLOBALES =====
let mensajesEnviados = [];

// ===== INICIALIZACIÓN =====
window.addEventListener('DOMContentLoaded', () => {
    // Verificar autenticación
    if (!Session.isAuthenticated()) {
        document.getElementById('noAuthView').classList.remove('d-none');
        return;
    }

    // Usuario autenticado
    document.getElementById('usuarioActual').textContent = Session.getUsername();
    document.getElementById('authView').classList.remove('d-none');

    // Contador de caracteres
    const textarea = document.getElementById('contenidoMensaje');
    const counter = document.getElementById('charCounter');

    textarea.addEventListener('input', () => {
        const length = textarea.value.length;
        counter.textContent = `${length} / 500 caracteres`;

        counter.classList.remove('warning', 'danger');
        if (length > 450) {
            counter.classList.add('danger');
        } else if (length > 400) {
            counter.classList.add('warning');
        }
    });

    // Ctrl+Enter para enviar
    textarea.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'Enter') {
            enviarMensaje();
        }
    });
});

// ===== ENVIAR MENSAJE =====
async function enviarMensaje() {
    const contenido = document.getElementById('contenidoMensaje').value.trim();
    const username = Session.getUsername();
    const enviarBtn = document.getElementById('enviarBtn');
    const btnText = document.getElementById('btnText');

    // Limpiar alertas
    document.getElementById('errorAlert').classList.add('d-none');
    document.getElementById('successAlert').classList.add('d-none');

    // Validaciones
    if (!contenido) {
        mostrarError('Por favor escriba un mensaje antes de enviar.');
        return;
    }

    if (contenido.length < 3) {
        mostrarError('El mensaje debe tener al menos 3 caracteres.');
        return;
    }

    // Loading
    enviarBtn.disabled = true;
    btnText.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Enviando...';

    try {
        // Llamar al API usando api.js
        const result = await API.enviarMensaje(username, contenido);

        if (result.ok) {
            console.log('Mensaje enviado:', result.data);
            mostrarExito('Mensaje enviado correctamente!');
            agregarAlHistorial(contenido);
            
            // Limpiar textarea
            document.getElementById('contenidoMensaje').value = '';
            document.getElementById('charCounter').textContent = '0 / 500 caracteres';
        } else {
            mostrarError(result.data.message || 'Error al enviar el mensaje.');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarError('Error de conexion. Intente nuevamente.');
    } finally {
        enviarBtn.disabled = false;
        btnText.innerHTML = '<i class="fas fa-paper-plane me-2"></i>Enviar Mensaje';
    }
}

// ===== MOSTRAR ERROR =====
function mostrarError(mensaje) {
    const errorAlert = document.getElementById('errorAlert');
    document.getElementById('errorMessage').textContent = mensaje;
    errorAlert.classList.remove('d-none');
    errorAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ===== MOSTRAR ÉXITO =====
function mostrarExito(mensaje) {
    const successAlert = document.getElementById('successAlert');
    document.getElementById('successMessage').textContent = mensaje;
    successAlert.classList.remove('d-none');
    
    setTimeout(() => {
        successAlert.classList.add('d-none');
    }, 5000);
}

// ===== AGREGAR AL HISTORIAL =====
function agregarAlHistorial(contenido) {
    const now = new Date();
    const timeString = now.toLocaleTimeString('es-GT', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    mensajesEnviados.unshift({ contenido, hora: timeString });

    if (mensajesEnviados.length > 5) {
        mensajesEnviados.pop();
    }

    renderizarHistorial();
}

// ===== RENDERIZAR HISTORIAL =====
function renderizarHistorial() {
    const historial = document.getElementById('historialMensajes');
    
    if (mensajesEnviados.length === 0) {
        historial.innerHTML = '';
        return;
    }

    let html = '<h6 class="mt-4 mb-3"><i class="fas fa-history me-2"></i>Ultimos mensajes enviados</h6>';
    
    mensajesEnviados.forEach((msg, index) => {
        html += `
            <div class="mensaje-enviado">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <span class="badge bg-success">#${mensajesEnviados.length - index}</span>
                    <small class="text-muted">${msg.hora}</small>
                </div>
                <p class="mb-0">${escapeHtml(msg.contenido)}</p>
            </div>
        `;
    });

    historial.innerHTML = html;
}

// ===== ESCAPAR HTML =====
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===== CERRAR SESIÓN =====
function cerrarSesion() {
    if (confirm('Esta seguro que desea cerrar sesion?')) {
        Session.cerrar();
        window.location.href = 'login.html';
    }
}