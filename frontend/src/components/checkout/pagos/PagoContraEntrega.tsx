'use client';

import { useState } from 'react';
import { Loader2, MapPin, ShieldCheck, Truck } from 'lucide-react';
import { logPago, simularPago } from '../../../lib/pagos';
import { DireccionUsuario } from '../../../types';

interface PagoContraEntregaProps {
  monto: number;
  direccion?: DireccionUsuario | null;
  onExito: () => void;
  onCancelar: () => void;
}

export default function PagoContraEntrega({
  monto,
  direccion,
  onExito,
  onCancelar,
}: PagoContraEntregaProps) {
  const [estado, setEstado] = useState<'idle' | 'procesando'>('idle');

  const confirmar = async () => {
    setEstado('procesando');
    logPago('CONTRA_ENTREGA', 'procesando', {});
    await simularPago('CONTRA_ENTREGA');
    onExito();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Truck className="text-teal" size={32} />
        <div>
          <h3 className="font-bold text-azul-oscuro">Pago contra entrega</h3>
          <p className="text-sm text-gris-elegante">
            Paga en efectivo o con POS directamente al repartidor
          </p>
        </div>
      </div>

      {direccion && (
        <div className="bg-crema rounded-2xl p-5 text-sm">
          <p className="flex items-center gap-2 font-semibold text-azul-oscuro mb-2">
            <MapPin size={16} className="text-dorado" /> Entrega en
          </p>
          <p className="text-gris-elegante">{direccion.nombreCompleto} - {direccion.telefono}</p>
          <p className="text-gris-elegante">
            {direccion.direccion}, {direccion.distrito}, {direccion.provincia}, {direccion.departamento}
          </p>
        </div>
      )}

      <div className="bg-dorado/10 border border-dorado/30 rounded-2xl p-5 text-center">
        <p className="text-sm text-gris-elegante">Monto a pagar al repartidor</p>
        <p className="text-2xl font-bold text-azul-oscuro">
          {new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(monto)}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={confirmar}
          disabled={estado === 'procesando'}
          className="btn-primario flex-1 flex items-center justify-center gap-2"
        >
          {estado === 'procesando' ? (
            <>
              <Loader2 size={18} className="animate-spin" /> Confirmando...
            </>
          ) : (
            'Confirmar pedido contra entrega'
          )}
        </button>
        <button
          type="button"
          onClick={onCancelar}
          disabled={estado === 'procesando'}
          className="btn-secundario"
        >
          Cambiar método
        </button>
      </div>

      <div className="flex items-start gap-2 text-xs text-gris-elegante">
        <ShieldCheck size={14} className="mt-0.5 text-teal shrink-0" />
        <span>Tu pedido quedará con estado de pago pendiente hasta la entrega.</span>
      </div>
    </div>
  );
}
