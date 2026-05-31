'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Save, ArrowLeft, Package, Loader2, Plus, Trash2, Image as ImageIcon, Layers } from 'lucide-react';
import { productosAPI, categoriasAPI, coloresAPI, sizeCollectionsAPI, sizesAPI } from '../../../../lib/api';
import toast from 'react-hot-toast';
import VariantImagesDialog from '../../../../components/ui/variant-images-dialog';

interface FormVariant {
  id?: number;
  colorId: number | null;
  sizeId: number | null;
  sku: string;
  precioBase: string;
  precioOferta: string;
  porcentajeDescuento: number | null;
  stock: string;
  stockMinimo: string;
  enOferta: boolean;
  activo: boolean;
  esPrincipal: boolean;
  orden: number;
  imagenes: { url: string; alt: string; orden: number; principal: boolean }[];
}

export default function EditarProductoPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

  const [cargando, setCargando] = useState(false);
  const [cargandoDatos, setCargandoDatos] = useState(true);
  const [categorias, setCategorias] = useState([]);
  const [colores, setColores] = useState([]);
  const [coleccionesTallas, setColeccionesTallas] = useState([]);
  const [tallas, setTallas] = useState([]);
  const [categoriaPadreId, setCategoriaPadreId] = useState(null);
  const [subcategorias, setSubcategorias] = useState([]);

  // Modal para editar imágenes de variante
  const [variantImagesDialog, setVariantImagesDialog] = useState<{
    isOpen: boolean;
    variantIndex: number;
  }>({ isOpen: false, variantIndex: 0 });

  const [form, setForm] = useState({
    nombre: '',
    slug: '',
    descripcion: '',
    descripcionCorta: '',
    categoriaId: null,
    marcaId: null,
    activo: true,
    destacado: false,
    imagenPrincipal: '',
    peso: '' as string | null,
  });

  const [variantes, setVariantes] = useState([]);

  useEffect(() => {
    cargarDatos();
  }, [id]);

  useEffect(() => {
    if (categoriaPadreId) {
      const subs = categorias.filter((c) => c.categoriaPadreId === categoriaPadreId);
      setSubcategorias(subs);
    } else {
      setSubcategorias([]);
    }
  }, [categoriaPadreId, categorias]);

  const cargarDatos = async () => {
    setCargandoDatos(true);
    try {
      const [catsRes, colsRes, collsRes, sizesRes, productoRes] = await Promise.all([
        categoriasAPI.listar({ todos: true }),
        coloresAPI.listar({ todos: true }),
        sizeCollectionsAPI.listar({ todos: true }),
        sizesAPI.listar({ todos: true }),
        productosAPI.obtenerPorId(id),
      ]);

      setCategorias(Array.isArray(catsRes) ? catsRes : catsRes.datos || []);
      setColores(Array.isArray(colsRes) ? colsRes : colsRes.datos || []);
      setColeccionesTallas(Array.isArray(collsRes) ? collsRes : collsRes.datos || []);
      setTallas(Array.isArray(sizesRes) ? sizesRes : sizesRes.datos || []);

      const producto = productoRes;
      
      // Encontrar categoría padre
      const catPadre = producto.categoria?.categoriaPadreId 
        ? producto.categoria.categoriaPadreId 
        : producto.categoria?.id;
      setCategoriaPadreId(catPadre);

      setForm({
        nombre: producto.nombre || '',
        slug: producto.slug || '',
        descripcion: producto.descripcion || '',
        descripcionCorta: producto.descripcionCorta || '',
        categoriaId: producto.categoriaId || null,
        subcategoriaId: producto.categoriaId || null, // Inicializar subcategoriaId
        marcaId: producto.marcaId || null,
        activo: producto.activo ?? true,
        destacado: producto.destacado ?? false,
        imagenPrincipal: producto.imagenPrincipal || '',
        peso: producto.peso !== null && producto.peso !== undefined ? String(producto.peso) : '',
      });

      setVariantes((producto.variantes || []).map((v, idx) => ({
        id: v.id,
        colorId: v.colorId || null,
        sizeId: v.sizeId || null,
        sku: v.sku || '',
        precioBase: v.precioBase || v.precio ? String(v.precioBase || v.precio) : '',
        precioOferta: v.precioOferta ? String(v.precioOferta) : '',
        porcentajeDescuento: v.porcentajeDescuento || null,
        stock: v.stock ? String(v.stock) : '',
        stockMinimo: v.stockMinimo ? String(v.stockMinimo) : '',
        enOferta: v.enOferta ?? false,
        activo: v.activo ?? true,
        esPrincipal: idx === 0,
        orden: idx,
        imagenes: (v.imagenes || []).map(img => ({
          url: img.url,
          alt: img.alt || '',
          orden: img.orden,
          principal: img.principal,
        })),
      })));

    } catch (error) {
      toast.error('Error al cargar datos');
    } finally {
      setCargandoDatos(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (variantes.length === 0) {
      toast.error('Debes agregar al menos una variante');
      return;
    }

    if (!categoriaPadreId || !form.categoriaId) {
      toast.error('Debes seleccionar categoría padre y categoría');
      return;
    }

    setCargando(true);
    try {
      await productosAPI.actualizar(id, {
        ...form,
        categoriaId: form.categoriaId ? Number(form.categoriaId) : null,
        marcaId: form.marcaId ? Number(form.marcaId) : null,
        peso: form.peso && form.peso !== '' ? Number(form.peso) : null,
        imagenes: [], // No hay imágenes globales
        variantes: variantes.map((v, idx) => {
          const precioBaseNum = parseFloat(v.precioBase);
          const precioOfertaNum = v.precioOferta ? parseFloat(v.precioOferta) : null;
          const stockNum = parseFloat(v.stock);
          const stockMinimoNum = parseFloat(v.stockMinimo);
          
          return {
            id: v.id,
            colorId: v.colorId,
            sizeId: v.sizeId,
            sku: v.sku,
            precioBase: !isNaN(precioBaseNum) ? precioBaseNum : 0,
            precioOferta: precioOfertaNum !== null && !isNaN(precioOfertaNum) ? precioOfertaNum : null,
            porcentajeDescuento: v.porcentajeDescuento ? Number(v.porcentajeDescuento) : null,
            stock: !isNaN(stockNum) ? stockNum : 0,
            stockMinimo: !isNaN(stockMinimoNum) ? stockMinimoNum : 5,
            enOferta: 
              precioOfertaNum !== null && !isNaN(precioOfertaNum) && 
              !isNaN(precioBaseNum) && precioBaseNum > precioOfertaNum,
            activo: v.activo,
            esPrincipal: idx === 0,
            orden: idx,
            imagenes: v.imagenes.map((img, imgIdx) => ({ ...img, orden: imgIdx })),
          };
        }),
      });
      toast.success('Producto actualizado exitosamente');
      router.push('/admin/productos');
    } catch (err) {
      toast.error(err.message || 'Error al actualizar producto');
    } finally {
      setCargando(false);
    }
  };

  const generarSlug = (texto) => {
    return texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const generarSku = (categoriaPadre, subcategoria, numero, color, talla) => {
    const inicialesCategoria = (categoriaPadre || '').substring(0, 2).toUpperCase();
    const inicialesSubcategoria = (subcategoria || '').substring(0, 1).toUpperCase();
    const numeroFormateado = String(numero).padStart(3, '0');
    
    let sku = `${inicialesCategoria}${inicialesSubcategoria}-${numeroFormateado}`;
    
    if (color) {
      sku += `-${color.toUpperCase()}`;
    }
    
    if (talla) {
      sku += `-${talla.toUpperCase()}`;
    }
    
    return sku;
  };

  const actualizarSkus = () => {
    // Obtener nombres de categorías
    const categoriaPadre = categorias.find(c => c.id === categoriaPadreId)?.nombre || '';
    const subcategoria = categorias.find(c => c.id === form.categoriaId)?.nombre || '';
    
    setVariantes(prev => prev.map((variante, idx) => {
      const color = colores.find(c => c.id === variante.colorId)?.nombre || '';
      const talla = tallas.find(t => t.id === variante.sizeId)?.nombre || '';
      const nuevoSku = generarSku(categoriaPadre, subcategoria, idx + 1, color, talla);
      
      return { ...variante, sku: nuevoSku };
    }));
  };

  const handleNombreChange = (e) => {
    const nombre = e.target.value;
    setForm({ ...form, nombre, slug: generarSlug(nombre) });
  };

  const agregarVariante = () => {
    const categoriaPadre = categorias.find(c => c.id === categoriaPadreId)?.nombre || '';
    const subcategoria = categorias.find(c => c.id === form.categoriaId)?.nombre || '';
    const numero = variantes.length + 1;
    
    setVariantes([...variantes, {
      colorId: null,
      sizeId: null,
      sku: generarSku(categoriaPadre, subcategoria, numero, '', ''),
      precioBase: '',
      precioOferta: '',
      porcentajeDescuento: null,
      stock: '',
      stockMinimo: '',
      enOferta: false,
      activo: true,
      esPrincipal: variantes.length === 0,
      orden: variantes.length,
      imagenes: [],
    }]);
  };

  const eliminarVariante = (index) => {
    const nuevasVariantes = variantes.filter((_, i) => i !== index);
    // Re-generar SKUs después de eliminar
    setVariantes(nuevasVariantes);
    // Actualizamos los SKUs después del renderizado
    setTimeout(actualizarSkus, 0);
  };

  const actualizarVariante = (index, data) => {
    const newVars = [...variantes];
    let updatedData = { ...newVars[index], ...data };
    
    // Generar nuevo SKU si cambió color o talla
    if (data.colorId !== undefined || data.sizeId !== undefined) {
      const categoriaPadre = categorias.find(c => c.id === categoriaPadreId)?.nombre || '';
      const subcategoria = categorias.find(c => c.id === form.categoriaId)?.nombre || '';
      const color = colores.find(c => c.id === (data.colorId !== undefined ? data.colorId : updatedData.colorId))?.nombre || '';
      const talla = tallas.find(t => t.id === (data.sizeId !== undefined ? data.sizeId : updatedData.sizeId))?.nombre || '';
      
      updatedData.sku = generarSku(categoriaPadre, subcategoria, index + 1, color, talla);
    }
    
    // Calcular porcentaje de descuento automáticamente
    const precioBaseNum = parseFloat(updatedData.precioBase);
    const precioOfertaNum = parseFloat(updatedData.precioOferta);
    
    if (
      !isNaN(precioBaseNum) && !isNaN(precioOfertaNum) &&
      precioBaseNum > 0 && precioOfertaNum > 0 &&
      precioBaseNum > precioOfertaNum
    ) {
      const descuento = Math.round(((precioBaseNum - precioOfertaNum) / precioBaseNum) * 100);
      updatedData.porcentajeDescuento = descuento;
      updatedData.enOferta = true;
    } else {
      updatedData.porcentajeDescuento = null;
      updatedData.enOferta = false;
    }
    
    newVars[index] = updatedData;
    setVariantes(newVars);
  };

  const actualizarImagenesVariante = (variantIndex, newImages) => {
    const newVars = [...variantes];
    newVars[variantIndex].imagenes = newImages;
    setVariantes(newVars);
  };

  const categoriasPadre = categorias.filter((c) => !c.categoriaPadreId);

  if (cargandoDatos) {
    return (
      <div className="min-h-screen bg-crema flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-teal" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-crema">
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/productos" className="text-gris-elegante hover:text-teal transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-xl font-bold font-montserrat text-azul-oscuro flex items-center gap-2">
                <Package size={22} className="text-teal" /> Editar Producto
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white rounded-2xl shadow-card p-8">
              <h2 className="text-lg font-semibold text-azul-oscuro mb-6">Datos Básicos</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="label-campo">Nombre del Producto *</label>
                  <input type="text" value={form.nombre} onChange={handleNombreChange} required className="input-campo" />
                </div>
                <div>
                  <label className="label-campo">Categoría Padre *</label>
                  <select
                    value={categoriaPadreId || ''}
                    onChange={(e) => {
                      const nuevoId = e.target.value ? Number(e.target.value) : null;
                      setCategoriaPadreId(nuevoId);
                      // Resetear la subcategoría cuando cambie la categoría padre
                      setForm({ ...form, categoriaId: null, subcategoriaId: null });
                      // Actualizar los SKUs después de que se actualice el estado
                      setTimeout(() => {
                        actualizarSkus();
                      }, 0);
                    }}
                    className="input-campo"
                    required
                  >
                    <option value="">Seleccionar categoría padre</option>
                    {categoriasPadre.map((c) => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                </div>
                {categoriaPadreId && (
                  <div>
                    <label className="label-campo">Subcategoría *</label>
                    <select
                      value={form.categoriaId || ''}
                      onChange={(e) => {
                        const nuevoId = e.target.value ? Number(e.target.value) : null;
                        setForm({ ...form, categoriaId: nuevoId, subcategoriaId: nuevoId });
                        // Actualizar los SKUs después de que se actualice el estado
                        setTimeout(() => {
                          actualizarSkus();
                        }, 0);
                      }}
                      className="input-campo"
                      required
                    >
                      <option value="">Seleccionar subcategoría</option>
                      {subcategorias.map((c) => (
                        <option key={c.id} value={c.id}>{c.nombre}</option>
                      ))}
                    </select>
                  </div>
                )}
                {!categoriaPadreId && (
                  <div className="opacity-50">
                    <label className="label-campo">Subcategoría</label>
                    <select
                      disabled
                      className="input-campo cursor-not-allowed"
                    >
                      <option value="">Primero selecciona categoría padre</option>
                    </select>
                  </div>
                )}
                <div>
                  <label className="label-campo">Peso (kg)</label>
                  <input
                    type="text"
                    value={form.peso || ''}
                    onChange={(e) => {
                      // Permitir solo números, punto decimal, vacío
                      const value = e.target.value;
                      if (value === '' || /^\d*\.?\d*$/.test(value)) {
                        setForm({ ...form, peso: value });
                      }
                    }}
                    placeholder="0.000"
                    className="input-campo"
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={form.destacado}
                        onChange={(e) => setForm({ ...form, destacado: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-teal rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal"></div>
                    </div>
                    <span className="text-sm font-medium text-azul-oscuro">Producto Destacado</span>
                  </label>
                </div>
                <div>
                  <label className="label-campo">Descripción Corta</label>
                  <input type="text" value={form.descripcionCorta} onChange={(e) => setForm({ ...form, descripcionCorta: e.target.value })} className="input-campo" />
                </div>
                <div className="md:col-span-2">
                  <label className="label-campo">Descripción</label>
                  <textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} rows={4} className="input-campo resize-none" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-card p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-azul-oscuro flex items-center gap-2">
                  <Layers size={20} /> Variantes del Producto
                </h2>
                <button type="button" onClick={agregarVariante} className="btn-primario flex items-center gap-2">
                  <Plus size={16} /> Agregar Variante
                </button>
              </div>

              {variantes.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-azul-oscuro">SKU</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-azul-oscuro">Color</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-azul-oscuro">Talla</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-azul-oscuro">Precio Base</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-azul-oscuro">Precio Oferta</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-azul-oscuro">Stock</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-azul-oscuro">Stock Mínimo</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-azul-oscuro">Imágenes</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-azul-oscuro">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {variantes.map((variant, idx) => {
                        // Calcular porcentaje de descuento
                        let tieneOferta = false;
                        let porcentaje = null;
                        
                        const precioBaseNum = parseFloat(variant.precioBase);
                        const precioOfertaNum = parseFloat(variant.precioOferta);
                        
                        if (
                          !isNaN(precioBaseNum) && !isNaN(precioOfertaNum) &&
                          precioBaseNum > 0 && precioOfertaNum > 0 &&
                          precioBaseNum > precioOfertaNum
                        ) {
                          tieneOferta = true;
                          const calculated = Math.round(((precioBaseNum - precioOfertaNum) / precioBaseNum) * 100);
                          porcentaje = calculated > 0 ? calculated : null;
                        }
                        
                        return (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <input
                                type="text"
                                value={variant.sku}
                                onChange={(e) => actualizarVariante(idx, { sku: e.target.value })}
                                className="input-campo text-sm"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <select
                                value={variant.colorId || ''}
                                onChange={(e) => actualizarVariante(idx, { colorId: e.target.value ? Number(e.target.value) : null })}
                                className="input-campo text-sm"
                              >
                                <option value="">Ninguno</option>
                                {colores.map((c) => (
                                  <option key={c.id} value={c.id}>{c.nombre}</option>
                                ))}
                              </select>
                            </td>
                            <td className="px-4 py-3">
                              <select
                                value={variant.sizeId || ''}
                                onChange={(e) => actualizarVariante(idx, { sizeId: e.target.value ? Number(e.target.value) : null })}
                                className="input-campo text-sm"
                              >
                                <option value="">Ninguna</option>
                                {tallas.map((t) => (
                                  <option key={t.id} value={t.id}>{t.nombre}</option>
                                ))}
                              </select>
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="text"
                                value={variant.precioBase}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                    actualizarVariante(idx, { precioBase: value });
                                  }
                                }}
                                className="input-campo text-sm"
                                placeholder="0.00"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <div>
                                <input
                                  type="text"
                                  value={variant.precioOferta}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                      actualizarVariante(idx, { precioOferta: value });
                                    }
                                  }}
                                  className="input-campo text-sm"
                                  placeholder="Precio oferta"
                                />
                                {tieneOferta && porcentaje && (
                                  <span className="mt-1 inline-block text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                                    -{porcentaje}%
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="text"
                                value={variant.stock}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                    actualizarVariante(idx, { stock: value });
                                  }
                                }}
                                className="input-campo text-sm"
                                placeholder="0"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="text"
                                value={variant.stockMinimo}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                    actualizarVariante(idx, { stockMinimo: value });
                                  }
                                }}
                                className="input-campo text-sm"
                                placeholder="0"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1">
                                {variant.imagenes.length > 0 && (
                                  <span className="text-xs text-gris-elegante">
                                    {variant.imagenes.length} img
                                  </span>
                                )}
                                <button
                                  type="button"
                                  onClick={() => setVariantImagesDialog({ isOpen: true, variantIndex: idx })}
                                  className="p-1.5 text-teal hover:bg-teal-50 rounded-lg transition-colors"
                                  title="Gestionar imágenes"
                                >
                                  <ImageIcon size={14} />
                                </button>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => eliminarVariante(idx)}
                                  className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                                >
                                  <Trash2 size={14} />
                                </button>
                                {variant.esPrincipal && (
                                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Principal</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
                
              {variantes.length === 0 && (
                <div className="text-center py-8 text-gris-elegante">
                  No hay variantes. Agrega una para empezar.
                </div>
              )}
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Link href="/admin/productos" className="btn-outline px-6 py-3 text-base">Cancelar</Link>
              <button type="submit" disabled={cargando} className="btn-primario px-6 py-3 text-base flex items-center gap-2">
                {cargando ? (
                  <><Loader2 size={18} className="animate-spin" /> Guardando...</>
                ) : (
                  <><Save size={18} /> Actualizar Producto</>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>

      {/* Modal para editar imágenes de variante */}
      <VariantImagesDialog
        isOpen={variantImagesDialog.isOpen}
        onClose={() => setVariantImagesDialog({ isOpen: false, variantIndex: 0 })}
        variantIndex={variantImagesDialog.variantIndex}
        images={variantes[variantImagesDialog.variantIndex]?.imagenes || []}
        onUpdateImages={actualizarImagenesVariante}
      />
    </div>
  );
}
