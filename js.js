//  Mapeo de claves internas para los trimestres
// ----------------------

// Este objeto relaciona los nombres legibles de los trimestres con claves internas más cortas
// que se utilizan como identificadores únicos para los documentos en Firestore.
const clavesTrimestre = {
    "1er Trimestre": "t1",
    "2do Trimestre": "t2",
    "3er Trimestre": "t3"
};

// Este objeto es el inverso de 'clavesTrimestre' y se utiliza para mostrar los nombres legibles
// de los trimestres a partir de sus claves internas.
const nombresTrimestre = {
    t1: "1er Trimestre",
    t2: "2do Trimestre",
    t3: "3er Trimestre"
};

// Esta variable controla si el modo administrador está activado.
// Solo el administrador puede realizar acciones como agregar fechas o modificar asistencia.
let modoAdministradorActivo = false;
let seleccionActual = null;

window.auth.onAuthStateChanged(user => {
    modoAdministradorActivo = Boolean(user);
    document.getElementById('cerrar-sesion').classList.toggle('oculto', !user);
    document.getElementById('estado-sesion').textContent = user ?
        `Sesión iniciada: ${user.email}` :
        'Inicia sesión con la cuenta asignada por la institución.';
    if (seleccionActual) {
        const { carrera, anio, trimestre } = seleccionActual;
        mostrarTablaAsistencia(carrera, anio, trimestre);
    }
});

// ----------------------
// Función para activar el modo administrador
// ----------------------

function activarModoAdministrador() {
    document.getElementById('acceso-docente').classList.toggle('oculto');
}

async function iniciarSesionDocente() {
    const correo = document.getElementById('correo-docente').value.trim();
    const contrasena = document.getElementById('contrasena-docente').value;
    try {
        await window.auth.signInWithEmailAndPassword(correo, contrasena);
        document.getElementById('contrasena-docente').value = '';
        document.getElementById('acceso-docente').classList.add('oculto');
    } catch (error) {
        alert('No se pudo iniciar sesión. Revisa el correo y la contraseña.');
    }
}

async function cerrarSesionDocente() {
    await window.auth.signOut();
}

// ----------------------
//  Función para crear una lista predeterminada de 45 estudiantes
// ----------------------

function crearListaEstudiantesPorDefecto() {
    const estudiantes = [];
    // Bucle for: se repite desde 1 hasta 45
    for (let i = 1; i <= 45; i++) {
        // .push(): método de los arrays que agrega un nuevo elemento al final
        // Se agrega un objeto con dos propiedades:
        // nombre: un texto como "Estudiante 1", "Estudiante 2", etc.
        // asistencia: un objeto vacío que luego almacenará las marcas de asistencia por fecha
        estudiantes.push({ nombre: `Estudiante ${i}`, asistencia: {} });
    }
    return estudiantes; // Devuelve el arreglo completo de 45 estudiantes
}

// ----------------------
// Función para mostrar los años disponibles según la carrera seleccionada
// ----------------------

document.getElementById('carreras').addEventListener('click', event => {
    const tarjeta = event.target.closest('[data-carrera]');
    if (tarjeta) mostrarAnios(tarjeta.dataset.carrera);
});

function mostrarAnios(carrera) {
    const contenido = document.getElementById('contenido');
    const vista = document.getElementById('plantilla-anios').content.cloneNode(true);
    vista.querySelector('[data-titulo]').textContent = carrera;
    vista.querySelectorAll('[data-anio]').forEach(tarjeta => {
        tarjeta.addEventListener('click', () => mostrarTrimestres(carrera, tarjeta.dataset.anio));
    });
    contenido.replaceChildren(vista);
}

// ----------------------
//  Función para mostrar los trimestres disponibles según la carrera y el año
// ----------------------

