/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/ClientSide/javascript.js to edit this template
 */

// ============================================
// admin.js - Login + Panel de administración
// ============================================

const LS_EST = 'pa_estudiantes';
const LS_RES = 'pa_resultados';
const LS_ADMIN = 'pa_admin_sesion';

const CREDENCIALES = {
    usuario: 'admin',
    password: '2026'
};

// ============================================
// HELPERS
// ============================================
function obtenerEstudiantes() {
    try { return JSON.parse(localStorage.getItem(LS_EST)) || []; }
    catch { return []; }
}

function obtenerResultados() {
    try { return JSON.parse(localStorage.getItem(LS_RES)) || []; }
    catch { return []; }
}

function formatearFecha(iso) {
    const fecha = new Date(iso);
    return fecha.toLocaleDateString('es-GT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// ============================================
// 1. LOGIN
// ============================================
const formLogin = document.getElementById('formLogin');
const loginContenedor = document.getElementById('loginContenedor');
const panelContenedor = document.getElementById('panelContenedor');
const adminBadge = document.getElementById('adminBadge');
const btnLogout = document.getElementById('btnLogout');

function iniciarSesion() {
    loginContenedor.style.display = 'none';
    panelContenedor.style.display = 'block';
    adminBadge.style.display = 'inline-block';
    btnLogout.style.display = 'inline-block';
    cargarPanel();
}

function cerrarSesion() {
    sessionStorage.removeItem(LS_ADMIN);
    loginContenedor.style.display = 'flex';
    panelContenedor.style.display = 'none';
    adminBadge.style.display = 'none';
    btnLogout.style.display = 'none';
    formLogin.reset();
    document.getElementById('error-login').textContent = '';
}

formLogin.addEventListener('submit', (e) => {
    e.preventDefault();
    const usuario = document.getElementById('usuario').value.trim();
    const password = document.getElementById('password').value;
    const errorEl = document.getElementById('error-login');

    if (usuario === CREDENCIALES.usuario && password === CREDENCIALES.password) {
        sessionStorage.setItem(LS_ADMIN, 'activo');
        errorEl.textContent = '';
        iniciarSesion();
    } else {
        errorEl.textContent = '❌ Usuario o contraseña incorrectos.';
    }
});

btnLogout.addEventListener('click', cerrarSesion);

// Verificar si ya hay sesión al cargar
if (sessionStorage.getItem(LS_ADMIN) === 'activo') {
    iniciarSesion();
}

// ============================================
// 2. CARGAR PANEL
// ============================================
function cargarPanel() {
    actualizarEstadisticas();
    renderEstudiantes();
    renderResultados();
}

// ============================================
// 3. ESTADÍSTICAS
// ============================================
function actualizarEstadisticas() {
    const estudiantes = obtenerEstudiantes();
    const resultados = obtenerResultados();

    const aprobados = resultados.filter(r => r.aprobado).length;
    const promedio = resultados.length
        ? Math.round(resultados.reduce((sum, r) => sum + r.nota, 0) / resultados.length)
        : 0;

    document.getElementById('statEstudiantes').textContent = estudiantes.length;
    document.getElementById('statIntentos').textContent = resultados.length;
    document.getElementById('statAprobados').textContent = aprobados;
    document.getElementById('statPromedio').textContent = promedio;
}

// ============================================
// 4. TABLA ESTUDIANTES
// ============================================
function renderEstudiantes(filtro = '') {
    const estudiantes = obtenerEstudiantes();
    const tbody = document.getElementById('tbodyEstudiantes');
    const vacio = document.getElementById('vacioEstudiantes');

    const filtroLower = filtro.toLowerCase().trim();
    const filtrados = estudiantes.filter(e =>
        !filtroLower ||
        e.nombre.toLowerCase().includes(filtroLower) ||
        e.email.toLowerCase().includes(filtroLower) ||
        e.id.toLowerCase().includes(filtroLower)
    );

    if (filtrados.length === 0) {
        tbody.innerHTML = '';
        vacio.style.display = 'block';
        vacio.textContent = estudiantes.length === 0
            ? 'No hay estudiantes registrados aún.'
            : 'No se encontraron coincidencias.';
        return;
    }

    vacio.style.display = 'none';

    tbody.innerHTML = filtrados.map(e => `
        <tr>
            <td><strong>${e.id}</strong></td>
            <td>${e.nombre}</td>
            <td>${e.email}</td>
            <td>${e.telefono}</td>
            <td>${e.edad} años</td>
            <td>${e.mascota}</td>
            <td>${formatearFecha(e.fechaRegistro)}</td>
        </tr>
    `).join('');
}

// ============================================
// 5. TABLA RESULTADOS
// ============================================
function renderResultados(filtroTexto = '', filtroEstado = 'todos') {
    const resultados = obtenerResultados();
    const tbody = document.getElementById('tbodyResultados');
    const vacio = document.getElementById('vacioResultados');

    const filtroLower = filtroTexto.toLowerCase().trim();

    const filtrados = resultados.filter(r => {
        // Filtro de texto
        const coincideTexto = !filtroLower ||
            r.nombre.toLowerCase().includes(filtroLower) ||
            r.id.toLowerCase().includes(filtroLower) ||
            r.estudianteId.toLowerCase().includes(filtroLower);

        // Filtro de estado
        const coincideEstado =
            filtroEstado === 'todos' ||
            (filtroEstado === 'aprobados' && r.aprobado) ||
            (filtroEstado === 'reprobados' && !r.aprobado);

        return coincideTexto && coincideEstado;
    });

    // Ordenar por fecha descendente (más reciente primero)
    filtrados.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    if (filtrados.length === 0) {
        tbody.innerHTML = '';
        vacio.style.display = 'block';
        vacio.textContent = resultados.length === 0
            ? 'No hay resultados registrados aún.'
            : 'No se encontraron coincidencias.';
        return;
    }

    vacio.style.display = 'none';

    tbody.innerHTML = filtrados.map(r => `
        <tr>
            <td><strong>${r.id}</strong></td>
            <td>${r.nombre}<br><small style="color:#888;">${r.estudianteId}</small></td>
            <td><span class="badge badge--nota">${r.nota}</span></td>
            <td>${r.correctas} / ${r.totalPreguntas}</td>
            <td>
                <span class="badge ${r.aprobado ? 'badge--aprobado' : 'badge--reprobado'}">
                    ${r.aprobado ? 'Aprobado' : 'Reprobado'}
                </span>
            </td>
            <td>${formatearFecha(r.fecha)}</td>
            <td>
                <button class="btn-ver" data-resultado="${r.id}">Ver detalle</button>
            </td>
        </tr>
    `).join('');

    // Asignar eventos a botones "Ver detalle"
    document.querySelectorAll('.btn-ver').forEach(btn => {
        btn.addEventListener('click', () => abrirDetalle(btn.dataset.resultado));
    });
}

// ============================================
// 5.1 EXPORTAR RESULTADOS A CSV
// ============================================
function exportarResultadosCSV(filtroTexto = '', filtroEstado = 'todos') {
    const resultados = obtenerResultados();

    // Aplicar mismos filtros que la tabla
    const filtroLower = filtroTexto.toLowerCase().trim();
    const filtrados = resultados.filter(r => {
        const coincideTexto = !filtroLower ||
            r.nombre.toLowerCase().includes(filtroLower) ||
            r.id.toLowerCase().includes(filtroLower) ||
            r.estudianteId.toLowerCase().includes(filtroLower);

        const coincideEstado =
            filtroEstado === 'todos' ||
            (filtroEstado === 'aprobados' && r.aprobado) ||
            (filtroEstado === 'reprobados' && !r.aprobado);

        return coincideTexto && coincideEstado;
    });

    if (filtrados.length === 0) {
        alert('No hay resultados para exportar con los filtros actuales.');
        return;
    }

    // Ordenar por fecha descendente
    filtrados.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    // Encabezados del CSV
    const headers = [
        'ID Resultado',
        'ID Estudiante',
        'Nombre',
        'Correo',
        'Curso',
        'Nota',
        'Correctas',
        'Total Preguntas',
        'Estado',
        'Fecha',
        'Pregunta 1',
        'Pregunta 2',
        'Pregunta 3',
        'Pregunta 4',
        'Pregunta 5',
        'Pregunta 6'
    ];

    // Escapar valores para CSV (comillas dobles, punto y coma, saltos de línea)
    function escapar(valor) {
        if (valor === null || valor === undefined) return '';
        const s = String(valor);
        if (/[",;\n\r]/.test(s)) {
            return '"' + s.replace(/"/g, '""') + '"';
        }
        return s;
    }

    // Convertir respuesta a texto legible
    function textoRespuesta(resp) {
        if (Array.isArray(resp)) {
            return resp.length ? resp.join(' | ') : 'Sin responder';
        }
        return resp || 'Sin responder';
    }

    // Filas
    const filas = filtrados.map(r => {
        const resp = r.respuestas || {};
        return [
            r.id,
            r.estudianteId,
            r.nombre,
            r.email,
            r.curso,
            r.nota,
            r.correctas,
            r.totalPreguntas,
            r.aprobado ? 'Aprobado' : 'Reprobado',
            formatearFecha(r.fecha),
            textoRespuesta(resp.p1),
            textoRespuesta(resp.p2),
            textoRespuesta(resp.p3),
            textoRespuesta(resp.p4),
            textoRespuesta(resp.p5),
            textoRespuesta(resp.p6)
        ].map(escapar).join(';');
    });

    // Unir encabezado + filas
    const csv = [headers.join(';'), ...filas].join('\r\n');

    // BOM UTF-8 para que Excel en español muestre bien los acentos
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    // Nombre del archivo con fecha
    const fechaArchivo = new Date().toISOString().slice(0, 10);
    const nombreArchivo = `resultados_petacademy_${fechaArchivo}.csv`;

    // Descarga
    const a = document.createElement('a');
    a.href = url;
    a.download = nombreArchivo;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// ============================================
// 6. MODAL DETALLE
// ============================================
const PREGUNTAS_TEXTO = {
    1: '¿Cada cuánto se recomienda bañar a un perro sano?',
    2: '¿Cuáles alimentos son tóxicos para perros?',
    3: '¿Cuál es un animal silvestre símbolo de Guatemala?',
    4: '¿Cuánto ejercicio diario necesita un perro activo?',
    5: '¿Qué señales indican enfermedad?',
    6: '¿A qué edad se recomienda la primera visita al veterinario?'
};

function abrirDetalle(idResultado) {
    const resultado = obtenerResultados().find(r => r.id === idResultado);
    if (!resultado) return;

    const modal = document.getElementById('modalDetalle');
    const contenido = document.getElementById('modalDetalleContenido');

    contenido.innerHTML = `
        <div class="detalle-modal">
            <h2>${resultado.nombre}</h2>
            <p class="detalle-modal__sub">Detalle de la evaluación ${resultado.id}</p>

            <div class="detalle-modal__info">
                <div><strong>Estudiante ID</strong>${resultado.estudianteId}</div>
                <div><strong>Correo</strong>${resultado.email}</div>
                <div><strong>Nota</strong>${resultado.nota} / 100</div>
                <div><strong>Correctas</strong>${resultado.correctas} / ${resultado.totalPreguntas}</div>
                <div><strong>Estado</strong>${resultado.aprobado ? '✅ Aprobado' : '❌ Reprobado'}</div>
                <div><strong>Fecha</strong>${formatearFecha(resultado.fecha)}</div>
            </div>

            <h3 style="font-family:var(--fuente-titulo); color:var(--verde); margin-bottom:15px;">
                Respuestas
            </h3>
            <ul class="detalle-modal__preguntas">
                ${resultado.detalle.map(d => `
                    <li>
                        <span class="icono">${d.correcta ? '✅' : '❌'}</span>
                        <div class="texto">
                            <strong>${d.pregunta}.</strong> ${PREGUNTAS_TEXTO[d.pregunta] || ''}
                            <small>Respuesta: ${formatearRespuesta(d.respuesta)}</small>
                        </div>
                    </li>
                `).join('')}
            </ul>
        </div>
    `;

    modal.classList.add('activo');
}

function formatearRespuesta(respuesta) {
    if (Array.isArray(respuesta)) {
        return respuesta.length ? respuesta.join(', ') : 'Sin responder';
    }
    return respuesta || 'Sin responder';
}

document.getElementById('btnCerrarModal').addEventListener('click', () => {
    document.getElementById('modalDetalle').classList.remove('activo');
});

// Cerrar modal al hacer click fuera
document.getElementById('modalDetalle').addEventListener('click', (e) => {
    if (e.target.id === 'modalDetalle') {
        e.target.classList.remove('activo');
    }
});

// ============================================
// 7. TABS
// ============================================
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('activo'));
        document.querySelectorAll('.tab-contenido').forEach(c => c.classList.remove('activo'));

        tab.classList.add('activo');
        document.getElementById('tab-' + tab.dataset.tab).classList.add('activo');
    });
});

// ============================================
// 8. BÚSQUEDAS Y FILTROS
// ============================================
document.getElementById('buscarEstudiante').addEventListener('input', (e) => {
    renderEstudiantes(e.target.value);
});

document.getElementById('buscarResultado').addEventListener('input', (e) => {
    const estado = document.getElementById('filtroEstado').value;
    renderResultados(e.target.value, estado);
});

document.getElementById('filtroEstado').addEventListener('change', (e) => {
    const texto = document.getElementById('buscarResultado').value;
    renderResultados(texto, e.target.value);
});

// ============================================
// 9. EXPORTAR CSV
// ============================================
document.getElementById('btnExportarCSV').addEventListener('click', () => {
    const texto = document.getElementById('buscarResultado').value;
    const estado = document.getElementById('filtroEstado').value;
    exportarResultadosCSV(texto, estado);
});