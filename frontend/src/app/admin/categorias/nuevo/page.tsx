'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Save, ArrowLeft, Folder, Loader2 } from 'lucide-react';
import { categoriasAPI } from '../../../../lib/api';
import toast from 'react-hot-toast';
import { Categoria } from '../../../../types';

function NuevaCategoriaForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const padreId = searchParams.get('padre');
  const [cargando, setCargando] = useState(false);
  const [categoriasPadre, setCategoriasPadre] = useState<Categoria[]>([]);
  const [tipoImagen, setTipoImagen] = useState<'url' | 'archivo'>('url');
  const [previewImagen, setPreviewImagen] = useState<string | null>(null);
  const [form, setForm] = useState({
    nombre: '',
    slug: '',
    descripcion: '',
    imagen: '',
    categoriaPadreId: null as number | null,
    activa: true,
    orden: 0,
  });

  useEffect(() => {
    cargarCategorias();
  }, []);

  useEffect(() => {
    if (padreId) {
      setForm(prev => ({ ...prev, categoriaPadreId: Number(padreId) }));
    }
  }, [padreId]);

  const cargarCategorias = async () => {
    try {
      const resp: any = await categoriasAPI.listar({ todos: true });
      const todas = resp || [];
      setCategoriasPadre(todas.filter((c: Categoria) => !c.categoriaPadreId));
    } catch {
      toast.error('Error al cargar categorías');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    try {
      await categoriasAPI.crear({
        ...form,
        categoriaPadreId: form.categoriaPadreId ? Number(form.categoriaPadreId) : null,
        orden: Number(form.orden),
      });
      toast.success('Categoría creada exitosamente');
      router.push('/admin/categorias');
    } catch (err: any) {
      toast.error(err.message || 'Error al crear categoría');
    } finally {
      setCargando(false);
    }
  };

  const generarSlug = (texto: string) => {
    return texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleNombreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nombre = e.target.value;
    setForm({ ...form, nombre, slug: generarSlug(nombre) });
  };

  const handleCategoriaPadreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setForm({
      ...form,
      categoriaPadreId: value ? Number(value) : null,
    });
  };

  const handleOrdenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, orden: Number(e.target.value) });
  };

  const handleArchivoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    if (archivo) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setForm({ ...form, imagen: result });
        setPreviewImagen(result);
      };
      reader.readAsDataURL(archivo);
    }
  };

  const handleImagenUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setForm({ ...form, imagen: url });
    setPreviewImagen(url || null);
  };

  return (
    <div className="min-h-screen bg-crema">
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/categorias" className="text-gris-elegante hover:text-teal transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-xl font-bold font-montserrat text-azul-oscuro flex items-center gap-2">
                <Folder size={22} className="text-teal" /> 
                {padreId ? 'Nueva Subcategoría' : 'Nueva Categoría'}
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
                <label className="label-campo">Nombre de la Categoría *</label>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={handleNombreChange}
                  placeholder="Ej: Audífonos"
                  required
                  className="input-campo"
                />
              </div>

              <div>
                <label className="label-campo">Slug *</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="ej: audifonos"
                  required
                  className="input-campo"
                />
              </div>

              <div>
                <label className="label-campo">Categoría Padre</label>
                <select
                  value={form.categoriaPadreId || ''}
                  onChange={handleCategoriaPadreChange}
                  className="input-campo"
                >
                  <option value="">Sin categoría padre</option>
                  {categoriasPadre.map((c) => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label-campo">Orden</label>
                <input
                  type="number"
                  value={form.orden}
                  onChange={handleOrdenChange}
                  placeholder="0"
                  className="input-campo"
                />
              </div>

              <div className="md:col-span-2">
                <label className="label-campo">Descripción</label>
                <textarea
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  placeholder="Descripción de la categoría"
                  rows={3}
                  className="input-campo resize-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="label-campo">Imagen</label>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setTipoImagen('url')}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        tipoImagen === 'url'
                          ? 'bg-teal text-white'
                          : 'bg-gray-100 text-gris-elegante hover:bg-gray-200'
                      }`}
                    >
                      URL
                    </button>
                    <button
                      type="button"
                      onClick={() => setTipoImagen('archivo')}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        tipoImagen === 'archivo'
                          ? 'bg-teal text-white'
                          : 'bg-gray-100 text-gris-elegante hover:bg-gray-200'
                      }`}
                    >
                      Subir Archivo
                    </button>
                  </div>
                  {tipoImagen === 'url' ? (
                    <input
                      type="text"
                      value={form.imagen}
                      onChange={handleImagenUrlChange}
                      placeholder="https://ejemplo.com/imagen.jpg"
                      className="input-campo"
                    />
                  ) : (
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleArchivoChange}
                      className="input-campo"
                    />
                  )}
                  {(form.imagen || previewImagen) && (
                    <div className="mt-3">
                      <img
                        src={form.imagen || previewImagen || ''}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="md:col-span-2 flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.activa}
                    onChange={(e) => setForm({ ...form, activa: e.target.checked })}
                    className="w-4 h-4 text-teal rounded"
                  />
                  <span className="text-sm text-azul-oscuro">Activa</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
              <Link
                href="/admin/categorias"
                className="btn-outline px-6 py-3 text-base"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={cargando}
                className="btn-primario px-6 py-3 text-base flex items-center gap-2"
              >
                {cargando ? (
                  <><Loader2 size={18} className="animate-spin" /> Guardando...</>
                ) : (
                  <><Save size={18} /> Guardar Categoría</>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

export default function NuevaCategoriaPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-crema flex items-center justify-center"><Loader2 size={48} className="animate-spin text-teal" /></div>}>
      <NuevaCategoriaForm />
    </Suspense>
  );
}
