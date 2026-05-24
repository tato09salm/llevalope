'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingCart, Star, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Producto } from '../../types';
import { useCarritoStore } from '../../store/carrito.store';

interface Props {
  producto: Producto;
}

export default function CardProducto({ producto }: Props) {
  const [wishlist, setWishlist] = useState(false);
  const { agregar } = useCarritoStore();

  const agregarAlCarrito = (e: React.MouseEvent) => {
    e.preventDefault();
    agregar(producto, 1);
    toast.success(`${producto.nombre.substring(0, 30)}... agregado al carrito`);
  };

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    setWishlist(!wishlist);
    toast.success(wishlist ? 'Eliminado de favoritos' : '❤️ Agregado a favoritos');
  };

  const precioFormateado = (precio: number) =>
    new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(precio);

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="card-producto group"
    >
      <Link href={`/productos/${producto.slug}`}>
        {/* Imagen */}
        <div className="relative bg-gray-50 h-52 overflow-hidden">
          {producto.imagenPrincipal ? (
            <Image
              src={producto.imagenPrincipal}
              alt={producto.nombre}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <ShoppingCart size={48} className="text-gray-300" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {producto.enOferta && producto.porcentajeDescuento && (
              <span className="badge-oferta">-{producto.porcentajeDescuento}%</span>
            )}
            {producto.destacado && (
              <span className="badge-nuevo">Destacado</span>
            )}
            {producto.stock <= producto.stockMinimo && producto.stock > 0 && (
              <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                ¡Últimas unidades!
              </span>
            )}
            {producto.stock === 0 && (
              <span className="bg-gray-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                Agotado
              </span>
            )}
          </div>

          {/* Acciones hover */}
          <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={toggleWishlist}
              className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all ${
                wishlist
                  ? 'bg-red-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-red-50 hover:text-red-500'
              }`}
            >
              <Heart size={14} fill={wishlist ? 'currentColor' : 'none'} />
            </button>
            <button
              className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md text-gray-600 hover:bg-teal hover:text-white transition-all"
            >
              <Eye size={14} />
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          {/* Categoría */}
          {producto.categoria && (
            <p className="text-xs text-teal font-medium mb-1 uppercase tracking-wide">
              {producto.categoria.nombre}
            </p>
          )}

          {/* Nombre */}
          <h3 className="text-sm font-semibold text-azul-oscuro line-clamp-2 mb-2 leading-snug">
            {producto.nombre}
          </h3>

          {/* Estrellas */}
          <div className="flex items-center gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={12}
                className={star <= Math.round(producto.calificacion) ? 'text-dorado fill-dorado' : 'text-gray-200 fill-gray-200'}
              />
            ))}
            <span className="text-xs text-gris-elegante ml-1">({producto.totalResenas})</span>
          </div>

          {/* Precio */}
          <div className="flex items-end justify-between">
            <div>
              <p className="text-lg font-bold text-azul-oscuro">
                {precioFormateado(producto.precio)}
              </p>
              {producto.precioAnterior && (
                <p className="text-xs text-gris-elegante line-through">
                  {precioFormateado(producto.precioAnterior)}
                </p>
              )}
            </div>

            {/* Botón carrito */}
            <button
              onClick={agregarAlCarrito}
              disabled={producto.stock === 0}
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 ${
                producto.stock === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-azul-oscuro text-white hover:bg-teal active:scale-95'
              }`}
              title="Agregar al carrito"
            >
              <ShoppingCart size={16} />
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
