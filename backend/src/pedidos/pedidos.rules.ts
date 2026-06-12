export const ENVIO_GRATIS_DESDE = 199;
export const COSTO_ENVIO_STANDARD = 14.9;
export const COSTO_ENVIO_EXPRESS = 24.9;
export const IGV_TASA = 0.18;
export const DESCUENTO_VOLUMEN_TASA = 0.05;
export const RESERVA_STOCK_MINUTOS = 15;

export type TipoEnvio = 'STANDARD' | 'EXPRESS';

export function redondearMoneda(valor: number) {
  return Math.round((valor + Number.EPSILON) * 100) / 100;
}

export function calcularIgvIncluido(totalConIgv: number) {
  return redondearMoneda(totalConIgv - totalConIgv / (1 + IGV_TASA));
}

export function calcularCostoEnvio(totalMercaderia: number, tipoEnvio: TipoEnvio) {
  if (tipoEnvio === 'EXPRESS') {
    return redondearMoneda(COSTO_ENVIO_EXPRESS);
  }

  return totalMercaderia >= ENVIO_GRATIS_DESDE ? 0 : redondearMoneda(COSTO_ENVIO_STANDARD);
}
