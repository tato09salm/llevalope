'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, Eye, Package, Loader2, AlertTriangle, ChevronLeft } from 'lucide-react';
import { productosAPI } from '../../../lib/api';
import { Producto } from '../../../types';
import toast from 'react-hot-toast';

export default function AdminProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [total, setTotal] = useState(0);

  useEffect(() => { cargar(); }, [busqueda]);

  const cargar = async () => {
    setCargando(true);
    try {
      const resp: any = await productosAPI.listar({ busqueda, limite: 50, todos: true });
      setProductos(resp.datos || []);
      setTotal(resp.total || 0);
    } catch {
      setProductos([]);
    } finally {
      setCargando(false);
    }
  };

  const eliminar = async (id: number, nombre: string) => {
    if (!confirm(`¿Eliminar "${nombre}"?`)) return;
    try {
      await productosAPI.eliminar(id);
      toast.success('Producto eliminado');
      cargar();
    } catch {
      toast.error('Error al eliminar');
    }
  };

  const formatPrecio = (p: number) =>
    new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(p);

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
                    <th className="text-left px-5 py-3.5 text-xs font-bold text-azul-oscuro uppercase tracking-wide">SKU</th>
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
                    productos.map((p, i) => (
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
                              {p.imagenPrincipal ? (
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
                              {p.enOferta && <span className="badge-oferta text-[10px] py-0.5">En oferta</span>}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm text-gris-elegante font-mono">{p.sku}</td>
                        <td className="px-5 py-4 text-sm text-azul-oscuro">{p.categoria?.nombre || '-'}</td>
                        <td className="px-5 py-4 text-sm text-right font-bold text-azul-oscuro">{formatPrecio(p.precio)}</td>
                        <td className="px-5 py-4 text-center">
                          <span className={`text-sm font-bold flex items-center justify-center gap-1 ${p.stock <= p.stockMinimo ? 'text-orange-500' : 'text-green-600'}`}>
                            {p.stock <= p.stockMinimo && <AlertTriangle size={12} />}
                            {p.stock}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${p.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                            {p.activo ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <Link href={`/productos/${p.slug}`} className="p-1.5 text-gris-elegante hover:text-teal transition-colors" title="Ver">
                              <Eye size={16} />
                            </Link>
                            <Link href={`/admin/productos/${p.id}`} className="p-1.5 text-gris-elegante hover:text-azul-corp transition-colors" title="Editar">
                              <Edit2 size={16} />
                            </Link>
                            <button onClick={() => eliminar(p.id, p.nombre)} className="p-1.5 text-gris-elegante hover:text-red-500 transition-colors" title="Eliminar">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
