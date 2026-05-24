'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Save, ArrowLeft, Package, Loader2 } from 'lucide-react';
import { productosAPI, categoriasAPI } from '../../../../lib/api';
import toast from 'react-hot-toast';
import { Producto, Categoria } from '../../../../types';

export default function NuevoProductoPage() {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [form, setForm] = useState({
    nombre: '',
    slug: '',
    descripcion: '',
    descripcionCorta: '',
    sku: '',
    precio: 0,
    precioAnterior: null,
    porcentajeDescuento: 0,
    categoriaId: null,
    marcaId: null,
    stock: 0,
    stockMinimo: 5,
    activo: true,
    destacado: false,
    enOferta: false,
    imagenPrincipal: '',
  });

  useEffect(() => {
    cargarCategorias();
  }, []);

  const cargarCategorias = async () => {
    try {
      const resp: any = await categoriasAPI.listar();
      setCategorias(resp.datos || resp || []);
    } catch {
      toast.error('Error al cargar categorías');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    try {
      await productosAPI.crear({
        ...form,
        precio: Number(form.precio),
        precioAnterior: form.precioAnterior ? Number(form.precioAnterior) : null,
        porcentajeDescuento: Number(form.porcentajeDescuento),
        categoriaId: form.categoriaId ? Number(form.categoriaId) : null,
        marcaId: form.marcaId ? Number(form.marcaId) : null,
        stock: Number(form.stock),
        stockMinimo: Number(form.stockMinimo),
      });
      toast.success('Producto creado exitosamente');
      router.push('/admin/productos');
    } catch (err: any) {
      toast.error(err.message || 'Error al crear producto');
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

  return (
    <div className="min-h-screen bg-crema">
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/productos" className="text-gris-elegante hover:text-teal transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-xl font-bold font-montserrat text-azul-oscuro flex items-center gap-2">
                <Package size={22} className="text-teal" /> Nuevo Producto
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
                <label className="label-campo">Nombre del Producto *</label>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={handleNombreChange}
                  placeholder="Ej: Audífonos Sony WH-1000XM5"
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
                  placeholder="ej: audifonos-sony-wh1000xm5"
                  required
                  className="input-campo"
                />
              </div>

              <div>
                <label className="label-campo">SKU *</label>
                <input
                  type="text"
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  placeholder="Ej: SON-AUD-001"
                  required
                  className="input-campo"
                />
              </div>

              <div>
                <label className="label-campo">Precio *</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.precio}
                  onChange={(e) => setForm({ ...form, precio: Number(e.target.value) })}
                  placeholder="0.00"
                  required
                  className="input-campo"
                />
              </div>

              <div>
                <label className="label-campo">Precio Anterior</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.precioAnterior || ''}
                  onChange={(e) => setForm({ ...form, precioAnterior: e.target.value ? Number(e.target.value) : null })}
                  placeholder="0.00"
                  className="input-campo"
                />
              </div>

              <div>
                <label className="label-campo">% Descuento</label>
                <input
                  type="number"
                  value={form.porcentajeDescuento}
                  onChange={(e) => setForm({ ...form, porcentajeDescuento: Number(e.target.value) })}
                  placeholder="0"
                  className="input-campo"
                />
              </div>

              <div>
                <label className="label-campo">Categoría</label>
                <select
                  value={form.categoriaId || ''}
                  onChange={(e) => setForm({ ...form, categoriaId: e.target.value ? Number(e.target.value) : null })}
                  className="input-campo"
                >
                  <option value="">Seleccionar categoría</option>
                  {categorias.map((c) => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label-campo">Stock</label>
                <input
                  type="number"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                  placeholder="0"
                  className="input-campo"
                />
              </div>

              <div>
                <label className="label-campo">Stock Mínimo</label>
                <input
                  type="number"
                  value={form.stockMinimo}
                  onChange={(e) => setForm({ ...form, stockMinimo: Number(e.target.value) })}
                  placeholder="5"
                  className="input-campo"
                />
              </div>

              <div>
                <label className="label-campo">Imagen Principal URL</label>
                <input
                  type="text"
                  value={form.imagenPrincipal}
                  onChange={(e) => setForm({ ...form, imagenPrincipal: e.target.value })}
                  placeholder="https://ejemplo.com/imagen.jpg"
                  className="input-campo"
                />
              </div>

              <div className="md:col-span-2">
                <label className="label-campo">Descripción Corta</label>
                <input
                  type="text"
                  value={form.descripcionCorta}
                  onChange={(e) => setForm({ ...form, descripcionCorta: e.target.value })}
                  placeholder="Breve descripción del producto"
                  className="input-campo"
                />
              </div>

              <div className="md:col-span-2">
                <label className="label-campo">Descripción</label>
                <textarea
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  placeholder="Descripción completa del producto"
                  rows={4}
                  className="input-campo resize-none"
                />
              </div>

              <div className="md:col-span-2 flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.activo}
                    onChange={(e) => setForm({ ...form, activo: e.target.checked })}
                    className="w-4 h-4 text-teal rounded"
                  />
                  <span className="text-sm text-azul-oscuro">Activo</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.destacado}
                    onChange={(e) => setForm({ ...form, destacado: e.target.checked })}
                    className="w-4 h-4 text-teal rounded"
                  />
                  <span className="text-sm text-azul-oscuro">Destacado</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.enOferta}
                    onChange={(e) => setForm({ ...form, enOferta: e.target.checked })}
                    className="w-4 h-4 text-teal rounded"
                  />
                  <span className="text-sm text-azul-oscuro">En Oferta</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
              <Link
                href="/admin/productos"
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
                  <><Save size={18} /> Guardar Producto</>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
