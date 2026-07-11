'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { LogoMercadoPago } from './LogosPago';
import { generarNumeroOperacion, logPago } from '../../../lib/pagos';

interface PagoMercadoPagoProps {
  monto: number;
  onExito: (resultado: { numeroOperacion?: string }) => void;
  onCancelar: () => void;
}

type FaseRedirect = 'conectando' | 'autorizando' | 'retornando';

/** Simulación de redirección a MercadoPago, mismo patrón que PagoPaypal. */
export default function PagoMercadoPago({ monto, onExito, onCancelar }: PagoMercadoPagoProps) {
  const [fase, setFase] = useState<FaseRedirect>('conectando');

  useEffect(() => {
    logPago('MERCADOPAGO', 'procesando', { fase: 'conectando' });
    const t1 = setTimeout(() => setFase('autorizando'), 1200);
    const t2 = setTimeout(() => setFase('retornando'), 2400);
    const t3 = setTimeout(() => {
      logPago('MERCADOPAGO', 'aprobado', {});
      onExito({ numeroOperacion: generarNumeroOperacion() });
    }, 3400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mensajes: Record<FaseRedirect, string> = {
    conectando: 'Conectando con MercadoPago...',
    autorizando: 'Autorizando el pago de forma segura...',
    retornando: 'Volviendo a LlevaloPe...',
  };

  return (
    <div className="space-y-6 text-center py-10">
      <LogoMercadoPago size={56} className="mx-auto" />
      <Loader2 className="mx-auto animate-spin text-teal" size={32} />
      <div>
        <p className="font-semibold text-azul-oscuro">{mensajes[fase]}</p>
        <p className="text-sm text-gris-elegante mt-1">
          Monto a autorizar:{' '}
          {new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(monto)}
        </p>
      </div>
      <button type="button" onClick={onCancelar} className="text-sm text-teal font-semibold underline">
        Cancelar y elegir otro método
      </button>
    </div>
  );
}
