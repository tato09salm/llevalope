'use client';

import { Fragment, useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Truck, Package, Loader2, Save, ChevronDown, ChevronUp } from 'lucide-react';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import AdminShell from '../../../components/admin/AdminShell';
import { productosAPI, proveedoresAPI } from '../../../lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const ESTADOS_ORDEN = [
  { valor: 'BORRADOR', etiqueta: 'Borrador' },
  { valor: 'ENVIADA', etiqueta: 'Enviada' },
  { valor: 'CONFIRMADA', etiqueta: 'Confirmada' },
  { valor: 'EN_TRANSITO', etiqueta: 'En tránsito' },
  { valor: 'RECIBIDA_PARCIAL', etiqueta: 'Recibida parcial' },
  { valor: 'RECIBIDA', etiqueta: 'Recibida' },
  { valor: 'CANCELADA', etiqueta: 'Cancelada' },
] as const;

const extraerMensajeError = (error: any, fallback: string) => {
  if (!error) return fallback;
  if (typeof error.message === 'string') return error.message;
  if (Array.isArray(error.message)) return error.message.join(', ');
  return fallback;
};

const normalizarLista = <T,>(respuesta: T[] | { datos?: T[] } | null | undefined): T[] => {
  if (Array.isArray(respuesta)) return respuesta;
  if (respuesta && Array.isArray(respuesta.datos)) return respuesta.datos;
  return [];
};

