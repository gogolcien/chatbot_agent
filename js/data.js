// ================= BASE DE CONOCIMIENTO (FAQ) =================
const BASE_CONOCIMIENTO = [
    {
        tags: ['cuentas', 'depositar', 'banco', 'transferencia', 'donde deposito', 'subir mi pago'],
        resp: "Nuestras cuentas son en Santander y Banamex.,Deberá enviar comprobante de pago a tu agente especificando el folio de la reservación, así como el nombre del titular de la misma. El depósito o transferencia puede realizarlo en cualquiera de las cuentas a nombre de Corporation Travel S.A de C.V. que se listan a continuación",
        url: null,
        info: ` Deberá enviar comprobante de pago a tu agente especificando el folio de la reservación, así como el nombre del titular de la misma. El depósito o transferencia puede realizarlo en cualquiera de las cuentas a nombre de Corporation Travel S.A de C.V. que se listan a continuación:<br>
                Santander: 1234567890
                <br>
                Banamex: 0987654321    
            `
    },
    {
        tags: ['comisión', 'comision', 'porcentaje'],
        resp: "Tu porcentaje de comisión depende de tu nivel de agencia y el tipo de servicio. Consulta tu perfil para ver el tabulador vigente.",
        url: "https://agentes.imacop.com.mx/perfil"
    },
    {
        tags: ['colores', 'descuento', 'color'],
        resp: "Los colores indican la disponibilidad y el descuento especial aplicado. Verde es disponible inmediato, Amarillo requiere verificación.",
        url: null
    },
    {
        tags: ['horarios imacop', 'hora imacop', 'abierto en imacop'],
        resp: "Nuestro horario de atención es de Lunes a Viernes de 9 de la mañana a 7 de la tarde, y sábados de 9 a 2.",
        url: null
    },
    {
        tags: ['contacto a ventas', 'chicos de ventas', 'telefono de ventas', 'contacto a ventas'],
        resp: "Puedes contactar al equipo de ventas al teléfono 33-3333-3333 o por el chat de soporte.",
        url: null
    },
    {
        tags: ['publicidad por whatsapp', 'publicidad por celular', 'publicidad por mensaje'],
        resp: "Claro, para recibir publicidad por WhatsApp, por favor regístrate en el siguiente enlace.",
        url: "https://wa.me/5213333333333"
    },
    {
        tags: ['donde consulto las amenidades', 'donde veo que incluye el hotel', 'donde consulto que incluye el hotel'],
        resp: "Las amenidades específicas aparecen en la ficha de cada hotel dentro de la plataforma al momento de cotizar.",
        url: null
    },
    {
        tags: ['white label', 'mi marca', 'actualizar mi logo'],
        resp: "Para actualizar tu White Label y que tus clientes vean tu logo, entra a la configuración de 'Mi Agente'.",
        url: "https://agentes.imacop.com.mx/whitelabel"
    },
    {
        tags: ['cupón', 'cupon', 'boucher', 'voucher'],
        resp: "Puedes descargar tu cupón desde la sección 'Mis Reservaciones'. Si tienes crédito, puedes descargarlo sin pagar inmediatamente.",
        url: "https://agentes.imacop.com.mx/reservaciones"
    },
    {
        tags: ['estatus reserva', 'cambio de estatus'],
        resp: "El estatus de pago se actualiza automáticamente al subir tu comprobante. Si tarda más de 24 horas, contacta a cobranza.",
        url: null
    },
    {
        tags: ['tarifa netas', 'tarifas publicas', 'ver tarifa'],
        resp: "En la plataforma puedes visualizar tanto tarifas netas para ti, como públicas para tu cliente, dependiendo de tu configuración.",
        url: null
    },
    {
        tags: ['no show'],
        resp: "En caso de No Show, se aplican las políticas específicas del hotel. Generalmente se cobra la primera noche o el total dependiendo la temporada.",
        url: null
    },
    {
        tags: ['cambio de nombre', 'cambiar nombre', 'cambio de pasajero'],
        resp: "El cambio de nombre está sujeto a las políticas del operador o aerolínea. En hoteles suele ser posible antes de 72 horas.",
        url: null
    },
    {
        tags: ['reembolso', 'devolución'],
        resp: "Los tiempos de reembolso varían de 15 a 45 días hábiles dependiendo del proveedor final.",
        url: null
    },
    {
        tags: ['grupo', 'grupales'],
        resp: "Para cotizar grupos (más de 10 habitaciones), por favor usa el módulo de 'Cotización Grupal' para obtener tarifas preferenciales.",
        url: "https://agentes.imacop.com.mx/grupos"
    },
    {
        tags: ['visa', 'pasaporte', 'documentación'],
        resp: "Nosotros te asesoramos, pero el trámite de visados y pasaportes es responsabilidad directa del pasajero.",
        url: null
    },
    {
        tags: ['seguro', 'aseguradora'],
        resp: "Nuestros paquetes pueden incluir seguro de viajero si lo seleccionas al momento de reservar. Te recomendamos siempre ofrecerlo.",
        url: null
    }
];

// ================= AGENTES =================
const AGENTES = {
    ian: {
        nombre: 'Ian',
        genero: 'masculino',
        voz: 'male',
        avatar: {
            neutral: './assets/IAN.gif',
            hablar: './assets/IAN.gif',
            pensar: './assets/IAN.gif',
            exito: './assets/IAN.gif'
        }
    },
    mia: {
        nombre: 'Mia',
        genero: 'femenino',
        voz: 'female',
        avatar: {
            neutral: './assets/MIA.gif',
            hablar: './assets/MIA.gif',
            pensar: './assets/MIA.gif',
            exito: './assets/MIA.gif'
        }
    }
};

const VOZ_MASCULINA = 'Microsoft Raul - Spanish (Mexico)';
const VOZ_FEMENINA  = 'Microsoft Sabina - Spanish (Mexico)';
