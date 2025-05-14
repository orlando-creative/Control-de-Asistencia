// ----------------------
// 🔁 Mapeo de claves internas para los trimestres
// ----------------------

// Un objeto literal que mapea el nombre legible del trimestre a una clave corta interna (string)
const clavesTrimestre = {
    "1er Trimestre": "t1",
    "2do Trimestre": "t2",
    "3er Trimestre": "t3"
};

// Otro objeto literal, pero esta vez mapea de clave interna a nombre completo
const nombresTrimestre = {
    t1: "1er Trimestre",
    t2: "2do Trimestre",
    t3: "3er Trimestre"
};

// ----------------------
// 🔐 Variable booleana que indica si el modo administrador está activo
// ----------------------
let modoAdministradorActivo = false;

// ----------------------
// 🔑 Función para activar el modo administrador solicitando una contraseña
// ----------------------
function activarModoAdministrador() {
    // prompt() muestra un cuadro de entrada de texto y devuelve lo que el usuario escribe
    const contraseña = prompt("Introduce la contraseña de administrador:");

    // Condicional if-else para validar la contraseña
    if (contraseña === "admin123") {
        // Si es correcta, activamos el modo admin
        modoAdministradorActivo = true;
        alert("Modo administrador activado.");
    } else {
        alert("Contraseña incorrecta.");
    }
}

// ----------------------
// 🧰 Función para mostrar el panel de administración (interfaz de selección)
// ----------------------
// Array para almacenar las carreras (se cargará desde localStorage)

// Array para almacenar las carreras (se cargará desde localStorage)
// Array para almacenar las carreras (se cargará desde localStorage)
let carreras = [];

function generarColorPastelAleatorio() {
    const r = Math.floor(Math.random() * 106 + 150);
    const g = Math.floor(Math.random() * 106 + 150);
    const b = Math.floor(Math.random() * 106 + 150);
    return `rgb(${r}, ${g}, ${b})`;
}

function guardarCarrera(nombreCarrera) {
    if (nombreCarrera && nombreCarrera.trim() !== "" && !carreras.some(c => c && c.nombre === nombreCarrera)) {
        const nuevoColor = generarColorPastelAleatorio();
        carreras.push({ nombre: nombreCarrera, color: nuevoColor });
        carreras.sort((a, b) => {
            if (a && b && a.nombre && b.nombre) {
                return a.nombre.localeCompare(b.nombre);
            }
            return 0; // Mantener el orden si alguna propiedad falta
        });
        localStorage.setItem("carreras", JSON.stringify(carreras));
        mostrarCarrerasEnInicio();
        actualizarOpcionesAdminCarrera();
    }
}

function cargarCarrerasGuardadas() {
    const storedCarreras = JSON.parse(localStorage.getItem('carreras'));
    if (storedCarreras && Array.isArray(storedCarreras)) {
        carreras = storedCarreras.map(c => {
            return { nombre: c ? c.nombre : null, color: c ? c.color || generarColorPastelAleatorio() : generarColorPastelAleatorio() };
        }).filter(c => c.nombre); // Filtrar elementos con nombre nulo
    } else {
        carreras = [];
    }
    mostrarCarrerasEnInicio();
    actualizarOpcionesAdminCarrera();
}

function agregarTarjetaCarreraInicio(carrera) {
    const contenedorCarrerasInicio = document.getElementById('carreras');
    const nuevaTarjeta = document.createElement('div');
    nuevaTarjeta.className = 'tarjeta';
    nuevaTarjeta.textContent = carrera.nombre;
    nuevaTarjeta.style.cursor = 'pointer';
    nuevaTarjeta.style.backgroundColor = carrera.color;
        nuevaTarjeta.onclick = function() {
        mostrarAnios(carrera.nombre); // Asegúrate de que se llame a mostrarAnios con el nombre correcto
    };
    

    // Botón de eliminar (solo visible en modo administrador)
    if (modoAdministradorActivo) {
        const botonEliminar = document.createElement('button');
        botonEliminar.textContent = '❌';
        botonEliminar.className = 'boton-eliminar';
        botonEliminar.onclick = function(event) {
            event.stopPropagation();
            eliminarCarrera(carrera.nombre, nuevaTarjeta);
        };
        nuevaTarjeta.appendChild(botonEliminar);
    }

    contenedorCarrerasInicio.appendChild(nuevaTarjeta);
}

