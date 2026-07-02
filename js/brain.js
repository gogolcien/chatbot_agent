let AGENTE_ACTIVO = null;

const OLLAMA_URL = 'http://localhost:11434/api/chat';
const OLLAMA_MODEL = 'qwen3:14b';

function construirSystemPrompt() {
    const kbTexto = BASE_CONOCIMIENTO.map(item => `- ${item.resp}`).join('\n');
    return (
        "Eres el asistente virtual de IMACOP, una operadora de viajes que atiende " +
        "a agentes de viaje registrados. Responde ÚNICAMENTE con base en la " +
        "siguiente información oficial. Si la pregunta no está cubierta por esta " +
        "información, dilo con honestidad y sugiere contactar al equipo de ventas " +
        "al 33-3333-3333, en vez de inventar una respuesta.\n\n" +
        `INFORMACIÓN OFICIAL:\n${kbTexto}\n\n` +
        "Responde en español de México, en 2-3 frases como máximo, tono natural."
    );
}

function preguntarIA(txt) {
    fetch(OLLAMA_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: OLLAMA_MODEL,
            messages: [
                { role: 'system', content: construirSystemPrompt() },
                { role: 'user', content: txt }
            ],
            stream: false
        })
    })
        .then(res => {
            if (!res.ok) throw new Error('Ollama respondió ' + res.status);
            return res.json();
        })
        .then(data => {
            hablar(data.message.content, () => volverAMenu());
        })
        .catch(err => {
            console.error('Error consultando Ollama:', err);
            hablar(
                "No pude conectarme con el modelo local. Verifica que Ollama esté corriendo",
                () => volverAMenu()
            );
        });
}

AVATAR = {
    neutral: './assets/saludo.gif',
    hablar: './assets/explicando.gif',
    pensar: './assets/pensando.gif',
    exito: './assets/exito.gif'
};

let DESTINOS_VALIDOS = [];
DESTINOS_MAP = {};

let estado = 'OFF';
let datos = {
    destino: '',
    fechaEntrada: null,
    fechaSalida: null,
    strEntrada: '',
    habitaciones: 0,
    habActual: 1,
    habData: []
};

function buscarEnBaseConocimiento(texto) {
    for (let item of BASE_CONOCIMIENTO) {
        const encontrado = item.tags.some(tag => texto.includes(tag));
        if (encontrado) {
            return item;
        }
    }
    return null;
}

