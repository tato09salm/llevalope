'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Palette, Search, Plus, Edit2, Trash2,
  Power, AlertTriangle, Download, ChevronLeft,
} from 'lucide-react';
import { coloresAPI } from '../../../lib/api';
import toast from 'react-hot-toast';
import { Color } from '../../../types';
import { jsPDF } from 'jspdf';

export default function AdminColoresPage() {
  const [colores, setColores] = useState<Color[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [modalEliminar, setModalEliminar] = useState<{ id: number; nombre: string } | null>(null);

  useEffect(() => {
    cargar();
  }, []);

  const cargar = async () => {
    try {
      setCargando(true);
      const data = await coloresAPI.listarAdmin();
      setColores(Array.isArray(data) ? data : []);
    } catch {
      setColores([]);
    } finally {
      setCargando(false);
    }
  };

  const toggleActivo = async (id: number) => {
    try {
      await coloresAPI.toggleActiva(id);
      toast.success('Estado actualizado');
      cargar();
    } catch {
      toast.error('Error al actualizar estado');
    }
  };

  const confirmarEliminar = async () => {
    if (!modalEliminar) return;
    try {
      await coloresAPI.eliminar(modalEliminar.id);
      toast.success('Color eliminado');
      setModalEliminar(null);
      cargar();
    } catch {
      toast.error('Error al eliminar');
    }
  };

  const generarPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Reporte de Colores', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, 14, 30);
    
    let y = 40;
    const coloresOrdenados = [...coloresFiltrados].sort((a, b) => a.nombre.localeCompare(b.nombre));
    
    coloresOrdenados.forEach((color, index) => {
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`${index + 1}. ${color.nombre}`, 14, y);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Código HEX: ${color.hex}`, 20, y + 8);
      doc.text(`Estado: ${color.activo ? 'Activo' : 'Inactivo'}`, 20, y + 16);
      
      y += 24;
    });
    
    doc.save('reporte-colores.pdf');
    toast.success('PDF generado correctamente');
  };

  const coloresFiltrados = colores.filter((c) => {
    const matchesBusqueda = c.nombre.toLowerCase().includes(busqueda.toLowerCase()) || c.hex.toLowerCase().includes(busqueda.toLowerCase());
    const matchesEstado = filtroEstado === 'todos' || 
                         (filtroEstado === 'activos' && c.activo) || 
                         (filtroEstado === 'inactivos' && !c.activo);
    return matchesBusqueda && matchesEstado;
  });

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
                <Palette size={22} className="text-teal" /> Gestión de Colores
              </h1>
              <p className="text-xs text-gris-elegante">{colores.length} colores registrados</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={generarPDF} 
              className="btn-outline flex items-center gap-2 text-sm"
            >
              <Download size={16} /> Reporte PDF
            </button>
            <Link href="/admin/colores/nuevo" className="btn-secundario flex items-center gap-2 text-sm">
              <Plus size={16} /> Nuevo Color
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Buscador y filtros */}
        <div className="bg-white rounded-2xl shadow-card p-4 mb-6 flex gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3.5 top-3 text-gris-elegante" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar color por nombre o HEX..."
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
              <option value="activos">Activos</option>
              <option value="inactivos">Inactivos</option>
            </select>
          </div>
        </div>

        {/* Tabla */}
        {cargando ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal"></div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-crema border-b border-gray-100">
                    <th className="text-left px-5 py-3.5 text-xs font-bold text-azul-oscuro uppercase tracking-wide">
                      Muestra
                    </th>
                    <th className="text-left px-5 py-3.5 text-xs font-bold text-azul-oscuro uppercase tracking-wide">
                      Nombre
                    </th>
                    <th className="text-left px-5 py-3.5 text-xs font-bold text-azul-oscuro uppercase tracking-wide">
                      Código HEX
                    </th>
                    <th className="text-center px-5 py-3.5 text-xs font-bold text-azul-oscuro uppercase tracking-wide">
                      Estado
                    </th>
                    <th className="text-center px-5 py-3.5 text-xs font-bold text-azul-oscuro uppercase tracking-wide">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {coloresFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-16 text-gris-elegante">
                        <Palette size={40} className="mx-auto mb-3 opacity-30" />
                        <p>No hay colores registrados</p>
                        <Link href="/admin/colores/nuevo" className="text-teal text-sm mt-2 inline-block hover:underline">
                          + Agregar el primer color
                        </Link>
                      </td>
                    </tr>
                  ) : (
                    coloresFiltrados.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')).map((color) => (
                      <tr key={color.id} className="hover:bg-crema transition-colors">
                        <td className="px-5 py-4">
                          <div
                            className="w-10 h-10 rounded-full border border-gray-200"
                            style={{ backgroundColor: color.hex }}
                          />
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-medium text-azul-oscuro text-sm">{color.nombre}</p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-sm text-gris-elegante font-mono">{color.hex}</p>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <button
                            onClick={() => toggleActivo(color.id)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1 transition-colors mx-auto ${
                              color.activo
                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                : 'bg-red-100 text-red-600 hover:bg-red-200'
                            }`}
                          >
                            <Power size={12} />
                            {color.activo ? 'Activo' : 'Inactivo'}
                          </button>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <Link href={`/admin/colores/${color.id}`} className="p-1.5 text-gris-elegante hover:text-azul-corp transition-colors" title="Editar">
                              <Edit2 size={16} />
                            </Link>
                            <button onClick={() => setModalEliminar({ id: color.id, nombre: color.nombre })} className="p-1.5 text-gris-elegante hover:text-red-600 transition-colors" title="Eliminar">
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
                    <h3 className="text-lg font-bold text-azul-oscuro mb-2">Eliminar Color</h3>
                    <p className="text-gris-elegante text-sm mb-6">
                      ¿Estás seguro de que deseas eliminar el color <span className="font-semibold text-azul-oscuro">"{modalEliminar.nombre}"</span>? Esta acción no se puede deshacer.
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
