'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2 } from 'lucide-react';
import CardProducto from '../productos/CardProducto';
import { productosAPI } from '../../lib/api';
import { Producto } from '../../types';

interface Props {
  titulo?: string;
  subtitulo?: string;
  tipo?: 'destacados' | 'ofertas';
  verMasRuta?: string;
}

export default function SeccionProductos({
  titulo = 'Productos Populares',
  subtitulo = 'Los más vendidos',
  tipo = 'destacados',
  verMasRuta = '/productos',
}: Props) {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        const data: any =
          tipo === 'destacados'
            ? await productosAPI.destacados()
            : await productosAPI.ofertas();
        setProductos(Array.isArray(data) ? data : []);
      } catch {
        // En desarrollo sin backend, usar datos de demo
        setProductos(productosDemo);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [tipo]);

  if (cargando) {
    return (
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 flex justify-center py-20">
          <Loader2 size={32} className="animate-spin text-teal" />
        </div>
      </section>
    );
  }

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Encabezado */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-teal text-sm font-semibold uppercase tracking-widest mb-1">{subtitulo}</p>
            <h2 className="seccion-titulo">{titulo}</h2>
          </div>
          <Link
            href={verMasRuta}
            className="flex items-center gap-2 text-teal font-semibold text-sm hover:gap-3 transition-all duration-200"
          >
            Ver todos <ArrowRight size={16} />
          </Link>
        </div>

        {/* Grid de productos */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 md:gap-6">
          {productos.map((producto, i) => (
            <motion.div
              key={producto.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <CardProducto producto={producto} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Datos de demostración
const productosDemo: Producto[] = [
  {
    id: 1, nombre: 'Audífonos Sony WH-1000XM5', slug: 'audifonos-sony', sku: 'SON001',
    precio: 1299.90, precioAnterior: 1599.90, porcentajeDescuento: 19,
    categoriaId: 1, categoria: { id: 1, nombre: 'Tecnología', slug: 'tecnologia' },
    stock: 45, stockMinimo: 5, activo: true, destacado: true, enOferta: true,
    calificacion: 4.8, totalResenas: 128, totalVentas: 342,
    imagenPrincipal: undefined, creadoEn: new Date().toISOString(),
  },
  {
    id: 2, nombre: 'Smartwatch Pro Series 8', slug: 'smartwatch-pro', sku: 'SMP001',
    precio: 899.90, precioAnterior: 1099.90, porcentajeDescuento: 18,
    categoriaId: 1, categoria: { id: 1, nombre: 'Tecnología', slug: 'tecnologia' },
    stock: 32, stockMinimo: 5, activo: true, destacado: true, enOferta: false,
    calificacion: 4.6, totalResenas: 96, totalVentas: 215,
    imagenPrincipal: undefined, creadoEn: new Date().toISOString(),
  },
  {
    id: 3, nombre: 'Mochila Urbana Premium', slug: 'mochila-premium', sku: 'MOC001',
    precio: 299.90, precioAnterior: 399.90, porcentajeDescuento: 25,
    categoriaId: 3, categoria: { id: 3, nombre: 'Moda', slug: 'moda' },
    stock: 78, stockMinimo: 10, activo: true, destacado: false, enOferta: true,
    calificacion: 4.5, totalResenas: 74, totalVentas: 189,
    imagenPrincipal: undefined, creadoEn: new Date().toISOString(),
  },
  {
    id: 4, nombre: 'Perfume Elegance Pour Femme 50ml', slug: 'perfume-elegance', sku: 'PER001',
    precio: 399.90, precioAnterior: 499.90, porcentajeDescuento: 20,
    categoriaId: 4, categoria: { id: 4, nombre: 'Belleza', slug: 'belleza' },
    stock: 55, stockMinimo: 5, activo: true, destacado: true, enOferta: false,
    calificacion: 4.7, totalResenas: 53, totalVentas: 167,
    imagenPrincipal: undefined, creadoEn: new Date().toISOString(),
  },
];
