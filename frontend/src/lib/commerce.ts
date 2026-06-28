import { Producto, VarianteProducto } from '../types';

export const ENVIO_GRATIS_DESDE = 199;
export const COSTO_ENVIO_STANDARD = 14.9;
export const COSTO_ENVIO_EXPRESS = 24.9;
export const DESCUENTO_VOLUMEN_TASA = 0.05;
export const IGV_TASA = 0.18;

export type TipoEnvio = 'STANDARD' | 'EXPRESS';

export interface ItemCarritoCalculable {
  producto: Producto;
  variante: VarianteProducto;
  cantidad: number;
}

export function redondearMoneda(valor: number) {
  return Math.round((valor + Number.EPSILON) * 100) / 100;
}

export function obtenerPrecioVigente(variante: VarianteProducto) {
  if (!variante) return 0;
  return Number(
    variante.enOferta && variante.precioOferta ? variante.precioOferta : variante.precioBase,
  );
}

export function calcularResumenLocal(items: ItemCarritoCalculable[], tipoEnvio: TipoEnvio = 'STANDARD') {
  const subtotalOriginal = redondearMoneda(
    items.reduce((acc, item) => {
      if (!item || !item.variante) return acc;
      return acc + obtenerPrecioVigente(item.variante) * item.cantidad;
    }, 0),
  );

  const descuentoOferta = redondearMoneda(
    items.reduce((acc, item) => {
      if (!item || !item.variante) return acc;
      if (!(item.variante.enOferta && item.variante.precioOferta)) return acc;
      const ahorro = Number(item.variante.precioBase) - Number(item.variante.precioOferta);
      return acc + (ahorro > 0 ? ahorro * item.cantidad : 0);
    }, 0),
  );

  const descuentoVolumen = redondearMoneda(
    items.reduce((acc, item) => {
      if (!item || !item.variante) return acc;
      if (item.cantidad < 3) return acc;
      return acc + obtenerPrecioVigente(item.variante) * item.cantidad * DESCUENTO_VOLUMEN_TASA;
    }, 0),
  );

  const subtotalProductos = redondearMoneda(subtotalOriginal - descuentoVolumen);
  const costoEnvio = tipoEnvio === 'EXPRESS'
    ? COSTO_ENVIO_EXPRESS
    : subtotalProductos >= ENVIO_GRATIS_DESDE
      ? 0
      : COSTO_ENVIO_STANDARD;
  const igvIncluido = redondearMoneda(subtotalProductos - subtotalProductos / (1 + IGV_TASA));
  const ahorroEnvio =
    tipoEnvio === 'STANDARD' && subtotalProductos >= ENVIO_GRATIS_DESDE ? COSTO_ENVIO_STANDARD : 0;
  const ahorroTotal = redondearMoneda(descuentoOferta + descuentoVolumen + ahorroEnvio);

  return {
    subtotalOriginal,
    subtotalProductos,
    descuentoOferta,
    descuentoVolumen,
    descuentoCupon: 0,
    costoEnvio: redondearMoneda(costoEnvio),
    envioGratis: costoEnvio === 0 && tipoEnvio === 'STANDARD',
    igvIncluido,
    total: redondearMoneda(subtotalProductos + costoEnvio),
    ahorroTotal,
    tipoEnvio,
    umbralEnvioGratis: ENVIO_GRATIS_DESDE,
    faltanteEnvioGratis:
      tipoEnvio === 'STANDARD' && subtotalProductos < ENVIO_GRATIS_DESDE
        ? redondearMoneda(ENVIO_GRATIS_DESDE - subtotalProductos)
        : 0,
  };
}
