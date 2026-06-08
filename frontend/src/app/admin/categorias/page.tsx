'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, Folder, Loader2, ChevronLeft, Power, ChevronDown, ChevronRight, X, AlertTriangle, FileText, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { categoriasAPI } from '../../../lib/api';
import { Categoria } from '../../../types';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../../store/auth.store';

export default function AdminCategoriasPage() {
  const { usuario } = useAuthStore();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'activas' | 'inactivas'>('todos');
  const [expandidas, setExpandidas] = useState<Set<number>>(new Set());
  const [modalEliminar, setModalEliminar] = useState<{ id: number; nombre: string } | null>(null);
  const puedeEliminar = usuario?.rol === 'ADMIN' || usuario?.rol === 'GERENTE';

  const generarPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Reporte de Categorías', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, 14, 30);
    
    let yPosition = 40;
    const categoriasPadre = [...categorias.filter(c => !c.categoriaPadreId)]
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
    
    categoriasPadre.forEach(catPadre => {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`• ${catPadre.nombre}`, 14, yPosition);
      yPosition += 10;
      
      const subcategorias = [...categorias.filter(c => c.categoriaPadreId === catPadre.id)]
        .sort((a, b) => a.nombre.localeCompare(b.nombre));
      
      if (subcategorias.length > 0) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        subcategorias.forEach(sub => {
          doc.text(`  - ${sub.nombre}`, 14, yPosition);
          yPosition += 8;
          
          if (yPosition > 280) {
            doc.addPage();
            yPosition = 20;
          }
        });
      }
      yPosition += 5;
      
      if (yPosition > 280) {
        doc.addPage();
        yPosition = 20;
      }
    });
    
    doc.save('reporte-categorias.pdf');
    toast.success('PDF generado correctamente');
  };

  useEffect(() => { cargar(); }, [busqueda]);

  const cargar = async () => {
    setCargando(true);
    try {
      const resp: any = await categoriasAPI.listar({ todos: true });
      setCategorias(resp || []);
    } catch {
      setCategorias([]);
    } finally {
      setCargando(false);
    }
  };

  const toggleExpandir = (id: number) => {
    const nuevasExpandidas = new Set(expandidas);
    if (nuevasExpandidas.has(id)) {
      nuevasExpandidas.delete(id);
    } else {
      nuevasExpandidas.add(id);
    }
    setExpandidas(nuevasExpandidas);
  };

  const toggleActiva = async (id: number) => {
    try {
      await categoriasAPI.toggleActiva(id);
      toast.success('Estado actualizado');
      cargar();
    } catch {
      toast.error('Error al actualizar estado');
    }
  };

  const confirmarEliminar = async () => {
    if (!modalEliminar) return;
    try {
      await categoriasAPI.eliminar(modalEliminar.id);
      toast.success('Categoría eliminada');
      setModalEliminar(null);
      cargar();
    } catch (err: any) {
      toast.error(err.message || 'Error al eliminar');
    }
  };

  const getSubcategorias = (padreId: number) => {
    return categorias.filter(c => c.categoriaPadreId === padreId);
  };

  const categoriasFiltradas = categorias.filter(c => {
    const matchesBusqueda = c.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const matchesEstado = filtroEstado === 'todos' 
      ? true 
      : filtroEstado === 'activas' 
        ? c.activa 
        : !c.activa;
    return matchesBusqueda && matchesEstado;
  });

  const categoriasPadre = [...categoriasFiltradas.filter(c => !c.categoriaPadreId)]
    .sort((a, b) => a.nombre.localeCompare(b.nombre));

  const renderCategoria = (categoria: Categoria, index: number, isSubcategoria: boolean = false) => {
    const subcategorias = [...getSubcategorias(categoria.id)]
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
    const tieneSubcategorias = subcategorias.length > 0;
    const estaExpandida = expandidas.has(categoria.id);

    return (
      <>
        <motion.tr
          key={categoria.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.03 }}
          className={`hover:bg-crema transition-colors ${isSubcategoria ? 'bg-gray-50' : ''}`}
        >
          <td className="px-5 py-4">
            <div className="flex items-center gap-3">
              {!isSubcategoria && tieneSubcategorias && (
                <button
                  onClick={() => toggleExpandir(categoria.id)}
                  className="p-1 text-gris-elegante hover:text-teal transition-colors"
                >
                  {estaExpandida ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
              )}
              {!isSubcategoria && !tieneSubcategorias && (
                <div className="w-6" />
              )}
              <div className={`w-10 h-10 bg-crema rounded-lg flex items-center justify-center shrink-0 overflow-hidden ${isSubcategoria ? 'ml-0' : ''}`}>
                {categoria.imagen ? (
                  <img 
                    src={categoria.imagen} 
                    alt={categoria.nombre} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Folder size={18} className="text-gris-elegante" />
                )}
              </div>
              <div className="min-w-0">
                <p className="font-medium text-azul-oscuro text-sm line-clamp-1">{categoria.nombre}</p>
                <p className="text-xs text-gris-elegante font-mono">{categoria.slug}</p>
              </div>
            </div>
          </td>
          <td className="px-5 py-4 text-sm text-gris-elegante">
            {categoria.categoriaPadre?.nombre || '-'}
          </td>
          <td className="px-5 py-4 text-sm text-azul-oscuro">
            {!isSubcategoria ? subcategorias.length : '-'}
          </td>
          <td className="px-5 py-4 text-center text-sm text-gris-elegante">{categoria.orden}</td>
          <td className="px-5 py-4 text-center">
            <button
              onClick={() => toggleActiva(categoria.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1 transition-colors ${
                categoria.activa 
                  ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                  : 'bg-red-100 text-red-600 hover:bg-red-200'
              }`}
            >
              <Power size={12} />
              {categoria.activa ? 'Activa' : 'Inactiva'}
            </button>
          </td>
          <td className="px-5 py-4">
            <div className="flex items-center justify-center gap-2">
              {!isSubcategoria && (
                <Link 
                  href={`/admin/categorias/nuevo?padre=${categoria.id}`} 
                  className="p-1.5 text-gris-elegante hover:text-teal transition-colors" 
                  title="Agregar subcategoría"
                >
                  <Plus size={16} />
                </Link>
              )}
              <Link href={`/admin/categorias/${categoria.id}`} className="p-1.5 text-gris-elegante hover:text-azul-corp transition-colors" title="Editar">
                <Edit2 size={16} />
              </Link>
              {puedeEliminar && (
                <button onClick={() => setModalEliminar({ id: categoria.id, nombre: categoria.nombre })} className="p-1.5 text-gris-elegante hover:text-red-500 transition-colors" title="Eliminar">
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </td>
        </motion.tr>
        {!isSubcategoria && tieneSubcategorias && estaExpandida && (
          <AnimatePresence>
            {subcategorias.map((sub, j) => (
              <motion.tr
                key={sub.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="hover:bg-crema transition-colors bg-gray-50"
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-6 ml-6" />
                    <div className="w-10 h-10 bg-crema rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                      {sub.imagen ? (
                        <img 
                          src={sub.imagen} 
                          alt={sub.nombre} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Folder size={18} className="text-gris-elegante" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-azul-oscuro text-sm line-clamp-1">{sub.nombre}</p>
                      <p className="text-xs text-gris-elegante font-mono">{sub.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-sm text-azul-oscuro">
                  {sub.categoriaPadre?.nombre || '-'}
                </td>
                <td className="px-5 py-4 text-sm text-gris-elegante">-</td>
                <td className="px-5 py-4 text-center text-sm text-gris-elegante">{sub.orden}</td>
                <td className="px-5 py-4 text-center">
                  <button
                    onClick={() => toggleActiva(sub.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1 transition-colors ${
                      sub.activa 
                        ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                        : 'bg-red-100 text-red-600 hover:bg-red-200'
                    }`}
                  >
                    <Power size={12} />
                    {sub.activa ? 'Activa' : 'Inactiva'}
                  </button>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <Link href={`/admin/categorias/${sub.id}`} className="p-1.5 text-gris-elegante hover:text-azul-corp transition-colors" title="Editar">
                      <Edit2 size={16} />
                    </Link>
                    <button onClick={() => setModalEliminar({ id: sub.id, nombre: sub.nombre })} className="p-1.5 text-gris-elegante hover:text-red-500 transition-colors" title="Eliminar">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </AnimatePresence>
        )}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-crema">
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-gris-elegante hover:text-teal transition-colors">
              <ChevronLeft size={20} />
            </Link>
            <div>
              <h1 className="text-xl font-bold font-montserrat text-azul-oscuro flex items-center gap-2">
                <Folder size={22} className="text-teal" /> Gestión de Categorías
              </h1>
              <p className="text-xs text-gris-elegante">
                {categoriasPadre.length} categorías • {categorias.length - categoriasPadre.length} subcategorías
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={generarPDF} 
              className="btn-outline flex items-center gap-2 text-sm"
            >
              <Download size={16} /> Reporte PDF
            </button>
            <Link href="/admin/categorias/nuevo" className="btn-secundario flex items-center gap-2 text-sm">
              <Plus size={16} /> Nueva Categoría
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="bg-white rounded-2xl shadow-card p-4 mb-6 flex gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3.5 top-3 text-gris-elegante" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar categoría..."
              className="input-campo pl-10 py-2.5"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gris-elegante font-medium">Estado:</span>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value as any)}
              className="input-campo py-2.5 px-4"
            >
              <option value="todos">Todos</option>
              <option value="activas">Activas</option>
              <option value="inactivas">Inactivas</option>
            </select>
          </div>
        </div>

        {cargando ? (
          <div className="flex justify-center py-20"><Loader2 size={36} className="animate-spin text-teal" /></div>
        ) : (
          <div className="bg-white rounded-2xl shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-crema border-b border-gray-100">
                    <th className="text-left px-5 py-3.5 text-xs font-bold text-azul-oscuro uppercase tracking-wide">Categoría</th>
                    <th className="text-left px-5 py-3.5 text-xs font-bold text-azul-oscuro uppercase tracking-wide">Padre</th>
                    <th className="text-left px-5 py-3.5 text-xs font-bold text-azul-oscuro uppercase tracking-wide">Subcategorías</th>
                    <th className="text-center px-5 py-3.5 text-xs font-bold text-azul-oscuro uppercase tracking-wide">Orden</th>
                    <th className="text-center px-5 py-3.5 text-xs font-bold text-azul-oscuro uppercase tracking-wide">Estado</th>
                    <th className="text-center px-5 py-3.5 text-xs font-bold text-azul-oscuro uppercase tracking-wide">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {categoriasPadre.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-16 text-gris-elegante">
                        <Folder size={40} className="mx-auto mb-3 opacity-30" />
                        <p>No hay categorías registradas</p>
                        <Link href="/admin/categorias/nuevo" className="text-teal text-sm mt-2 inline-block hover:underline">
                          + Agregar la primera categoría
                        </Link>
                      </td>
                    </tr>
                  ) : (
                    categoriasPadre.map((c, i) => renderCategoria(c, i))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal de confirmación de eliminación */}
      <AnimatePresence>
        {modalEliminar && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setModalEliminar(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                    <AlertTriangle size={24} className="text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-azul-oscuro mb-2">Eliminar Categoría</h3>
                    <p className="text-gris-elegante text-sm mb-6">
                      ¿Estás seguro de que deseas eliminar la categoría <span className="font-semibold text-azul-oscuro">"{modalEliminar.nombre}"</span>? Esta acción no se puede deshacer.
                    </p>
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => setModalEliminar(null)}
                        className="btn-outline px-5 py-2.5 text-sm"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={confirmarEliminar}
                        className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 text-sm rounded-lg font-medium transition-colors flex items-center gap-2"
                      >
                        <Trash2 size={16} />
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


    </div>
  );
}
