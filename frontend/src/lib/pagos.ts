import { MetodoPago } from '../types';

// ========================
// LlevaloPe - Simulación de pagos
// ========================
// Todo lo que hay en este archivo es una SIMULACIÓN. No se conecta a ninguna
// pasarela de pago real ni procesa dinero de verdad. Sirve para completar el
// flujo de checkout con datos deterministas y feedback visual.

/**
 * Métodos que se muestran en el selector visual. Los primeros 6 corresponden
 * 1 a 1 con el enum `MetodoPago` del backend (no se puede modificar la base
 * de datos). Los "extra" son billeteras/canales adicionales del mercado
 * peruano que se simulan igual mostrando su propia marca, pero al confirmar
 * el pedido se envían al backend con el `metodoPago` equivalente más cercano
 * (ver `metodoBackend`) para no romper el enum de Prisma.
 */
export type MetodoPagoUI =
  | MetodoPago
  | 'BIM'
  | 'LUKITA'
  | 'PAGOEFECTIVO'
  | 'MERCADOPAGO'
  | 'QR_UNIFICADO';

export interface DefinicionMetodoPago {
  id: MetodoPagoUI;
  label: string;
  descripcion: string;
  metodoBackend: MetodoPago;
  instantaneo: boolean;
  grupo: 'billetera' | 'tarjeta' | 'otro';
  extra?: boolean;
}

export const METODOS_PAGO_UI: DefinicionMetodoPago[] = [
  {
    id: 'YAPE',
    label: 'Yape',
    descripcion: 'Paga escaneando el QR desde tu app BCP',
    metodoBackend: 'YAPE',
    instantaneo: true,
    grupo: 'billetera',
  },
  {
    id: 'PLIN',
    label: 'Plin',
    descripcion: 'Paga escaneando el QR desde tu app Plin',
    metodoBackend: 'PLIN',
    instantaneo: true,
    grupo: 'billetera',
  },
  {
    id: 'QR_UNIFICADO',
    label: 'QR Yape / Plin',
    descripcion: 'Un solo QR interoperable para ambas apps',
    metodoBackend: 'YAPE',
    instantaneo: true,
    grupo: 'billetera',
    extra: true,
  },
  {
    id: 'BIM',
    label: 'Bim (Cash)',
    descripcion: 'Billetera móvil de la Asbanc',
    metodoBackend: 'YAPE',
    instantaneo: true,
    grupo: 'billetera',
    extra: true,
  },
  {
    id: 'LUKITA',
    label: 'Lukita',
    descripcion: 'Billetera digital de Caja Piura',
    metodoBackend: 'PLIN',
    instantaneo: true,
    grupo: 'billetera',
    extra: true,
  },
  {
    id: 'TARJETA',
    label: 'Tarjeta',
    descripcion: 'Visa, Mastercard, American Express o Diners',
    metodoBackend: 'TARJETA',
    instantaneo: true,
    grupo: 'tarjeta',
  },
  {
    id: 'TRANSFERENCIA',
    label: 'Transferencia bancaria',
    descripcion: 'Deposito o transferencia con voucher',
    metodoBackend: 'TRANSFERENCIA',
    instantaneo: false,
    grupo: 'otro',
  },
  {
    id: 'PAGOEFECTIVO',
    label: 'PagoEfectivo',
    descripcion: 'Paga en agente o banca por internet con codigo CIP',
    metodoBackend: 'TRANSFERENCIA',
    instantaneo: false,
    grupo: 'otro',
    extra: true,
  },
  {
    id: 'PAYPAL',
    label: 'PayPal',
    descripcion: 'Redirige a tu cuenta de PayPal',
    metodoBackend: 'PAYPAL',
    instantaneo: true,
    grupo: 'otro',
  },
  {
    id: 'MERCADOPAGO',
    label: 'MercadoPago',
    descripcion: 'Redirige a tu cuenta de MercadoPago',
    metodoBackend: 'PAYPAL',
    instantaneo: true,
    grupo: 'otro',
    extra: true,
  },
  {
    id: 'CONTRA_ENTREGA',
    label: 'Contra entrega',
    descripcion: 'Paga en efectivo o con POS al repartidor',
    metodoBackend: 'CONTRA_ENTREGA',
    instantaneo: false,
    grupo: 'otro',
  },
];

export function obtenerDefinicionMetodo(id: MetodoPagoUI): DefinicionMetodoPago {
  const definicion = METODOS_PAGO_UI.find((m) => m.id === id);
  if (!definicion) {
    throw new Error(`Metodo de pago no soportado: ${id}`);
  }
  return definicion;
}

// ------------------------
// Tarjetas
// ------------------------

export type MarcaTarjeta = 'VISA' | 'MASTERCARD' | 'AMEX' | 'DINERS' | 'DESCONOCIDA';

