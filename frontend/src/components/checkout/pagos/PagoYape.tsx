'use client';

import PagoBilleteraBase, { ResultadoExitoPago } from './PagoBilleteraBase';

interface PagoYapeProps {
  monto: number;
  onExito: (resultado: ResultadoExitoPago) => void;
  onCancelar: () => void;
}

/** Simulación del flujo Yape (BCP): QR real, número celular destino y timer de 5 min. */
export default function PagoYape({ monto, onExito, onCancelar }: PagoYapeProps) {
  return (
    <PagoBilleteraBase
      metodo="YAPE"
      monto={monto}
      numeroDestino="987 654 321"
      colorPrincipal="#7C2AE8"
      onExito={onExito}
      onCancelar={onCancelar}
    />
  );
}
