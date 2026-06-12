'use client';

import { useEffect, useState } from 'react';
import { Package, History, Plus, Loader2, TrendingUp, TrendingDown, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminShell from '../../../components/admin/AdminShell';
import { productosAPI, inventarioAPI } from '../../../lib/api';

export default function AdminInventarioPage() {
  const [pestañaActiva, setPestañaActiva] = useState<'inventario' | 'movimientos'>('inventario');
  const [productos, setProductos] = useState<any[]>([]);
  const [movimientos, setMovimientos] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarAjuste, setMostrarAjuste] = useState(false);
  const [varianteAjuste, setVarianteAjuste] = useState<any>(null);
  const [formAjuste, setFormAjuste] = useState({
    cantidad: 0,
    tipo: 'ENTRADA',
    motivo: ''
  });
  const [busqueda, setBusqueda] = useState('');

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [prodResp, movResp] = await Promise.all([
        productosAPI.listarAdmin({ limite: 200 }),
        inventarioAPI.movimientos(),
      ]);
      setProductos(prodResp?.datos || []);
      setMovimientos(movResp || []);
    } catch (error: any) {
      toast.error('No se pudieron cargar los datos');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const abrirAjuste = (variante: any, producto: any) => {
    setVarianteAjuste({ ...variante, producto });
    setFormAjuste({ cantidad: 0, tipo: 'ENTRADA', motivo: '' });
    setMostrarAjuste(true);
  };

  const guardarAjuste = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!varianteAjuste) return;

    try {
      await inventarioAPI.ajustar({
        varianteId: varianteAjuste.id,
        tipo: formAjuste.tipo,
        cantidad: formAjuste.cantidad,
        motivo: formAjuste.motivo,
      });
      toast.success('Ajuste de inventario realizado');
      setMostrarAjuste(false);
      cargarDatos();
    } catch (error: any) {
      toast.error(error.message || 'No se pudo realizar el ajuste');
    }
  };

  const productosFiltrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.sku?.toLowerCase().includes(busqueda.toLowerCase())
  );

  const formatPrecio = (valor: number) =>
    new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(valor);

  const todasLasVariantes = productosFiltrados.flatMap(p =>
    (p.variantes || []).map(v => ({ ...v, producto: p }))
  );

  return (
    <AdminShell title="Inventario" description="Gestiona el stock y movimientos de productos" icon={Package}>
      {/* Pestañas */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setPestañaActiva('inventario')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors
            ${pestañaActiva === 'inventario' ? 'border-teal text-teal' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <div className="flex items-center gap-2">
            <Package size={18} /> Lista de Inventario
          </div>
        </button>
        <button
          onClick={() => setPestañaActiva('movimientos')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors
            ${pestañaActiva === 'movimientos' ? 'border-teal text-teal' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <div className="flex items-center gap-2">
            <History size={18} /> Historial de Movimientos
          </div>
        </button>
      </div>

      {cargando ? (
        <div className="flex justify-center py-12">
          <Loader2 size={40} className="animate-spin text-teal" />
        </div>
      ) : (
        <>
          {/* Pestaña 1: Lista de Inventario */}
          {pestañaActiva === 'inventario' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-2xl shadow-card">
                <input
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar por nombre o SKU"
                  className="input-campo"
                />
              </div>

              <div className="bg-white rounded-2xl shadow-card overflow-hidden">
                <table className="w-full">
                  <thead className="bg-crema">
                    <tr>
                      <th className="text-left px-6 py-4 text-sm font-bold text-azul-oscuro">Producto</th>
                      <th className="text-left px-6 py-4 text-sm font-bold text-azul-oscuro">SKU</th>
                      <th className="text-center px-6 py-4 text-sm font-bold text-azul-oscuro">Stock Actual</th>
                      <th className="text-right px-6 py-4 text-sm font-bold text-azul-oscuro">Precio</th>
                      <th className="text-center px-6 py-4 text-sm font-bold text-azul-oscuro">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {todasLasVariantes.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-12 text-gris-elegante">
                          No hay productos en inventario
                        </td>
                      </tr>
                    ) : (
                      todasLasVariantes.map((variante) => (
                        <tr key={variante.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="font-medium text-azul-oscuro">{variante.producto.nombre}</div>
                            {variante.color?.nombre && (
                              <div className="text-xs text-gris-elegante">{variante.color.nombre}</div>
                            )}
                            {variante.size?.talla && (
                              <div className="text-xs text-gris-elegante">Talla: {variante.size.talla}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-gris-elegante">{variante.sku || '-'}</td>
                          <td className="px-6 py-4 text-center">
                            <span className={`font-bold
                              ${variante.stock <= variante.producto?.stockMinimo ? 'text-red-600' : 'text-azul-oscuro'}
                            `}>
                              {variante.stock}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right font-bold text-azul-oscuro">
                            {formatPrecio(variante.precioVenta)}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => abrirAjuste(variante, variante.producto)}
                              className="btn-secundario inline-flex items-center gap-1 text-xs px-3 py-1"
                            >
                              <Edit2 size={12} /> Ajustar Stock
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Modal de Ajuste */}
              {mostrarAjuste && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                  <div className="bg-white rounded-2xl max-w-md w-full p-6">
                    <h3 className="text-lg font-bold text-azul-oscuro mb-4">
                      Ajustar Stock
                    </h3>
                    <div className="mb-4 p-3 bg-crema rounded-xl">
                      <p className="font-medium text-azul-oscuro">{varianteAjuste?.producto?.nombre}</p>
                      <p className="text-sm text-gris-elegante">Stock actual: <span className="font-bold">{varianteAjuste?.stock}</span></p>
                    </div>
                    <form onSubmit={guardarAjuste} className="space-y-4">
                      <div>
                        <label className="label-campo">Tipo de Ajuste</label>
                        <select
                          value={formAjuste.tipo}
                          onChange={(e) => setFormAjuste({ ...formAjuste, tipo: e.target.value })}
                          className="input-campo"
                        >
                          <option value="ENTRADA">Adición (+)</option>
                          <option value="SALIDA">Resta (-)</option>
                        </select>
                      </div>
                      <div>
                        <label className="label-campo">Cantidad</label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={formAjuste.cantidad}
                          onChange={(e) => setFormAjuste({ ...formAjuste, cantidad: parseInt(e.target.value) || 0 })}
                          className="input-campo"
                        />
                      </div>
                      <div>
                        <label className="label-campo">Motivo</label>
                        <textarea
                          required
                          value={formAjuste.motivo}
                          onChange={(e) => setFormAjuste({ ...formAjuste, motivo: e.target.value })}
                          className="input-campo"
                          rows={3}
                        />
                      </div>
                      <div className="flex gap-3 pt-2">
                        <button type="submit" className="btn-primario flex-1">
                          Confirmar Ajuste
                        </button>
                        <button
                          type="button"
                          onClick={() => setMostrarAjuste(false)}
                          className="btn-secundario flex-1"
                        >
                          Cancelar
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Pestaña 2: Historial de Movimientos */}
          {pestañaActiva === 'movimientos' && (
            <div className="bg-white rounded-2xl shadow-card overflow-hidden">
              <table className="w-full">
                <thead className="bg-crema">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-bold text-azul-oscuro">Fecha</th>
                    <th className="text-left px-6 py-4 text-sm font-bold text-azul-oscuro">Producto</th>
                    <th className="text-center px-6 py-4 text-sm font-bold text-azul-oscuro">Tipo</th>
                    <th className="text-center px-6 py-4 text-sm font-bold text-azul-oscuro">Cantidad</th>
                    <th className="text-left px-6 py-4 text-sm font-bold text-azul-oscuro">Motivo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {movimientos.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-gris-elegante">
                        No hay movimientos registrados
                      </td>
                    </tr>
                  ) : (
                    movimientos.map((mov) => (
                      <tr key={mov.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gris-elegante">
                          {new Date(mov.creadoEn).toLocaleString('es-PE')}
                        </td>
                        <td className="px-6 py-4 text-sm text-azul-oscuro">
                          {mov.producto?.nombre || 'Producto'}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium
                            ${mov.tipo === 'ENTRADA' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
                          `}>
                            <div className="flex items-center gap-1 justify-center">
                              {mov.tipo === 'ENTRADA' ? (
                                <TrendingUp size={12} />
                              ) : (
                                <TrendingDown size={12} />
                              )}
                              {mov.tipo === 'ENTRADA' ? 'Entrada' : 'Salida'}
                            </div>
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center font-bold text-azul-oscuro">
                          {mov.cantidad}
                        </td>
                        <td className="px-6 py-4 text-sm text-gris-elegante max-w-xs truncate">
                          {mov.motivo}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </AdminShell>
  );
}