/** Detección de marca por BIN (primeros dígitos), sin depender de una API real. */
export function detectarMarca(numeroCrudo: string): MarcaTarjeta {
  const numero = numeroCrudo.replace(/\D/g, '');
  if (/^4/.test(numero)) return 'VISA';
  if (/^(5[1-5]|2(2[2-9]|[3-6]\d|7[01]|720))/.test(numero)) return 'MASTERCARD';
  if (/^3[47]/.test(numero)) return 'AMEX';
  if (/^3(0[0-5]|[68])/.test(numero)) return 'DINERS';
  return 'DESCONOCIDA';
}

/** Algoritmo de Luhn estándar, solo para validación visual (no se envía al backend). */
export function validarLuhn(numeroCrudo: string): boolean {
  const numero = numeroCrudo.replace(/\D/g, '');
  if (numero.length < 12) return false;

  let suma = 0;
  let alternar = false;
  for (let i = numero.length - 1; i >= 0; i -= 1) {
    let digito = parseInt(numero[i], 10);
    if (alternar) {
      digito *= 2;
      if (digito > 9) digito -= 9;
    }
    suma += digito;
    alternar = !alternar;
  }
  return suma % 10 === 0;
}

export function formatearNumeroTarjeta(numeroCrudo: string): string {
  const numero = numeroCrudo.replace(/\D/g, '').slice(0, 19);
  const marca = detectarMarca(numero);
  if (marca === 'AMEX') {
    // 4-6-5
    return numero.replace(/(\d{4})(\d{0,6})(\d{0,5})/, (_, a, b, c) =>
      [a, b, c].filter(Boolean).join(' '),
    );
  }
  return numero.replace(/(\d{4})/g, '$1 ').trim();
}

export function formatearVencimiento(valorCrudo: string): string {
  const valor = valorCrudo.replace(/\D/g, '').slice(0, 4);
  if (valor.length <= 2) return valor;
  return `${valor.slice(0, 2)}/${valor.slice(2)}`;
}

export function vencimientoValido(mmYY: string): boolean {
  const match = /^(\d{2})\/(\d{2})$/.exec(mmYY);
  if (!match) return false;
  const mes = parseInt(match[1], 10);
  const anio = 2000 + parseInt(match[2], 10);
  if (mes < 1 || mes > 12) return false;
  const ahora = new Date();
  const finMes = new Date(anio, mes, 0, 23, 59, 59);
  return finMes >= ahora;
}

// ------------------------
// Códigos / referencias simuladas
// ------------------------

function digitosAleatorios(cantidad: number): string {
  let resultado = '';
  for (let i = 0; i < cantidad; i += 1) {
    resultado += Math.floor(Math.random() * 10).toString();
  }
  return resultado;
}

/** Número de operación estilo Yape/Plin (8 dígitos). */
export function generarNumeroOperacion(): string {
  return digitosAleatorios(8);
}

/** Código CIP de PagoEfectivo (8 dígitos). */
export function generarCIP(): string {
  return digitosAleatorios(8);
}

/** CCI simulado (20 dígitos) para transferencias. */
export function generarCCI(): string {
  return `002-${digitosAleatorios(3)}-${digitosAleatorios(13)}-${digitosAleatorios(2)}`;
}

// ------------------------
// Simulación de resultado de pago
// ------------------------

export type EstadoSimulacion = 'idle' | 'procesando' | 'exito' | 'error' | 'requiere_autenticacion';

export interface ResultadoSimulacion {
  estado: 'aprobado' | 'rechazado' | 'requiere_autenticacion';
  mensaje: string;
  codigo: string;
  numeroOperacion?: string;
  ultimos4?: string;
}

export interface DatosPagoTarjeta {
  numero: string;
  nombreTitular: string;
  vencimiento: string;
  cvv: string;
  cuotas: number;
  guardarTarjeta?: boolean;
}

/**
 * Regla de simulación determinística documentada en los criterios del proyecto:
 * - Tarjeta terminada en 0000  -> rechazado
 * - Tarjeta terminada en 1111  -> requiere autenticación adicional (3DS simulado)
 * - Cualquier otro número      -> aprobado
 * Para el resto de métodos (billeteras, transferencia, contra entrega, etc.)
 * la simulación siempre resulta en "aprobado" tras el tiempo de espera simulado,
 * ya que no hay una tarjeta que analizar.
 */
