
$(document).ready(function() {
    let listaPersonas = [];
    let generoEscuadra = "";
    const añoFestero = new Date().getFullYear() +1;

    // Múltiples actos por persona en un mismo año
    let multiActo = false; // por defecto no se permiten múltiples actos

    // Totales Avantcarga
    let avantcargaSi = 0;
    let avantcargaNo = 0;
    let avantcargaCaducado = 0;

    // Límite escuadreros/dianeros
    const limitePorColumna = {
        escuadra1: 5,
        escuadra2: 11,
        diana1: 11,
        diana2: 11,
        diana3: 11
    }; 

    // Mapear índice de columna a nombre de columna
    const columnas = {
        4: 'escuadra1',
        5: 'diana1',
        6: 'escuadra2',
        7: 'diana3',
        8: 'diana2'
    };

    // Contadores
    const contadores = {
        escuadra1: 0,
        escuadra2: 0,
        diana1: 0,
        diana2: 0,
        diana3: 0
    };
    
    const contadorGenero = {
        hombres: 0,
        mujeres: 0
    }

    const contadorGeneroHombres = {
        escuadra1: 0,
        escuadra2: 0,
        diana1: 0,
        diana2: 0,
        diana3: 0
    };

    const contadorGeneroMujeres = {
        escuadra1: 0,
        escuadra2: 0,
        diana1: 0,
        diana2: 0,
        diana3: 0
    };

    /**
     ***************
     *   EVENTOS   *
     ***************
     */

    $('#multiActo').on('change', function() {
        multiActo = $(this).is(':checked');
        actualizarEstadoCeldas();
    });

    // Inicializar tabla con los datos del JSON
    $.getJSON('data/data.json', function(data) {
        listaPersonas = data;
        renderizarTabla(listaPersonas);

        actualizarEstadoCeldas();
        actualizarTotales();
    }).fail(function() {
        console.error("No se pudo cargar el JSON");
    });

    // Rellenar celda
    $('#tablaDatos').on('dblclick', 'tbody td:not(:first-child):not(:nth-child(2)):not(:nth-child(3))', function() {
        const fila = $(this).parent();
        const colActual = columnaActual();
        if (!colActual) return; // todas las columnas completas

        // Buscar el índice de la columna correcta
        const indexCorrecto = Object.keys(columnas).find(key => columnas[key] === colActual);
        const celdaCorrecta = fila.find(`td:eq(${indexCorrecto})`);

        // Saber el género de la persona
        const genero = fila.data('genero');

        let operacion = "";

        // Alternar valor
        if (celdaCorrecta.text() === '' && contadores[colActual] < limitePorColumna[colActual]) {
            celdaCorrecta.text(añoFestero);
            contadores[colActual]++;
            operacion = "suma";
            if (genero === 'Hombre') {
                contadorGenero.hombres++;
                contadorGeneroHombres[colActual]++;
            }
            if (genero === 'Mujer') {
                contadorGenero.mujeres++;
                contadorGeneroMujeres[colActual]++;
            }
        } else if (celdaCorrecta.text() == añoFestero) {
            celdaCorrecta.text('');
            contadores[colActual]--;
            operacion = "resta";
            if (genero === 'Hombre') {
                contadorGenero.hombres--;
                contadorGeneroHombres[colActual]--;
            }
            if (genero === 'Mujer') {
                contadorGenero.mujeres--;
                contadorGeneroMujeres[colActual]--;
            }
        }

        if (colActual === 'escuadra1' || colActual === 'escuadra2') {
            const avantcarga = fila.data('avantcarga');

            actualizarResumenAvantcarga(avantcarga, operacion);
        }

        validarGenero(colActual);
        actualizarEstadoCeldas();
        actualizarColores();
        actualizarTotales();

        if(contadores[colActual] === limitePorColumna[colActual]) {
            mostrarSeleccionados(colActual);

            // Reiniciar variables para el siguiente acto
            generoEscuadra = "";
            contadorGenero.hombres = 0;
            contadorGenero.mujeres = 0;
        }
    });

    // Abrir modal con datos
    $(document).on('click', '.editarBtn', function() {
        const index = $(this).closest('tr').data('index');
        const persona = listaPersonas[index];
        editarPersona(persona, index);
    });

    // Guardar cambios
    $("#guardarCambios").on("click", function () {
        const index = $("#formEditar").data("index");

        guardarCambios(index);

        renderizarTabla(listaPersonas);
        $("#modalEditar").modal("hide");
    });

    // Borrar una persona
    $('#borrarPersona').on('click', function() {
        let index = $("#formEditar").data("index");

        if (index === null) return;

        Swal.fire({
            title: '¿Estás seguro?',
            text: "¡No podrás revertir esto!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, borrar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                listaPersonas.splice(index, 1);             // Borrar persona
                reasignarNumerosRueda();                    // Reasignar números de rueda
                renderizarTabla(listaPersonas);             // Volver a dibujar tabla
                index = null;                               // Limpiar selección
                $('#modalEditar').modal('hide');            // Cerrar modal
                Swal.fire('Borrado!', 'La persona ha sido eliminada.', 'success');
            }
        });
    });

    // Añadir festero a la rueda
    $("#btnNuevoFestero").on("click", function () {
        $("#formNuevoFestero")[0].reset();
        $("#modalNuevoFestero").modal("show");
    });

    $("#guardarNuevoFestero").on("click", function () {
        // Obtener el último número de rueda y sumar 1
        const ultimoNumRueda = listaPersonas.length > 0 
            ? Math.max(...listaPersonas.map(p => p.num_rueda)) 
            : 0;

        const nuevoFestero = {
            num_rueda: ultimoNumRueda + 1,
            nombre: $("#nuevoNombre").val().trim().toUpperCase(),
            genero: $("#nuevoGenero").val(),
            categoria: $("#nuevoCategoria").val(),
            mayor_50: $("#nuevoMayor50").is(":checked"),
            avantcarga: $("#nuevoAvantcarga").val(),
            inclusion_rueda: añoFestero,
            escuadra1: null,
            diana1: null,
            escuadra2: null,
            diana3: null,
            diana2: null
        };

        listaPersonas.push(nuevoFestero);
        renderizarTabla(listaPersonas);
        $("#modalNuevoFestero").modal("hide");
    });

    // Guardar datos
    $("#btnGuardar").on("click", function () {
        guardarRuedaFesteros();
    });

    // Fijar contadores
    $(window).on('scroll', function() {
        if ($(window).scrollTop() > 0) {
            $("#topBar").addClass("contador-fijo");
        } else {
            if ($("#topBar").hasClass("contador-fijo")) {
                $("#topBar").removeClass("contador-fijo");
            }
        }
    });

    /**
     *****************
     *   FUNCIONES   *
     *****************
     */

    function renderizarTabla(listaPersonas = []) {
        // Limpiar el tbody por si hubiera algo
        $('#tablaDatos tbody').empty();

        // Ordenar los datos por num_rueda antes de generar las filas
        listaPersonas.sort((a, b) => a.num_rueda - b.num_rueda);

        // Recorrer cada objeto del JSON y crear una fila
        listaPersonas.forEach((item, index) => {
            let cardIcon = "";
            let personIcon = "";

            if (item.avantcarga === "Sí") cardIcon = '<img src="./img/green-card.png" height="15px">';
            else if (item.avantcarga === "No") cardIcon = '<img src="./img/red-card.png" height="15px">';
            else if (item.avantcarga === "Caducado" || item.avantcarga === "Cad.") cardIcon = '<img src="./img/orange-card.png" height="15px">';

            if (item.mayor_50 === "Sí") personIcon = '<img src="./img/mayor-50.png" height="15px">';

            const fila = `
                <tr data-nombre='${item.nombre}' data-genero='${item.genero}' data-avantcarga='${item.avantcarga}' data-index='${index}'>
                    <td>${item.num_rueda}</td>
                    <td>
                        ${item.nombre} 
                        ${cardIcon}
                        ${personIcon}
                    </td>
                    <td>${item.genero}</td>
                    <td>${item.categoria}</td>
                    <td>${item.escuadra1 !== null ? item.escuadra1 : ''}</td>
                    <td>${item.escuadra2 !== null ? item.escuadra2 : ''}</td>
                    <td>${item.diana1 !== null ? item.diana1 : ''}</td>
                    <td>${item.diana2 !== null ? item.diana2 : ''}</td>
                    <td>${item.diana3 !== null ? item.diana3 : ''}</td>
                    <td><button class="btn btn-primary btn-sm editarBtn">Editar</button></td>
                </tr>
            `;
            $('#tablaDatos tbody').append(fila);
        });

        actualizarColores();
    }

    function editarPersona(persona, index) {
        $("#editarNumRueda").val(persona.num_rueda);
        $("#editarNombre").val(persona.nombre);
        $("#editarGenero").val(persona.genero);
        $("#editarCategoria").val(persona.categoria);
        $("#editarInclusionRueda").val(persona.inclusion_rueda);
        $("#editarMayor50").prop("checked", persona.mayor_50 === "Sí");
        $("#editarAvantcarga").val(persona.avantcarga);

        $("#editarEscuadra1").val(persona.escuadra1);
        $("#editarEscuadra2").val(persona.escuadra2);
        $("#editarDiana1").val(persona.diana1);
        $("#editarDiana2").val(persona.diana2);
        $("#editarDiana3").val(persona.diana3);

        $("#formEditar").data("index", index);
        $("#modalEditar").modal("show");
    }

    function guardarCambios(index) {
        // Validar num_rueda duplicado
        const nuevoNumRueda = parseInt($('#editarNumRueda').val(), 10);
        if (listaPersonas.some((p, i) => i !== index && p.num_rueda === nuevoNumRueda)) {
            alert('Ya existe una persona con ese número de rueda');
            return;
        }

        listaPersonas[index].num_rueda = nuevoNumRueda;
        listaPersonas[index].nombre = $('#editarNombre').val().toUpperCase();
        listaPersonas[index].genero = $('#editarGenero').val();
        listaPersonas[index].categoria = $('#editarCategoria').val();
        listaPersonas[index].inclusion_rueda = $('#editarInclusionRueda').val();
        listaPersonas[index].mayor_50 = $('#editarMayor50').val();
        listaPersonas[index].avantcarga = $('#editarAvantcarga').val();

        listaPersonas[index].escuadra1 = $('#editarEscuadra1').val();
        listaPersonas[index].escuadra2 = $('#editarEscuadra2').val();
        listaPersonas[index].diana1 = $('#editarDiana1').val();
        listaPersonas[index].diana2 = $('#editarDiana2').val();
        listaPersonas[index].diana3 = $('#editarDiana3').val();
    }

    function actualizarEstadoCeldas() {
        $('#tablaDatos tbody tr').each(function() {
            let fila = $(this);
            let tieneAño = false;

            // Comprobar si ya tiene año en alguna columna
            fila.find('td:not(:first-child):not(:nth-child(2)):not(:nth-child(3))').each(function() {
                if ($(this).text() == añoFestero) {
                    tieneAño = true;
                }
            });

            // Bloquear/desbloquear celdas según estado de multiActo
            fila.find('td:not(:first-child):not(:nth-child(2)):not(:nth-child(3))').each(function() {
                if (!multiActo && tieneAño && $(this).text() === '') {
                    $(this).addClass('celda-bloqueada');
                } else {
                    $(this).removeClass('celda-bloqueada');
                }
            });
        });
    }

    // Saber que columna se está rellenando
    function columnaActual() {
        // Devuelve la primera columna que no haya alcanzado su límite
        for (let i = 1; i <= 5; i++) {
            const nombre = columnas[i];
            if (contadores[nombre] < limitePorColumna[nombre]) return nombre;
        }
        return null; // todas completadas
    }

    // Función para actualizar el div de totales
    function actualizarTotales() {
        const tabla = $('.contador table tbody');

        // Mapear columnas de datos a columnas de la tabla de contadores
        const mapCol = {
            escuadra1: 1, // Arrancà escuadra
            diana1: 2,    // Arrancà diana
            escuadra2: 3, // 2n tram escuadra
            diana3: 4,    // 3r tram diana
            diana2: 5     // 2n tram diana
        };

        // Resetear todas las celdas primero
        // tabla.find('tr:eq(0) td, tr:eq(1) td').not(':first').text('');
        tabla.find('tr:eq(0) td:not(:first)').text('');
        tabla.find('tr:eq(1) td:not(:first)').text('');

        // Colocar los contadores de Hombres
        for (const col in contadores) {
            const idx = mapCol[col];
            tabla.find('tr:eq(0) td:eq(' + idx + ')').text(contadorGeneroHombres[col] || 0);
        }

        // Colocar los contadores de Mujeres
        for (const col in contadores) {
            const idx = mapCol[col];
            tabla.find('tr:eq(1) td:eq(' + idx + ')').text(contadorGeneroMujeres[col] || 0);
        }
    }

    // Mostrar alerta con los nombres de los escuadreros/dianeros
    function mostrarSeleccionados(colNombre) {
        const indexCorrecto = Object.keys(columnas).find(key => columnas[key] === colNombre);
        let nombres = [];

        $('#tablaDatos tbody tr').each(function() {
            const celda = $(this).find(`td:eq(${indexCorrecto})`);
            if (celda.text() == añoFestero) {
                const nombre = $(this).find('td:eq(1)').text(); // columna del nombre
                nombres.push(nombre);
            }
        });

        if (nombres.length > 0) {
            let nombreColumna = "";
            switch (colNombre) {
                case 'escuadra1':
                    nombreColumna = "Arrancà d'esquadra";
                    break;
                case 'escuadra2':
                    nombreColumna = "2n tram d'esquadra";
                    break;
                case 'diana1':
                    nombreColumna = "Arrancà de diana";
                    break;
                case 'diana2':
                    nombreColumna = "2n de diana";
                    break;
                case 'diana3':
                    nombreColumna = "3n de diana";
                    break;
                default:
                    nombreColumna = "";
            }
            Swal.fire({
                title: `${nombreColumna}`,
                html: `<br>${nombres.join('<br>')}`,
            });
        }

        sincronizarPersonasConActo(nombres, colNombre);
        moverSeleccionadosAlFinal(colNombre);
    }

    // Comprobar género mayoritario
    function validarGenero(colActual) {
        const umbral = Math.floor(limitePorColumna[colActual] / 2) + 1;

        // Si ya hay un género mayoritario
        if (generoEscuadra !== "") {
            // Verificar si aún se mantiene el umbral
            const contadorMayoritario = generoEscuadra === 'Hombre' ? contadorGenero.hombres : contadorGenero.mujeres;
            if (contadorMayoritario < umbral) {
                // Desbloquear celdas del género contrario
                desbloquearGeneroContrario(colActual);
                generoEscuadra = ""; // Reiniciar el género mayoritario
            }
            return;
        }

        // Si aún no hay género mayoritario y se alcanza el umbral
        if (contadorGenero.hombres >= umbral || contadorGenero.mujeres >= umbral) {
            generoEscuadra = contadorGenero.hombres > contadorGenero.mujeres ? 'Hombre' : 'Mujer';
            bloquearGeneroContrario(colActual, generoEscuadra);
        }
    }

    // Bloquear perosnas del género minoritario en un acto
    function bloquearGeneroContrario(colNombre, generoPermitido) {
        const indexCorrecto = Object.keys(columnas).find(key => columnas[key] === colNombre);

        $('#tablaDatos tbody tr').each(function () {
            const fila = $(this);
            const genero = fila.data('genero');
            const celda = fila.find(`td:eq(${indexCorrecto})`);

            // Verificar si hay marca activa (añoFestero) y el género NO coincide
            if (genero !== generoPermitido && celda.text() == añoFestero) {
                celda.text('');

                contadores[colNombre]--;

                // Buscar persona en listaPersonas para actualizar su estado
                const nombrePersona = fila.find('td:eq(1)').text().trim();
                const personaIndex = listaPersonas.findIndex(p => p.nombre === nombrePersona);
                if (personaIndex !== -1) {
                    listaPersonas[personaIndex][colNombre] = null;

                    // Descontar de contadores de avantcarga según su estado
                    actualizarResumenAvantcarga(listaPersonas[personaIndex].avantcarga, "resta");
                }
            }

            // Deshabilitar celda para género contrario
            if (genero !== generoPermitido) {
                celda.addClass('disabled');
            }
        });

        // Descontar del contador del acto
        if (generoPermitido === 'Hombre') {
            contadorGenero.mujeres = 0;
            contadorGeneroMujeres[colNombre] = 0;
        }
        if (generoPermitido === 'Mujer') {
            contadorGenero.hombres = 0;
            contadorGeneroHombres[colNombre] = 0;
        }
    }

    // Desbloquear las celdas que habían sido bloqueadas
    function desbloquearGeneroContrario(colNombre) {
        const indexCorrecto = Object.keys(columnas).find(key => columnas[key] === colNombre);

        $('#tablaDatos tbody tr').each(function() {
            const fila = $(this);
            const genero = fila.data('genero');
            const celda = fila.find(`td:eq(${indexCorrecto})`);

            // Si estaba bloqueada por género contrario, desbloquear
            celda.removeClass('disabled');
        });
    }

    // Pinta cada año con un color
    function actualizarColores() {
        $('#tablaDatos tbody td:not(:first-child):not(:nth-child(2)):not(:nth-child(3))').each(function() {
            const valor = parseInt($(this).text(), 10); // Convertir a número
            $(this).removeClass(function(index, className) {
                return (className.match(/(^|\s)año-\S+/g) || []).join(' ');
            });

            if (!isNaN(valor) && valor >= 2022 && valor <= 2030) {
                $(this).addClass(`año-${valor}`);
            }
        });
    }

    // Reasignar los nº de rueda
    function reasignarNumerosRueda() {
        listaPersonas.forEach((item, index) => {
            item.num_rueda = index + 1; 
        });
    }
    
    // Actualizar contadores de carné de avantcara
    function actualizarResumenAvantcarga(avantcarga, operacion) {       
        if (avantcarga === "Sí") {
            operacion === "suma" ? avantcargaSi++ : avantcargaSi--;
        } else if (avantcarga === "Caducado" || avantcarga === "Cad.") {
            operacion === "suma" ? avantcargaCaducado++ : avantcargaCaducado--;
        } else {
            operacion === "suma" ? avantcargaNo++ : avantcargaNo--;
        }

        // Mostrar en HTML
        $("#avantcargaSi").text(avantcargaSi);
        $("#avantcargaCaducado").text(avantcargaCaducado);
        $("#avantcargaNo").text(avantcargaNo);
    }

    // Sincronizar las personas que hacen los actos
    function sincronizarPersonasConActo(nombresSeleccionados, colNombre) {
        nombresSeleccionados.forEach(nombrePersona => {
            const nombre = nombrePersona.trim();

            // Buscar fila correspondiente
            const fila = $(`#tablaDatos tbody tr`).filter(function () {
                return $(this).find('td:eq(1)').text().trim() === nombre;
            });

            if (fila.length === 0) return; // Si no se encuentra, saltar

            // Buscar índice correcto en listaPersonas
            const personaIndex = listaPersonas.findIndex(persona => persona.nombre === nombre);
            if (personaIndex !== -1) {
                // Sincronizar columnas de actos
                const celdaIndex = Object.keys(columnas).find(key => columnas[key] === colNombre);
                const valorCelda = fila.find(`td:eq(${celdaIndex})`).text().trim();
                listaPersonas[personaIndex][colNombre] = valorCelda === '' ? null : añoFestero;
            }
        });
    }


    // Mover al final de la rueda aquellos festeros que realizan acto
    function moverSeleccionadosAlFinal(colNombre) {
        console.log('mover');
        // 1. Separa personas: las que tienen la columna actual = añoFestero vs las demás
        const personasAMover = [];
        const personasQueQuedan = [];
        
        listaPersonas.forEach((persona) => {
            if (persona[colNombre] == añoFestero) {
                personasAMover.push(persona); // Mantienen su orden original
            } else {
                personasQueQuedan.push(persona);
            }
        });
        console.log('a mover', personasAMover);
        console.log('se quedan', personasQueQuedan)
        
        // 2. Reorganiza: primero las que quedan, luego las que se mueven
        listaPersonas = [...personasQueQuedan, ...personasAMover];
        
        // 3. Re-renderiza la tabla
        reasignarNumerosRueda();
        renderizarTabla(listaPersonas);
    }

    function guardarRuedaFesteros() {
        const jsonStr = JSON.stringify(listaPersonas, null, 2); // formato bonito con indentación
        const blob = new Blob([jsonStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = "data.json"; // nombre del archivo
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        console.log("Lista de personas guardada en data.json");
    }
    
});