const actualizarEstadoOrden = async (id: number, estado: string) => {
  const token = Cookies.get('llevalope_token');
  const response = await fetch(`${API_URL}/proveedores/ordenes/${id}/estado`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: 'include',
    body: JSON.stringify({ estado }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(extraerMensajeError(data, 'No se pudo actualizar el estado de la orden'));
  }
  return data;
};

const FORMULARIO_INICIAL = {
  nombre: '',
  ruc: '',
  contacto: '',
  correo: '',
  telefono: '',
  pais: 'Perú',
  direccion: '',
  notas: '',
  activo: true,
};

const ITEM_OC_INICIAL = {
  productoId: '',
  varianteId: '',
  cantidadPedida: 1,
  precioUnit: 0,
};

export default function AdminProveedoresPage() {
  const [pestañaActiva, setPestañaActiva] = useState<'lista' | 'ordenes' | 'detalle'>('lista');
  const [proveedores, setProveedores] = useState<any[]>([]);
  const [ordenes, setOrdenes] = useState<any[]>([]);
  const [productos, setProductos] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState<any>(null);
  const [formProveedor, setFormProveedor] = useState(FORMULARIO_INICIAL);
  const [itemsOC, setItemsOC] = useState([{ ...ITEM_OC_INICIAL }]);
  const [proveedorFiltro, setProveedorFiltro] = useState<string>('');
  const [ordenExpandida, setOrdenExpandida] = useState<number | null>(null);
  const [mostrarFormularioOC, setMostrarFormularioOC] = useState(false);

  const cargarDatos = async () => {
    setCargando(true);

    try {
      const provResp = await proveedoresAPI.listar();
      setProveedores(normalizarLista(provResp));
    } catch (error: any) {
      console.error('Error al cargar proveedores:', error);
      toast.error(extraerMensajeError(error, 'No se pudieron cargar los proveedores'));
    }

    try {
      const ordResp = await proveedoresAPI.listarOrdenes(
        proveedorFiltro ? { proveedorId: proveedorFiltro } : undefined,
      );
      setOrdenes(normalizarLista(ordResp));
    } catch (error: any) {
      console.error('Error al cargar órdenes:', error);
      toast.error(extraerMensajeError(error, 'No se pudieron cargar las órdenes de compra'));
    }

    try {
      const prodResp = await productosAPI.listarAdmin({ limite: 200 });
      setProductos(prodResp?.datos || normalizarLista(prodResp));
    } catch (error: any) {
      console.error('Error al cargar productos:', error);
      if (pestañaActiva === 'ordenes') {
        toast.error(extraerMensajeError(error, 'No se pudieron cargar los productos para la orden'));
      }
    }

    setCargando(false);
  };

  useEffect(() => {
    cargarDatos();
  }, [proveedorFiltro]);

  const prepararDatosProveedor = () => ({
    nombre: formProveedor.nombre.trim(),
    ruc: formProveedor.ruc.trim(),
    contacto: formProveedor.contacto.trim() || undefined,
    correo: formProveedor.correo.trim() || undefined,
    telefono: formProveedor.telefono.trim() || undefined,
    pais: formProveedor.pais.trim() || 'Perú',
    direccion: formProveedor.direccion.trim() || undefined,
    notas: formProveedor.notas.trim() || undefined,
    activo: formProveedor.activo,
  });

  const guardarProveedor = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!/^\d{11}$/.test(formProveedor.ruc.trim())) {
      toast.error('El RUC debe tener exactamente 11 dígitos');
      return;
    }

    try {
      const datos = prepararDatosProveedor();
      if (proveedorSeleccionado) {
        await proveedoresAPI.actualizar(proveedorSeleccionado.id, datos);
        toast.success('Proveedor actualizado');
      } else {
        await proveedoresAPI.crear(datos);
        toast.success('Proveedor creado');
      }
      setProveedorSeleccionado(null);
      setFormProveedor(FORMULARIO_INICIAL);
      setPestañaActiva('lista');
      cargarDatos();
    } catch (error: any) {
      toast.error(extraerMensajeError(error, 'Error al guardar el proveedor'));
    }
  };

  const editarProveedor = (proveedor: any) => {
    setProveedorSeleccionado(proveedor);
    setFormProveedor({
      nombre: proveedor.nombre,
      ruc: proveedor.ruc,
      contacto: proveedor.contacto || '',
      correo: proveedor.correo || '',
      telefono: proveedor.telefono || '',
      pais: proveedor.pais || 'Perú',
      direccion: proveedor.direccion || '',
      notas: proveedor.notas || '',
      activo: proveedor.activo,
    });
    setPestañaActiva('detalle');
  };

  const eliminarProveedor = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este proveedor?')) return;
    try {
      await proveedoresAPI.eliminar(id);
      toast.success('Proveedor eliminado');
      cargarDatos();
    } catch (error: any) {
      toast.error('No se pudo eliminar el proveedor');
    }
  };

  const crearOrdenCompra = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proveedorFiltro) {
      toast.error('Selecciona un proveedor');
      return;
    }

    try {
      const itemsValidos = itemsOC.filter(item => item.varianteId && item.cantidadPedida > 0 && item.precioUnit > 0);
      if (itemsValidos.length === 0) {
        toast.error('Agrega al menos un item válido');
        return;
      }

      await proveedoresAPI.crearOrden({
        proveedorId: parseInt(proveedorFiltro),
        items: itemsValidos.map(item => ({
          productoId: parseInt(item.productoId, 10),
          varianteId: parseInt(item.varianteId, 10),
          cantidadPedida: Number(item.cantidadPedida),
          precioUnit: Number(item.precioUnit),
        })),
      });
      toast.success('Orden de compra creada');
      setItemsOC([{ ...ITEM_OC_INICIAL }]);
      setMostrarFormularioOC(false);
      cargarDatos();
    } catch (error: any) {
      toast.error(extraerMensajeError(error, 'Error al crear la orden'));
    }
  };

  const cambiarEstadoOrden = async (ordenId: number, estado: string) => {
    try {
      await actualizarEstadoOrden(ordenId, estado);
      toast.success('Estado de la orden actualizado');
      cargarDatos();
    } catch (error: any) {
      toast.error(extraerMensajeError(error, 'No se pudo actualizar el estado'));
    }
  };

  const agregarItemOC = () => {
    setItemsOC([...itemsOC, { ...ITEM_OC_INICIAL }]);
  };

  const eliminarItemOC = (index: number) => {
    if (itemsOC.length > 1) {
      setItemsOC(itemsOC.filter((_, i) => i !== index));
    }
  };

  const actualizarItemOC = (index: number, campo: string, valor: any) => {
    const nuevosItems = [...itemsOC];
    if (campo === 'varianteId') {
      const variante = productos.flatMap(p => p.variantes || []).find(v => v.id === parseInt(valor));
      if (variante) {
        nuevosItems[index] = {
          ...nuevosItems[index],
          [campo]: valor,
          productoId: variante.productoId.toString(),
          precioUnit: Number(variante.precioBase) || 0,
        };
      } else {
        nuevosItems[index] = { ...nuevosItems[index], [campo]: valor };
      }
    } else {
      nuevosItems[index] = { ...nuevosItems[index], [campo]: valor };
    }
    setItemsOC(nuevosItems);
  };

  const formatPrecio = (valor: number | string) =>
    new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(Number(valor) || 0);

  const etiquetaEstadoOrden = (estado: string) =>
    ESTADOS_ORDEN.find((e) => e.valor === estado)?.etiqueta || estado;

  const todasLasVariantes = productos.flatMap(p =>
    (p.variantes || []).map(v => ({ ...v, productoNombre: p.nombre }))
  );

  return (
    <AdminShell title="Proveedores" description="Gestiona proveedores y órdenes de compra" icon={Truck}>
      {/* Pestañas */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setPestañaActiva('lista')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors
            ${pestañaActiva === 'lista' ? 'border-teal text-teal' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <div className="flex items-center gap-2">
            <Truck size={18} /> Lista de Proveedores
          </div>
        </button>
        <button
          onClick={() => setPestañaActiva('ordenes')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors
            ${pestañaActiva === 'ordenes' ? 'border-teal text-teal' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <div className="flex items-center gap-2">
            <Package size={18} /> Órdenes de Compra
          </div>
        </button>
      </div>

      {cargando ? (
        <div className="flex justify-center py-12">
          <Loader2 size={40} className="animate-spin text-teal" />
        </div>
      ) : (
        <>
          {/* Pestaña 1: Lista de Proveedores */}
          {pestañaActiva === 'lista' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-azul-oscuro">Proveedores Registrados</h2>
                <button
                  onClick={() => {
                    setFormProveedor(FORMULARIO_INICIAL);
                    setProveedorSeleccionado(null);
                    setPestañaActiva('detalle');
                  }}
                  className="btn-primario flex items-center gap-2"
                >
                  <Plus size={18} /> Nuevo Proveedor
                </button>
              </div>

              <div className="bg-white rounded-2xl shadow-card overflow-hidden">
                <table className="w-full">
                  <thead className="bg-crema">
                    <tr>
                      <th className="text-left px-6 py-4 text-sm font-bold text-azul-oscuro">Nombre</th>
                      <th className="text-left px-6 py-4 text-sm font-bold text-azul-oscuro">RUC</th>
                      <th className="text-left px-6 py-4 text-sm font-bold text-azul-oscuro">Contacto</th>
                      <th className="text-left px-6 py-4 text-sm font-bold text-azul-oscuro">Teléfono</th>
                      <th className="text-center px-6 py-4 text-sm font-bold text-azul-oscuro">Estado</th>
                      <th className="text-center px-6 py-4 text-sm font-bold text-azul-oscuro">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {proveedores.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-12 text-gris-elegante">
                          No hay proveedores registrados
                        </td>
                      </tr>
                    ) : (
                      proveedores.map((proveedor) => (
                        <tr key={proveedor.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 font-medium text-azul-oscuro">
                            {proveedor.nombre}
                          </td>
                          <td className="px-6 py-4 text-sm text-gris-elegante">
                            {proveedor.ruc}
                          </td>
                          <td className="px-6 py-4 text-sm text-gris-elegante">
                            {proveedor.contacto || '-'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gris-elegante">
                            {proveedor.telefono || '-'}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium
                              ${proveedor.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                            >
                              {proveedor.activo ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex justify-center gap-2">
                              <button onClick={() => editarProveedor(proveedor)} className="p-2 text-teal hover:bg-teal/10 rounded-lg">
                                <Edit size={16} />
                              </button>
                              <button onClick={() => eliminarProveedor(proveedor.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pestaña 2: Órdenes de Compra */}
          {pestañaActiva === 'ordenes' && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-4 items-center bg-white p-4 rounded-2xl shadow-card">
                <select
                  value={proveedorFiltro}
                  onChange={(e) => {
                    setProveedorFiltro(e.target.value);
                    setMostrarFormularioOC(false);
                    setItemsOC([{ ...ITEM_OC_INICIAL }]);
                  }}
                  className="input-campo w-80"
                >
                  <option value="">Todos los proveedores</option>
                  {proveedores.map(p => (
                    <option key={p.id} value={p.id}>{p.nombre}</option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    setItemsOC([{ ...ITEM_OC_INICIAL }]);
                    setMostrarFormularioOC(true);
                  }}
                  className="btn-primario flex items-center gap-2"
                  disabled={!proveedorFiltro}
                >
                  <Plus size={18} /> Nueva Orden
                </button>
              </div>

              {proveedorFiltro && mostrarFormularioOC && (
                <form onSubmit={crearOrdenCompra} className="bg-white p-6 rounded-2xl shadow-card space-y-4">
                  <h3 className="font-bold text-lg text-azul-oscuro">Nueva Orden de Compra</h3>
                  <div className="space-y-4">
                    {itemsOC.map((item, index) => (
                      <div key={index} className="border border-gray-200 p-4 rounded-xl space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-azul-oscuro">Item {index + 1}</span>
                          {itemsOC.length > 1 && (
                            <button type="button" onClick={() => eliminarItemOC(index)} className="text-red-500 text-sm">
                              <Trash2 size={14} /> Eliminar
                            </button>
                          )}
                        </div>
                        <div className="grid md:grid-cols-4 gap-4">
                          <div className="md:col-span-2">
                            <label className="label-campo">Variante</label>
                            <select
                              value={item.varianteId}
                              onChange={(e) => actualizarItemOC(index, 'varianteId', e.target.value)}
                              className="input-campo"
                            >
                              <option value="">Selecciona una variante</option>
                              {todasLasVariantes.map(v => (
                                <option key={v.id} value={v.id}>{v.productoNombre} - {v.sku}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="label-campo">Cantidad</label>
                            <input
                              type="number"
                              min="1"
                              value={item.cantidadPedida}
                              onChange={(e) => actualizarItemOC(index, 'cantidadPedida', parseInt(e.target.value) || 1)}
                              className="input-campo"
                            />
                          </div>
                          <div>
                            <label className="label-campo">Precio Unitario</label>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={item.precioUnit}
                              onChange={(e) => actualizarItemOC(index, 'precioUnit', parseFloat(e.target.value) || 0)}
                              className="input-campo"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="flex gap-3">
                      <button type="button" onClick={agregarItemOC} className="btn-secundario flex items-center gap-2">
                        <Plus size={16} /> Agregar Item
                      </button>
                      <button type="submit" className="btn-primario flex items-center gap-2">
                        Crear Orden de Compra
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMostrarFormularioOC(false);
                          setItemsOC([{ ...ITEM_OC_INICIAL }]);
                        }}
                        className="btn-secundario"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </form>
              )}

              <div className="bg-white rounded-2xl shadow-card overflow-hidden">
                <table className="w-full">
                  <thead className="bg-crema">
                    <tr>
                      <th className="text-left px-6 py-4 text-sm font-bold text-azul-oscuro">Número</th>
                      <th className="text-left px-6 py-4 text-sm font-bold text-azul-oscuro">Proveedor</th>
                      <th className="text-left px-6 py-4 text-sm font-bold text-azul-oscuro">Fecha</th>
                      <th className="text-center px-6 py-4 text-sm font-bold text-azul-oscuro">Estado</th>
                      <th className="text-right px-6 py-4 text-sm font-bold text-azul-oscuro">Total</th>
                      <th className="text-center px-6 py-4 text-sm font-bold text-azul-oscuro">Items</th>
                      <th className="text-center px-6 py-4 text-sm font-bold text-azul-oscuro">Detalle</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {ordenes.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-12 text-gris-elegante">
                          No hay órdenes de compra
                        </td>
                      </tr>
                    ) : (
                      ordenes.map((orden) => (
                        <Fragment key={orden.id}>
                          <tr className="hover:bg-gray-50">
                            <td className="px-6 py-4 font-medium text-azul-oscuro">
                              {orden.numeroOrden}
                            </td>
                            <td className="px-6 py-4 text-sm text-gris-elegante">
                              {orden.proveedor?.nombre}
                            </td>
                            <td className="px-6 py-4 text-sm text-gris-elegante">
                              {new Date(orden.creadoEn).toLocaleDateString('es-PE')}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <select
                                value={orden.estado}
                                onChange={(e) => cambiarEstadoOrden(orden.id, e.target.value)}
                                className="input-campo text-sm py-1 px-2 min-w-[150px]"
                              >
                                {ESTADOS_ORDEN.map((estado) => (
                                  <option key={estado.valor} value={estado.valor}>
                                    {estado.etiqueta}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="px-6 py-4 text-right font-bold text-azul-oscuro">
                              {formatPrecio(orden.total)}
                            </td>
                            <td className="px-6 py-4 text-center text-sm text-gris-elegante">
                              {orden.items?.length || 0}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <button
                                type="button"
                                onClick={() => setOrdenExpandida(ordenExpandida === orden.id ? null : orden.id)}
                                className="p-2 text-teal hover:bg-teal/10 rounded-lg"
                                title={ordenExpandida === orden.id ? 'Ocultar detalle' : 'Ver detalle'}
                              >
                                {ordenExpandida === orden.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                              </button>
                            </td>
                          </tr>
                          {ordenExpandida === orden.id && (
                            <tr className="bg-crema/40">
                              <td colSpan={7} className="px-6 py-4">
                                <div className="space-y-2">
                                  <p className="text-sm font-semibold text-azul-oscuro">
                                    Estado actual: {etiquetaEstadoOrden(orden.estado)}
                                  </p>
                                  <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                      <thead>
                                        <tr className="text-left text-gris-elegante">
                                          <th className="py-2 pr-4">Producto</th>
                                          <th className="py-2 pr-4">SKU</th>
                                          <th className="py-2 pr-4">Cantidad</th>
                                          <th className="py-2 pr-4">Precio unit.</th>
                                          <th className="py-2">Subtotal</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {(orden.items || []).map((item: any) => (
                                          <tr key={item.id} className="border-t border-gray-200">
                                            <td className="py-2 pr-4">{item.producto?.nombre || `Producto #${item.productoId}`}</td>
                                            <td className="py-2 pr-4">{item.variante?.sku || item.varianteId}</td>
                                            <td className="py-2 pr-4">{item.cantidadPedida}</td>
                                            <td className="py-2 pr-4">{formatPrecio(item.precioUnit)}</td>
                                            <td className="py-2">{formatPrecio(item.subtotal)}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pestaña 3: Formulario de Proveedor */}
          {pestañaActiva === 'detalle' && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl shadow-card p-6">
                <h2 className="text-xl font-bold text-azul-oscuro mb-6">
                  {proveedorSeleccionado ? 'Editar Proveedor' : 'Nuevo Proveedor'}
                </h2>
                <form onSubmit={guardarProveedor} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="label-campo">Nombre del Proveedor *</label>
                      <input
                        required
                        value={formProveedor.nombre}
                        onChange={(e) => setFormProveedor({ ...formProveedor, nombre: e.target.value })}
                        className="input-campo"
                        placeholder="Nombre completo"
                      />
                    </div>
                    <div>
                      <label className="label-campo">RUC *</label>
                      <input
                        required
                        value={formProveedor.ruc}
                        onChange={(e) => setFormProveedor({ ...formProveedor, ruc: e.target.value })}
                        className="input-campo"
                        maxLength={11}
                        placeholder="11 dígitos"
                      />
                    </div>
                    <div>
                      <label className="label-campo">Persona de Contacto</label>
                      <input
                        value={formProveedor.contacto}
                        onChange={(e) => setFormProveedor({ ...formProveedor, contacto: e.target.value })}
                        className="input-campo"
                      />
                    </div>
                    <div>
                      <label className="label-campo">Correo Electrónico</label>
                      <input
                        type="email"
                        value={formProveedor.correo}
                        onChange={(e) => setFormProveedor({ ...formProveedor, correo: e.target.value })}
                        className="input-campo"
                      />
                    </div>
                    <div>
                      <label className="label-campo">Teléfono</label>
                      <input
                        value={formProveedor.telefono}
                        onChange={(e) => setFormProveedor({ ...formProveedor, telefono: e.target.value })}
                        className="input-campo"
                      />
                    </div>
                    <div>
                      <label className="label-campo">País</label>
                      <input
                        value={formProveedor.pais}
                        onChange={(e) => setFormProveedor({ ...formProveedor, pais: e.target.value })}
                        className="input-campo"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="label-campo">Dirección</label>
                      <textarea
                        value={formProveedor.direccion}
                        onChange={(e) => setFormProveedor({ ...formProveedor, direccion: e.target.value })}
                        className="input-campo"
                        rows={3}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="label-campo">Notas</label>
                      <textarea
                        value={formProveedor.notas}
                        onChange={(e) => setFormProveedor({ ...formProveedor, notas: e.target.value })}
                        className="input-campo"
                        rows={3}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formProveedor.activo}
                        onChange={(e) => setFormProveedor({ ...formProveedor, activo: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <label className="text-sm text-azul-oscuro">Proveedor Activo</label>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="btn-primario flex items-center gap-2"
                    >
                      <Save size={16} /> {proveedorSeleccionado ? 'Guardar Cambios' : 'Crear Proveedor'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPestañaActiva('lista')}
                      className="btn-secundario"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}
    </AdminShell>
  );
}