function mostrarCarrerasEnInicio() {
    const contenedorCarrerasInicio = document.getElementById('carreras');
    if (contenedorCarrerasInicio) {
        contenedorCarrerasInicio.innerHTML = '';
        carreras.forEach(carrera => {
            if (carrera && carrera.nombre) {
                agregarTarjetaCarreraInicio(carrera);
            }
        });
    } else {
        console.error("Error: El elemento con ID 'carreras' no se encontró.");
    }
}

function eliminarCarrera(nombre, elemento) {
    if (confirm(`¿Estás seguro de que deseas eliminar la carrera "${nombre}"?`)) {
        carreras = carreras.filter(c => c && c.nombre !== nombre);
        localStorage.setItem('carreras', JSON.stringify(carreras));
        elemento.remove();
        mostrarCarrerasEnInicio();
        actualizarOpcionesAdminCarrera();
    }
}

function actualizarOpcionesAdminCarrera() {
    const selectAdminCarrera = document.getElementById('adminCarrera');
    if (selectAdminCarrera) {
        selectAdminCarrera.innerHTML = '';
        carreras.forEach(carrera => {
            if (carrera && carrera.nombre) {
                const opcion = document.createElement('option');
                opcion.value = carrera.nombre;
                opcion.textContent = carrera.nombre;
                selectAdminCarrera.appendChild(opcion);
            }
        });
    }
}

function mostrarPanelAdministrador() {
    const contenido = document.getElementById('contenido');
    if (contenido) {
        if (!modoAdministradorActivo) {
            alert("Debes activar el modo administrador.");
            contenido.innerHTML = ''; // Limpiar el contenido si no está en modo admin
            return;
        }

        contenido.innerHTML = `
            <h2>🛠 Panel de Administración</h2>
            <p>Selecciona la carrera, año y trimestre que deseas reiniciar.</p>
            <label>Carrera:
                <select id="adminCarrera">
                    ${carreras.filter(c => c && c.nombre).map(carrera => `<option value="${carrera.nombre}">${carrera.nombre}</option>`).join('')}
                </select>
            </label>
            <br><br>
            <label>Año:
                <select id="adminAnio">
                    <option>4to</option>
                    <option>5to</option>
                    <option>6to</option>
                </select>
            </label>
            <br><br>
            <label>Trimestre:
                <select id="adminTrimestre">
                    <option>1er Trimestre</option>
                    <option>2do Trimestre</option>
                    <option>3er Trimestre</option>
                </select>
            </label>
            <br><br>
            <button onclick="reiniciarDesdePanel()" class="boton" style="background-color: #d9534f;">❌ Eliminar datos</button>
        `;
    } else {
        console.error("Error: El elemento con ID 'contenido' no se encontró.");
    }
}

function crearCarrera() {
        if (!modoAdministradorActivo) {
        alert("Debes activar el modo administrador.");
        contenido.innerHTML = ''; // Limpiar el contenido si no está en modo admin
        return;
    }
    const nombreCarrera = prompt("Introduce el nombre de la nueva carrera:");
    guardarCarrera(nombreCarrera); // La validación se hace dentro de guardarCarrera
}

function mostrarInicio() {
    const contenido = document.getElementById('contenido');
    if (contenido) {
        contenido.innerHTML = '';
    } else {
        console.error("Error: El elemento con ID 'contenido' no se encontró.");
    }
    mostrarCarrerasEnInicio();
}

function reiniciarDesdePanel() {
    const carreraSelect = document.getElementById('adminCarrera');
    const anioSelect = document.getElementById('adminAnio');
    const trimestreSelect = document.getElementById('adminTrimestre');

    if (!carreraSelect || !anioSelect || !trimestreSelect) {
        alert("Error: No se encontraron los elementos del panel de administración.");
        return;
    }

    const carrera = carreraSelect.value;
    const anio = anioSelect.value;
    const trimestre = trimestreSelect.value;
    const claveTrimestre = clavesTrimestre[trimestre]; // Asegúrate de que clavesTrimestre esté definido

    if (!claveTrimestre) {
        alert("Error: Trimestre no válido.");
        return;
    }

    const claveAlmacenamiento = `${carrera}_${anio}_${claveTrimestre}`;

    const confirmar = confirm(`¿Seguro que deseas eliminar todos los datos de asistencia para:\n\n${carrera} - ${anio} - ${trimestre} ?`);
    if (!confirmar) return;

    localStorage.removeItem(claveAlmacenamiento);
    localStorage.removeItem(claveAlmacenamiento + '_fechas');

    alert(`Datos eliminados para ${carrera} - ${anio} - ${trimestre}`);
    mostrarAnios(carrera); // Volvemos a la vista de los años para esa carrera
}

