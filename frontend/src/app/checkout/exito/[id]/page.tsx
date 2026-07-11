'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../../../components/layout/Navbar';
import Footer from '../../../../components/layout/Footer';
import PagoExito from '../../../../components/checkout/pagos/PagoExito';
import { pedidosAPI } from '../../../../lib/api';
import { obtenerDatosPagoLocal } from '../../../../lib/pagos';
import { Pedido } from '../../../../types';

export default function CheckoutExitoPage() {
  const params = useParams();
  const id = Number(params?.id);
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    pedidosAPI
      .obtener(id)
      .then((resp: any) => setPedido(resp))
      .catch(() => setError(true))
      .finally(() => setCargando(false));
  }, [id]);

  if (cargando) {
    return (
      <>
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-16 text-center text-gris-elegante">
          Cargando confirmación de tu pedido...
        </div>
        <Footer />
      </>
    );
  }

  if (error || !pedido) {
    return (
      <>
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-azul-oscuro mb-3">No encontramos ese pedido</h1>
          <Link href="/cuenta/pedidos" className="btn-primario inline-block">
            Ver mis pedidos
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  const datosPagoLocal = obtenerDatosPagoLocal(String(pedido.id));

  return (
    <>
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-10">
        <PagoExito
          numeroPedido={pedido.numeroPedido}
          pedidoId={pedido.id}
          metodo={pedido.metodoPago}
          total={Number(pedido.total)}
          estadoPago={pedido.estadoPago === 'PAGADO' ? 'PAGADO' : 'PENDIENTE'}
          numeroOperacion={datosPagoLocal?.numeroOperacion}
        />
      </div>
      <Footer />
    </>
  );
}