window.onload = function () {

    fetch('https://nuevo.sistemaimacop.com.mx/API/ApiDestinos', {
        method: 'POST',
        body: new URLSearchParams({
            user: 'Imacop',
            password: '25041988',
            gih: '0',
            pagina: '0',
            num_reg: '5000'
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error en la respuesta del servidor');
        }
        return response.json();
    })
    .then(data => {
        // 🔹 Nos quedamos solo con los nombres de destinos
        DESTINOS_VALIDOS = data.map(d => d.destinationName.toUpperCase());

        data.forEach(d => {
            DESTINOS_MAP[d.destinationName.toUpperCase()] = {
                id: d.destinationId,
                nombre: d.destinationName,
                imagen: d.destinationImage,
                descripcion: d.destinationDescription,
                lat: d.latitude,
                lng: d.longitude
            };
        });

        // 🔹 Habilitar botón
        const btn = document.getElementById('btn-start');
        const txt = document.getElementById('estado-texto');

        btn.disabled = false;
        btn.innerText = "EMPEZAR";
        btn.classList.remove('bg-gray-600', 'cursor-not-allowed', 'opacity-50');
        btn.classList.add('bg-indigo-600', 'hover:bg-indigo-500');
        txt.innerText = "";
    })
    .catch(error => {
        document.getElementById('estado-texto').innerText = "ERROR CARGANDO DESTINOS";
        log('SISTEMA', 'No se pudo obtener la lista de destinos desde el API.');
    });
};

function normalizar(texto) {
    return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function validarDestino(textoUsuario) {
    let input = normalizar(textoUsuario);

    for (let destino of DESTINOS_VALIDOS) {
        let destinoClean = normalizar(destino);
        // Búsqueda flexible (si dice "vallarta" encuentra "Puerto Vallarta")
        if (destinoClean.includes(input) || input.includes(destinoClean)) {
            return destino;
        }
    }
    return null;
}

function setAvatar(tipo) {
    const img = document.getElementById('avatar-img');
    const txt = document.getElementById('estado-texto');
    img.className = "w-48 h-48 object-contain  border-4 border-indigo-500 bg-white shadow-xl transition-all duration-200";

    if (tipo === 'hablar') {
        img.src = AVATAR.hablar;
        img.classList.add('hablando');
        txt.innerText = "RESPONDIENDO...";
    } else if (tipo === 'pensar') {
        img.src = AVATAR.pensar;
        txt.innerText = "PROCESANDO...";
    } else if (tipo === 'exito') {
        img.src = AVATAR.exito;
        txt.innerText = "TERMINADO";
    } else {
        img.src = AVATAR.neutral;
        txt.innerText = "ESCRIBE TU DUDA...";
    }
}

function log(user, msg) {
    const box = document.getElementById('chat-box');
    const color = user === 'BOT' ? 'text-indigo-400' : 'text-green-400';
    const align = user === 'BOT' ? 'text-left' : 'text-right';
    box.innerHTML += `<div class="${align}"><span class="${color} font-bold text-xs">${user}</span><br>${msg}</div>`;
    box.scrollTop = box.scrollHeight;
}

function hablar(texto, callback)
{
    setAvatar('hablar');
    log('BOT', texto);

    setTimeout(() => {
        if (callback) {
            callback();
        } else {
            escuchar();
        }
    }, 300);
}

function escuchar() {
    setAvatar('neutral');
    const input = document.getElementById('text-input');
    const btn = document.getElementById('btn-send');
    if (input) {
        input.disabled = false;
        input.value = '';
        input.focus();
    }
    if (btn) btn.disabled = false;
}

function enviarTexto() {
    const input = document.getElementById('text-input');
    if (!input) return;

    const texto = input.value.trim();
    if (!texto) return;

    const input2 = input; // deshabilitar mientras se procesa
    input2.disabled = true;
    const btn = document.getElementById('btn-send');
    if (btn) btn.disabled = true;

    log('TU', texto);
    input.value = '';
    setAvatar('pensar');

    setTimeout(() => {
        cerebro(texto.toLowerCase());
    }, 300);
}

document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('text-input');
    const btn = document.getElementById('btn-send');

    if (input) {
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                enviarTexto();
            }
        });
    }
    if (btn) {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            enviarTexto();
        });
    }
});

function seleccionarAgente(tipo) {
    AGENTE_ACTIVO = AGENTES[tipo];
    AVATAR = AGENTE_ACTIVO.avatar;

    // Ocultar selector
    document.getElementById('selector-agente').style.display = 'none';

    // Mostrar avatar y botón
    document.getElementById('bloque-avatar').classList.remove('hidden');
    document.getElementById('btn-start').classList.remove('hidden');

    setAvatar('neutral');

    document.getElementById('estado-texto').innerText =
        `Te atenderá ${AGENTE_ACTIVO.nombre}`;
}

function iniciar() {
    if (!AGENTE_ACTIVO) {
        alert("Por favor selecciona un agente (Ian o Mia) primero.");
        return;
    }

    estado = 'MENU';

    // 1. Ocultamos el botón de "EMPEZAR"
    const btnStart = document.getElementById('btn-start');
    btnStart.classList.add('hidden');

    // 2. Mostramos el área de input de texto
    const inputArea = document.getElementById('input-area');
    inputArea.classList.remove('hidden');

    setTimeout(() => {
        log('BOT',
            "<b>Hola, Bienvenido, soy tu Asistente Virtual.</b>"+
            "<br>🏨 Cotizar precio de Hoteles y Circuitos<br>" +
            "💳 Subir Pagos<br>" +
            "📄 Facturación<br>" +
            "🎟️ Descargar Cupones y Publicidad<br>" +
            "👤 Alta de Usuarios y White Label<br>" +
            "🧑‍🏫 Capacitación<br>"+
            "⤴️ Guía para asesorar a tus clientes<br>"+
            "❓ Dudas generales<br>"+
            "<b>¿En qué te puedo ayudar? Escribe lo que necesitas.</b>"
        );
        escuchar();
            
    }, 100);
}

