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
const productosDemo: any[] = [
  {
    id: 1, nombre: 'Audífonos Sony WH-1000XM5', slug: 'audifonos-sony', sku: 'SON001',
    precio: 1299.90, precioAnterior: 1599.90, porcentajeDescuento: 19,
    categoriaId: 1, categoria: { id: 1, nombre: 'Tecnología', slug: 'tecnologia' },
    stock: 45, stockMinimo: 5, activo: true, destacado: true, enOferta: true,
    calificacion: 4.8, totalResenas: 128, totalVentas: 342,
    imagenPrincipal: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=1200', creadoEn: new Date().toISOString(),
    variantes: [
      {
        id: 1,
        productoId: 1,
        sku: 'SONY-WH1000XM5-NEGRO',
        precioBase: 1599.9,
        precioOferta: 1299.9,
        porcentajeDescuento: 19,
        stock: 45,
        stockMinimo: 5,
        enOferta: true,
        activo: true,
        esPrincipal: true,
        orden: 0,
        colorId: 1,
        color: { id: 1, nombre: 'Negro', hex: '#000000', activo: true, creadoEn: new Date().toISOString(), actualizadoEn: new Date().toISOString() },
        sizeId: 1,
        size: { id: 1, nombre: 'Talla Única', orden: 1, activo: true, creadoEn: new Date().toISOString(), actualizadoEn: new Date().toISOString() },
        imagenes: [],
      },
    ],
  },
  {
    id: 2, nombre: 'Smartwatch Pro Series 8', slug: 'smartwatch-pro', sku: 'SMP001',
    precio: 899.90, precioAnterior: 1099.90, porcentajeDescuento: 18,
    categoriaId: 1, categoria: { id: 1, nombre: 'Tecnología', slug: 'tecnologia' },
    stock: 32, stockMinimo: 5, activo: true, destacado: true, enOferta: false,
    calificacion: 4.6, totalResenas: 96, totalVentas: 215,
    imagenPrincipal: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200', creadoEn: new Date().toISOString(),
    variantes: [
      {
        id: 2,
        productoId: 2,
        sku: 'SMP-PRO-8',
        precioBase: 899.9,
        precioOferta: null,
        porcentajeDescuento: 0,
        stock: 32,
        stockMinimo: 5,
        enOferta: false,
        activo: true,
        esPrincipal: true,
        orden: 0,
        imagenes: [],
      },
    ],
  },
  {
    id: 3, nombre: 'Mochila Urbana Premium', slug: 'mochila-premium', sku: 'MOC001',
    precio: 299.90, precioAnterior: 399.90, porcentajeDescuento: 25,
    categoriaId: 3, categoria: { id: 3, nombre: 'Moda', slug: 'moda' },
    stock: 78, stockMinimo: 10, activo: true, destacado: false, enOferta: true,
    calificacion: 4.5, totalResenas: 74, totalVentas: 189,
    imagenPrincipal: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=1200', creadoEn: new Date().toISOString(),
    variantes: [
      {
        id: 3,
        productoId: 3,
        sku: 'MOC-URB-001',
        precioBase: 399.9,
        precioOferta: 299.9,
        porcentajeDescuento: 25,
        stock: 78,
        stockMinimo: 10,
        enOferta: true,
        activo: true,
        esPrincipal: true,
        orden: 0,
        imagenes: [],
      },
    ],
  },
  {
    id: 4, nombre: 'Perfume Elegance Pour Femme 50ml', slug: 'perfume-elegance', sku: 'PER001',
    precio: 399.90, precioAnterior: 499.90, porcentajeDescuento: 20,
    categoriaId: 4, categoria: { id: 4, nombre: 'Belleza', slug: 'belleza' },
    stock: 55, stockMinimo: 5, activo: true, destacado: true, enOferta: false,
    calificacion: 4.7, totalResenas: 53, totalVentas: 167,
    imagenPrincipal: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=1200', creadoEn: new Date().toISOString(),
    variantes: [
      {
        id: 4,
        productoId: 4,
        sku: 'PER-ELE-001',
        precioBase: 399.9,
        precioOferta: null,
        porcentajeDescuento: 0,
        stock: 55,
        stockMinimo: 5,
        enOferta: false,
        activo: true,
        esPrincipal: true,
        orden: 0,
        imagenes: [],
      },
    ],
  },
];
