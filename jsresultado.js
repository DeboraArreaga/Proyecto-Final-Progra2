/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/ClientSide/javascript.js to edit this template
 */

// ============================================
// resultado.js - Muestra nota + diploma + impresión
// ============================================

const LS_RES = 'pa_resultados';

// ============================================
// TEXTO DE LAS PREGUNTAS (para el detalle)
// ============================================
const PREGUNTAS_TEXTO = {
    1: '¿Cada cuánto se recomienda bañar a un perro sano de pelo corto?',
    2: '¿Cuáles de estos alimentos son tóxicos para perros?',
    3: '¿Cuál es un animal silvestre símbolo de Guatemala?',
    4: '¿Cuánto ejercicio diario necesita un perro adulto de raza activa?',
    5: '¿Qué señales indican que tu mascota podría estar enferma?',
    6: '¿A qué edad se recomienda la primera visita al veterinario?'
};

// Mapa de valores a texto legible (para el detalle)
const VALORES_TEXTO = {
    // P1
    a: 'Cada semana', b: 'Cada 4 a 6 semanas', c: 'Cada año', d: 'Nunca',
    // P2 / P5
    chocolate: 'Chocolate', uvas: 'Uvas y pasas', pollo: 'Pollo cocido',
    cebolla: 'Cebolla y ajo',
    letargo: 'Letargo o debilidad', come: 'Come con normalidad',
    vomitos: 'Vómitos frecuentes', juega: 'Juega normal',
    apetito: 'Falta de apetito por +24 h',
    // P3
    perro: 'Perro', quetzal: 'Quetzal', gallina: 'Gallina', vaca: 'Vaca',
    // P4
    // (reutiliza a, b, c, d pero con otros textos)
    // P6
    '1mes': '1 mes', '2meses': '2 meses', '6meses': '6 meses', '1año': '1 año'
};

// Texto específico por pregunta para valores ambiguos (a,b,c,d)
function textoRespuesta(pregunta, valor) {
    if (Array.isArray(valor)) {
        return valor.map(v => VALORES_TEXTO[v] || v).join(', ') || 'Sin responder';
    }
    // Casos especiales donde a/b/c/d significan cosas distintas por pregunta
    if (pregunta === 1) {
        const map1 = { a: 'Cada semana', b: 'Cada 4 a 6 semanas', c: 'Cada año', d: 'Nunca' };
        return map1[valor] || valor;
    }
    if (pregunta === 4) {
        const map4 = { a: '15 minutos', b: '30 minutos', c: '1.5 a 2 horas', d: '5 horas' };
        return map4[valor] || valor;
    }
    return VALORES_TEXTO[valor] || valor || 'Sin responder';
}

// ============================================
// HELPERS
// ============================================
function obtenerResultados() {
    try { return JSON.parse(localStorage.getItem(LS_RES)) || []; }
    catch { return []; }
}

function obtenerResultado() {
    const id = new URLSearchParams(window.location.search).get('id');
    const resultados = obtenerResultados();
    if (id) return resultados.find(r => r.id === id);
    // Si no hay ID, tomar el último
    return resultados[resultados.length - 1] || null;
}