function cerebro(txt)
{
    if (estado === 'MENU')
    {
        const respuestaFAQ = buscarEnBaseConocimiento(txt);

        if (respuestaFAQ) {
            hablar(respuestaFAQ.resp, () => volverAMenu());

            if (respuestaFAQ.url) {
                mostrarBotonAbrir(respuestaFAQ.info || "Haz clic para ver más detalles", respuestaFAQ.url);
            } else if (respuestaFAQ.info) {
                logDestinoVisual("Información Solicitada", "https://via.placeholder.com/300x100?text=Info+en+Pantalla");
                log('BOT', respuestaFAQ.info);
            }
            return;
        }

        if (txt.includes('cotizar') || txt.includes('viaje')) {
            estado = 'DESTINO';
            hablar("Bien. ¿A qué destino viajan?");
        }
        else if (txt.includes('pago')) {
            estado = 'PAGO';
            hablar("Dime el GDL o localizador.");
        }
        // --- ALTA DE USUARIOS ---
        else if (txt.includes('alta de usuario') || txt.includes('nuevo usuario') || txt.includes('registrar usuario')) {
            estado = 'ALTA_USUARIO';

            hablar(
                "Para dar de alta usuarios, dirígete a Mundo Imacop, selecciona Mi Agente, y en el menú lateral izquierdo selecciona Tu Publicidad.",
                () => { volverAMenu(); }
            );

            mostrarBotonAbrir(
                "<b>Pasos para alta de Usuarios:</b><br>1. Ir a 'tu BackOffice : https://reservas.arenia.mx/backoffice'.<br>2. Menu lateral: Seleccionar 'Usuarios por Agencia'.<br>3. Menú superior: 'presionar el boton con simbolo de + <br> Llenar formulario: con los datos del nuevo Usuario'.",
                "https://agentes.imacop.com.mx/backoffice"
            );
        }
        // ---------------------------------------------
        else if (txt.includes('publicidad')) {
            estado = 'PUBLICIDAD';

            hablar(
                "Excelente decisión. Ya tengo listo el acceso a nuestra sección de publicidad, Aquí encontrarás un banco de promociones actualizadas que puedes descargar, personalizar con el logotipo de tu agencia y compartir libremente con tus clientes.",
                () => {
                    volverAMenu();
                }
            );

            mostrarBotonAbrir(
                "Aquí encontrarás un banco de promociones actualizadas que puedes descargar, personalizar con el logotipo de tu agencia y compartir libremente con tus clientes.",
                "https://agentes.imacop.com.mx/backoffice/imacop/publicidad"
            );
        }
        else if (txt.includes('guía')) {
            estado = 'GUÍA';

            hablar(
                "Excelente elección. Te dejo el acceso a nuestra guía interactiva de hoteles, Consulta destinos, hoteles, habitaciones e instalaciones para asesorar mejor a tus clientes.",
                () => {
                    volverAMenu();
                }
            );

            mostrarBotonAbrir(
                "Consulta destinos, hoteles, habitaciones e instalaciones para asesorar mejor a tus clientes.",
                "https://guiainteractivadehoteles.com"
            );
        }
        else if (txt.includes('factura')) {
            estado = 'FACTURA';

            hablar(
                "Perfecto. Aquí tienes el acceso a nuestro portal de facturación electrónica,Recuerda que solo se puede facturar el mes en curso. Te recomendamos hacerlo a tiempo.",
                () => {
                    volverAMenu();
                }
            );

            mostrarBotonAbrir(
                "Recuerda que solo se puede facturar el mes en curso. Te recomendamos hacerlo a tiempo.",
                "https://facturacion.imacoponline.com/index.php"
            );
        }
        else if (txt.includes('capacitación') || txt.includes('capacitar') ) {
            estado = 'CAPACITACION';
            hablar(
                "Entendido, excelente elección. Te redirigiré a nuestro portal de capacitación, donde podrás mantenerte actualizado y fortalecer tus conocimientos como agente de viajes.",
                () => {
                    volverAMenu();
                }
            );

            mostrarBotonAbrir(
                "Entendido, excelente elección. Te redirigiré a nuestro portal de capacitación, donde podrás mantenerte actualizado y fortalecer tus conocimientos como agente de viajes.",
                "https://agentes.imacop.com.mx/backoffice/imacop/capacitaciones"
            );
        }
        else {
            preguntarIA(txt);
        }
        return;
    }

    if (estado === 'PAGO') {
        let nums = txt.replace(/\D/g, '');
        if (nums) finalizar('pago', nums);
        else hablar("Repite el número por favor.");
        return;
    }

    if (estado === 'DESTINO') {
        const destinoEncontrado = validarDestino(txt);

        if (destinoEncontrado) {
            datos.destino = destinoEncontrado;

             datos.imagenDestino = DESTINOS_MAP[destinoEncontrado]?.imagen || null;
             let imagen_destino_completa='https://nuevo.sistemaimacop.com.mx/'+datos.imagenDestino;
               logDestinoVisual(destinoEncontrado, imagen_destino_completa);

            estado = 'FECHA_IN';
            hablar(`Perfecto, ${destinoEncontrado}. Dime la fecha en que iniciaras el viaje. Ejemplo: 20 de mayo.`);
        } else {
            hablar(`No encontré "${txt}" en la base de datos. Intenta con otro.`);
        }
        return;
    }

    if (estado === 'FECHA_IN') {
        const fechaObj = parsearFecha(txt);
        if (!fechaObj) {
            hablar("No entendí la fecha. Intenta: Día y Mes.");
            return;
        }
        let hoy = new Date(); hoy.setHours(0,0,0,0);
        if (fechaObj < hoy) {
            hablar("Esa fecha ya pasó. Dime una fecha futura.");
            return;
        }
        datos.fechaEntrada = fechaObj;
        datos.strEntrada = txt;
        estado = 'FECHA_OUT';
        hablar("Ok. Ahora dime la fecha del fin del viaje.");
        return;
    }

    if (estado === 'FECHA_OUT') {
        const fechaObj = parsearFecha(txt);
        if (!fechaObj) {
            hablar("Repite la fecha del fin del viaje.");
            return;
        }
        if (fechaObj <= datos.fechaEntrada) {
            hablar(`La fecha fin debe ser posterior a la fecha inicio. Dime otra fecha.`);
            return;
        }
        datos.fechaSalida = fechaObj;
        estado = 'HABITACIONES';
        hablar("Fechas correctas. ¿Cuántas habitaciones necesitan?");
        return;
    }

    if (estado === 'HABITACIONES') {
        let cant = obtenerNumero(txt) || 1;
        datos.habitaciones = cant;
        datos.habActual = 1;
        datos.habData = [];
        for(let i=0; i<cant; i++) datos.habData.push({adultos:0, menores:0, edades:''});

        estado = 'ADULTOS';
        let preg = cant === 1 ? "¿Cuántos adultos van?" : "Habitación 1. ¿Cuántos adultos?";
        hablar(preg);
        return;
    }

    if (estado === 'ADULTOS') {
        let num = obtenerNumero(txt);
        if (num === 0) num = 2;
        datos.habData[datos.habActual-1].adultos = num;

        estado = 'MENORES';
        hablar("¿Cuántos menores? Escribe cero si no hay.");
        return;
    }

    if (estado === 'MENORES') {
        let num = obtenerNumero(txt);
        if (num === 0) {
            if (txt.includes('cero') || txt.includes('no') || txt.includes('ninguno') || txt.includes('nadie')) {
                num = 0;
            } else if (txt.includes('niño') || txt.includes('menor') || txt.includes('bebe') || txt.includes('hijo')) {
                num = 1;
            }
        }
        datos.habData[datos.habActual-1].menores = num;
        if (num > 0) {
            estado = 'EDADES';
            hablar(`Entendido, ${num} menores. Dime sus edades.`);
        } else {
            siguienteHabitacion();
        }
        return;
    }

    if (estado === 'EDADES') {
        datos.habData[datos.habActual-1].edades = txt;
        siguienteHabitacion();
        return;
    }
}

