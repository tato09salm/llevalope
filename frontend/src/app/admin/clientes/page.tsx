'use client';

import { useEffect, useMemo, useState } from 'react';
import { Eye, Loader2, UserCog } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminShell from '../../../components/admin/AdminShell';
import { pedidosAPI, usuariosAPI } from '../../../lib/api';
import { DireccionUsuario, Pedido, Usuario } from '../../../types';

export default function AdminClientesPage() {
  const [clientes, setClientes] = useState<Usuario[]>([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Usuario | null>(null);
  const [pedidosCliente, setPedidosCliente] = useState<Pedido[]>([]);
  const [direccionesCliente, setDireccionesCliente] = useState<DireccionUsuario[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtroActivo, setFiltroActivo] = useState<'todos' | 'activos' | 'inactivos'>('todos');
  const [cargando, setCargando] = useState(true);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [actualizandoEstado, setActualizandoEstado] = useState<number | null>(null);

  useEffect(() => {
    cargarClientes();
  }, [busqueda, filtroActivo]);

  const cargarClientes = async () => {
    setCargando(true);
    try {
      const resp: any = await usuariosAPI.listar({
        busqueda: busqueda || undefined,
        activo:
          filtroActivo === 'todos'
            ? undefined
            : filtroActivo === 'activos',
      });
      setClientes((resp?.datos || []).filter((usuario: Usuario) => usuario.rol === 'CLIENTE'));
    } catch (error: any) {
      toast.error(error.message || 'No se pudieron cargar los clientes');
      setClientes([]);
    } finally {
      setCargando(false);
    }
  };


  const verDetalleCliente = async (cliente: Usuario) => {
    setClienteSeleccionado(cliente);
    setCargandoDetalle(true);
    try {
      const resp: any = await pedidosAPI.listarAdmin({ limite: 200 });
      const pedidosBasicos = (resp?.datos || []).filter((pedido: Pedido) => pedido.usuarioId === cliente.id);
      const pedidosDetallados = await Promise.all(
        pedidosBasicos.map((pedido: Pedido) => pedidosAPI.obtener(pedido.id)),
      );

      const direccionesMap = new Map<string, DireccionUsuario>();
      pedidosDetallados.forEach((pedido: Pedido) => {
        if (pedido.direccion) {
          const key = `${pedido.direccion.nombreCompleto}-${pedido.direccion.direccion}-${pedido.direccion.distrito}`;
          direccionesMap.set(key, pedido.direccion);
        }
      });

      setPedidosCliente(pedidosDetallados);
      setDireccionesCliente(Array.from(direccionesMap.values()));
    } catch (error: any) {
      toast.error(error.message || 'No se pudo cargar el detalle del cliente');
      setPedidosCliente([]);
      setDireccionesCliente([]);
    } finally {
      setCargandoDetalle(false);
    }
  };

  const cambiarEstadoCliente = async (cliente: Usuario, activo: boolean) => {
    setActualizandoEstado(cliente.id);
    try {
      const actualizado = await usuariosAPI.actualizarEstado(cliente.id, activo);
      setClientes((prev) => prev.map((item) => (item.id === cliente.id ? { ...item, ...actualizado } : item)));
      if (clienteSeleccionado?.id === cliente.id) {
        setClienteSeleccionado((prev) => (prev ? { ...prev, activo } : prev));
      }
      toast.success(`Cuenta ${activo ? 'activada' : 'desactivada'} correctamente`);
    } catch (error: any) {
      toast.error(error.message || 'No se pudo actualizar el estado del cliente');
    } finally {
      setActualizandoEstado(null);
    }
  };

  const totalComprado = useMemo(
    () =>
      pedidosCliente.reduce((acc, pedido) => {
        const totalPedido = Number(pedido.total);
        return acc + (Number.isFinite(totalPedido) ? totalPedido : 0);
      }, 0),
    [pedidosCliente],
  );

  const formatPrecio = (valor: number) =>
    new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(valor);

  return (
    <AdminShell
      title="Gestion de Clientes"
      description="Consulta clientes registrados, su historial de compra y direcciones asociadas."
      icon={UserCog}
    >
      <div className="bg-white rounded-2xl shadow-card p-4 flex flex-wrap gap-4">
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre o correo"
          className="input-campo flex-1 min-w-[220px]"
        />
        <select
          value={filtroActivo}
          onChange={(e) => setFiltroActivo(e.target.value as 'todos' | 'activos' | 'inactivos')}
          className="input-campo max-w-xs"
        >
          <option value="todos">Todos los estados</option>
          <option value="activos">Activos</option>
          <option value="inactivos">Inactivos</option>
        </select>
      </div>

      <div className="grid xl:grid-cols-[1.2fr_0.8fr] gap-6">
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
                    <th className="text-left px-5 py-3.5 text-xs font-bold text-azul-oscuro uppercase tracking-wide">Cliente</th>
                    <th className="text-left px-5 py-3.5 text-xs font-bold text-azul-oscuro uppercase tracking-wide">Correo</th>
                    <th className="text-left px-5 py-3.5 text-xs font-bold text-azul-oscuro uppercase tracking-wide">Telefono</th>
                    <th className="text-left px-5 py-3.5 text-xs font-bold text-azul-oscuro uppercase tracking-wide">Registro</th>
                    <th className="text-center px-5 py-3.5 text-xs font-bold text-azul-oscuro uppercase tracking-wide">Cuenta</th>
                    <th className="text-center px-5 py-3.5 text-xs font-bold text-azul-oscuro uppercase tracking-wide">Detalle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {clientes.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-16 text-gris-elegante">
                        No hay clientes para los filtros aplicados.
                      </td>
                    </tr>
                  ) : (
                    clientes.map((cliente) => (
                      <tr key={cliente.id} className="hover:bg-crema transition-colors">
                        <td className="px-5 py-4 text-sm font-medium text-azul-oscuro">
                          {cliente.nombre} {cliente.apellido}
                        </td>
                        <td className="px-5 py-4 text-sm text-gris-elegante">{cliente.correo}</td>
                        <td className="px-5 py-4 text-sm text-gris-elegante">{cliente.telefono || '-'}</td>
                        <td className="px-5 py-4 text-sm text-gris-elegante">
                          {new Date(cliente.creadoEn).toLocaleDateString('es-PE')}
                        </td>
                        <td className="px-5 py-4 text-center">
                          <button
                            onClick={() => cambiarEstadoCliente(cliente, !cliente.activo)}
                            disabled={actualizandoEstado === cliente.id}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                              cliente.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                            }`}
                          >
                            {cliente.activo ? 'Activo' : 'Inactivo'}
                          </button>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <button
                            onClick={() => verDetalleCliente(cliente)}
                            className="inline-flex items-center gap-2 text-sm text-teal hover:underline"
                          >
                            <Eye size={15} /> Ver
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
          {!clienteSeleccionado ? (
            <div className="text-center text-gris-elegante py-16">
              Selecciona un cliente para ver pedidos y direcciones.
            </div>
          ) : cargandoDetalle ? (
            <div className="flex justify-center py-20">
              <Loader2 size={32} className="animate-spin text-teal" />
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-azul-oscuro">
                  {clienteSeleccionado.nombre} {clienteSeleccionado.apellido}
                </h2>
                <p className="text-sm text-gris-elegante">{clienteSeleccionado.correo}</p>
                <p className="text-sm text-gris-elegante">{clienteSeleccionado.telefono || 'Sin telefono'}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-crema rounded-xl p-3">
                  <p className="text-xs text-gris-elegante">Pedidos</p>
                  <p className="text-xl font-bold text-azul-oscuro">{pedidosCliente.length}</p>
                </div>
                <div className="bg-crema rounded-xl p-3">
                  <p className="text-xs text-gris-elegante">Total comprado</p>
                  <p className="text-xl font-bold text-azul-oscuro">{formatPrecio(totalComprado)}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-azul-oscuro mb-3">Direcciones</h3>
                <div className="space-y-3">
                  {direccionesCliente.length === 0 ? (
                    <p className="text-sm text-gris-elegante">Sin direcciones registradas en pedidos.</p>
                  ) : (
                    direccionesCliente.map((direccion, index) => (
                      <div key={`${direccion.direccion}-${index}`} className="bg-crema rounded-xl p-4 text-sm text-gris-elegante">
                        <p className="font-medium text-azul-oscuro">{direccion.alias}</p>
                        <p>{direccion.nombreCompleto}</p>
                        <p>{direccion.telefono}</p>
                        <p>
                          {direccion.direccion}, {direccion.distrito}, {direccion.provincia}, {direccion.departamento}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-azul-oscuro mb-3">Pedidos del cliente</h3>
                <div className="space-y-3 max-h-[360px] overflow-auto pr-1">
                  {pedidosCliente.length === 0 ? (
                    <p className="text-sm text-gris-elegante">Aun no registra pedidos.</p>
                  ) : (
                    pedidosCliente.map((pedido) => (
                      <div key={pedido.id} className="border border-gray-100 rounded-xl p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-medium text-azul-oscuro">{pedido.numeroPedido}</p>
                            <p className="text-xs text-gris-elegante">
                              {new Date(pedido.creadoEn).toLocaleString('es-PE')}
                            </p>
                          </div>
                          <span className="text-sm font-bold text-azul-oscuro">{formatPrecio(pedido.total)}</span>
                        </div>
                        <p className="text-sm text-gris-elegante mt-2">Estado: {pedido.estado}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>
    </AdminShell>
  );
}
