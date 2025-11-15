// ===== VARIABLES GLOBALES =====
let mensajesData = [];
const username = Session.getUsername() || 'Invitado';

// ===== INICIALIZACIÓN =====
window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('sidebarUsername').textContent = username;
    cargarMensajes();
});

// ===== CARGAR MENSAJES =====
async function cargarMensajes() {
    const loadingState = document.getElementById('loadingState');
    const emptyState = document.getElementById('emptyState');
    const mensajesContainer = document.getElementById('mensajesContainer');
    const refreshBtn = document.getElementById('refreshBtn');

    // Mostrar loading
    loadingState.classList.remove('d-none');
    emptyState.classList.add('d-none');
    mensajesContainer.classList.add('d-none');
    refreshBtn.innerHTML = '<i class="fas fa-sync-alt fa-spin"></i>';

    try {
        // Llamar al API usando api.js
        const result = await API.obtenerMensajes();

        if (result.ok && result.data.length > 0) {
            mensajesData = result.data;
            renderizarMensajes();
            loadingState.classList.add('d-none');
            mensajesContainer.classList.remove('d-none');
        } else {
            loadingState.classList.add('d-none');
            emptyState.classList.remove('d-none');
        }

        // Actualizar contador
        document.getElementById('totalMensajes').innerHTML = 
            `<i class="fas fa-envelope me-1"></i>${mensajesData.length} mensajes`;

    } catch (error) {
        console.error('Error al cargar mensajes:', error);
        loadingState.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-triangle me-2"></i>
                Error al cargar mensajes. Intente nuevamente.
            </div>
        `;
    } finally {
        refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i>';
    }
}

// ===== RENDERIZAR MENSAJES =====
function renderizarMensajes() {
    const container = document.getElementById('mensajesContainer');
    container.innerHTML = '';

    // Ordenar por fecha (más antiguos primero)
    mensajesData.sort((a, b) => new Date(a.fecha_hora) - new Date(b.fecha_hora));

    mensajesData.forEach((mensaje, index) => {
        const esMio = mensaje.login_emisor === username;
        const fecha = new Date(mensaje.fecha_hora);
        const hora = fecha.toLocaleTimeString('es-GT', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        const fechaFormato = fecha.toLocaleDateString('es-GT', {
            day: '2-digit',
            month: 'short'
        });

        const mensajeHTML = `
            <div class="mensaje-item ${esMio ? 'mensaje-propio' : 'mensaje-otro'}" 
                 style="animation-delay: ${index * 0.1}s">
                <div class="mensaje-content">
                    <div class="mensaje-header">
                        <span class="mensaje-autor">
                            <i class="fas fa-user-circle me-1"></i>
                            ${mensaje.login_emisor}
                        </span>
                        <span class="mensaje-fecha">
                            ${fechaFormato} - ${hora}
                        </span>
                    </div>
                    <div class="mensaje-texto">
                        ${escapeHtml(mensaje.contenido)}
                    </div>
                </div>
            </div>
        `;

        container.innerHTML += mensajeHTML;
    });

    // Scroll al final
    setTimeout(() => {
        container.scrollTop = container.scrollHeight;
    }, 100);
}

// ===== ESCAPAR HTML =====
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===== IR A ENVIAR MENSAJE =====
function irAEnviar() {
    window.location.href = '/views/message.html';
}

// ===== CERRAR SESIÓN =====
function cerrarSesion() {
    if (confirm('Esta seguro que desea cerrar sesion?')) {
        Session.cerrar();
        window.location.href = '/views/login.html';
    }
}

// ===== AUTO-REFRESH =====
setInterval(() => {
    cargarMensajes();
}, 10000);