function siguienteHabitacion() {
    if (datos.habActual < datos.habitaciones) {
        datos.habActual++;
        estado = 'ADULTOS';
        hablar(`Listo. Vamos con la habitación ${datos.habActual}. ¿Cuántos adultos?`);
    } else {
        finalizar('cotizar', null);
    }
}

function obtenerNumero(txt) {
    let matches = txt.match(/\d+/);
    if (matches) return parseInt(matches[0]);
    const nums = { 'un': 1, 'uno':1, 'una':1, 'unos': 1, 'dos':2, 'tres':3, 'cuatro':4, 'cinco':5, 'seis':6 };
    for (let k in nums) {
        if (new RegExp(`\\b${k}\\b`, 'i').test(txt)) return nums[k];
    }
    return 0;
}

function parsearFecha(texto) {
    const meses = {
        'enero': 0, 'febrero': 1, 'marzo': 2, 'abril': 3, 'mayo': 4, 'junio': 5,
        'julio': 6, 'agosto': 7, 'septiembre': 8, 'octubre': 9, 'noviembre': 10, 'diciembre': 11
    };
    let diaMatch = texto.match(/\d+/);
    if (!diaMatch) return null;
    let dia = parseInt(diaMatch[0]);
    let mes = -1;
    for (let m in meses) { if (texto.includes(m)) { mes = meses[m]; break; } }
    if (mes === -1) return null;
    let hoy = new Date();
    let anio = hoy.getFullYear();
    if (hoy.getMonth() > 8 && mes < 3) anio++;
    return new Date(anio, mes, dia);
}

