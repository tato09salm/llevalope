'use client';

import { useEffect, useState, Suspense, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, SlidersHorizontal, Grid, List, Search, X, Loader2, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import CardProducto from '../../components/productos/CardProducto';
import CardProductoList from '../../components/productos/CardProductoList';
import { productosAPI, categoriasAPI } from '../../lib/api';
import { Producto, Categoria } from '../../types';

function ProductosContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [cargando, setCargando] = useState(true);
  const [vistaLista, setVistaLista] = useState(false);
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);

  // Sincronizar filtros con URL
  const [filtros, setFiltros] = useState(() => ({
    busqueda: searchParams.get('busqueda') || '',
    categoria: searchParams.get('categoria') || '',
    precioMin: searchParams.get('precioMin') || '',
    precioMax: searchParams.get('precioMax') || '',
    enOferta: searchParams.get('enOferta') === 'true',
    destacado: searchParams.get('destacado') === 'true',
    ordenar: searchParams.get('ordenar') || 'creadoEn',
  }));

  // Actualizar filtros cuando cambie la URL
  useEffect(() => {
    setFiltros({
      busqueda: searchParams.get('busqueda') || '',
      categoria: searchParams.get('categoria') || '',
      precioMin: searchParams.get('precioMin') || '',
      precioMax: searchParams.get('precioMax') || '',
      enOferta: searchParams.get('enOferta') === 'true',
      destacado: searchParams.get('destacado') === 'true',
      ordenar: searchParams.get('ordenar') || 'creadoEn',
    });
    setPagina(1);
  }, [searchParams]);

  useEffect(() => {
    cargarCategorias();
  }, []);

  useEffect(() => {
    cargarProductos();
  }, [filtros, pagina]);

  const cargarCategorias = async () => {
    try {
      const resp: any = await categoriasAPI.listarPadres();
      setCategorias(Array.isArray(resp) ? resp : resp.datos || []);
    } catch {
      // fall silent
    }
  };

  const cargarProductos = async () => {
    setCargando(true);
    try {
      const params: any = { pagina, limite: 24, ordenar: filtros.ordenar };
      if (filtros.busqueda) params.busqueda = filtros.busqueda;
      if (filtros.categoria) params.categoria = filtros.categoria;
      // Check if precioMin/precioMax exist (including "0")
      if (filtros.precioMin !== undefined && filtros.precioMin !== '') {
        const val = parseFloat(filtros.precioMin);
        if (!isNaN(val)) params.precioMin = val;
      }
      if (filtros.precioMax !== undefined && filtros.precioMax !== '') {
        const val = parseFloat(filtros.precioMax);
        if (!isNaN(val)) params.precioMax = val;
      }
      if (filtros.enOferta) params.enOferta = true;
      if (filtros.destacado) params.destacado = true;

      const resp: any = await productosAPI.listar(params);
      setProductos(resp.datos || []);
      setTotal(resp.total || 0);
      const totalPages = Math.ceil((resp.total || 0) / 24);
      setTotalPaginas(totalPages > 0 ? totalPages : 1);
    } catch {
      setProductos([]);
    } finally {
      setCargando(false);
    }
  };

  // Actualizar filtro y URL
  const actualizarFiltro = useCallback((key: string, valor: any) => {
    const newFiltros = { ...filtros, [key]: valor };
    
    // Construir nuevos params de URL
    const params = new URLSearchParams();
    Object.entries(newFiltros).forEach(([k, v]) => {
      // Special handling for precioMin/precioMax - include "0" values
      if (k === 'precioMin' || k === 'precioMax') {
        if (v !== '' && v !== null && v !== undefined) {
          // Check if it's a valid number or number string
          const num = Number(v);
          if (!isNaN(num)) {
            params.set(k, v.toString());
          }
        }
      } else if (v && v !== '') {
        params.set(k, v.toString());
      }
    });
    
    // Navegar sin recargar la página
    router.push(`/productos?${params.toString()}`, { scroll: false });
    setPagina(1);
  }, [filtros, router]);

  const limpiarFiltros = () => {
    router.push('/productos', { scroll: false });
    setPagina(1);
  };

  const getCategoriaNombre = (slug: string): string => {
    for (const cat of categorias) {
      if (cat.slug === slug) return cat.nombre;
      if (cat.subcategorias) {
        for (const sub of cat.subcategorias) {
          if (sub.slug === slug) return sub.nombre;
        }
      }
    }
    return slug;
  };

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Encabezado */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-azul-oscuro mb-1">
              {filtros.busqueda 
                ? `Resultados para "${filtros.busqueda}"` 
                : filtros.categoria 
                  ? getCategoriaNombre(filtros.categoria) 
                  : 'Catálogo de Productos'}
            </h1>
            <p className="text-gris-elegante text-sm">
              {total} {total === 1 ? 'producto encontrado' : 'productos encontrados'}
            </p>
          </div>

          {/* Controles */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <select
              value={filtros.ordenar}
              onChange={(e) => actualizarFiltro('ordenar', e.target.value)}
              className="input-campo text-sm py-2.5 w-full sm:w-auto"
            >
              <option value="creadoEn">Más recientes</option>
              <option value="precio_asc">Precio: Menor a Mayor</option>
              <option value="precio_desc">Precio: Mayor a Menor</option>
              <option value="calificacion">Mejor calificación</option>
              <option value="ventas">Más vendidos</option>
            </select>

            <div className="flex items-center gap-1.5 ml-auto lg:ml-0">
              <button
                onClick={() => setVistaLista(false)}
                className={`p-2.5 border rounded-lg transition-all ${!vistaLista ? 'border-teal bg-teal text-white' : 'border-gray-200 hover:border-teal'}`}
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setVistaLista(true)}
                className={`p-2.5 border rounded-lg transition-all ${vistaLista ? 'border-teal bg-teal text-white' : 'border-gray-200 hover:border-teal'}`}
              >
                <List size={18} />
              </button>
            </div>

            <button
              onClick={() => setFiltrosAbiertos(!filtrosAbiertos)}
              className="flex items-center gap-2 px-4 py-2.5 bg-azul-oscuro text-white rounded-lg text-sm font-medium hover:bg-teal transition-colors lg:hidden"
            >
              <SlidersHorizontal size={16} /> Filtros
            </button>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filtros */}
          <aside className={`w-72 shrink-0 ${filtrosAbiertos ? 'block' : 'hidden'} lg:block`}>
            <div className="bg-white rounded-2xl shadow-card p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                <h3 className="font-bold text-lg text-azul-oscuro">Filtros</h3>
                <button
                  onClick={limpiarFiltros}
                  className="text-teal text-xs font-semibold hover:underline flex items-center gap-1"
                >
                  <X size={14} /> Limpiar
                </button>
              </div>

              {/* Buscar */}
              <div className="mb-6">
                <label className="label-campo mb-2">Buscar productos</label>
                <div className="relative">
                  <input
                    type="text"
                    value={filtros.busqueda}
                    onChange={(e) => actualizarFiltro('busqueda', e.target.value)}
                    placeholder="Buscar por nombre..."
                    className="input-campo pr-10 text-sm py-2.5"
                  />
                  <Search size={16} className="absolute right-3 top-3.5 text-gris-elegante" />
                  {filtros.busqueda && (
                    <button
                      onClick={() => actualizarFiltro('busqueda', '')}
                      className="absolute right-10 top-3.5 text-gris-elegante hover:text-azul-oscuro"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Categorías */}
              <div className="mb-6">
                <label className="label-campo mb-3">Categorías</label>
                <div className="space-y-1.5 max-h-80 overflow-y-auto">
                  <button
                    onClick={() => actualizarFiltro('categoria', '')}
                    className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-all flex items-center gap-2 ${!filtros.categoria ? 'bg-teal text-white' : 'hover:bg-crema text-azul-oscuro'}`}
                  >
                    {!filtros.categoria && <CheckCircle2 size={14} />}
                    Todas las categorías
                  </button>
                  {categorias.map((cat) => (
                    <div key={cat.id} className="space-y-1">
                      <button
                        onClick={() => actualizarFiltro('categoria', cat.slug)}
                        className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-all flex items-center justify-between ${filtros.categoria === cat.slug ? 'bg-teal text-white' : 'hover:bg-crema text-azul-oscuro'}`}
                      >
                        <span className="font-medium flex items-center gap-2">
                          {filtros.categoria === cat.slug && <CheckCircle2 size={14} />}
                          {cat.nombre}
                        </span>
                        {cat.cantidadProductos !== undefined && (
                          <span className={`text-xs ${filtros.categoria === cat.slug ? 'text-white/80' : 'text-gris-elegante'}`}>
                            {cat.cantidadProductos}
                          </span>
                        )}
                      </button>
                      
                      {/* Subcategorías */}
                      {cat.subcategorias && cat.subcategorias.length > 0 && (
                        <div className="ml-4 space-y-1 border-l-2 border-gray-200 pl-3">
                          {cat.subcategorias.map((sub: any) => (
                            <button
                              key={sub.id}
                              onClick={() => actualizarFiltro('categoria', sub.slug)}
                              className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-all flex items-center justify-between ${filtros.categoria === sub.slug ? 'bg-teal text-white' : 'hover:bg-crema text-azul-oscuro'}`}
                            >
                              <span className="flex items-center gap-2">
                                {filtros.categoria === sub.slug && <CheckCircle2 size={14} />}
                                {sub.nombre}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Rango de precio */}
              <div className="mb-6">
                <label className="label-campo mb-3">Rango de Precio</label>
                <div className="flex gap-3 items-center">
                  <div className="flex-1">
                    <input
                      type="number"
                      value={filtros.precioMin}
                      onChange={(e) => actualizarFiltro('precioMin', e.target.value)}
                      placeholder="Mínimo"
                      className="input-campo text-sm py-2.5"
                    />
                  </div>
                  <span className="text-gris-elegante">-</span>
                  <div className="flex-1">
                    <input
                      type="number"
                      value={filtros.precioMax}
                      onChange={(e) => actualizarFiltro('precioMax', e.target.value)}
                      placeholder="Máximo"
                      className="input-campo text-sm py-2.5"
                    />
                  </div>
                </div>
              </div>

              {/* Opciones */}
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer py-1.5 px-1 rounded hover:bg-crema transition-colors">
                  <input
                    type="checkbox"
                    checked={filtros.enOferta}
                    onChange={(e) => actualizarFiltro('enOferta', e.target.checked)}
                    className="w-4 h-4 accent-teal cursor-pointer"
                  />
                  <span className="text-sm text-azul-oscuro font-medium">Solo en oferta</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer py-1.5 px-1 rounded hover:bg-crema transition-colors">
                  <input
                    type="checkbox"
                    checked={filtros.destacado}
                    onChange={(e) => actualizarFiltro('destacado', e.target.checked)}
                    className="w-4 h-4 accent-teal cursor-pointer"
                  />
                  <span className="text-sm text-azul-oscuro font-medium">Productos destacados</span>
                </label>
              </div>
            </div>
          </aside>

          {/* Mobile Filtros Modal Overlay */}
          <AnimatePresence>
            {filtrosAbiertos && (
              <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setFiltrosAbiertos(false)} />
            )}
          </AnimatePresence>

          {/* Productos */}
          <div className="flex-1 min-w-0">
            {cargando ? (
              <div className="flex justify-center py-20">
                <Loader2 size={40} className="animate-spin text-teal" />
              </div>
            ) : productos.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-2xl shadow-card">
                <p className="text-5xl mb-6">🔍</p>
                <p className="text-xl font-bold text-azul-oscuro mb-3">No encontramos productos</p>
                <p className="text-gris-elegante mb-8 max-w-md mx-auto">
                  Intenta con otros filtros o términos de búsqueda para encontrar lo que buscas
                </p>
                <button onClick={limpiarFiltros} className="btn-primary px-8">
                  Limpiar filtros
                </button>
              </div>
            ) : (
              <>
                <div className={`${vistaLista ? 'space-y-4' : 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4'}`}>
                  {productos.map((producto, i) => (
                    <motion.div
                      key={producto.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      {vistaLista ? (
                        <CardProductoList producto={producto} />
                      ) : (
                        <CardProducto producto={producto} />
                      )}
                    </motion.div>
                  ))}
                </div>

                {/* Paginación */}
                {totalPaginas > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-12">
                    <button
                      onClick={() => setPagina((p) => Math.max(1, p - 1))}
                      disabled={pagina === 1}
                      className="p-2.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:border-teal transition-all"
                    >
                      <ChevronLeft size={18} />
                    </button>

                    {/* Generate page numbers */}
                    {Array.from({ length: Math.min(7, totalPaginas) }).map((_, i) => {
                      let pageNum;
                      if (totalPaginas <= 7) {
                        pageNum = i + 1;
                      } else {
                        if (pagina <= 4) {
                          pageNum = i + 1;
                        } else if (pagina >= totalPaginas - 3) {
                          pageNum = totalPaginas - 6 + i;
                        } else {
                          pageNum = pagina - 3 + i;
                        }
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPagina(pageNum)}
                          className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${pagina === pageNum ? 'bg-teal text-white' : 'border border-gray-200 hover:border-teal hover:bg-crema'}`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                      disabled={pagina === totalPaginas}
                      className="p-2.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:border-teal transition-all"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default function ProductosPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-24"><Loader2 size={40} className="animate-spin text-teal" /></div>}>
      <ProductosContent />
    </Suspense>
  );
}
