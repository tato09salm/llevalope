'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, Eye, Package, Loader2, AlertTriangle, ChevronLeft, Layers } from 'lucide-react';
import { productosAPI } from '../../../lib/api';
import { Producto } from '../../../types';
import toast from 'react-hot-toast';
import ConfirmDialog from '../../../components/ui/confirm-dialog';
import { useAuthStore } from '../../../store/auth.store';

export default function AdminProductosPage() {
  const { usuario } = useAuthStore();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [total, setTotal] = useState(0);
  const [confirmDialog, setConfirmDialog] = useState<{ 
    isOpen: boolean; 
    id: number; 
    nombre: string; 
  }>({ isOpen: false, id: 0, nombre: '' });

  useEffect(() => { cargar(); }, [busqueda]);

  const cargar = async () => {
    setCargando(true);
    try {
      const resp: any = await productosAPI.listar({ busqueda, limite: 50, todos: true });
      console.log('✅ API Response:', resp);
      console.log('📦 Productos:', resp.datos);
      console.log('🔢 Total:', resp.total);
      setProductos(resp.datos || []);
      setTotal(resp.total || 0);
    } catch (error) {
      console.error('❌ Error cargando productos:', error);
      setProductos([]);
    } finally {
      setCargando(false);
    }
  };

  const abrirConfirmacionEliminar = (id: number, nombre: string) => {
    setConfirmDialog({ isOpen: true, id, nombre });
  };

  const cerrarConfirmacionEliminar = () => {
    setConfirmDialog({ isOpen: false, id: 0, nombre: '' });
  };

  const confirmarEliminar = async () => {
    const { id, nombre } = confirmDialog;
    try {
      await productosAPI.eliminar(id);
      toast.success('Producto eliminado permanentemente');
      cerrarConfirmacionEliminar();
      cargar();
    } catch (err: any) {
      toast.error(err?.message || 'Error al eliminar el producto');
      cerrarConfirmacionEliminar();
    }
  };

  const toggleActivo = async (id: number, nombre: string, estado: boolean) => {
    try {
      await productosAPI.toggleActivo(id);
      toast.success(`Producto ${estado ? 'desactivado' : 'activado'} correctamente`);
      cargar();
    } catch {
      toast.error('Error al cambiar el estado del producto');
    }
  };

  const formatPrecio = (p: number) =>
    new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(p);

  const getVariantePrincipal = (producto: Producto) => {
    if (!producto.variantes || producto.variantes.length === 0) return null;
    return producto.variantes.find((v: any) => v.esPrincipal) || producto.variantes[0];
  };

  const getTotalStock = (producto: Producto) => {
    if (!producto.variantes || producto.variantes.length === 0) return 0;
    return producto.variantes.reduce((sum: number, v: any) => sum + v.stock, 0);
  };

  const getMinStock = (producto: Producto) => {
    if (!producto.variantes || producto.variantes.length === 0) return 0;
    return Math.min(...producto.variantes.map((v: any) => v.stockMinimo));
  };

  const hasEnOferta = (producto: Producto) => {
    if (!producto.variantes || producto.variantes.length === 0) return false;
    return producto.variantes.some((v: any) => v.enOferta && v.activo);
  };

  const puedeEliminar = usuario?.rol === 'ADMIN' || usuario?.rol === 'GERENTE';

  return (
    <div className="min-h-screen bg-crema">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-gris-elegante hover:text-teal transition-colors">
              <ChevronLeft size={20} />
            </Link>
            <div>
              <h1 className="text-xl font-bold font-montserrat text-azul-oscuro flex items-center gap-2">
                <Package size={22} className="text-teal" /> Gestión de Productos
              </h1>
              <p className="text-xs text-gris-elegante">{total} productos registrados</p>
            </div>
          </div>
          <Link href="/admin/productos/nuevo" className="btn-secundario flex items-center gap-2 text-sm">
            <Plus size={16} /> Nuevo Producto
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Buscador */}
        <div className="bg-white rounded-2xl shadow-card p-4 mb-6 flex gap-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-3 text-gris-elegante" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre, SKU..."
              className="input-campo pl-10 py-2.5"
            />
          </div>
        </div>

        {/* Tabla */}
        {cargando ? (
          <div className="flex justify-center py-20"><Loader2 size={36} className="animate-spin text-teal" /></div>
        ) : (
          <div className="bg-white rounded-2xl shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-crema border-b border-gray-100">
                    <th className="text-left px-5 py-3.5 text-xs font-bold text-azul-oscuro uppercase tracking-wide">Producto</th>
                    <th className="text-left px-5 py-3.5 text-xs font-bold text-azul-oscuro uppercase tracking-wide">Variantes</th>
                    <th className="text-left px-5 py-3.5 text-xs font-bold text-azul-oscuro uppercase tracking-wide">Categoría</th>
                    <th className="text-right px-5 py-3.5 text-xs font-bold text-azul-oscuro uppercase tracking-wide">Precio</th>
                    <th className="text-center px-5 py-3.5 text-xs font-bold text-azul-oscuro uppercase tracking-wide">Stock</th>
                    <th className="text-center px-5 py-3.5 text-xs font-bold text-azul-oscuro uppercase tracking-wide">Estado</th>
                    <th className="text-center px-5 py-3.5 text-xs font-bold text-azul-oscuro uppercase tracking-wide">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {productos.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-16 text-gris-elegante">
                        <Package size={40} className="mx-auto mb-3 opacity-30" />
                        <p>No hay productos registrados</p>
                        <Link href="/admin/productos/nuevo" className="text-teal text-sm mt-2 inline-block hover:underline">
                          + Agregar el primer producto
                        </Link>
                      </td>
                    </tr>
                  ) : (
                    productos.map((p, i) => {
                      const variantePrincipal = getVariantePrincipal(p);
                      const totalStock = getTotalStock(p);
                      const minStock = getMinStock(p);
                      const enOferta = hasEnOferta(p);
                      
                      return (
                        <motion.tr
                          key={p.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.03 }}
                          className="hover:bg-crema transition-colors"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-crema rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                                {p.imagenes && p.imagenes.length > 0 ? (
                                  <img 
                                    src={p.imagenes[0].url} 
                                    alt={p.nombre} 
                                    className="w-full h-full object-cover"
                                  />
                                ) : p.imagenPrincipal ? (
                                  <img 
                                    src={p.imagenPrincipal} 
                                    alt={p.nombre} 
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <Package size={18} className="text-gris-elegante" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-azul-oscuro text-sm line-clamp-1">{p.nombre}</p>
                                {enOferta && <span className="badge-oferta text-[10px] py-0.5">En oferta</span>}
                                {variantePrincipal && (
                                  <p className="text-xs text-gris-elegante font-mono mt-0.5">{variantePrincipal.sku}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2 text-sm text-azul-oscuro">
                              <Layers size={14} className="text-teal" />
                              <span>{p.variantes?.length || 0} variante(s)</span>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-sm text-azul-oscuro">{p.categoria?.nombre || '-'}</td>
                          <td className="px-5 py-4 text-sm text-right font-bold text-azul-oscuro">
                            {variantePrincipal ? (
                              <div className="flex flex-col items-end">
                                <span>{formatPrecio(variantePrincipal.precioBase)}</span>
                                {variantePrincipal.enOferta && variantePrincipal.precioOferta && (
                                  <span className="text-xs text-gris-elegante line-through">
                                    {formatPrecio(variantePrincipal.precioOferta)}
                                  </span>
                                )}
                              </div>
                            ) : '-'}
                          </td>
                          <td className="px-5 py-4 text-center">
                            <span className={`text-sm font-bold flex items-center justify-center gap-1 ${totalStock <= minStock ? 'text-orange-500' : 'text-green-600'}`}>
                              {totalStock <= minStock && <AlertTriangle size={12} />}
                              {totalStock}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-center">
                            <button
                              onClick={() => toggleActivo(p.id, p.nombre, p.activo)}
                              className={`px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-all hover:opacity-80 ${p.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}
                            >
                              {p.activo ? 'Activo' : 'Inactivo'}
                            </button>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <Link href={`/productos/${p.slug}`} className="p-1.5 text-gris-elegante hover:text-teal transition-colors" title="Ver">
                                <Eye size={16} />
                              </Link>
                              <Link href={`/admin/productos/${p.id}`} className="p-1.5 text-gris-elegante hover:text-azul-corp transition-colors" title="Editar">
                                <Edit2 size={16} />
                              </Link>
                              {puedeEliminar && (
                                <button onClick={() => abrirConfirmacionEliminar(p.id, p.nombre)} className="p-1.5 text-gris-elegante hover:text-red-500 transition-colors" title="Eliminar">
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal de confirmación para eliminar */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={cerrarConfirmacionEliminar}
        onConfirm={confirmarEliminar}
        title="Eliminar Producto"
        message={`¿Estás seguro que deseas ELIMINAR PERMANENTEMENTE el producto "${confirmDialog.nombre}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  );
}