function finalizar(tipo, payload) {
    setAvatar('exito');
    estado = 'FIN';

    if (tipo === 'pago') {
        console.log("PAGO GDL:", payload);

        let id_agencia_dinamico=48384;
        hablar(
            `He detectado el GDL ${payload}. Te redirigiré a la sección de carga de pagos.`,
            () => {
                volverAMenu();
            }
        );
        mostrarBotonAbrir(
            "Aquí tienes el modulo de carga de pagos , aqui puedes subir los comprobantes de pagos de tus reservas",
            `https://nuevo.sistemaimacop.com.mx/subir_pago_agencia.php?id_agencia=${id_agencia_dinamico}`
        );
    }
    else {
        console.clear();
        console.log("%c DATOS COMPLETOS ", "background: #22c55e; color: white; padding: 5px; font-weight: bold;");
        console.log("DESTINO:", datos.destino);
        console.log("ENTRADA:", datos.fechaEntrada.toLocaleDateString());
        console.log("SALIDA: ", datos.fechaSalida.toLocaleDateString());
        console.table(datos.habData);

        hablar(
            `He terminado de cotizar , encontre losmejores resultados para ${datos.destino}, te entrego la lista` ,
        () => {
            volverAMenu();
        } );

        mostrarBotonAbrir(
            `He terminado de cotizar , encontre losmejores resultados para ${datos.destino}, te entrego la lista`,
            `https://agentes.imacop.com.mx/busquedas/resultados/12045191oghs5/Hoteles`
        );
    }
}

function logDestinoVisual(destino, imagenUrl) {
    const box = document.getElementById('chat-box');

    box.innerHTML += `
        <div class="text-left space-y-2">
            <span class="text-indigo-400 font-bold text-xs">BOT</span>

            <div class="bg-slate-800 border border-indigo-500 rounded-xl overflow-hidden shadow-lg max-w-xs">
                    <img src="${imagenUrl}"
                    onclick="window.open('${imagenUrl}','_blank')"
                    class="cursor-pointer w-full h-32 object-cover"  alt="${destino}">

                <div class="p-3 text-sm">
                    <p class="text-white font-semibold">${destino}</p>
                    <p class="text-xs text-indigo-300">Destino seleccionado</p>
                </div>
            </div>
        </div>
    `;

    box.scrollTop = box.scrollHeight;
}

function mostrarBotonAbrir(texto, url) {
    const box = document.getElementById('chat-box');

    box.innerHTML += `
        <div class="text-left space-y-2 animate-fade-in">
            <span class="text-indigo-400 font-bold text-xs">BOT</span>

            <div class="bg-slate-800 border border-indigo-500 rounded-xl p-3 space-y-2 max-w-xs">
                <p class="text-sm text-white">${texto}</p>

                <button
                    onclick="window.open('${url}', '_blank')"
                    class="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-lg font-semibold">
                    Abrir ahora
                </button>
            </div>
        </div>
    `;

    box.scrollTop = box.scrollHeight;
}

function volverAMenu(delay = 3000) {
    setTimeout(() => {
        estado = 'MENU';
        hablar(
            "<b>¿Puedo ayudarte en algo más?</b>"+
            "<br>Cuento con los siguientes servicios:<br>" +
            "🏨 Cotizar precio de Hoteles y Circuitos<br>" +
            "💳 Subir Pagos<br>" +
            "📄 Facturación<br>" +
            "🎟️ Descargar Cupones y Publicidad<br>" +
            "👤 Alta de Usuarios y White Label<br>" +
            "🧑‍🏫 Capacitación<br>"+
            "⤴️ Guía para asesorar a tus clientes<br>"+
            "❓ Dudas generales",
            () => escuchar()
        );
    }, delay);
}