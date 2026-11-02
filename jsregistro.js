/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/ClientSide/javascript.js to edit this template
 */

// ============================================
// registro.js - Validación y guardado de inscripción
// ============================================

const LS_KEY = 'pa_estudiantes';
const form = document.getElementById('formRegistro');

// --- Helpers de localStorage ---
function obtenerEstudiantes() {
    try {
        return JSON.parse(localStorage.getItem(LS_KEY)) || [];
    } catch {
        return [];
    }
}

function guardarEstudiantes(lista) {
    localStorage.setItem(LS_KEY, JSON.stringify(lista));
}

// --- Helpers de validación visual ---
function mostrarError(id, mensaje) {
    const el = document.getElementById('error-' + id);
    if (el) el.textContent = mensaje;
    const input = document.getElementById(id);
    if (input) input.classList.add('error-input');
}

function limpiarError(id) {
    const el = document.getElementById('error-' + id);
    if (el) el.textContent = '';
    const input = document.getElementById(id);
    if (input) input.classList.remove('error-input');
}

function limpiarTodos() {
    ['nombre', 'email', 'telefono', 'edad', 'dpi', 'direccion', 'genero', 'mascota', 'terminos']
        .forEach(limpiarError);
}

// --- Función principal de validación ---
function validar() {
    limpiarTodos();
    let valido = true;
    let primerError = null;

    const nombre     = document.getElementById('nombre').value.trim();
    const email      = document.getElementById('email').value.trim();
    const telefono   = document.getElementById('telefono').value.trim();
    const edad       = document.getElementById('edad').value.trim();
    const dpi        = document.getElementById('dpi').value.trim();
    const direccion  = document.getElementById('direccion').value.trim();
    const genero     = document.querySelector('input[name="genero"]:checked');
    const mascota    = document.getElementById('mascota').value;
    const terminos   = document.getElementById('terminos').checked;

    // Nombre
    if (nombre.length < 3) {
        mostrarError('nombre', 'Ingresa tu nombre completo (mín. 3 caracteres).');
        valido = false; primerError = primerError || 'nombre';
    } else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(nombre)) {
        mostrarError('nombre', 'El nombre solo puede tener letras y espacios.');
        valido = false; primerError = primerError || 'nombre';
    }

    // Email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        mostrarError('email', 'Ingresa un correo válido.');
        valido = false; primerError = primerError || 'email';
    }

    // Teléfono (8 a 15 dígitos)
    const telDigits = telefono.replace(/\D/g, '');
    if (telDigits.length < 8 || telDigits.length > 15) {
        mostrarError('telefono', 'Ingresa un teléfono válido (8 a 15 dígitos).');
        valido = false; primerError = primerError || 'telefono';
    }

    // Edad
    const edadNum = parseInt(edad, 10);
    if (isNaN(edadNum) || edadNum < 5 || edadNum > 100) {
        mostrarError('edad', 'Ingresa una edad válida (entre 5 y 100).');
        valido = false; primerError = primerError || 'edad';
    }

    // DPI (opcional, pero si se llena, 13 dígitos)
    if (dpi && !/^\d{13}$/.test(dpi)) {
        mostrarError('dpi', 'El DPI debe tener 13 dígitos (o déjalo vacío).');
        valido = false; primerError = primerError || 'dpi';
    }

    // Dirección
    if (direccion.length < 5) {
        mostrarError('direccion', 'Ingresa una dirección válida.');
        valido = false; primerError = primerError || 'direccion';
    }

    // Género
    if (!genero) {
        mostrarError('genero', 'Selecciona un género.');
        valido = false; primerError = primerError || 'genero';
    }

    // Mascota
    if (!mascota) {
        mostrarError('mascota', 'Selecciona el tipo de mascota.');
        valido = false; primerError = primerError || 'mascota';
    }

    // Términos
    if (!terminos) {
        mostrarError('terminos', 'Debes aceptar los términos para continuar.');
        valido = false; primerError = primerError || 'terminos';
    }

    return {
        valido,
        primerError,
        datos: {
            nombre,
            email,
            telefono,
            edad: edadNum,
            dpi: dpi || null,
            direccion,
            genero: genero ? genero.value : null,
            mascota
        }
    };
}

// --- Evento submit ---
form.addEventListener('submit', (e) => {
    e.preventDefault();

    const { valido, primerError, datos } = validar();

    if (!valido) {
        const el = document.getElementById(primerError);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.focus({ preventScroll: true });
        }
        return;
    }

    // Generar ID correlativo
    const estudiantes = obtenerEstudiantes();
    const num = estudiantes.length + 1;
    const id = 'EST-2026-' + String(num).padStart(3, '0');

    const nuevoEstudiante = {
        id,
        ...datos,
        curso: 'Cuidado Básico de Mascotas y Tipos de Animales',
        fechaRegistro: new Date().toISOString(),
        estado: 'inscrito'
    };

    estudiantes.push(nuevoEstudiante);
    guardarEstudiantes(estudiantes);

    // Guardar "sesión actual" (por si acaso)
    localStorage.setItem('pa_sesion', JSON.stringify(nuevoEstudiante));

    // Redirigir a confirmación con el ID
    window.location.href = 'confirmacion.html?id=' + encodeURIComponent(id);
});
