export const SOPORTE_CATEGORIAS = [
  'CONSULTA',
  'RECLAMO',
  'DEVOLUCION',
  'PAGO',
  'ENVIO',
  'PRODUCTO',
  'OTRO',
] as const;

export const SOPORTE_PRIORIDADES = ['BAJA', 'MEDIA', 'ALTA', 'URGENTE'] as const;

export const SOPORTE_ESTADOS_VISUALES = ['ABIERTO', 'EN_PROCESO', 'RESUELTO'] as const;

export type SoporteEstadoVisual = (typeof SOPORTE_ESTADOS_VISUALES)[number];

export function normalizarEstadoTicket(estado: string): SoporteEstadoVisual {
  if (estado === 'ABIERTO') return 'ABIERTO';
  if (estado === 'RESUELTO' || estado === 'CERRADO') return 'RESUELTO';
  return 'EN_PROCESO';
}

export function mapearEstadoVisualABackend(estadoVisual: SoporteEstadoVisual) {
  if (estadoVisual === 'EN_PROCESO') return 'EN_ATENCION';
  if (estadoVisual === 'RESUELTO') return 'RESUELTO';
  return 'ABIERTO';
}