export async function simularPago(
  metodo: MetodoPagoUI,
  datos?: Partial<DatosPagoTarjeta>,
): Promise<ResultadoSimulacion> {
  const esperaMs = 900 + Math.floor(Math.random() * 900);
  await new Promise((resolve) => setTimeout(resolve, esperaMs));

  if (metodo === 'TARJETA' && datos?.numero) {
    const numero = datos.numero.replace(/\D/g, '');
    const ultimos4 = numero.slice(-4);

    if (numero.endsWith('0000')) {
      logPago(metodo, 'rechazado', { ultimos4 });
      return {
        estado: 'rechazado',
        mensaje: 'El banco emisor rechazó la operación. Intenta con otra tarjeta.',
        codigo: 'CARD_DECLINED',
        ultimos4,
      };
    }

    if (numero.endsWith('1111')) {
      logPago(metodo, 'requiere_autenticacion', { ultimos4 });
      return {
        estado: 'requiere_autenticacion',
        mensaje: 'Tu banco requiere autenticación adicional (3D Secure simulado).',
        codigo: 'REQUIRES_AUTH',
        ultimos4,
      };
    }

    logPago(metodo, 'aprobado', { ultimos4 });
    return {
      estado: 'aprobado',
      mensaje: 'Pago aprobado correctamente.',
      codigo: 'APPROVED',
      numeroOperacion: generarNumeroOperacion(),
      ultimos4,
    };
  }

  logPago(metodo, 'aprobado', {});
  return {
    estado: 'aprobado',
    mensaje: 'Pago simulado registrado correctamente.',
    codigo: 'APPROVED',
    numeroOperacion: generarNumeroOperacion(),
  };
}

/** Simula la segunda etapa cuando `requiere_autenticacion` (3DS). Siempre aprueba. */
export async function simularAutenticacionAdicional(): Promise<ResultadoSimulacion> {
  await new Promise((resolve) => setTimeout(resolve, 1200));
  return {
    estado: 'aprobado',
    mensaje: 'Autenticación adicional verificada. Pago aprobado.',
    codigo: 'APPROVED_AFTER_AUTH',
    numeroOperacion: generarNumeroOperacion(),
  };
}

export function logPago(metodo: MetodoPagoUI, estado: string, extra: Record<string, unknown> = {}) {
  // eslint-disable-next-line no-console
  console.info('[Pago Simulado]', { metodo, estado, timestamp: new Date().toISOString(), ...extra });
}

// ------------------------
// Persistencia ligera en localStorage / sessionStorage
// ------------------------

export interface DatosPagoGuardados {
  metodo: MetodoPagoUI;
  numeroOperacion?: string;
  voucherNombre?: string;
  ultimos4?: string;
  cip?: string;
  timestamp: string;
}

function claveLocalStorage(pedidoReferencia: string) {
  return `llevalope-pago-${pedidoReferencia}`;
}

export function guardarDatosPagoLocal(pedidoReferencia: string, datos: DatosPagoGuardados) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(claveLocalStorage(pedidoReferencia), JSON.stringify(datos));
  } catch {
    // Almacenamiento no disponible (modo privado, cuota excedida, etc). No es crítico.
  }
}

export function obtenerDatosPagoLocal(pedidoReferencia: string): DatosPagoGuardados | null {
  if (typeof window === 'undefined') return null;
  try {
    const crudo = window.localStorage.getItem(claveLocalStorage(pedidoReferencia));
    return crudo ? JSON.parse(crudo) : null;
  } catch {
    return null;
  }
}

// ------------------------
// Checkout pendiente (paso intermedio entre /checkout y /checkout/pago)
// ------------------------

export interface CheckoutPendiente {
  itemsPayload: { varianteId: number; cantidad: number }[];
  direccionId: number;
  direccion?: {
    id: number;
    alias: string;
    nombreCompleto: string;
    telefono: string;
    departamento: string;
    provincia: string;
    distrito: string;
    direccion: string;
    referencia?: string;
    predeterminada: boolean;
  };
  tipoEnvio: 'STANDARD' | 'EXPRESS';
  cupon?: string;
  notas?: string;
  checkoutToken: string;
  metodoPago: MetodoPagoUI;
  total: number;
  resumenItems: { nombre: string; cantidad: number; sku: string }[];
  creadoEn: string;
}

const CLAVE_CHECKOUT_PENDIENTE = 'llevalope-checkout-pendiente';

export function guardarCheckoutPendiente(datos: CheckoutPendiente) {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(CLAVE_CHECKOUT_PENDIENTE, JSON.stringify(datos));
}

export function obtenerCheckoutPendiente(): CheckoutPendiente | null {
  if (typeof window === 'undefined') return null;
  try {
    const crudo = window.sessionStorage.getItem(CLAVE_CHECKOUT_PENDIENTE);
    return crudo ? JSON.parse(crudo) : null;
  } catch {
    return null;
  }
}

export function limpiarCheckoutPendiente() {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(CLAVE_CHECKOUT_PENDIENTE);
}

// ------------------------
// Tiempo de expiración de QR (Yape / Plin)
// ------------------------

export const QR_DURACION_SEGUNDOS = 5 * 60; // 5 minutos

export function formatearTiempoRestante(segundos: number): string {
  const mm = Math.floor(Math.max(segundos, 0) / 60)
    .toString()
    .padStart(2, '0');
  const ss = Math.floor(Math.max(segundos, 0) % 60)
    .toString()
    .padStart(2, '0');
  return `${mm}:${ss}`;
}
