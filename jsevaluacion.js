/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/ClientSide/javascript.js to edit this template
 */

// ============================================
// evaluacion.js - Validación, calificación y guardado
// ============================================

const LS_EST = 'pa_estudiantes';
const LS_RES = 'pa_resultados';

// ============================================
// RESPUESTAS CORRECTAS (clave del examen)
// ============================================
const RESPUESTAS_CORRECTAS = {
    1: 'b',                                        // Cada 4-6 semanas
    2: ['chocolate', 'uvas', 'cebolla'],           // Checkbox (todas obligatorias)
    3: 'quetzal',
    4: 'c',                                        // 1.5 a 2 horas
    5: ['letargo', 'vomitos', 'apetito'],          // Checkbox (todas obligatorias)
    6: '2meses'
};

const TOTAL_PREGUNTAS = 6;

// ============================================
// HELPERS DE STORAGE
// ============================================
function obtenerEstudiantes() {
    try { return JSON.parse(localStorage.getItem(LS_EST)) || []; }
    catch { return []; }
}

function obtenerResultados() {
    try { return JSON.parse(localStorage.getItem(LS_RES)) || []; }
    catch { return []; }
}

function guardarResultados(arr) {
    localStorage.setItem(LS_RES, JSON.stringify(arr));
}

// ============================================
// VALIDAR ESTUDIANTE
// ============================================
const idURL = new URLSearchParams(window.location.search).get('id');
const estudiantes = obtenerEstudiantes();
const estudiante = idURL
    ? estudiantes.find(e => e.id === idURL)
    : JSON.parse(localStorage.getItem('pa_sesion') || 'null');

if (!estudiante) {
    alert('Debes registrarte primero para acceder a la evaluación.');
    window.location.href = 'registro.html';
} else {
    document.getElementById('nombreEstudiante').textContent = estudiante.nombre.split(' ')[0];
}

// ============================================
// VALIDACIÓN DEL FORMULARIO
// ============================================
function obtenerRespuestas() {
    const respuestas = {};

    // P1 - Radio
    const p1 = document.querySelector('input[name="p1"]:checked');
    respuestas.p1 = p1 ? p1.value : null;

    // P2 - Checkbox
    respuestas.p2 = [...document.querySelectorAll('input[name="p2"]:checked')].map(i => i.value);

    // P3 - Select
    respuestas.p3 = document.getElementById('p3').value || null;

    // P4 - Radio
    const p4 = document.querySelector('input[name="p4"]:checked');
    respuestas.p4 = p4 ? p4.value : null;

    // P5 - Checkbox
    respuestas.p5 = [...document.querySelectorAll('input[name="p5"]:checked')].map(i => i.value);

    // P6 - Select
    respuestas.p6 = document.getElementById('p6').value || null;

    return respuestas;
}

function validarRespuestas(respuestas) {
    let todoOk = true;
    const errores = {};

    for (let i = 1; i <= TOTAL_PREGUNTAS; i++) {
        const r = respuestas['p' + i];
        const vacia = Array.isArray(r) ? r.length === 0 : !r;

        if (vacia) {
            errores['p' + i] = 'Debes responder esta pregunta.';
            todoOk = false;
        }
    }

    return { todoOk, errores };
}

