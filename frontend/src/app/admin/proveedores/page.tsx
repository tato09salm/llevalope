'use client';

import { useEffect, useMemo, useState } from 'react';
import { Loader2, Plus, Truck } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminShell from '../../../components/admin/AdminShell';
import { productosAPI, proveedoresAPI } from '../../../lib/api';
import { OrdenCompra, Producto, Proveedor } from '../../../types';

const NUEVO_PROVEEDOR = {
  nombre: '',
  ruc: '',
  contacto: '',
  correo: '',
  telefono: '',
  pais: 'Peru',
  direccion: '',
  notas: '',
};

const NUEVO_ITEM_OC = {
  productoId: '',
  varianteId: '',
  cantidadPedida: 1,
  precioUnit: 0,
};

export default function AdminProveedoresPage() {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [ordenes, setOrdenes] = useState<OrdenCompra[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [proveedorSeleccionadoId, setProveedorSeleccionadoId] = useState<number | ''>('');
  const [cargando, setCargando] = useState(true);
  const [guardandoProveedor, setGuardandoProveedor] = useState(false);
  const [guardandoOrden, setGuardandoOrden] = useState(false);
  const [nuevoProveedor, setNuevoProveedor] = useState(NUEVO_PROVEEDOR);
  const [ordenForm, setOrdenForm] = useState({
    proveedorId: '',
    notas: '',
    items: [{ ...NUEVO_ITEM_OC }],
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [proveedoresResp, ordenesResp, productosResp] = await Promise.all([
        proveedoresAPI.listar(),
        proveedoresAPI.listarOrdenes(),
        productosAPI.listarAdmin({ limite: 100 }),
      ]);
      setProveedores(proveedoresResp || []);
      setOrdenes(ordenesResp || []);
      setProductos(productosResp?.datos || []);

      const primerProveedor = (proveedoresResp || [])[0];
      if (primerProveedor) {
        setProveedorSeleccionadoId(primerProveedor.id);
        setOrdenForm((prev) => ({ ...prev, proveedorId: String(primerProveedor.id) }));
      }
    } catch (error: any) {
      toast.error(error.message || 'No se pudieron cargar proveedores');
    } finally {
      setCargando(false);
    }
  };

  const variantesDisponibles = useMemo(
    () =>
      productos.flatMap((producto) =>
        (producto.variantes || []).map((variante) => ({
          ...variante,
          productoNombre: producto.nombre,
          productoId: producto.id,
        })),
      ),
    [productos],
  );

  const ordenesFiltradas = useMemo(
    () =>
      proveedorSeleccionadoId
        ? ordenes.filter((orden) => orden.proveedorId === proveedorSeleccionadoId)
        : ordenes,
    [ordenes, proveedorSeleccionadoId],
  );

  const guardarProveedor = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardandoProveedor(true);
    try {
      await proveedoresAPI.crear(nuevoProveedor);
      toast.success('Proveedor creado correctamente');
      setNuevoProveedor(NUEVO_PROVEEDOR);
      await cargarDatos();
    } catch (error: any) {
      toast.error(error.message || 'No se pudo crear el proveedor');
    } finally {
      setGuardandoProveedor(false);
    }
  };

  const agregarItemOrden = () => {
    setOrdenForm((prev) => ({
      ...prev,
      items: [...prev.items, { ...NUEVO_ITEM_OC }],
    }));
  };

  const actualizarItemOrden = (index: number, campo: string, valor: string | number) => {
    setOrdenForm((prev) => {
      const items = [...prev.items];
      const actual = { ...items[index], [campo]: valor };

      if (campo === 'varianteId') {
        const variante = variantesDisponibles.find((item) => item.id === Number(valor));
        if (variante) {
          actual.productoId = String(variante.productoId);
          actual.precioUnit = Number(variante.precioBase);
        }
      }

      items[index] = actual;
      return { ...prev, items };
    });
  };

  const eliminarItemOrden = (index: number) => {
    setOrdenForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const guardarOrdenCompra = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ordenForm.proveedorId) {
      toast.error('Selecciona un proveedor para la orden');
      return;
    }

    setGuardandoOrden(true);
    try {
      await proveedoresAPI.crearOrden({
        proveedorId: Number(ordenForm.proveedorId),
        notas: ordenForm.notas || undefined,
        items: ordenForm.items.map((item) => ({
          productoId: Number(item.productoId),
          varianteId: Number(item.varianteId),
          cantidadPedida: Number(item.cantidadPedida),
          precioUnit: Number(item.precioUnit),
        })),
      });
      toast.success('Orden de compra creada');
      setOrdenForm({
        proveedorId: ordenForm.proveedorId,
        notas: '',
        items: [{ ...NUEVO_ITEM_OC }],
      });
      await cargarDatos();
    } catch (error: any) {
      toast.error(error.message || 'No se pudo crear la orden de compra');
    } finally {
      setGuardandoOrden(false);
    }
  };

  const formatPrecio = (valor: number) =>
    new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(valor);

  return (
    <AdminShell
      title="Gestion de Proveedores"
      description="Administra proveedores y registra ordenes de compra con sus items."
      icon={Truck}
    >
      {cargando ? (
        <div className="flex justify-center py-24">
          <Loader2 size={36} className="animate-spin text-teal" />
        </div>
      ) : (
        <div className="grid xl:grid-cols-[0.9fr_1.1fr] gap-6">
          <section className="space-y-6">
            <div className="bg-white rounded-2xl shadow-card p-6">
              <h2 className="text-lg font-bold text-azul-oscuro mb-4">Nuevo proveedor</h2>
              <form onSubmit={guardarProveedor} className="grid md:grid-cols-2 gap-4">
                {Object.entries(nuevoProveedor).map(([key, value]) => (
                  <input
                    key={key}
                    value={value}
                    onChange={(e) => setNuevoProveedor((prev) => ({ ...prev, [key]: e.target.value }))}
                    placeholder={key}
                    className={`input-campo ${key === 'direccion' || key === 'notas' ? 'md:col-span-2' : ''}`}
                    required={key === 'nombre' || key === 'ruc'}
                  />
                ))}
                <div className="md:col-span-2">
                  <button disabled={guardandoProveedor} className="btn-primario inline-flex items-center gap-2">
                    <Plus size={16} /> {guardandoProveedor ? 'Guardando...' : 'Crear proveedor'}
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-white rounded-2xl shadow-card overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-lg font-bold text-azul-oscuro">Proveedores registrados</h2>
                <select
                  value={String(proveedorSeleccionadoId)}
                  onChange={(e) => setProveedorSeleccionadoId(e.target.value ? Number(e.target.value) : '')}
                  className="input-campo max-w-xs"
                >
                  <option value="">Todos</option>
                  {proveedores.map((proveedor) => (
                    <option key={proveedor.id} value={proveedor.id}>
                      {proveedor.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="divide-y divide-gray-50">
                {proveedores.map((proveedor) => (
                  <button
                    key={proveedor.id}
                    onClick={() => {
                      setProveedorSeleccionadoId(proveedor.id);
                      setOrdenForm((prev) => ({ ...prev, proveedorId: String(proveedor.id) }));
                    }}
                    className={`w-full text-left p-4 hover:bg-crema transition-colors ${
                      proveedorSeleccionadoId === proveedor.id ? 'bg-crema' : ''
                    }`}
                  >
                    <p className="font-medium text-azul-oscuro">{proveedor.nombre}</p>
                    <p className="text-sm text-gris-elegante">
                      RUC {proveedor.ruc} {proveedor.contacto ? `| ${proveedor.contacto}` : ''}
                    </p>
                    <p className="text-xs text-gris-elegante mt-1">
                      {proveedor.correo || 'Sin correo'} {proveedor.telefono ? `| ${proveedor.telefono}` : ''}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="bg-white rounded-2xl shadow-card p-6">
              <h2 className="text-lg font-bold text-azul-oscuro mb-4">Nueva orden de compra</h2>
              <form onSubmit={guardarOrdenCompra} className="space-y-4">
                <select
                  value={ordenForm.proveedorId}
                  onChange={(e) => setOrdenForm((prev) => ({ ...prev, proveedorId: e.target.value }))}
                  className="input-campo"
                  required
                >
                  <option value="">Selecciona un proveedor</option>
                  {proveedores.map((proveedor) => (
                    <option key={proveedor.id} value={proveedor.id}>
                      {proveedor.nombre}
                    </option>
                  ))}
                </select>

                {ordenForm.items.map((item, index) => (
                  <div key={index} className="border border-gray-100 rounded-xl p-4 space-y-3">
                    <select
                      value={item.varianteId}
                      onChange={(e) => actualizarItemOrden(index, 'varianteId', e.target.value)}
                      className="input-campo"
                      required
                    >
                      <option value="">Selecciona una variante</option>
                      {variantesDisponibles.map((variante) => (
                        <option key={variante.id} value={variante.id}>
                          {variante.productoNombre} - {variante.sku}
                        </option>
                      ))}
                    </select>
                    <div className="grid md:grid-cols-2 gap-3">
                      <input
                        type="number"
                        min={1}
                        value={item.cantidadPedida}
                        onChange={(e) => actualizarItemOrden(index, 'cantidadPedida', Number(e.target.value))}
                        className="input-campo"
                        placeholder="Cantidad"
                        required
                      />
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={item.precioUnit}
                        onChange={(e) => actualizarItemOrden(index, 'precioUnit', Number(e.target.value))}
                        className="input-campo"
                        placeholder="Precio unitario"
                        required
                      />
                    </div>
                    {ordenForm.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => eliminarItemOrden(index)}
                        className="text-sm text-red-600 hover:underline"
                      >
                        Eliminar item
                      </button>
                    )}
                  </div>
                ))}

                <button type="button" onClick={agregarItemOrden} className="btn-secundario inline-flex items-center gap-2">
                  <Plus size={16} /> Agregar item
                </button>

                <textarea
                  value={ordenForm.notas}
                  onChange={(e) => setOrdenForm((prev) => ({ ...prev, notas: e.target.value }))}
                  className="input-campo min-h-[100px]"
                  placeholder="Notas de la orden"
                />

                <button disabled={guardandoOrden} className="btn-primario w-full">
                  {guardandoOrden ? 'Creando orden...' : 'Crear orden de compra'}
                </button>
              </form>
            </div>

            <div className="bg-white rounded-2xl shadow-card p-6">
              <h2 className="text-lg font-bold text-azul-oscuro mb-4">Ordenes por proveedor</h2>
              <div className="space-y-4 max-h-[520px] overflow-auto pr-1">
                {ordenesFiltradas.length === 0 ? (
                  <p className="text-sm text-gris-elegante">No hay ordenes para el proveedor seleccionado.</p>
                ) : (
                  ordenesFiltradas.map((orden) => (
                    <div key={orden.id} className="border border-gray-100 rounded-xl p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-azul-oscuro">{orden.numeroOrden}</p>
                          <p className="text-sm text-gris-elegante">{orden.proveedor?.nombre}</p>
                          <p className="text-xs text-gris-elegante">
                            {new Date(orden.creadoEn).toLocaleString('es-PE')}
                          </p>
                        </div>
                        <span className="font-bold text-azul-oscuro">{formatPrecio(orden.total)}</span>
                      </div>
                      <div className="mt-3 space-y-2">
                        {orden.items.map((item) => (
                          <div key={item.id} className="bg-crema rounded-lg p-3 text-sm">
                            <p className="text-gris-elegante">
                              Variante #{item.varianteId} | Cantidad {item.cantidadPedida}
                            </p>
                            <p className="font-medium text-azul-oscuro">{formatPrecio(item.subtotal)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        </div>
      )}
    </AdminShell>
  );
}
