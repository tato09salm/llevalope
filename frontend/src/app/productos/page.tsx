'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Filter, SlidersHorizontal, Grid, List, Search, X, Loader2 } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import CardProducto from '../../components/productos/CardProducto';
import { productosAPI } from '../../lib/api';
import { Producto } from '../../types';

function ProductosContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [productos, setProductos] = useState<Producto[]>([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [cargando, setCargando] = useState(true);
  const [vistaLista, setVistaLista] = useState(false);
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);

  const [filtros, setFiltros] = useState({
    busqueda: searchParams.get('busqueda') || '',
    categoria: searchParams.get('categoria') || '',
    precioMin: searchParams.get('precioMin') || '',
    precioMax: searchParams.get('precioMax') || '',
    enOferta: searchParams.get('enOferta') === 'true',
    destacado: searchParams.get('destacado') === 'true',
    ordenar: searchParams.get('ordenar') || 'creadoEn',
  });

  useEffect(() => {
    cargarProductos();
  }, [filtros, pagina]);

  const cargarProductos = async () => {
    setCargando(true);
    try {
      const params: any = { pagina, limite: 20, ordenar: filtros.ordenar };
      if (filtros.busqueda) params.busqueda = filtros.busqueda;
      if (filtros.categoria) params.categoria = filtros.categoria;
      if (filtros.precioMin) params.precioMin = filtros.precioMin;
      if (filtros.precioMax) params.precioMax = filtros.precioMax;
      if (filtros.enOferta) params.enOferta = true;
      if (filtros.destacado) params.destacado = true;

      const resp: any = await productosAPI.listar(params);
      setProductos(resp.datos || []);
      setTotal(resp.total || 0);
      setTotalPaginas(resp.totalPaginas || 1);
    } catch {
      setProductos([]);
    } finally {
      setCargando(false);
    }
  };

  const actualizarFiltro = (key: string, valor: any) => {
    setFiltros((prev) => ({ ...prev, [key]: valor }));
    setPagina(1);
  };

  const limpiarFiltros = () => {
    setFiltros({ busqueda: '', categoria: '', precioMin: '', precioMax: '', enOferta: false, destacado: false, ordenar: 'creadoEn' });
    setPagina(1);
  };

  const categorias = [
    { slug: 'tecnologia', nombre: 'Tecnología' },
    { slug: 'hogar', nombre: 'Hogar' },
    { slug: 'moda', nombre: 'Moda' },
    { slug: 'belleza', nombre: 'Belleza' },
    { slug: 'deportes', nombre: 'Deportes' },
    { slug: 'alimentos', nombre: 'Alimentos' },
    { slug: 'juguetes', nombre: 'Juguetes' },
    { slug: 'libros', nombre: 'Libros' },
  ];

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Encabezado */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold font-montserrat text-azul-oscuro">
              {filtros.busqueda ? `Resultados para "${filtros.busqueda}"` : 'Todos los Productos'}
            </h1>
            <p className="text-gris-elegante text-sm mt-1">{total} productos encontrados</p>
          </div>

          {/* Controles */}
          <div className="flex items-center gap-3">
            <select
              value={filtros.ordenar}
              onChange={(e) => actualizarFiltro('ordenar', e.target.value)}
              className="input-campo text-sm py-2 w-auto"
            >
              <option value="creadoEn">Más recientes</option>
              <option value="precio_asc">Precio: Menor a Mayor</option>
              <option value="precio_desc">Precio: Mayor a Menor</option>
              <option value="calificacion">Mejor calificación</option>
              <option value="ventas">Más vendidos</option>
            </select>

            <button
              onClick={() => setVistaLista(!vistaLista)}
              className="p-2.5 border border-gray-200 rounded-lg hover:border-teal transition-colors"
            >
              {vistaLista ? <Grid size={18} /> : <List size={18} />}
            </button>

            <button
              onClick={() => setFiltrosAbiertos(!filtrosAbiertos)}
              className="flex items-center gap-2 px-4 py-2.5 bg-azul-oscuro text-white rounded-lg text-sm font-medium hover:bg-teal transition-colors md:hidden"
            >
              <SlidersHorizontal size={16} /> Filtros
            </button>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar Filtros */}
          <aside className={`w-64 shrink-0 ${filtrosAbiertos ? 'block' : 'hidden'} md:block`}>
            <div className="bg-white rounded-2xl shadow-card p-6 sticky top-24">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-azul-oscuro">Filtros</h3>
                <button
                  onClick={limpiarFiltros}
                  className="text-teal text-xs font-medium hover:underline"
                >
                  Limpiar todo
                </button>
              </div>

              {/* Buscar */}
              <div className="mb-5">
                <label className="label-campo">Buscar</label>
                <div className="relative">
                  <input
                    type="text"
                    value={filtros.busqueda}
                    onChange={(e) => actualizarFiltro('busqueda', e.target.value)}
                    placeholder="Nombre del producto..."
                    className="input-campo pr-10 text-sm"
                  />
                  <Search size={16} className="absolute right-3 top-3.5 text-gris-elegante" />
                </div>
              </div>

              {/* Categorías */}
              <div className="mb-5">
                <label className="label-campo">Categoría</label>
                <div className="space-y-2">
                  <button
                    onClick={() => actualizarFiltro('categoria', '')}
                    className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${!filtros.categoria ? 'bg-teal text-white' : 'hover:bg-crema text-azul-oscuro'}`}
                  >
                    Todas
                  </button>
                  {categorias.map((cat) => (
                    <button
                      key={cat.slug}
                      onClick={() => actualizarFiltro('categoria', cat.slug)}
                      className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${filtros.categoria === cat.slug ? 'bg-teal text-white' : 'hover:bg-crema text-azul-oscuro'}`}
                    >
                      {cat.nombre}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rango de precio */}
              <div className="mb-5">
                <label className="label-campo">Rango de Precio</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={filtros.precioMin}
                    onChange={(e) => actualizarFiltro('precioMin', e.target.value)}
                    placeholder="Mín"
                    className="input-campo text-sm py-2"
                  />
                  <input
                    type="number"
                    value={filtros.precioMax}
                    onChange={(e) => actualizarFiltro('precioMax', e.target.value)}
                    placeholder="Máx"
                    className="input-campo text-sm py-2"
                  />
                </div>
              </div>

              {/* Opciones */}
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filtros.enOferta}
                    onChange={(e) => actualizarFiltro('enOferta', e.target.checked)}
                    className="w-4 h-4 accent-teal"
                  />
                  <span className="text-sm text-azul-oscuro">Solo en oferta</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filtros.destacado}
                    onChange={(e) => actualizarFiltro('destacado', e.target.checked)}
                    className="w-4 h-4 accent-teal"
                  />
                  <span className="text-sm text-azul-oscuro">Productos destacados</span>
                </label>
              </div>
            </div>
          </aside>

          {/* Productos */}
          <div className="flex-1 min-w-0">
            {cargando ? (
              <div className="flex justify-center py-20">
                <Loader2 size={36} className="animate-spin text-teal" />
              </div>
            ) : productos.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-4xl mb-4">🔍</p>
                <p className="text-xl font-bold text-azul-oscuro mb-2">No encontramos productos</p>
                <p className="text-gris-elegante mb-6">Intenta con otros filtros o términos de búsqueda</p>
                <button onClick={limpiarFiltros} className="btn-secundario">
                  Limpiar filtros
                </button>
              </div>
            ) : (
              <>
                <div className={`grid gap-4 ${vistaLista ? 'grid-cols-1' : 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
                  {productos.map((producto, i) => (
                    <motion.div
                      key={producto.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <CardProducto producto={producto} />
                    </motion.div>
                  ))}
                </div>

                {/* Paginación */}
                {totalPaginas > 1 && (
                  <div className="flex justify-center gap-2 mt-10">
                    <button
                      onClick={() => setPagina((p) => Math.max(1, p - 1))}
                      disabled={pagina === 1}
                      className="px-4 py-2 border border-gray-200 rounded-lg disabled:opacity-40 hover:border-teal transition-colors text-sm"
                    >
                      Anterior
                    </button>
                    {Array.from({ length: Math.min(5, totalPaginas) }).map((_, i) => {
                      const num = i + 1;
                      return (
                        <button
                          key={num}
                          onClick={() => setPagina(num)}
                          className={`w-10 h-10 rounded-lg text-sm transition-colors ${pagina === num ? 'bg-teal text-white' : 'border border-gray-200 hover:border-teal'}`}
                        >
                          {num}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                      disabled={pagina === totalPaginas}
                      className="px-4 py-2 border border-gray-200 rounded-lg disabled:opacity-40 hover:border-teal transition-colors text-sm"
                    >
                      Siguiente
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
    <Suspense fallback={<div className="flex justify-center py-20"><Loader2 size={36} className="animate-spin text-teal" /></div>}>
      <ProductosContent />
    </Suspense>
  );
}
