/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/ClientSide/javascript.js to edit this template
 */

// ============================================
// curso.js - Navegación entre módulos + progreso
// ============================================

const LS_EST = 'pa_estudiantes';
const LS_PROG = 'pa_progreso';

// --- Helpers ---
function obtenerEstudiantes() {
    try { return JSON.parse(localStorage.getItem(LS_EST)) || []; }
    catch { return []; }
}

function obtenerIdDeURL() {
    return new URLSearchParams(window.location.search).get('id');
}

// ============================================
// 1. VALIDAR ESTUDIANTE
// ============================================
const idURL = obtenerIdDeURL();
const estudiantes = obtenerEstudiantes();
const estudiante = idURL
    ? estudiantes.find(e => e.id === idURL)
    : JSON.parse(localStorage.getItem('pa_sesion') || 'null');

if (!estudiante) {
    alert('Debes registrarte primero para acceder al curso.');
    window.location.href = 'registro.html';
} else {
    document.getElementById('nombreEstudiante').textContent = estudiante.nombre.split(' ')[0];
    // Actualizar enlaces con el ID
    const btnEval = document.getElementById('btnEvaluacion');
    const btnEval2 = document.getElementById('btnIrEvaluacion');
    if (btnEval)  btnEval.href  = `evaluacion.html?id=${encodeURIComponent(estudiante.id)}`;
    if (btnEval2) btnEval2.href = `evaluacion.html?id=${encodeURIComponent(estudiante.id)}`;
}

// ============================================
// 2. PROGRESO DEL ESTUDIANTE
// ============================================
function claveProgreso() {
    return `${LS_PROG}_${estudiante ? estudiante.id : 'anon'}`;
}

function obtenerProgreso() {
    try { return JSON.parse(localStorage.getItem(claveProgreso())) || []; }
    catch { return []; }
}

function guardarProgreso(arr) {
    localStorage.setItem(claveProgreso(), JSON.stringify(arr));
}

function marcarModuloVisitado(num) {
    const progreso = obtenerProgreso();
    if (!progreso.includes(num)) {
        progreso.push(num);
        guardarProgreso(progreso);
    }
    actualizarUIProgreso();
}

function actualizarUIProgreso() {
    const progreso = obtenerProgreso();
    const total = 6;
    const pct = Math.round((progreso.length / total) * 100);

    document.getElementById('progresoRelleno').style.width = pct + '%';
    document.getElementById('progresoTexto').textContent = `${progreso.length} / ${total} módulos`;

    // Marcar botones completados
    document.querySelectorAll('.modulo-btn').forEach(btn => {
        const num = parseInt(btn.dataset.modulo, 10);
        if (progreso.includes(num)) btn.classList.add('completado');
    });
}

// ============================================
// 3. NAVEGACIÓN ENTRE MÓDULOS
// ============================================
function activarModulo(num) {
    // Botones
    document.querySelectorAll('.modulo-btn').forEach(b => b.classList.remove('activo'));
    const btnActivo = document.querySelector(`.modulo-btn[data-modulo="${num}"]`);
    if (btnActivo) btnActivo.classList.add('activo');

    // Contenidos
    document.querySelectorAll('.modulo-contenido').forEach(c => c.classList.remove('activo'));
    const contenido = document.getElementById('modulo-' + num);
    if (contenido) contenido.classList.add('activo');

    // Marcar visitado
    marcarModuloVisitado(parseInt(num, 10));

    // Scroll top suave
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Click en sidebar
document.querySelectorAll('.modulo-btn').forEach(btn => {
    btn.addEventListener('click', () => activarModulo(btn.dataset.modulo));
});

// Botones "siguiente" / "anterior" dentro del contenido
document.querySelectorAll('[data-ir]').forEach(btn => {
    btn.addEventListener('click', () => activarModulo(btn.dataset.ir));
});

// ============================================
// 4. INICIALIZAR
// ============================================
if (estudiante) {
    actualizarUIProgreso();
    // Marcar el módulo 1 como visitado al entrar
    marcarModuloVisitado(1);
}
