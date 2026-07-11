'use client';

import { useMemo, useState } from 'react';
import { Copy, Loader2, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { LogoPagoEfectivo } from './LogosPago';
import { generarCIP, logPago, simularPago } from '../../../lib/pagos';

interface PagoEfectivoProps {
  monto: number;
  onExito: (resultado: { cip?: string }) => void;
  onCancelar: () => void;
}

/** PagoEfectivo: genera un código CIP de 8 dígitos para pagar en agente o banca por internet. */
export default function PagoEfectivo({ monto, onExito, onCancelar }: PagoEfectivoProps) {
  const cip = useMemo(() => generarCIP(), []);
  const [estado, setEstado] = useState<'idle' | 'procesando'>('idle');

  const copiarCIP = async () => {
    try {
      await navigator.clipboard.writeText(cip);
      toast.success('Código CIP copiado');
    } catch {
      toast.error('No se pudo copiar el código');
    }
  };

  const confirmarPago = async () => {
    setEstado('procesando');
    logPago('PAGOEFECTIVO', 'procesando', { cip });
    await simularPago('PAGOEFECTIVO');
    toast.success('Pago con PagoEfectivo registrado como pendiente de verificación');
    onExito({ cip });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <LogoPagoEfectivo size={40} />
        <div>
          <h3 className="font-bold text-azul-oscuro">PagoEfectivo</h3>
          <p className="text-sm text-gris-elegante">
            Paga en un agente autorizado o banca por internet con este código
          </p>
        </div>
      </div>

      <div className="bg-crema rounded-2xl p-6 text-center space-y-3">
        <p className="text-sm text-gris-elegante">Código CIP</p>
        <div className="flex items-center justify-center gap-3">
          <p className="text-3xl font-bold tracking-[0.3em] text-azul-oscuro">{cip}</p>
          <button
            type="button"
            onClick={copiarCIP}
            className="text-teal hover:text-teal/70"
            aria-label="Copiar código CIP"
          >
            <Copy size={20} />
          </button>
        </div>
        <p className="text-sm text-gris-elegante">
          Monto a pagar:{' '}
          <span className="font-bold text-azul-oscuro">
            {new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(monto)}
          </span>
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={confirmarPago}
          disabled={estado === 'procesando'}
          className="btn-primario flex-1 flex items-center justify-center gap-2"
        >
          {estado === 'procesando' ? (
            <>
              <Loader2 size={18} className="animate-spin" /> Registrando...
            </>
          ) : (
            'Ya pagué el código CIP'
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
        <span>Tu pedido quedará pendiente hasta verificar el pago del código CIP.</span>
      </div>
    </div>
  );
}
