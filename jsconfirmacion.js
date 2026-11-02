/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/ClientSide/javascript.js to edit this template
 */

// ============================================
// confirmacion.js - Mostrar datos del estudiante registrado
// ============================================

const LS_KEY = 'pa_estudiantes';

function obtenerEstudiantes() {
    try {
        return JSON.parse(localStorage.getItem(LS_KEY)) || [];
    } catch {
        return [];
    }
}

function obtenerIdDeURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

function renderizar() {
    const id = obtenerIdDeURL();
    const estudiantes = obtenerEstudiantes();

    // Buscar por ID de la URL, si no, usar la sesión actual
    const est = id
        ? estudiantes.find(e => e.id === id)
        : JSON.parse(localStorage.getItem('pa_sesion') || 'null');

    const card = document.getElementById('confirmacionCard');

    if (!est) {
        card.classList.add('confirmacion-card--error');
        card.innerHTML = `
            <div class="confirmacion-card__icono">⚠️</div>
            <h1>No encontramos tu registro</h1>
            <p class="confirmacion-card__sub">Por favor, vuelve a completar el formulario.</p>
            <a href="registro.html" class="btn btn--primario">Ir al registro</a>
        `;
        return;
    }

    // Datos a mostrar
    const campos = [
        ['ID de estudiante', est.id],
        ['Nombre completo', est.nombre],
        ['Correo electrónico', est.email],
        ['Teléfono', est.telefono],
        ['Edad', est.edad + ' años'],
        ['DPI', est.dpi || 'No proporcionado'],
        ['Dirección', est.direccion],
        ['Género', est.genero],
        ['Mascota', est.mascota],
        ['Curso', est.curso]
    ];

    document.getElementById('datosGrid').innerHTML = campos
        .map(([label, valor]) => `
            <div class="dato">
                <span class="dato__label">${label}</span>
                <span class="dato__valor">${valor}</span>
            </div>
        `).join('');

    // Botones
    document.getElementById('btnCurso').href = 'curso.html?id=' + encodeURIComponent(est.id);
}

renderizar();