function formatearFecha(iso) {
    const fecha = new Date(iso);
    return fecha.toLocaleDateString('es-GT', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

// ============================================
// RENDER
// ============================================
const resultado = obtenerResultado();
const contenedor = document.getElementById('resultadoContenedor');

if (!resultado) {
    // Sin resultado → mensaje
    contenedor.innerHTML = `
        <div class="resultado-header reprobado" style="padding:60px 30px;">
            <div class="resultado-header__icono">⚠️</div>
            <h1 class="resultado-header__titulo">No encontramos tu resultado</h1>
            <p class="resultado-header__subtitulo">Aún no has realizado la evaluación.</p>
            <a href="evaluacion.html" class="btn btn--primario btn--grande">Ir a la evaluación 🎓</a>
        </div>
    `;
} else {
    renderEncabezado(resultado);
    renderDetalle(resultado);
    renderDiploma(resultado);
    configurarBotones(resultado);
}

// ============================================
// 1. ENCABEZADO CON NOTA
// ============================================
function renderEncabezado(r) {
    const header = document.getElementById('resultadoHeader');
    const esAprobado = r.aprobado;

    header.classList.add(esAprobado ? 'aprobado' : 'reprobado');

    header.innerHTML = `
        <div class="resultado-header__icono">${esAprobado ? '🎉' : '😢'}</div>
        <h1 class="resultado-header__titulo">
            ${esAprobado ? '¡Felicidades, aprobaste!' : 'No aprobaste esta vez'}
        </h1>
        <p class="resultado-header__subtitulo">
            ${esAprobado
                ? 'Has completado exitosamente el curso.'
                : 'Necesitas 70 puntos o más para aprobar. ¡No te rindas!'}
        </p>

        <div class="resultado-header__nota-caja">
            <div class="resultado-header__nota">${r.nota}</div>
            <div class="resultado-header__nota-label">puntos / 100</div>
        </div>

        <div class="resultado-header__info">
            <span>✅ Correctas: <strong>${r.correctas} / ${r.totalPreguntas}</strong></span>
            <span>📅 Fecha: <strong>${formatearFecha(r.fecha)}</strong></span>
            <span>🆔 Resultado: <strong>${r.id}</strong></span>
        </div>
    `;
}

// ============================================
// 2. DETALLE DE RESPUESTAS
// ============================================
function renderDetalle(r) {
    const lista = document.getElementById('detalleLista');

    lista.innerHTML = r.detalle.map(d => {
        const textoPregunta = PREGUNTAS_TEXTO[d.pregunta] || 'Pregunta ' + d.pregunta;
        const textoResp = textoRespuesta(d.pregunta, d.respuesta);

        return `
            <div class="detalle-item ${d.correcta ? 'correcta' : 'incorrecta'}">
                <span class="detalle-item__icono">${d.correcta ? '✅' : '❌'}</span>
                <div class="detalle-item__contenido">
                    <div class="detalle-item__pregunta">${d.pregunta}. ${textoPregunta}</div>
                    <div class="detalle-item__respuesta">Tu respuesta: ${textoResp}</div>
                </div>
                <span class="detalle-item__estado">${d.correcta ? 'Correcta' : 'Incorrecta'}</span>
            </div>
        `;
    }).join('');
}

// ============================================
// 3. DIPLOMA
// ============================================
function renderDiploma(r) {
    document.getElementById('diplomaNombre').textContent = r.nombre;
    document.getElementById('diplomaCurso').textContent = r.curso;
    document.getElementById('diplomaNota').textContent = r.nota;
    document.getElementById('diplomaID').textContent = r.id;
    document.getElementById('diplomaFecha').textContent = formatearFecha(r.fecha);

    // Si no aprobó, mostramos aviso en el diploma
    if (!r.aprobado) {
        const diploma = document.getElementById('diploma');
        diploma.innerHTML = `
            <div class="diploma__marco" style="text-align:center;">
                <div class="diploma__logo">🐾 PetAcademy Guatemala</div>
                <div style="font-size:4rem; margin:30px 0;">😢</div>
                <h2 style="font-family:var(--fuente-titulo); color:#E53935; margin-bottom:15px;">
                    Diploma no disponible
                </h2>
                <p style="color:var(--texto-suave); margin-bottom:20px;">
                    Obtuviste <strong>${r.nota} puntos</strong>. Necesitas al menos 70 para obtener tu diploma.
                </p>
                <p style="color:var(--texto-suave);">
                    ¡Inténtalo de nuevo, estás cerca!
                </p>
            </div>
        `;
    }
}

// ============================================
// 4. BOTONES
// ============================================
function configurarBotones(r) {
    // Botón imprimir
    const btnImprimir = document.getElementById('btnImprimir');
    if (btnImprimir) {
        if (r.aprobado) {
            btnImprimir.addEventListener('click', () => {
                window.print();
            });
        } else {
            // Si no aprobó, deshabilitar el botón de imprimir
            btnImprimir.disabled = true;
            btnImprimir.style.opacity = '0.5';
            btnImprimir.style.cursor = 'not-allowed';
            btnImprimir.textContent = '🖨️ Diploma no disponible';
        }
    }

    // Botón reintentar (pasa el id del estudiante)
    const btnReintentar = document.getElementById('btnReintentar');
    if (btnReintentar) {
        btnReintentar.href = `evaluacion.html?id=${encodeURIComponent(r.estudianteId)}`;
    }
}
