'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const categorias = [
  { nombre: 'Tecnología', slug: 'tecnologia', icono: '💻', bg: 'from-blue-900 to-teal', productos: '1,200+' },
  { nombre: 'Hogar', slug: 'hogar', icono: '🏠', bg: 'from-amber-700 to-amber-900', productos: '850+' },
  { nombre: 'Moda', slug: 'moda', icono: '👗', bg: 'from-rose-800 to-rose-900', productos: '2,300+' },
  { nombre: 'Belleza', slug: 'belleza', icono: '💄', bg: 'from-pink-700 to-pink-900', productos: '650+' },
  { nombre: 'Deportes', slug: 'deportes', icono: '⚽', bg: 'from-green-800 to-green-900', productos: '900+' },
  { nombre: 'Alimentos', slug: 'alimentos', icono: '🛒', bg: 'from-orange-700 to-orange-900', productos: '400+' },
];

export default function CategoriasDestacadas() {
  return (
    <section className="py-12 bg-crema">
      <div className="max-w-7xl mx-auto px-4">
        {/* Encabezado */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-teal text-sm font-semibold uppercase tracking-widest mb-1">Explora</p>
            <h2 className="seccion-titulo">Categorías Destacadas</h2>
          </div>
          <Link
            href="/productos"
            className="flex items-center gap-2 text-teal font-semibold text-sm hover:gap-3 transition-all duration-200"
          >
            Ver todas <ArrowRight size={16} />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categorias.map((cat, i) => (
            <motion.div
              key={cat.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
            >
              <Link href={`/productos?categoria=${cat.slug}`}>
                <div className={`relative bg-gradient-to-br ${cat.bg} rounded-2xl p-5 text-white text-center cursor-pointer group overflow-hidden hover:shadow-hover transition-all duration-300`}>
                  {/* Círculo decorativo */}
                  <div className="absolute -top-4 -right-4 w-16 h-16 bg-white bg-opacity-5 rounded-full group-hover:scale-150 transition-transform duration-500" />

                  {/* Icono */}
                  <div className="text-4xl mb-3 relative z-10 group-hover:scale-110 transition-transform duration-200">
                    {cat.icono}
                  </div>

                  {/* Nombre */}
                  <p className="font-semibold text-sm relative z-10">{cat.nombre}</p>

                  {/* Cantidad */}
                  <p className="text-white text-opacity-70 text-xs mt-1 relative z-10">
                    {cat.productos} productos
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
