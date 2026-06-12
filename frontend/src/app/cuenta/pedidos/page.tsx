'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Navbar from '../../../components/layout/Navbar';
import Footer from '../../../components/layout/Footer';
import CuentaNav from '../../../components/cuenta/CuentaNav';
import { pedidosAPI } from '../../../lib/api';
import { useAuthStore } from '../../../store/auth.store';
import { useCarritoStore } from '../../../store/carrito.store';
import { Pedido } from '../../../types';

export default function PedidosCuentaPage() {
  const { usuario } = useAuthStore();
  const { agregar } = useCarritoStore();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [cargando, setCargando] = useState(true);
  const [recomprandoId, setRecomprandoId] = useState<number | null>(null);

  useEffect(() => {
    if (!usuario) return;

    cargarPedidos();
    const timer = setInterval(() => {
      cargarPedidos(true).catch(() => undefined);
    }, 30000);

    return () => clearInterval(timer);
  }, [usuario]);

  const cargarPedidos = async (silencioso = false) => {
    if (!silencioso) setCargando(true);
    try {
      const resp: any = await pedidosAPI.listarMios();
      setPedidos(Array.isArray(resp) ? resp : []);
    } catch (error: any) {
      toast.error(error.message || 'No se pudieron cargar los pedidos');
    } finally {
      if (!silencioso) setCargando(false);
    }
  };

  const recomprar = async (pedido: Pedido) => {
    setRecomprandoId(pedido.id);
    try {
      for (const item of pedido.items) {
        if (item.producto && item.variante) {
          await agregar(item.producto, item.variante, item.cantidad);
        }
      }
      toast.success('Productos agregados nuevamente al carrito');
    } catch (error: any) {
      toast.error(error.message || 'No se pudo completar la recompra');
    } finally {
      setRecomprandoId(null);
    }
  };

  const formatPrecio = (valor: number) =>
    new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(valor);

  if (!usuario) {
    return (
      <>
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold text-azul-oscuro mb-3">Inicia sesion para ver tus pedidos</h1>
          <Link href="/auth/iniciar-sesion" className="btn-primario inline-block">
            Iniciar sesion
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-azul-oscuro mb-2">Historial de pedidos</h1>
        <p className="text-gris-elegante mb-6">Estado actualizado automaticamente cada 30 segundos.</p>
        <CuentaNav />

        {cargando ? (
          <div className="bg-white rounded-2xl shadow-card p-8 text-center text-gris-elegante">
            Cargando pedidos...
          </div>
        ) : pedidos.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-card p-8 text-center">
            <p className="text-gris-elegante mb-4">Aun no tienes pedidos registrados.</p>
            <Link href="/productos" className="btn-primario inline-block">
              Ir a comprar
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {pedidos.map((pedido) => (
              <article key={pedido.id} className="bg-white rounded-2xl shadow-card p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-5">
                  <div>
                    <h2 className="text-xl font-bold text-azul-oscuro">{pedido.numeroPedido}</h2>
                    <p className="text-sm text-gris-elegante">
                      {new Date(pedido.creadoEn).toLocaleString('es-PE')}
                    </p>
                    <p className="text-sm text-gris-elegante">
                      Estado actual: <span className="font-semibold text-azul-oscuro">{pedido.estado}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-azul-oscuro">{formatPrecio(pedido.total)}</p>
                    <p className="text-sm text-gris-elegante">
                      Envio: {pedido.tipoEnvio || 'STANDARD'}
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-azul-oscuro mb-3">Items</h3>
                    <div className="space-y-3">
                      {pedido.items.map((item) => (
                        <div key={item.id} className="border border-gray-100 rounded-xl p-4">
                          <p className="font-medium text-azul-oscuro">{item.nombre}</p>
                          <p className="text-sm text-gris-elegante">
                            Cantidad: {item.cantidad} | Precio unitario: {formatPrecio(item.precioUnit)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-azul-oscuro mb-2">Resumen</h3>
                      <div className="space-y-1 text-sm text-gris-elegante">
                        <p>Subtotal: {formatPrecio(pedido.subtotal)}</p>
                        <p>Descuento: {formatPrecio(pedido.descuento)}</p>
                        <p>Envio: {formatPrecio(pedido.costoEnvio)}</p>
                        <p>IGV incluido: {formatPrecio(pedido.impuestos)}</p>
                        <p>Ahorro total: {formatPrecio(pedido.ahorroTotal || 0)}</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-azul-oscuro mb-2">Trazabilidad</h3>
                      <div className="space-y-2">
                        {(pedido.historial || []).map((evento) => (
                          <div key={evento.id} className="border-l-2 border-teal pl-3">
                            <p className="text-sm font-medium text-azul-oscuro">{evento.estado}</p>
                            <p className="text-xs text-gris-elegante">{evento.descripcion}</p>
                            <p className="text-xs text-gris-elegante">
                              {new Date(evento.creadoEn).toLocaleString('es-PE')}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => recomprar(pedido)}
                        disabled={recomprandoId === pedido.id}
                        className="btn-primario"
                      >
                        {recomprandoId === pedido.id ? 'Recomprando...' : 'Recompra rapida'}
                      </button>
                      <Link href="/carrito" className="btn-secundario">
                        Ver carrito
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
