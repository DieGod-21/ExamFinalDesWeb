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

    // ORDENAR: Más recientes primero (DESC)
    mensajesData.sort((a, b) => new Date(b.Fecha_Envio) - new Date(a.Fecha_Envio));

        mensajesData.forEach((mensaje, index) => {
        const autor = mensaje.Login_Emisor || "Desconocido";
        const contenido = mensaje.Contenido || "(sin contenido)";

        let fecha = new Date(mensaje.Fecha_Envio);
        fecha.setHours(fecha.getHours() + 6);

        let hora = fecha.toLocaleTimeString('es-GT', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        });
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
        container.scrollTop = 0;
    }, 100);
}

// ===== AUTO-REFRESH CADA 1 MINUTO =====
setInterval(() => {
    cargarMensajes();
}, 60000);

// ===== ESCAPAR HTML =====
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===== IR A ENVIAR MENSAJE (ABRE MODAL) =====
function irAEnviar() {
    abrirModal();
}

// ===== ABRIR MODAL =====
function abrirModal() {
    document.getElementById('modalUsername').textContent = username;
    document.getElementById('modalMensaje').value = '';
    document.getElementById('modalCharCount').textContent = '0';
    document.getElementById('modalError').classList.add('d-none');
    document.getElementById('modalSuccess').classList.add('d-none');
    document.getElementById('modalEnviar').classList.remove('d-none');
    
    // Contador de caracteres
    const textarea = document.getElementById('modalMensaje');
    textarea.oninput = function() {
        document.getElementById('modalCharCount').textContent = this.value.length;
    };
}

// ===== CERRAR MODAL =====
function cerrarModal() {
    document.getElementById('modalEnviar').classList.add('d-none');
}

// ===== CERRAR MODAL AL HACER CLIC FUERA =====
function cerrarModalFuera(event) {
    if (event.target.id === 'modalEnviar') {
        cerrarModal();
    }
}

// ===== ENVIAR MENSAJE DESDE MODAL =====
async function enviarMensajeModal() {
    const contenido = document.getElementById('modalMensaje').value.trim();
    const btnEnviar = document.getElementById('btnEnviarModal');
    const errorDiv = document.getElementById('modalError');
    const successDiv = document.getElementById('modalSuccess');
    
    errorDiv.classList.add('d-none');
    successDiv.classList.add('d-none');
    
    if (!contenido) {
        errorDiv.textContent = 'Por favor escriba un mensaje';
        errorDiv.classList.remove('d-none');
        return;
    }
    
    if (contenido.length < 3) {
        errorDiv.textContent = 'El mensaje debe tener al menos 3 caracteres';
        errorDiv.classList.remove('d-none');
        return;
    }
    
    btnEnviar.disabled = true;
    btnEnviar.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Enviando...';
    
    try {
        const result = await API.enviarMensaje(username, contenido);
        
        if (result.ok) {
            successDiv.textContent = 'Mensaje enviado correctamente!';
            successDiv.classList.remove('d-none');
            
            document.getElementById('modalMensaje').value = '';
            document.getElementById('modalCharCount').textContent = '0';
            
            setTimeout(() => {
                cargarMensajes();
                cerrarModal();
            }, 1500);
        } else {
            errorDiv.textContent = result.data.message || 'Error al enviar mensaje';
            errorDiv.classList.remove('d-none');
        }
    } catch (error) {
        console.error('Error:', error);
        errorDiv.textContent = 'Error de conexion. Intente nuevamente.';
        errorDiv.classList.remove('d-none');
    } finally {
        btnEnviar.disabled = false;
        btnEnviar.innerHTML = '<i class="fas fa-paper-plane me-2"></i>Enviar';
    }
}

// ===== CERRAR SESIÓN =====
function cerrarSesion() {
    if (confirm('Esta seguro que desea cerrar sesion?')) {
        Session.cerrar();
        window.location.href = '/views/login.html';
    }
}

