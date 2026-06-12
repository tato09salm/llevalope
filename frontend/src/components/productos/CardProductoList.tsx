'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingCart, Star, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { Producto, VarianteProducto } from '../../types';
import { useCarritoStore } from '../../store/carrito.store';
import { useWishlistStore } from '../../store/wishlist.store';
import { useAuthStore } from '../../store/auth.store';
import { useRouter } from 'next/navigation';

interface Props {
  producto: Producto;
}

export default function CardProductoList({ producto }: Props) {
  const [isUpdating, setIsUpdating] = useState(false);
  const { agregar } = useCarritoStore();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore();
  const { usuario } = useAuthStore();
  const router = useRouter();

  // Get all active variants
  const activeVariants = (producto.variantes || []).filter(v => v.activo);
  
  // Get the main variant (first one or esPrincipal = true)
  const mainVariant = activeVariants.find(v => v.esPrincipal) || activeVariants[0];

  const agregarAlCarrito = (e: React.MouseEvent) => {
    e.preventDefault();
    if (mainVariant) {
      agregar(producto, mainVariant, 1);
      toast.success(`${producto.nombre.substring(0, 30)}... agregado al carrito`);
    }
  };

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!usuario) {
      toast.error('Inicia sesión para guardar productos en tu lista de deseos');
      router.push('/auth/iniciar-sesion');
      return;
    }

    setIsUpdating(true);
    try {
      if (isInWishlist(producto.id)) {
        await removeFromWishlist(producto.id);
        toast.success('Producto eliminado de la lista de deseos');
      } else {
        await addToWishlist(producto.id);
        toast.success('❤️ Agregado a la lista de deseos');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar la lista de deseos');
    } finally {
      setIsUpdating(false);
    }
  };

  const precioFormateado = (precio: number) =>
    new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(precio);

  // Get the main image to display
  const getMainImage = () => {
    if (mainVariant?.imagenes?.length) {
      const mainVariantImage = mainVariant.imagenes.find(img => img.principal) || mainVariant.imagenes[0];
      if (mainVariantImage) return mainVariantImage.url;
    }
    if (producto.imagenPrincipal) return producto.imagenPrincipal;
    if (producto.imagenes?.length) {
      const mainProdImage = producto.imagenes.find(img => img.principal) || producto.imagenes[0];
      if (mainProdImage) return mainProdImage.url;
    }
    return null;
  };

  const mainImage = getMainImage();
  const currentPrice = mainVariant 
    ? (mainVariant.enOferta && mainVariant.precioOferta ? mainVariant.precioOferta : mainVariant.precioBase) 
    : 0;
  const originalPrice = mainVariant?.precioBase || 0;
  const hasDiscount = mainVariant?.enOferta && mainVariant?.precioOferta && mainVariant.precioOferta < mainVariant.precioBase;

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row">
      <Link href={`/productos/${producto.slug}`} className="flex-shrink-0">
        {/* Imagen */}
        <div className="relative bg-gray-50 w-full sm:w-48 h-48 sm:h-48">
          {mainImage ? (
            <Image
              src={mainImage}
              alt={producto.nombre}
              fill
              className="object-contain p-3"
              sizes="(max-width: 640px) 100vw, 192px"
              quality={100}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingCart size={40} className="text-gray-300" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {hasDiscount && mainVariant?.porcentajeDescuento && (
              <span className="bg-rojito text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                -{mainVariant.porcentajeDescuento}%
              </span>
            )}
            {producto.destacado && (
              <span className="bg-teal text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                Destacado
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="flex-1 p-4 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start gap-4">
            <div>
              {/* Categoría */}
              {producto.categoria && (
                <p className="text-xs text-teal font-medium mb-1 uppercase">
                  {producto.categoria.nombre}
                </p>
              )}

              {/* Nombre */}
              <Link href={`/productos/${producto.slug}`} className="block">
                <h3 className="text-base font-semibold text-azul-oscuro mb-2 leading-snug hover:text-teal transition-colors">
                  {producto.nombre}
                </h3>
              </Link>

              {/* Descripción */}
              {producto.descripcionCorta && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {producto.descripcionCorta}
                </p>
              )}
            </div>

            <button
              onClick={toggleWishlist}
              disabled={isUpdating}
              className={`p-2 rounded-full transition-all flex-shrink-0 ${
                isInWishlist(producto.id)
                  ? 'bg-red-50 text-red-500'
                  : 'text-gray-400 hover:bg-red-50 hover:text-red-500'
              }`}
            >
              <Heart size={20} fill={isInWishlist(producto.id) ? 'currentColor' : 'none'} />
            </button>
          </div>

          {/* Estrellas */}
          <div className="flex items-center gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={14}
                className={star <= Math.round(producto.calificacion) ? 'text-dorado fill-dorado' : 'text-gray-200 fill-gray-200'}
              />
            ))}
            <span className="text-xs text-gray-500 ml-1">
              ({producto.totalResenas} reseñas)
            </span>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex items-center justify-between gap-4">
          {/* Precio */}
          <div className="flex items-end gap-2">
            <p className="text-xl font-bold text-azul-oscuro">
              {currentPrice > 0 ? precioFormateado(currentPrice) : 'Precio no disponible'}
            </p>
            {hasDiscount && (
              <p className="text-sm text-gray-500 line-through">
                {precioFormateado(originalPrice)}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link
              href={`/productos/${producto.slug}`}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Eye size={18} className="text-gray-600" />
            </Link>

            <button
              onClick={agregarAlCarrito}
              disabled={!mainVariant || mainVariant.stock === 0}
              className="flex items-center gap-2 bg-azul-oscuro text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <ShoppingCart size={18} />
              Agregar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
