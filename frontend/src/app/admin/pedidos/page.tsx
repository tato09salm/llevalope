'use client';

import { useEffect, useState } from 'react';
import { Eye, Loader2, Package2 } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminShell from '../../../components/admin/AdminShell';
import { LogoMetodo } from '../../../components/checkout/pagos/LogosPago';
import { pedidosAPI } from '../../../lib/api';
import { Pedido } from '../../../types';

const ESTADOS_FILTRO = ['TODOS', 'PENDIENTE', 'CONFIRMADO', 'ENVIADO', 'ENTREGADO', 'CANCELADO'] as const;
const ESTADOS_ACTUALIZABLES = ['PENDIENTE', 'CONFIRMADO', 'ENVIADO', 'ENTREGADO', 'CANCELADO'] as const;
const METODOS_PAGO_FILTRO = [
  'TODOS',
  'TARJETA',
  'YAPE',
  'PLIN',
  'TRANSFERENCIA',
  'CONTRA_ENTREGA',
  'PAYPAL',
] as const;

export default function AdminPedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<Pedido | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<(typeof ESTADOS_FILTRO)[number]>('TODOS');
  const [filtroMetodoPago, setFiltroMetodoPago] = useState<(typeof METODOS_PAGO_FILTRO)[number]>('TODOS');
  const [cargando, setCargando] = useState(true);
  const [actualizandoEstado, setActualizandoEstado] = useState<number | null>(null);

  useEffect(() => {
    cargarPedidos();
  }, [filtroEstado]);

  const cargarPedidos = async () => {
    setCargando(true);
    try {
      const resp: any = await pedidosAPI.listarAdmin({
        estado: filtroEstado === 'TODOS' ? undefined : filtroEstado,
        limite: 100,
      });
      setPedidos(resp?.datos || []);
    } catch (error: any) {
      toast.error(error.message || 'No se pudieron cargar los pedidos');
      setPedidos([]);
    } finally {
      setCargando(false);
    }
  };

  const verDetalle = async (pedidoId: number) => {
    try {
      const detalle = await pedidosAPI.obtener(pedidoId);
      setPedidoSeleccionado(detalle);
    } catch (error: any) {
      toast.error(error.message || 'No se pudo cargar el detalle del pedido');
    }
  };

  const cambiarEstado = async (pedidoId: number, estado: string) => {
    setActualizandoEstado(pedidoId);
    try {
      await pedidosAPI.actualizarEstado(pedidoId, { estado });
      toast.success('Estado del pedido actualizado');
      await cargarPedidos();
      if (pedidoSeleccionado?.id === pedidoId) {
        await verDetalle(pedidoId);
      }
    } catch (error: any) {
      toast.error(error.message || 'No se pudo actualizar el estado');
    } finally {
      setActualizandoEstado(null);
    }
  };

  const formatPrecio = (valor: number) =>
    new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(valor);

  const pedidosFiltrados =
    filtroMetodoPago === 'TODOS'
      ? pedidos
      : pedidos.filter((pedido) => pedido.metodoPago === filtroMetodoPago);

  return (
    <AdminShell
      title="Gestion de Pedidos"
      description="Controla estados, consulta el detalle y revisa el historial de cambios."
      icon={Package2}
    >
      <div className="bg-white rounded-2xl shadow-card p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <span className="text-sm font-medium text-gris-elegante">Filtrar por estado:</span>
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value as (typeof ESTADOS_FILTRO)[number])}
            className="input-campo py-2.5 px-4 max-w-xs"
          >
            {ESTADOS_FILTRO.map((estado) => (
              <option key={estado} value={estado}>
                {estado}
              </option>
            ))}
          </select>

          <span className="text-sm font-medium text-gris-elegante">Metodo de pago:</span>
          <select
            value={filtroMetodoPago}
            onChange={(e) => setFiltroMetodoPago(e.target.value as (typeof METODOS_PAGO_FILTRO)[number])}
            className="input-campo py-2.5 px-4 max-w-xs"
          >
            {METODOS_PAGO_FILTRO.map((metodo) => (
              <option key={metodo} value={metodo}>
                {metodo}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid xl:grid-cols-[1.3fr_0.9fr] gap-6">
        <section className="bg-white rounded-2xl shadow-card overflow-hidden">
          {cargando ? (
            <div className="flex justify-center py-20">
              <Loader2 size={36} className="animate-spin text-teal" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-crema border-b border-gray-100">
                    <th className="text-left px-5 py-3.5 text-xs font-bold text-azul-oscuro uppercase tracking-wide">Numero</th>
                    <th className="text-left px-5 py-3.5 text-xs font-bold text-azul-oscuro uppercase tracking-wide">Cliente</th>
                    <th className="text-left px-5 py-3.5 text-xs font-bold text-azul-oscuro uppercase tracking-wide">Fecha</th>
                    <th className="text-right px-5 py-3.5 text-xs font-bold text-azul-oscuro uppercase tracking-wide">Total</th>
                    <th className="text-center px-5 py-3.5 text-xs font-bold text-azul-oscuro uppercase tracking-wide">Pago</th>
                    <th className="text-center px-5 py-3.5 text-xs font-bold text-azul-oscuro uppercase tracking-wide">Estado</th>
                    <th className="text-center px-5 py-3.5 text-xs font-bold text-azul-oscuro uppercase tracking-wide">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {pedidosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-16 text-gris-elegante">
                        No hay pedidos para el filtro seleccionado.
                      </td>
                    </tr>
                  ) : (
                    pedidosFiltrados.map((pedido) => (
                      <tr key={pedido.id} className="hover:bg-crema transition-colors">
                        <td className="px-5 py-4 text-sm font-semibold text-azul-oscuro">{pedido.numeroPedido}</td>
                        <td className="px-5 py-4 text-sm text-azul-oscuro">
                          {pedido.usuario?.nombre} {pedido.usuario?.apellido}
                        </td>
                        <td className="px-5 py-4 text-sm text-gris-elegante">
                          {new Date(pedido.creadoEn).toLocaleString('es-PE')}
                        </td>
                        <td className="px-5 py-4 text-sm text-right font-bold text-azul-oscuro">
                          {formatPrecio(pedido.total)}
                        </td>
                        <td className="px-5 py-4 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <LogoMetodo id={pedido.metodoPago} size={26} />
                            <span
                              className={`text-[9px] font-semibold uppercase tracking-wide rounded-full px-2 py-0.5 ${
                                pedido.estadoPago === 'PAGADO'
                                  ? 'bg-teal/10 text-teal'
                                  : 'bg-dorado/10 text-dorado-oscuro'
                              }`}
                            >
                              {pedido.estadoPago}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <select
                            value={pedido.estado}
                            onChange={(e) => cambiarEstado(pedido.id, e.target.value)}
                            disabled={actualizandoEstado === pedido.id}
                            className="input-campo py-2 px-3 text-xs min-w-[150px]"
                          >
                            {ESTADOS_ACTUALIZABLES.map((estado) => (
                              <option key={estado} value={estado}>
                                {estado}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <button
                            onClick={() => verDetalle(pedido.id)}
                            className="inline-flex items-center gap-2 text-sm text-teal hover:underline"
                          >
                            <Eye size={15} /> Ver detalle
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <aside className="bg-white rounded-2xl shadow-card p-6">
          {!pedidoSeleccionado ? (
            <div className="text-center text-gris-elegante py-16">
              Selecciona un pedido para ver su detalle e historial.
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-azul-oscuro">{pedidoSeleccionado.numeroPedido}</h2>
                <p className="text-sm text-gris-elegante">
                  {pedidoSeleccionado.usuario?.nombre} {pedidoSeleccionado.usuario?.apellido}
                </p>
                <p className="text-sm text-gris-elegante">{pedidoSeleccionado.usuario?.correo}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-crema rounded-xl p-3">
                  <p className="text-gris-elegante">Total</p>
                  <p className="font-bold text-azul-oscuro">{formatPrecio(pedidoSeleccionado.total)}</p>
                </div>
                <div className="bg-crema rounded-xl p-3">
                  <p className="text-gris-elegante">Estado</p>
                  <p className="font-bold text-azul-oscuro">{pedidoSeleccionado.estado}</p>
                </div>
                <div className="bg-crema rounded-xl p-3">
                  <p className="text-gris-elegante">Pago</p>
                  <p className="font-bold text-azul-oscuro flex items-center gap-2">
                    <LogoMetodo id={pedidoSeleccionado.metodoPago} size={22} />
                    {pedidoSeleccionado.metodoPago}
                  </p>
                  <p
                    className={`inline-block mt-1 text-[10px] font-semibold uppercase tracking-wide rounded-full px-2 py-0.5 ${
                      pedidoSeleccionado.estadoPago === 'PAGADO'
                        ? 'bg-teal/10 text-teal'
                        : 'bg-dorado/10 text-dorado-oscuro'
                    }`}
                  >
                    {pedidoSeleccionado.estadoPago}
                  </p>
                </div>
                <div className="bg-crema rounded-xl p-3">
                  <p className="text-gris-elegante">Envio</p>
                  <p className="font-bold text-azul-oscuro">{pedidoSeleccionado.tipoEnvio || 'STANDARD'}</p>
                </div>
              </div>

              {pedidoSeleccionado.direccion && (
                <div>
                  <h3 className="font-semibold text-azul-oscuro mb-2">Direccion</h3>
                  <div className="text-sm text-gris-elegante bg-crema rounded-xl p-4">
                    <p>{pedidoSeleccionado.direccion.nombreCompleto}</p>
                    <p>{pedidoSeleccionado.direccion.telefono}</p>
                    <p>
                      {pedidoSeleccionado.direccion.direccion}, {pedidoSeleccionado.direccion.distrito},{' '}
                      {pedidoSeleccionado.direccion.provincia}, {pedidoSeleccionado.direccion.departamento}
                    </p>
                    {pedidoSeleccionado.direccion.referencia && <p>Ref: {pedidoSeleccionado.direccion.referencia}</p>}
                  </div>
                </div>
              )}

              <div>
                <h3 className="font-semibold text-azul-oscuro mb-2">Items del pedido</h3>
                <div className="space-y-3">
                  {pedidoSeleccionado.items.map((item) => (
                    <div key={item.id} className="bg-crema rounded-xl p-4 text-sm">
                      <p className="font-medium text-azul-oscuro">{item.nombre}</p>
                      <p className="text-gris-elegante">
                        Cantidad: {item.cantidad} | Precio unitario: {formatPrecio(item.precioUnit)}
                      </p>
                      <p className="font-semibold text-azul-oscuro mt-1">{formatPrecio(item.subtotal)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-azul-oscuro mb-2">Historial de estados</h3>
                <div className="space-y-3">
                  {(pedidoSeleccionado.historial || []).map((evento) => (
                    <div key={evento.id} className="border-l-2 border-teal pl-3">
                      <p className="text-sm font-medium text-azul-oscuro">{evento.estado}</p>
                      <p className="text-sm text-gris-elegante">{evento.descripcion}</p>
                      <p className="text-xs text-gris-elegante">
                        {new Date(evento.creadoEn).toLocaleString('es-PE')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>
    </AdminShell>
  );
}
