'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { categoriasAPI } from '@/lib/api';
import { Categoria } from '@/types';

const gradientOptions = [
  'from-blue-900 to-teal',
  'from-amber-700 to-amber-900',
  'from-rose-800 to-rose-900',
  'from-pink-700 to-pink-900',
  'from-green-800 to-green-900',
  'from-orange-700 to-orange-900',
  'from-purple-800 to-purple-900',
  'from-indigo-700 to-indigo-900',
];

export default function CategoriasDestacadas() {
  const [categorias, setCategorias] = useState<(Categoria & { cantidadProductos?: number })[]>([]);
  const [cargando, setCargando] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cargarCategorias = async () => {
      try {
        const datos = await categoriasAPI.listarPadres();
        setCategorias(Array.isArray(datos) ? datos : datos.datos || []);
      } catch (error) {
        console.error('Error al cargar categorías:', error);
      } finally {
        setCargando(false);
      }
    };
    cargarCategorias();
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (!carouselRef.current) return;
    const scrollAmount = 300;
    const newScroll = 
      direction === 'left'
        ? carouselRef.current.scrollLeft - scrollAmount
        : carouselRef.current.scrollLeft + scrollAmount;
    carouselRef.current.scrollTo({ left: newScroll, behavior: 'smooth' });
  };

  if (cargando) {
    return (
      <section className="py-12 bg-crema">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-2">
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
              <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-40 bg-gray-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (categorias.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-crema">
      <div className="max-w-7xl mx-auto px-4">
        {/* Encabezado */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-teal text-sm font-semibold uppercase tracking-widest mb-1">Explora</p>
            <h2 className="seccion-titulo">Categorías Destacadas</h2>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/productos"
              className="hidden sm:flex items-center gap-2 text-teal font-semibold text-sm hover:gap-3 transition-all duration-200"
            >
              Ver todas <ArrowRight size={16} />
            </Link>
            {categorias.length > 6 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => scroll('left')}
                  className="p-2 rounded-full border border-gray-200 hover:bg-white hover:shadow-sm transition-all"
                >
                  <ChevronLeft size={20} className="text-gray-700" />
                </button>
                <button
                  onClick={() => scroll('right')}
                  className="p-2 rounded-full border border-gray-200 hover:bg-white hover:shadow-sm transition-all"
                >
                  <ChevronRight size={20} className="text-gray-700" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Carrusel */}
        <div className="relative">
          <div
            ref={carouselRef}
            className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {categorias.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="flex-shrink-0 w-40 sm:w-48 snap-start"
              >
                <Link href={`/productos?categoria=${cat.slug}`}>
                  <div
                    className={`relative bg-gradient-to-br ${
                      gradientOptions[i % gradientOptions.length]
                    } rounded-2xl p-5 text-white text-center cursor-pointer group overflow-hidden hover:shadow-hover transition-all duration-300 h-44`}
                  >
                    {/* Círculo decorativo */}
                    <div className="absolute -top-4 -right-4 w-16 h-16 bg-white bg-opacity-5 rounded-full group-hover:scale-150 transition-transform duration-500" />

                    {/* Imagen o Icono */}
                    <div className="mb-3 relative z-10">
                      {cat.imagen ? (
                        <div className="w-16 h-16 mx-auto rounded-xl overflow-hidden bg-white/20 backdrop-blur-sm">
                          <img
                            src={cat.imagen}
                            alt={cat.nombre}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="text-4xl group-hover:scale-110 transition-transform duration-200">
                          📦
                        </div>
                      )}
                    </div>

                    {/* Nombre */}
                    <p className="font-semibold text-sm relative z-10 line-clamp-2">{cat.nombre}</p>

                    {/* Cantidad */}
                    <p className="text-white text-opacity-70 text-xs mt-1 relative z-10">
                      {cat.cantidadProductos || 0} productos
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
