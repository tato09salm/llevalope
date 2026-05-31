'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Ruler, Search, Plus, Edit2, Trash2, ChevronLeft,
  Power, AlertTriangle, ChevronRight, ChevronDown,
  Download, FileText
} from 'lucide-react';
import { sizesAPI, sizeCollectionsAPI } from '../../../lib/api';
import { Size, SizeCollection } from '../../../types';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';

export default function AdminTallasPage() {
  const [colecciones, setColecciones] = useState<SizeCollection[]>([]);
  const [tallasSinColeccion, setTallasSinColeccion] = useState<Size[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [expandidas, setExpandidas] = useState<Set<number>>(new Set());
  const [modalEliminar, setModalEliminar] = useState<{ id: number; nombre: string; tipo: 'talla' | 'coleccion' } | null>(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const [coleccionesData, tallasData] = await Promise.all([
        sizeCollectionsAPI.listar({ todos: true }),
        sizesAPI.listar({ todos: true }),
      ]);
      
      const coleccionesList = Array.isArray(coleccionesData) ? coleccionesData : [];
      const tallasList = Array.isArray(tallasData) ? tallasData : [];
      
      setColecciones(coleccionesList);
      setTallasSinColeccion(tallasList.filter(t => !t.coleccionId));
    } catch (error) {
      console.error(error);
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

  const toggleActivoColeccion = async (id: number) => {
    try {
      await sizeCollectionsAPI.toggleActiva(id);
      toast.success('Estado actualizado');
      cargarDatos();
    } catch (error) {
      toast.error('Error al actualizar el estado');
    }
  };

  const toggleActivoTalla = async (id: number) => {
    try {
      await sizesAPI.toggleActiva(id);
      toast.success('Estado actualizado');
      cargarDatos();
    } catch (error) {
      toast.error('Error al actualizar el estado');
    }
  };

  const confirmarEliminar = async () => {
    if (!modalEliminar) return;
    try {
      if (modalEliminar.tipo === 'coleccion') {
        await sizeCollectionsAPI.eliminar(modalEliminar.id);
      } else {
        await sizesAPI.eliminar(modalEliminar.id);
      }
      toast.success('Eliminado correctamente');
      setModalEliminar(null);
      cargarDatos();
    } catch (error: any) {
      toast.error(error?.response?.data || 'Error al eliminar');
    }
  };

  const generarPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Reporte de Tallas', pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, 14, 30);
    
    let y = 45;
    
    // Tallas sin colección
    if (tallasSinColeccion.length > 0) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Talla Única', 14, y);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      y += 10;
      tallasSinColeccion.sort((a, b) => a.nombre.localeCompare(b.nombre)).forEach((talla) => {
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
        doc.text(`- ${talla.nombre}`, 20, y);
        y += 8;
      });
      y += 5;
    }
    
    // Colecciones
    colecciones.sort((a, b) => a.nombre.localeCompare(b.nombre)).forEach((coleccion) => {
      if (y > 260) {
        doc.addPage();
        y = 20;
      }
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(coleccion.nombre, 14, y);
      
      const tallasColeccion = coleccion.tallas || [];
      if (tallasColeccion.length > 0) {
        y += 10;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        tallasColeccion.forEach((talla) => {
          if (y > 280) {
            doc.addPage();
            y = 20;
          }
          doc.text(`- ${talla.nombre}`, 20, y);
          y += 8;
        });
      }
      y += 5;
    });
    
    doc.save('reporte-tallas.pdf');
    toast.success('PDF generado correctamente');
  };

  const filtrarTalla = (talla: Size) => {
    const matchesBusqueda = talla.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const matchesEstado = filtroEstado === 'todos' ||
      (filtroEstado === 'activas' && talla.activo) ||
      (filtroEstado === 'inactivas' && !talla.activo);
    return matchesBusqueda && matchesEstado;
  };

  const filtrarColeccion = (coleccion: SizeCollection) => {
    const matchesBusqueda = coleccion.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      (coleccion.tallas || []).some(t => t.nombre.toLowerCase().includes(busqueda.toLowerCase()));
    const matchesEstado = filtroEstado === 'todos' ||
      (filtroEstado === 'activas' && coleccion.activo) ||
      (filtroEstado === 'inactivas' && !coleccion.activo);
    return matchesBusqueda && matchesEstado;
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
                <Ruler size={22} className="text-teal" /> Gestión de Tallas
              </h1>
              <p className="text-xs text-gris-elegante">
                {colecciones.length} colecciones, {tallasSinColeccion.length + colecciones.reduce((acc, c) => acc + (c.tallas?.length || 0), 0)} tallas
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={generarPDF} className="btn-outline flex items-center gap-2 text-sm">
              <Download size={16} /> Reporte PDF
            </button>
            <Link href="/admin/tallas-colecciones/nuevo" className="btn-secundario flex items-center gap-2 text-sm">
              <Plus size={16} /> Nueva Colección
            </Link>
            <Link href="/admin/tallas/nuevo" className="btn-primario flex items-center gap-2 text-sm">
              <Plus size={16} /> Nueva Talla
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
              placeholder="Buscar talla o colección..."
              className="input-campo pl-10 py-2.5"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gris-elegante font-medium">Estado:</span>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="input-campo py-2.5 px-4"
            >
              <option value="todos">Todos</option>
              <option value="activas">Activas</option>
              <option value="inactivas">Inactivas</option>
            </select>
          </div>
        </div>

        {cargando ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Tallas sin colección */}
            {tallasSinColeccion.filter(filtrarTalla).length > 0 && (
              <div className="bg-white rounded-2xl shadow-card overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-bold font-montserrat text-azul-oscuro flex items-center gap-2">
                    <FileText size={18} className="text-teal" /> Talla Única
                  </h3>
                </div>
                <div className="px-6 py-4 space-y-3">
                  {tallasSinColeccion
                    .filter(filtrarTalla)
                    .sort((a, b) => a.orden - b.orden || a.nombre.localeCompare(b.nombre))
                    .map((talla) => (
                      <motion.div
                        key={talla.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-between p-3 bg-crema rounded-xl"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-teal/10 rounded-lg flex items-center justify-center">
                            <Ruler size={18} className="text-teal" />
                          </div>
                          <div>
                            <p className="font-medium text-azul-oscuro">{talla.nombre}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleActivoTalla(talla.id)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1 transition-colors ${
                              talla.activo
                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                : 'bg-red-100 text-red-600 hover:bg-red-200'
                            }`}
                          >
                            <Power size={12} />
                            {talla.activo ? 'Activa' : 'Inactiva'}
                          </button>
                          <Link href={`/admin/tallas/${talla.id}`} className="p-2 text-gris-elegante hover:text-azul-corp transition-colors rounded-lg hover:bg-azul-corp/5">
                            <Edit2 size={16} />
                          </Link>
                          <button onClick={() => setModalEliminar({ id: talla.id, nombre: talla.nombre, tipo: 'talla' })} className="p-2 text-gris-elegante hover:text-red-600 transition-colors rounded-lg hover:bg-red-50">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                </div>
              </div>
            )}

            {/* Colecciones */}
            {colecciones.filter(filtrarColeccion).sort((a, b) => a.orden - b.orden || a.nombre.localeCompare(b.nombre)).map((coleccion) => (
              <div key={coleccion.id} className="bg-white rounded-2xl shadow-card overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between cursor-pointer" onClick={() => toggleExpandir(coleccion.id)}>
                  <div className="flex items-center gap-3">
                    {coleccion.tallas && coleccion.tallas.length > 0 && (
                      expandidas.has(coleccion.id) ? <ChevronDown size={18} className="text-gris-elegante" /> : <ChevronRight size={18} className="text-gris-elegante" />
                    )}
                    <h3 className="font-bold font-montserrat text-azul-oscuro">{coleccion.nombre}</h3>
                    <span className="text-xs text-gris-elegante bg-white px-2 py-0.5 rounded-full">
                      {coleccion.tallas?.length || 0} tallas
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleActivoColeccion(coleccion.id); }}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1 transition-colors ${
                        coleccion.activo
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-red-100 text-red-600 hover:bg-red-200'
                      }`}
                    >
                      <Power size={12} />
                      {coleccion.activo ? 'Activa' : 'Inactiva'}
                    </button>
                    <Link href={`/admin/tallas-colecciones/${coleccion.id}`} onClick={(e) => e.stopPropagation()} className="p-2 text-gris-elegante hover:text-azul-corp transition-colors rounded-lg hover:bg-azul-corp/5">
                      <Edit2 size={16} />
                    </Link>
                    <Link href={`/admin/tallas/nuevo?coleccionId=${coleccion.id}`} onClick={(e) => e.stopPropagation()} className="p-2 text-gris-elegante hover:text-teal transition-colors rounded-lg hover:bg-teal/5" title="Agregar talla">
                      <Plus size={16} />
                    </Link>
                    <button onClick={(e) => { e.stopPropagation(); setModalEliminar({ id: coleccion.id, nombre: coleccion.nombre, tipo: 'coleccion' }); }} className="p-2 text-gris-elegante hover:text-red-600 transition-colors rounded-lg hover:bg-red-50">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <AnimatePresence>
                  {(expandidas.has(coleccion.id) || !coleccion.tallas || coleccion.tallas.length === 0) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                    >
                      <div className="px-6 py-4 space-y-3">
                        {(coleccion.tallas || [])
                          .filter(filtrarTalla)
                          .sort((a, b) => a.orden - b.orden || a.nombre.localeCompare(b.nombre))
                          .map((talla) => (
                            <motion.div
                              key={talla.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="flex items-center justify-between p-3 bg-crema rounded-xl"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-teal/10 rounded-lg flex items-center justify-center">
                                  <Ruler size={18} className="text-teal" />
                                </div>
                                <div>
                                  <p className="font-medium text-azul-oscuro">{talla.nombre}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => toggleActivoTalla(talla.id)}
                                  className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1 transition-colors ${
                                    talla.activo
                                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                      : 'bg-red-100 text-red-600 hover:bg-red-200'
                                  }`}
                                >
                                  <Power size={12} />
                                  {talla.activo ? 'Activa' : 'Inactiva'}
                                </button>
                                <Link href={`/admin/tallas/${talla.id}`} className="p-2 text-gris-elegante hover:text-azul-corp transition-colors rounded-lg hover:bg-azul-corp/5">
                                  <Edit2 size={16} />
                                </Link>
                                <button onClick={() => setModalEliminar({ id: talla.id, nombre: talla.nombre, tipo: 'talla' })} className="p-2 text-gris-elegante hover:text-red-600 transition-colors rounded-lg hover:bg-red-50">
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </motion.div>
                          ))}
                        {(coleccion.tallas || []).filter(filtrarTalla).length === 0 && (
                          <p className="text-gris-elegante text-center py-4">No hay tallas en esta colección</p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}

            {colecciones.filter(filtrarColeccion).length === 0 && tallasSinColeccion.filter(filtrarTalla).length === 0 && (
              <div className="bg-white rounded-2xl shadow-card p-12 text-center">
                <Ruler size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="text-gris-elegante mb-4">No hay tallas registradas</p>
                <div className="flex items-center justify-center gap-3">
                  <Link href="/admin/tallas-colecciones/nuevo" className="btn-secundario">
                    <Plus size={16} className="mr-2" /> Nueva Colección
                  </Link>
                  <Link href="/admin/tallas/nuevo" className="btn-primario">
                    <Plus size={16} className="mr-2" /> Nueva Talla
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

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
                    <h3 className="text-lg font-bold text-azul-oscuro mb-2">
                      Eliminar {modalEliminar.tipo === 'talla' ? 'Talla' : 'Colección'}
                    </h3>
                    <p className="text-gris-elegante text-sm mb-6">
                      ¿Estás seguro de que deseas eliminar {modalEliminar.tipo === 'talla' ? 'la talla' : 'la colección'} <span className="font-semibold text-azul-oscuro">"{modalEliminar.nombre}"</span>? Esta acción no se puede deshacer.
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