function mostrarTrimestres(carrera, anio) {
    const contenido = document.getElementById('contenido');
    const vista = document.getElementById('plantilla-trimestres').content.cloneNode(true);
    vista.querySelector('[data-titulo]').textContent = `${carrera} - ${anio}`;
    vista.querySelectorAll('[data-trimestre]').forEach(tarjeta => {
        tarjeta.addEventListener('click', () => {
            mostrarTablaAsistencia(carrera, anio, tarjeta.dataset.trimestre);
        });
    });
    contenido.replaceChildren(vista);
}
/**
 * BASE DE DATOS Función principal que muestra la tabla de asistencia para un grupo específico.
 * Carga datos de Firestore, crea la tabla con fechas y estudiantes, cuando se van registrando o accediendo desde el modo
 * administrador. si en caso no se registran datos se crea de manera automatica una lista con 45 estudiantes
 * y maneja la interfaz para agregar fechas y marcar asistencia si el modo admin está activo.
 */
async function mostrarTablaAsistencia(carrera, anio, trimestre) {
    seleccionActual = { carrera, anio, trimestre };
    const contenido = document.getElementById('contenido');
    contenido.innerHTML = `<h2>${carrera} - ${anio} - ${trimestre}</h2>`; // Título de la tabla

    const clave = `${carrera}_${anio}_${clavesTrimestre[trimestre]}`; // Clave para Firestore
    const docRef = window.db.collection("asistencia").doc(clave); // Referencia al documento Firestore

    let datos;
    const snap = await docRef.get(); // Obtener documento de Firestore (espera la respuesta)
    if (snap.exists) {
        datos = snap.data(); // Si existe, obtener los datos
    } else {
        datos = {
            estudiantes: crearListaEstudiantesPorDefecto(), // Si no existe, crear lista por defecto hace llamado a la funcion creada anteriormente
            fechas: [], // Y muestra la lista vacía de fechas
            docente: { nombre: '', telefono: '' }
        };
        await docRef.set(datos); // Guardar datos iniciales en Firestore
    }

    // El contacto se guarda una sola vez por carrera y año, no en cada trimestre.
    const claveGrupo = `${carrera}_${anio}`;
    const contactoRef = window.db.collection('contactos_docentes').doc(claveGrupo);
    let docente = null;
    try {
        const contactoSnap = await contactoRef.get();
        docente = contactoSnap.exists ? contactoSnap.data() : null;
    } catch (error) {
        console.warn('No se pudo leer contactos_docentes. Revisa las reglas de Firestore.', error);
    }

    // Compatibilidad con los contactos guardados anteriormente dentro de un trimestre.
    if (!docente || (!docente.nombre && !docente.telefono)) {
        docente = datos.docente || { nombre: '', telefono: '' };
        if (!docente.nombre && !docente.telefono) {
            for (const codigo of Object.values(clavesTrimestre)) {
                const antiguo = await window.db.collection('asistencia').doc(`${claveGrupo}_${codigo}`).get();
                const contactoAntiguo = antiguo.exists ? antiguo.data().docente : null;
                if (contactoAntiguo && (contactoAntiguo.nombre || contactoAntiguo.telefono)) {
                    docente = contactoAntiguo;
                    break;
                }
            }
        }
    }

    const contacto = document.createElement('section');
    contacto.className = 'contacto-docente';
    if (modoAdministradorActivo) {
        contacto.innerHTML = `<h3>Contacto del docente</h3>
            <label for="nombre-docente">Nombre completo</label>
            <input id="nombre-docente" type="text" maxlength="80" placeholder="Ej.: María Pérez" value="${escapeHtml(docente.nombre || '')}">
            <label for="telefono-docente">Teléfono de contacto</label>
            <input id="telefono-docente" type="tel" maxlength="20" placeholder="Ej.: +591 70000000" value="${escapeHtml(docente.telefono || '')}">
            <small>Incluye el código de país para que las familias puedan llamar.</small>
            <button class="boton" onclick="guardarContactoDocente('${claveGrupo}')">Guardar contacto</button>`;
    } else if (docente.nombre || docente.telefono) {
        const telefono = (docente.telefono || '').replace(/[^\d+]/g, '');
        contacto.innerHTML = `<h3>Contacto del docente</h3>${docente.nombre ? `<p class="nombre-contacto">${escapeHtml(docente.nombre)}</p>` : ''}${telefono ? `<a class="telefono-contacto" href="tel:${telefono}">${escapeHtml(docente.telefono)}</a>` : ''}`;
    }
    if (contacto.innerHTML) contenido.appendChild(contacto);

    // Si el modo administrador está activo, mostrar controles para agregar fechas
    if (modoAdministradorActivo) {
        const contenedorFecha = document.createElement('div'); // Crear un contenedor nuevo para fechas
        contenedorFecha.style.margin = '1rem 0'; // Margen arriba y abajo

        const entradaFecha = document.createElement('input'); // Crear input para seleccionar fecha
        entradaFecha.type = 'date'; // Tipo input: selector de fecha
        entradaFecha.valueAsDate = new Date(); // Valor por defecto: hoy
        entradaFecha.className = 'boton'; // Clase para estilizar como botón
        entradaFecha.style.marginRight = '0.5rem'; // Margen derecho para separar del botón

        const botonAgregarFecha = document.createElement('button'); // Crear botón para agregar fecha
        botonAgregarFecha.textContent = 'Agregar Fecha'; // Texto del botón
        botonAgregarFecha.className = 'boton'; // Clase CSS para estilos

        // Al hacer clic, agrega la fecha seleccionada si no está ya en la lista
        botonAgregarFecha.onclick = async() => {
            // La fecha viene en formato 'YYYY-MM-DD', la convertimos a 'DD/MM/YYYY'
            const fecha = entradaFecha.value.split('-').reverse().join('/');
            if (!datos.fechas.includes(fecha)) { // Verificar si la fecha no existe ya
                datos.fechas.push(fecha); // Agregar la fecha al array
                await docRef.update({ fechas: datos.fechas }); // Actualizar Firestore con nuevas fechas
                mostrarTablaAsistencia(carrera, anio, trimestre); // Recargar tabla para actualizar vista
            } else {
                alert("Esa fecha ya está registrada."); // Mensaje si la fecha ya está en la lista
            }
        };

        contenedorFecha.appendChild(entradaFecha); // Añadir input al contenedor
        contenedorFecha.appendChild(botonAgregarFecha); // Añadir botón al contenedor
        contenido.appendChild(contenedorFecha); // Añadir contenedor al contenido principal
    }

    // Crear tabla HTML para mostrar asistencia
    const tabla = document.createElement('table');
    const encabezado = document.createElement('thead');
    let filaEncabezado = '<tr><th>#</th><th>Nombre</th>'; // Primera fila con columnas # y Nombre

    // Añadir columnas de fechas
    datos.fechas.forEach((fecha, i) => {
        if (modoAdministradorActivo) {
            // En modo admin, mostrar fecha con botón para eliminar fecha
            filaEncabezado += `<th>${fecha}<br><button onclick="eliminarFecha('${clave}', ${i})" style="font-size:10px; color:red;">Eliminar</button></th>`;
        } else {
            // En modo usuario, solo mostrar fecha sin botones
            filaEncabezado += `<th>${fecha}</th>`;
        }
    });
    filaEncabezado += '</tr>';
    encabezado.innerHTML = filaEncabezado;
    tabla.appendChild(encabezado);

    // Crear cuerpo de la tabla para estudiantes y sus asistencias
    const cuerpo = document.createElement('tbody');

    // Por cada estudiante, crear una fila
    datos.estudiantes.forEach((est, i) => {
        const fila = document.createElement('tr');
        // Si modo admin activo, el nombre se muestra en un input editable
        let celdaNombre = modoAdministradorActivo ?
            `<input type="text" value="${est.nombre}" onchange="actualizarNombreEstudiante('${clave}', ${i}, this.value)" style="width: 100%; border: none; background: transparent; font-weight: bold;">` :
            est.nombre; // Si no, se muestra texto simple

        let contenidoFila = `<td>${i + 1}</td><td>${celdaNombre}</td>`; // Número y nombre del estudiante

        // Por cada fecha, mostrar asistencia o selector para cambiarla
        datos.fechas.forEach(fecha => {
            const marca = est.asistencia[fecha] || ''; // Obtener marca de asistencia para esa fecha (✓, X o vacío)
            if (modoAdministradorActivo) {
                // En admin, mostrar selector para marcar asistencia
                contenidoFila += `<td><select onchange="actualizarAsistencia('${clave}', ${i}, '${fecha}', this.value)">
                    <option value=""></option>
                    <option value="✓" ${marca === '✓' ? 'selected' : ''}>✓</option>
                    <option value="X" ${marca === 'X' ? 'selected' : ''}>X</option>
                    <option value="L" ${marca === 'L' ? 'selected' : ''}>L</option>
                </select></td>`;
            } else {
                // En usuario, solo mostrar la marca con color según tipo
                contenidoFila += `<td class="${marca === '✓' ? 'verde' : marca === 'X' ? 'rojo' : marca === 'L' ? 'azul' : ''}">${marca}</td>`;
            }
        });

        fila.innerHTML = contenidoFila; // Insertar la fila completa en HTML
        cuerpo.appendChild(fila); // Añadir fila al cuerpo de la tabla
    });

    tabla.appendChild(cuerpo); // Añadir cuerpo a la tabla
    contenido.appendChild(tabla); // Mostrar tabla en el contenido principal
}

