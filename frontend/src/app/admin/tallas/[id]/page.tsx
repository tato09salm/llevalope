'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronLeft, Save, Ruler, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { sizesAPI, sizeCollectionsAPI } from '../../../../lib/api';
import toast from 'react-hot-toast';
import { Size, SizeCollection } from '../../../../types';

export default function EditarTallaPage() {
  const router = useRouter();
  const params = useParams();
  const [talla, setTalla] = useState<Size | null>(null);
  const [colecciones, setColecciones] = useState<SizeCollection[]>([]);
  const [form, setForm] = useState({
    nombre: '',
    orden: 0,
    coleccionId: null as number | null,
  });
  const [guardando, setGuardando] = useState(false);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, [params.id]);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const [tallaData, coleccionesData] = await Promise.all([
        sizesAPI.obtener(parseInt(params.id as string)),
        sizeCollectionsAPI.listar(),
      ]);
      
      setTalla(tallaData);
      setColecciones(Array.isArray(coleccionesData) ? coleccionesData : []);
      setForm({
        nombre: tallaData.nombre,
        orden: tallaData.orden,
        coleccionId: tallaData.coleccionId,
      });
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar la talla');
      router.push('/admin/tallas');
    } finally {
      setCargando(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setGuardando(true);
      await sizesAPI.actualizar(parseInt(params.id as string), form);
      toast.success('Talla actualizada correctamente');
      router.push('/admin/tallas');
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data || 'Error al actualizar la talla');
    } finally {
      setGuardando(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value ? Number(value) : null) : value,
    }));
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-crema flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal"></div>
      </div>
    );
  }

  if (!talla) {
    return null;
  }

  return (
    <div className="min-h-screen bg-crema">
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/tallas" className="text-gris-elegante hover:text-teal transition-colors">
              <ChevronLeft size={20} />
            </Link>
            <div>
              <h1 className="text-xl font-bold font-montserrat text-azul-oscuro flex items-center gap-2">
                <Ruler size={22} className="text-teal" /> Editar Talla
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-card p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="label-campo">Nombre de la Talla *</label>
                <input
                  type="text"
                  name="nombre"
                  required
                  value={form.nombre}
                  onChange={handleChange}
                  placeholder="Ej: S, M, L, XL, 32, 36, 40"
                  className="input-campo"
                />
                <p className="text-xs text-gris-elegante mt-1">El nombre se guardará automáticamente en mayúsculas</p>
              </div>

              <div>
                <label className="label-campo">Colección</label>
                <select
                  name="coleccionId"
                  value={form.coleccionId || ''}
                  onChange={handleChange}
                  className="input-campo"
                >
                  <option value="">Talla Única</option>
                  {colecciones.sort((a, b) => a.nombre.localeCompare(b.nombre)).map((coleccion) => (
                    <option key={coleccion.id} value={coleccion.id}>{coleccion.nombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label-campo">Orden</label>
                <input
                  type="number"
                  name="orden"
                  min="0"
                  value={form.orden}
                  onChange={handleChange}
                  placeholder="0"
                  className="input-campo"
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
              <Link
                href="/admin/tallas"
                className="btn-outline px-6 py-3 text-base"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={guardando}
                className="btn-primario px-6 py-3 text-base flex items-center gap-2"
              >
                {guardando ? (
                  <><Loader2 size={18} className="animate-spin" /> Guardando...</>
                ) : (
                  <><Save size={18} /> Guardar Cambios</>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}