// ----------------------
// 📋 Función que crea una lista por defecto con 45 estudiantes ficticios
// ----------------------
function crearListaEstudiantesPorDefecto() {
    const estudiantes = [];

    // for loop: itera del 1 al 45
    for (let i = 1; i <= 45; i++) {
        estudiantes.push({
            nombre: `Estudiante ${i}`,
            asistencia: {} // objeto vacío que almacenará fechas como claves y ✓/X como valores
        });
    }

    return estudiantes;
}

// ----------------------
// 🗂 Función que muestra los años escolares disponibles para una carrera
// ----------------------
function mostrarAnios(carrera) {
    const contenido = document.getElementById('contenido');
    if (contenido) {
        contenido.innerHTML = `
            <h2>${carrera}</h2>
            <div class='cuadricula'>
                <div class="tarjeta" onclick="mostrarTrimestres('${carrera}', '4to')">4to de Secundaria</div>
                <div class="tarjeta" onclick="mostrarTrimestres('${carrera}', '5to')">5to de Secundaria</div>
                <div class="tarjeta" onclick="mostrarTrimestres('${carrera}', '6to')">6to de Secundaria</div>
            </div>`;
    } else {
        console.error("Error: El elemento con ID 'contenido' no se encontró en mostrarAnios.");
    }
}

function mostrarTrimestres(carrera, anio) {
    const contenido = document.getElementById('contenido');
    if (contenido) {
        contenido.innerHTML = `
            <h2>${carrera} - ${anio}</h2>
            <div class='cuadricula'>
                <div class="tarjeta" onclick="mostrarTablaAsistencia('${carrera}', '${anio}', '1er Trimestre')">1er Trimestre</div>
                <div class="tarjeta" onclick="mostrarTablaAsistencia('${carrera}', '${anio}', '2do Trimestre')">2do Trimestre</div>
                <div class="tarjeta" onclick="mostrarTablaAsistencia('${carrera}', '${anio}', '3er Trimestre')">3er Trimestre</div>
            </div>`;
    } else {
        console.error("Error: El elemento con ID 'contenido' no se encontró en mostrarTrimestres.");
    }
}