function mostrarErrores(errores) {
    // Limpiar
    for (let i = 1; i <= TOTAL_PREGUNTAS; i++) {
        document.getElementById('error-p' + i).textContent = '';
        document.querySelector(`.pregunta[data-pregunta="${i}"]`).classList.remove('con-error');
    }

    // Mostrar
    Object.entries(errores).forEach(([clave, msg]) => {
        const id = clave; // ej: p1
        const errorEl = document.getElementById('error-' + id);
        if (errorEl) errorEl.textContent = msg;
        const preg = document.querySelector(`.pregunta[data-pregunta="${id.replace('p', '')}"]`);
        if (preg) preg.classList.add('con-error');
    });

    // Scroll a la primera con error
    const primerError = Object.keys(errores)[0];
    if (primerError) {
        const preg = document.querySelector(`.pregunta[data-pregunta="${primerError.replace('p', '')}"]`);
        if (preg) preg.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// ============================================
// CALIFICACIÓN
// ============================================
function calificar(respuestas) {
    let correctas = 0;
    const detalle = [];

    for (let i = 1; i <= TOTAL_PREGUNTAS; i++) {
        const clave = 'p' + i;
        const respuesta = respuestas[clave];
        const correcta = RESPUESTAS_CORRECTAS[i];

        let esCorrecta = false;

        if (Array.isArray(correcta)) {
            // Checkbox: debe tener exactamente las mismas (ni más ni menos)
            if (Array.isArray(respuesta)) {
                const setResp = [...respuesta].sort();
                const setCorr = [...correcta].sort();
                esCorrecta = JSON.stringify(setResp) === JSON.stringify(setCorr);
            }
        } else {
            // Radio/Select
            esCorrecta = respuesta === correcta;
        }

        if (esCorrecta) correctas++;
        detalle.push({ pregunta: i, correcta: esCorrecta, respuesta });
    }

    // Nota: cada pregunta vale 100/6 ≈ 16.67
    const nota = Math.round((correctas / TOTAL_PREGUNTAS) * 100);
    const aprobado = nota >= 70;

    return { correctas, nota, aprobado, detalle };
}

// ============================================
// PROGRESO VISUAL (en vivo)
// ============================================
function actualizarProgreso() {
    const r = obtenerRespuestas();
    let respondidas = 0;

    for (let i = 1; i <= TOTAL_PREGUNTAS; i++) {
        const resp = r['p' + i];
        const vacia = Array.isArray(resp) ? resp.length === 0 : !resp;
        if (!vacia) respondidas++;

        // Marcar pregunta como respondida
        const preg = document.querySelector(`.pregunta[data-pregunta="${i}"]`);
        if (preg) preg.classList.toggle('respondida', !vacia);
    }

    const pct = (respondidas / TOTAL_PREGUNTAS) * 100;
    document.getElementById('evalProgreso').style.width = pct + '%';
    document.getElementById('evalProgresoTexto').textContent = `${respondidas} / ${TOTAL_PREGUNTAS} respondidas`;
}

// Escuchar cambios en todos los inputs
document.querySelectorAll('#formEvaluacion input, #formEvaluacion select').forEach(el => {
    el.addEventListener('change', actualizarProgreso);
    el.addEventListener('input', actualizarProgreso);
});

// Inicializar
actualizarProgreso();

// ============================================
// SUBMIT
// ============================================
const form = document.getElementById('formEvaluacion');
let ultimoResultado = null;

form.addEventListener('submit', (e) => {
    e.preventDefault();

    const respuestas = obtenerRespuestas();
    const { todoOk, errores } = validarRespuestas(respuestas);

    if (!todoOk) {
        mostrarErrores(errores);
        return;
    }

    // Limpiar errores
    mostrarErrores({});

    // Calificar
    const { correctas, nota, aprobado, detalle } = calificar(respuestas);

    // Guardar en localStorage
    const resultados = obtenerResultados();
    const num = resultados.length + 1;
    const idResultado = 'RES-2026-' + String(num).padStart(3, '0');

    const nuevoResultado = {
        id: idResultado,
        estudianteId: estudiante.id,
        nombre: estudiante.nombre,
        email: estudiante.email,
        curso: estudiante.curso,
        respuestas,
        correctas,
        totalPreguntas: TOTAL_PREGUNTAS,
        nota,
        aprobado,
        detalle,
        fecha: new Date().toISOString()
    };

    resultados.push(nuevoResultado);
    guardarResultados(resultados);

    ultimoResultado = nuevoResultado;

    // Mostrar modal
    mostrarModal(nuevoResultado);
});

// ============================================
// MODAL DE RESULTADO
// ============================================
function mostrarModal(r) {
    const modal = document.getElementById('modalCalificacion');
    const icono = document.getElementById('modalIcono');
    const titulo = document.getElementById('modalTitulo');
    const nota = document.getElementById('modalNota');
    const detalle = document.getElementById('modalDetalle');

    if (r.aprobado) {
        icono.textContent = '🎉';
        titulo.textContent = '¡Felicidades, aprobaste!';
        titulo.style.color = 'var(--verde)';
        nota.style.color = 'var(--naranja)';
    } else {
        icono.textContent = '😢';
        titulo.textContent = 'No aprobaste esta vez';
        titulo.style.color = '#E53935';
        nota.style.color = '#E53935';
    }

    nota.textContent = r.nota;
    detalle.innerHTML = `Respondiste correctamente <strong>${r.correctas} de ${r.totalPreguntas}</strong> preguntas.<br>
        ${r.aprobado ? 'Puedes ver tu diploma ahora mismo.' : 'Necesitas 70 puntos o más. ¡Inténtalo de nuevo!'}`;

    modal.classList.add('activo');
}

// ============================================
// BOTÓN "VER MI DIPLOMA"
// ============================================
document.getElementById('btnVerResultado').addEventListener('click', () => {
    if (!ultimoResultado) return;
    window.location.href = 'resultado.html?id=' + encodeURIComponent(ultimoResultado.id);
});