function escapeHtml(valor) {
    return String(valor).replace(/[&<>"']/g, caracter => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[caracter]);
}

async function guardarContactoDocente(claveGrupo) {
    const nombre = document.getElementById('nombre-docente').value.trim();
    const telefono = document.getElementById('telefono-docente').value.trim();
    if (!nombre) return alert('Escribe el nombre del docente.');
    
    try {
        await window.db.collection('contactos_docentes').doc(claveGrupo).set({ nombre, telefono });
        alert('Contacto guardado para los tres trimestres de este año.');
        const { carrera, anio, trimestre } = seleccionActual;
        mostrarTablaAsistencia(carrera, anio, trimestre);
    } catch (error) {
        alert('No se pudo guardar el contacto. Verifica el acceso a Firestore.');
    }
}

/**
 * Actualiza la asistencia de un estudiante en Firestore.
 * @param {string} clave - Documento Firestore (clave única).
 * @param {number} i - Índice del estudiante en el array.
 * @param {string} fecha - Fecha específica a modificar.
 * @param {string} valor - Nueva marca de asistencia ('✓', 'X' o 'L').
 */
async function actualizarAsistencia(clave, i, fecha, valor) {
    const ref = window.db.collection("asistencia").doc(clave); // Referencia al documento
    const snap = await ref.get(); // Obtener documento
    if (!snap.exists) return; // Si no existe, salir
    const data = snap.data(); // Obtener datos actuales
    data.estudiantes[i].asistencia[fecha] = valor; // Actualizar la asistencia en el objeto
    await ref.update({ estudiantes: data.estudiantes }); // Guardar cambios en Firestore
}

/**
 * Actualiza el nombre de un estudiante en Firestore.
 * @param {string} clave - Documento Firestore.
 * @param {number} i - Índice del estudiante.
 * @param {string} nombre - Nuevo nombre para el estudiante.
 */
async function actualizarNombreEstudiante(clave, i, nombre) {
    const ref = window.db.collection("asistencia").doc(clave);
    const snap = await ref.get();
    if (!snap.exists) return;
    const data = snap.data();
    data.estudiantes[i].nombre = nombre; // Cambiar nombre
    await ref.update({ estudiantes: data.estudiantes });
}

/**
 * Elimina una fecha de asistencia de Firestore y de todos los estudiantes.
 * @param {string} clave - Documento Firestore.
 * @param {number} iFecha - Índice de la fecha a eliminar.
 */
async function eliminarFecha(clave, iFecha) {
    const ref = window.db.collection("asistencia").doc(clave);
    const snap = await ref.get();
    if (!snap.exists) return;
    const data = snap.data();
    const fechaEliminada = data.fechas.splice(iFecha, 1)[0]; // Remover fecha del array
    if (!confirm(`¿Seguro que deseas eliminar ${fechaEliminada}? También se borrarán las marcas de asistencia de ese día.`)) return;
    data.estudiantes.forEach(e => delete e.asistencia[fechaEliminada]); // Eliminar la marca en cada estudiante
    await ref.update({ fechas: data.fechas, estudiantes: data.estudiantes }); // Actualizar Firestore

    // Extraer carrera, año y trimestre para recargar la tabla actualizada
    const [carrera, anio, codTri] = clave.split('_');
    mostrarTablaAsistencia(carrera, anio, nombresTrimestre[codTri]);
}