function mostrarTablaAsistencia(carrera, anio, trimestre) {
    const contenido = document.getElementById('contenido');
    if (contenido) {
        contenido.innerHTML = `<h2>${carrera} - ${anio} - ${trimestre}</h2>`;

        const claveTrimestre = clavesTrimestre[trimestre];
        const claveAlmacenamiento = `${carrera}_${anio}_${claveTrimestre}`;

        // Cargar estudiantes
        let listaEstudiantes = JSON.parse(localStorage.getItem(claveAlmacenamiento));
        if (!listaEstudiantes) {
            listaEstudiantes = crearListaEstudiantesPorDefecto(); // genera 45 estudiantes
            localStorage.setItem(claveAlmacenamiento, JSON.stringify(listaEstudiantes));
        }

        // Cargar fechas
        const fechas = JSON.parse(localStorage.getItem(claveAlmacenamiento + '_fechas')) || [];

        // ✅ Bloque para agregar fechas si está activo el modo administrador
        if (modoAdministradorActivo) {
            const contenedorFecha = document.createElement('div');
            contenedorFecha.style.margin = '1rem 0';

            const entradaFecha = document.createElement('input');
            entradaFecha.type = 'date';
            entradaFecha.valueAsDate = new Date();
            entradaFecha.style.marginRight = '0.5rem';
            entradaFecha.className = 'boton';

            const botonAgregarFecha = document.createElement('button');
            botonAgregarFecha.textContent = 'Agregar Fecha';
            botonAgregarFecha.className = 'boton';

            // ✅ Evento correctamente asignado (sin duplicar)
            botonAgregarFecha.onclick = () => {
                const fechaSeleccionada = entradaFecha.value;
                if (fechaSeleccionada) {
                    const [anioStr, mesStr, diaStr] = fechaSeleccionada.split('-');
                    const fechaObjeto = new Date(parseInt(anioStr), parseInt(mesStr) - 1, parseInt(diaStr));

                    const dia = String(fechaObjeto.getDate()).padStart(2, '0');
                    const mes = String(fechaObjeto.getMonth() + 1).padStart(2, '0');
                    const anioFecha = fechaObjeto.getFullYear();
                    const fechaFormateada = `${dia}/${mes}/${anioFecha}`; // DD/MM/YYYY

                    let fechasActualizadas = JSON.parse(localStorage.getItem(claveAlmacenamiento + '_fechas')) || [];

                    if (!fechasActualizadas.includes(fechaFormateada)) {
                        fechasActualizadas.push(fechaFormateada);
                        localStorage.setItem(claveAlmacenamiento + '_fechas', JSON.stringify(fechasActualizadas));

                        // ✅ Volvemos a cargar la tabla con la nueva fecha
                        mostrarTablaAsistencia(carrera, anio, trimestre);
                    } else {
                        alert("Esa fecha ya está en la lista.");
                    }
                }
            };

            contenedorFecha.appendChild(entradaFecha);
            contenedorFecha.appendChild(botonAgregarFecha);
            contenido.appendChild(contenedorFecha);
        }

        // Crear tabla
        const tabla = document.createElement('table');
        tabla.style.width = '70%'; // Añadido para asegurar que la tabla ocupe el ancho completo

        // ---------- ENCABEZADO ----------
        const encabezado = document.createElement('thead');
        let filaEncabezado = '<tr><th style="width: 5%;">Número</th><th style="width: 25%;">Nombre</th>'; //anchos

        fechas.forEach((fecha, indiceFecha) => {
            if (modoAdministradorActivo) {
                filaEncabezado += `<th style="width: 7%;">${fecha}<br>
                    <button onclick="eliminarFecha('${claveAlmacenamiento}', ${indiceFecha})" style="font-size:0.7rem; color:red; padding: 0; border: none; background: none; cursor: pointer;">Eliminar</button>
                </th>`; //estilos
            } else {
                filaEncabezado += `<th style="width: 7%;">${fecha}</th>`; //ancho
            }
        });

        filaEncabezado += '</tr>';
        encabezado.innerHTML = filaEncabezado;
        tabla.appendChild(encabezado);

        // ---------- CUERPO ----------
        const cuerpo = document.createElement('tbody');

        listaEstudiantes.forEach((estudiante, indice) => {
            const fila = document.createElement('tr');

            let celdaNombre;
            if (modoAdministradorActivo) {
                celdaNombre = `<input type="text" value="${estudiante.nombre}" 
                    onchange="actualizarNombreEstudiante('${claveAlmacenamiento}', ${indice}, this.value)" 
                    style="width: 100%; border: none; background: transparent; font-weight: bold;">`;
            } else {
                celdaNombre = estudiante.nombre;
            }

            let contenidoFila = `<td>${indice + 1}</td><td>${celdaNombre}</td>`;

            fechas.forEach(fecha => {
                const marca = estudiante.asistencia[fecha] || '';

                if (modoAdministradorActivo) {
                    contenidoFila += `<td><select onchange="actualizarAsistencia('${claveAlmacenamiento}', ${indice}, '${fecha}', this.value)">
                        <option value=""></option>
                        <option value="✓" ${marca === '✓' ? 'selected' : ''}>✓</option>
                        <option value="X" ${marca === 'X' ? 'selected' : ''}>X</option>
                        <option value="LIC." ${marca === 'LIC.' ? 'selected' : ''}>LIC.</option>
                        <option value="RET." ${marca === 'RET.' ? 'selected' : ''}>RET.</option>
                    </select></td>`;
                } else {
                    contenidoFila += `<td class="${marca === '✓' ? 'verde' : marca === 'X' ? 'rojo' : marca === 'LIC.' ? 'morado' : marca === 'RET.' ? 'naranja' : ''}">${marca}</td>`;
                }
            });

            fila.innerHTML = contenidoFila;
            cuerpo.appendChild(fila);
        });

        tabla.appendChild(cuerpo);
        contenido.appendChild(tabla); // Asegúrate de que la tabla se adjunte al contenido.
    } else {
        console.error("Error: El elemento con ID 'contenido' no se encontró en mostrarTablaAsistencia.");
    }
}
// * FUNCIONES PARA ACTUALIZAR, EDITAR Y ELIMINAR DATOS DE ASISTENCIA
 //******************************************************************/

