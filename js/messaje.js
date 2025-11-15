let mensajesEnviados = [];

// Verificar autenticación al cargar
window.addEventListener('DOMContentLoaded', () => {
    const token = Session.getToken();
    const username = Session.getUsername();

    if (token && username) {
        // Usuario autenticado
        document.getElementById('usuarioActual').textContent = username;
        document.getElementById('authView').classList.remove('d-none');
        console.log('Usuario autenticado:', username);
    } else {
        // Sin autenticación
        document.getElementById('noAuthView').classList.remove('d-none');
        console.log('Usuario no autenticado. Redirigir a login.');
    }
});

// Contador de caracteres
document.addEventListener('DOMContentLoaded', () => {
    const textarea = document.getElementById('contenidoMensaje');
    const counter = document.getElementById('charCounter');

    textarea.addEventListener('input', () => {
        const length = textarea.value.length;
        counter.textContent = `${length} / 500 caracteres`;

        // Cambiar color según longitud
        counter.classList.remove('warning', 'danger');
        if (length > 450) {
            counter.classList.add('danger');
        } else if (length > 400) {
            counter.classList.add('warning');
        }
    });
});

// Función principal para enviar mensaje
async function enviarMensaje() {
    const contenido = document.getElementById('contenidoMensaje').value.trim();
    const username = Session.getUsername();
    const enviarBtn = document.getElementById('enviarBtn');
    const btnText = document.getElementById('btnText');
    const errorAlert = document.getElementById('errorAlert');
    const successAlert = document.getElementById('successAlert');

    // Limpiar alertas previas
    errorAlert.classList.add('d-none');
    successAlert.classList.add('d-none');

    // Validación de contenido
    if (!contenido) {
        mostrarError('Por favor escriba un mensaje antes de enviar.');
        return;
    }

    if (contenido.length < 3) {
        mostrarError('El mensaje debe tener al menos 3 caracteres.');
        return;
    }

    // Deshabilitar botón y mostrar loading
    enviarBtn.disabled = true;
    btnText.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Enviando...';

    try {
        const result = await API.enviarMensaje(username, contenido);

        if (result.ok) {
            // Éxito
            console.log('Mensaje enviado exitosamente:', result.data);
            mostrarExito('Mensaje enviado correctamente!');
            
            // Agregar a historial
            agregarAlHistorial(contenido);
            
            // Limpiar textarea
            document.getElementById('contenidoMensaje').value = '';
            document.getElementById('charCounter').textContent = '0 / 500 caracteres';
            
        } else {
            // Error del servidor
            console.error('Error del servidor:', result.data);
            mostrarError(result.data.message || 'Error al enviar el mensaje. Intente nuevamente.');
        }

    } catch (error) {
        // Error de conexión
        console.error('Error en la peticion:', error);
        mostrarError('Error de conexion. Verifique su internet e intente nuevamente.');
    } finally {
        // Rehabilitar botón
        enviarBtn.disabled = false;
        btnText.innerHTML = '<i class="fas fa-paper-plane me-2"></i>Enviar Mensaje';
    }
}

// Función para mostrar errores
function mostrarError(mensaje) {
    const errorAlert = document.getElementById('errorAlert');
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = mensaje;
    errorAlert.classList.remove('d-none');
    
    // Scroll hacia la alerta
    errorAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Función para mostrar éxito
function mostrarExito(mensaje) {
    const successAlert = document.getElementById('successAlert');
    const successMessage = document.getElementById('successMessage');
    successMessage.textContent = mensaje;
    successAlert.classList.remove('d-none');
    
    // Ocultar después de 5 segundos
    setTimeout(() => {
        successAlert.classList.add('d-none');
    }, 5000);
}

// Función para agregar mensaje al historial
function agregarAlHistorial(contenido) {
    const now = new Date();
    const timeString = now.toLocaleString('es-GT', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    mensajesEnviados.unshift({
        contenido: contenido,
        hora: timeString,
        fecha: now
    });

    // Mantener solo los últimos 5 mensajes
    if (mensajesEnviados.length > 5) {
        mensajesEnviados.pop();
    }

    renderizarHistorial();
}

// Función para renderizar historial
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

// Función para escapar HTML (seguridad)
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Función para cerrar sesión
function cerrarSesion() {
    if (confirm('¿Esta seguro que desea cerrar sesion?')) {
        Session.cerrar();
        window.location.href = '/views/login.html';
    }
}

// Permitir enviar con Ctrl+Enter
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('contenidoMensaje').addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'Enter') {
            enviarMensaje();
        }
    });
});
