'use client';

import PagoBilleteraBase, { ResultadoExitoPago } from './PagoBilleteraBase';

interface PagoPlinProps {
  monto: number;
  onExito: (resultado: ResultadoExitoPago) => void;
  onCancelar: () => void;
}

/** Simulación del flujo Plin: mismo patrón que Yape con la marca visual de Plin. */
export default function PagoPlin({ monto, onExito, onCancelar }: PagoPlinProps) {
  return (
    <PagoBilleteraBase
      metodo="PLIN"
      monto={monto}
      numeroDestino="912 345 678"
      colorPrincipal="#00BFB3"
      onExito={onExito}
      onCancelar={onCancelar}
    />
  );
}
