'use client';

import Link from 'next/link';
import { CheckCircle2, Clock3 } from 'lucide-react';
import { LogoMetodo } from './LogosPago';
import { MetodoPagoUI, obtenerDefinicionMetodo } from '../../../lib/pagos';

interface PagoExitoProps {
  numeroPedido: string;
  pedidoId: number;
  metodo: MetodoPagoUI;
  total: number;
  estadoPago: 'PAGADO' | 'PENDIENTE';
  numeroOperacion?: string;
}

export default function PagoExito({
  numeroPedido,
  pedidoId,
  metodo,
  total,
  estadoPago,
  numeroOperacion,
}: PagoExitoProps) {
  const definicion = obtenerDefinicionMetodo(metodo);

  return (
    <div className="max-w-lg mx-auto text-center space-y-6 py-6">
      {estadoPago === 'PAGADO' ? (
        <CheckCircle2 className="mx-auto text-teal" size={64} />
      ) : (
        <Clock3 className="mx-auto text-dorado" size={64} />
      )}

      <div>
        <h1 className="text-2xl font-bold text-azul-oscuro">
          {estadoPago === 'PAGADO' ? '¡Pago confirmado!' : 'Pedido registrado, pago pendiente'}
        </h1>
        <p className="text-gris-elegante mt-2">
          Pedido <span className="font-semibold text-azul-oscuro">{numeroPedido}</span> creado
          correctamente.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-card p-6 text-left space-y-3">
        <div className="flex items-center gap-3">
          <LogoMetodo id={metodo} size={36} />
          <div>
            <p className="font-semibold text-azul-oscuro">{definicion.label}</p>
            <p className="text-xs text-gris-elegante">
              Estado de pago: <span className="font-semibold">{estadoPago}</span>
            </p>
          </div>
        </div>

        {numeroOperacion && (
          <div className="flex justify-between text-sm">
            <span className="text-gris-elegante">Número de operación</span>
            <span className="font-semibold text-azul-oscuro">{numeroOperacion}</span>
          </div>
        )}

        <div className="flex justify-between text-sm border-t pt-3">
          <span className="text-gris-elegante">Total pagado</span>
          <span className="font-bold text-azul-oscuro">
            {new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(total)}
          </span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href={`/cuenta/pedidos?pedido=${pedidoId}`} className="btn-primario">
          Ver mis pedidos
        </Link>
        <Link href="/productos" className="btn-secundario">
          Seguir comprando
        </Link>
      </div>
    </div>
  );
}
