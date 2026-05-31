'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronLeft, Save, Palette, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { coloresAPI } from '../../../../lib/api';
import toast from 'react-hot-toast';
import { Color } from '../../../../types';

export default function EditarColorPage() {
  const router = useRouter();
  const params = useParams();
  const [color, setColor] = useState<Color | null>(null);
  const [form, setForm] = useState({
    nombre: '',
    hex: '#000000',
  });
  const [guardando, setGuardando] = useState(false);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (params.id) {
      cargarColor(parseInt(params.id as string));
    }
  }, [params.id]);

  const cargarColor = async (id: number) => {
    try {
      setCargando(true);
      const data = await coloresAPI.obtener(id);
      setColor(data);
      setForm({
        nombre: data.nombre,
        hex: data.hex,
      });
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar el color');
      router.push('/admin/colores');
    } finally {
      setCargando(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setGuardando(true);
      await coloresAPI.actualizar(parseInt(params.id as string), form);
      toast.success('Color actualizado correctamente');
      router.push('/admin/colores');
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data || error?.message || 'Error al actualizar el color');
    } finally {
      setGuardando(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-crema flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal"></div>
      </div>
    );
  }

  if (!color) {
    return null;
  }

  return (
    <div className="min-h-screen bg-crema">
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/colores" className="text-gris-elegante hover:text-teal transition-colors">
              <ChevronLeft size={20} />
            </Link>
            <div>
              <h1 className="text-xl font-bold font-montserrat text-azul-oscuro flex items-center gap-2">
                <Palette size={22} className="text-teal" /> Editar Color
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
                <label className="label-campo">Nombre del Color *</label>
                <input
                  type="text"
                  name="nombre"
                  required
                  value={form.nombre}
                  onChange={handleChange}
                  placeholder="Ej: BLANCO, ROJO, AZUL"
                  className="input-campo"
                />
                <p className="text-xs text-gris-elegante mt-1">El nombre se guardará automáticamente en mayúsculas</p>
              </div>

              <div className="md:col-span-1">
                <label className="label-campo">Código HEX *</label>
                <div className="flex gap-3">
                  <input
                    type="color"
                    name="hex"
                    required
                    value={form.hex}
                    onChange={handleChange}
                    className="w-20 h-12 rounded-xl border border-gray-200 cursor-pointer"
                  />
                  <input
                    type="text"
                    name="hex"
                    required
                    value={form.hex}
                    onChange={handleChange}
                    placeholder="#FFFFFF"
                    className="flex-1 input-campo font-mono"
                  />
                </div>
              </div>

              <div className="md:col-span-1">
                <label className="label-campo">Vista Previa</label>
                <div
                  className="w-full h-12 rounded-xl border border-gray-200"
                  style={{ backgroundColor: form.hex }}
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
              <Link
                href="/admin/colores"
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
