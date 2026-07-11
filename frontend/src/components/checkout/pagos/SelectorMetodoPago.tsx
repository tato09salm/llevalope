'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { METODOS_PAGO_UI, MetodoPagoUI } from '../../../lib/pagos';
import { LogoMetodo } from './LogosPago';

interface SelectorMetodoPagoProps {
  valor: MetodoPagoUI;
  onCambiar: (metodo: MetodoPagoUI) => void;
}

export default function SelectorMetodoPago({ valor, onCambiar }: SelectorMetodoPagoProps) {
  const [mostrarExtra, setMostrarExtra] = useState(false);

  const principales = METODOS_PAGO_UI.filter((m) => !m.extra);
  const extra = METODOS_PAGO_UI.filter((m) => m.extra);

  const renderTarjeta = (metodo: (typeof METODOS_PAGO_UI)[number]) => {
    const activo = valor === metodo.id;
    return (
      <button
        key={metodo.id}
        type="button"
        onClick={() => onCambiar(metodo.id)}
        className={`flex items-center gap-3 border rounded-xl p-4 text-left transition-colors ${
          activo ? 'border-teal bg-teal/5 ring-1 ring-teal' : 'border-gray-200 hover:border-teal/50'
        }`}
      >
        <LogoMetodo id={metodo.id} size={40} />
        <div className="min-w-0">
          <p className="font-semibold text-azul-oscuro text-sm">{metodo.label}</p>
          <p className="text-xs text-gris-elegante truncate">{metodo.descripcion}</p>
          {!metodo.instantaneo && (
            <span className="inline-block mt-1 text-[10px] font-semibold uppercase tracking-wide text-dorado-oscuro bg-dorado/10 rounded-full px-2 py-0.5">
              Pago pendiente
            </span>
          )}
        </div>
      </button>
    );
  };

  return (
    <div>
      <div className="grid sm:grid-cols-2 gap-3">{principales.map(renderTarjeta)}</div>

      <button
        type="button"
        onClick={() => setMostrarExtra((prev) => !prev)}
        className="mt-4 flex items-center gap-1 text-sm text-teal font-semibold"
      >
        {mostrarExtra ? 'Ocultar otras billeteras' : 'Ver mas billeteras peruanas'}
        {mostrarExtra ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {mostrarExtra && (
        <div className="grid sm:grid-cols-2 gap-3 mt-3">{extra.map(renderTarjeta)}</div>
      )}
    </div>
  );
}
