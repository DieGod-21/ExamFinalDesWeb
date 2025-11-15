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

    loadingState.classList.remove('d-none');
    emptyState.classList.add('d-none');
    mensajesContainer.classList.add('d-none');
    refreshBtn.innerHTML = '<i class="fas fa-sync-alt fa-spin"></i>';

    try {
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

    // 🔥 USAR LOS NOMBRES REALES DEL BACKEND
    mensajesData.sort((a, b) => new Date(a.Fecha_Envio) - new Date(b.Fecha_Envio));

    mensajesData.forEach((mensaje, index) => {

        const autor = mensaje.Login_Emisor || "Desconocido";
        const contenido = mensaje.Contenido || "(sin contenido)";

        let fecha = new Date(mensaje.Fecha_Envio);
        let hora = fecha.toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' });
        let fechaFormato = fecha.toLocaleDateString('es-GT', { day: '2-digit', month: 'short' });

        const esMio = autor.toLowerCase() === username.toLowerCase();

        const mensajeHTML = `
            <div class="mensaje-item ${esMio ? 'mensaje-propio' : 'mensaje-otro'}"
                 style="animation-delay: ${index * 0.1}s">
                <div class="mensaje-content">
                    <div class="mensaje-header">
                        <span class="mensaje-autor">
                            <i class="fas fa-user-circle me-1"></i>
                            ${autor}
                        </span>
                        <span class="mensaje-fecha">
                            ${fechaFormato} - ${hora}
                        </span>
                    </div>
                    <div class="mensaje-texto">${escapeHtml(contenido)}</div>
                </div>
            </div>
        `;

        container.innerHTML += mensajeHTML;
    });

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