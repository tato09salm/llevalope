'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronLeft, Save, Ruler, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { sizeCollectionsAPI } from '../../../../lib/api';
import toast from 'react-hot-toast';

export default function NuevaColeccionTallaPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    nombre: '',
    orden: 0,
  });
  const [guardando, setGuardando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setGuardando(true);
      await sizeCollectionsAPI.crear(form);
      toast.success('Colección creada correctamente');
      router.push('/admin/tallas');
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data || 'Error al crear la colección');
    } finally {
      setGuardando(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

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
                <Ruler size={22} className="text-teal" /> Nueva Colección de Tallas
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
                <label className="label-campo">Nombre de la Colección *</label>
                <input
                  type="text"
                  name="nombre"
                  required
                  value={form.nombre}
                  onChange={handleChange}
                  placeholder="Ej: CALZADO, ROPA, GORRAS"
                  className="input-campo"
                />
                <p className="text-xs text-gris-elegante mt-1">El nombre se guardará automáticamente en mayúsculas</p>
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
                  <><Save size={18} /> Guardar Colección</>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}