/*
 * Función: actualizarAsistencia
 * Descripción: Actualiza el estado de asistencia de un estudiante específico para una fecha dada.
 * Parámetros:
 *   - claveAlmacenamiento: string que identifica el grupo de estudiantes (ej: 'Sistemas_4to_t1').
 *   - indiceEstudiante: posición del estudiante en la lista (índice del array).
 *   - fecha: string que representa la fecha a actualizar (ej: '2025-05-06').
 *   - valor: string que puede ser "✓", "X" o "" para indicar presente, ausente o sin marcar.
 */
function actualizarAsistencia(claveAlmacenamiento, indiceEstudiante, fecha, valor) {
    // Obtiene la lista de estudiantes desde el localStorage (como string)
    const listaEstudiantes = JSON.parse(localStorage.getItem(claveAlmacenamiento));

    // Modifica el valor de asistencia para la fecha indicada en el estudiante seleccionado
    listaEstudiantes[indiceEstudiante].asistencia[fecha] = valor;

    // Guarda la lista actualizada en localStorage, convirtiendo el objeto en string
    localStorage.setItem(claveAlmacenamiento, JSON.stringify(listaEstudiantes));
}

/*
 * Función: actualizarNombreEstudiante
 * Descripción: Cambia el nombre de un estudiante según su posición en el array.
 * Parámetros:
 *   - claveAlmacenamiento: string que identifica al grupo (como 'Contaduria_6to_t2').
 *   - indiceEstudiante: número (posición en la lista de estudiantes).
 *   - nuevoNombre: string con el nuevo nombre que se desea asignar.
 */
function actualizarNombreEstudiante(claveAlmacenamiento, indiceEstudiante, nuevoNombre) {
    // Carga los estudiantes del almacenamiento local
    const listaEstudiantes = JSON.parse(localStorage.getItem(claveAlmacenamiento));

    // Cambia el nombre del estudiante
    listaEstudiantes[indiceEstudiante].nombre = nuevoNombre;

    // Guarda la lista con el nombre actualizado
    localStorage.setItem(claveAlmacenamiento, JSON.stringify(listaEstudiantes));
}

/*
 * Función: eliminarFecha
 * Descripción: Elimina una fecha del registro de asistencia y remueve ese dato para todos los estudiantes.
 * Parámetros:
 *   - claveAlmacenamiento: string del grupo (ej. 'Electronica_5to_t3').
 *   - indiceFecha: índice (posición) de la fecha a eliminar en el array de fechas.
 */
function eliminarFecha(claveAlmacenamiento, indiceFecha) {
    // Obtiene el array de fechas del almacenamiento o lo inicializa vacío si no existe
    const fechas = JSON.parse(localStorage.getItem(claveAlmacenamiento + '_fechas')) || [];

    // Elimina la fecha en la posición indicada del array
    const fechaEliminada = fechas.splice(indiceFecha, 1)[0]; // [0] obtiene el string eliminado

    // Actualiza el array de fechas en el almacenamiento
    localStorage.setItem(claveAlmacenamiento + '_fechas', JSON.stringify(fechas));

    // Obtiene la lista actual de estudiantes
    const listaEstudiantes = JSON.parse(localStorage.getItem(claveAlmacenamiento));

    // Recorre a cada estudiante y elimina la propiedad de asistencia correspondiente a la fecha
    listaEstudiantes.forEach(estudiante => {
        // delete es una palabra clave de JavaScript que elimina una propiedad de un objeto
        delete estudiante.asistencia[fechaEliminada];
    });

    // Guarda la lista de estudiantes sin la fecha eliminada
    localStorage.setItem(claveAlmacenamiento, JSON.stringify(listaEstudiantes));

    // Extrae los datos de carrera, año y trimestre desde la clave (ej. 'Transformacion_6to_t2')
    const [carrera, anio, claveTrimestre] = claveAlmacenamiento.split('_');

    // Vuelve a mostrar la tabla actualizada, usando el nombre real del trimestre
    mostrarTablaAsistencia(carrera, anio, nombresTrimestre[claveTrimestre]);
}


// Event listener para el botón de INICIO
document.addEventListener('DOMContentLoaded', () => {
    const botonInicio = document.querySelector('#principal > .boton:nth-child(2)');
    if (botonInicio) {
        botonInicio.addEventListener('click', mostrarInicio);
    } else {
        console.error("Error: No se encontró el botón de INICIO.");
    }
    cargarCarrerasGuardadas();
});

addEventListener('DOMContentLoaded',cargarCarrerasGuardadas);