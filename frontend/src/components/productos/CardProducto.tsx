'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingCart, Star, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Producto, VarianteProducto } from '../../types';
import { useCarritoStore } from '../../store/carrito.store';
import { useWishlistStore } from '../../store/wishlist.store';
import { useAuthStore } from '../../store/auth.store';
import { useRouter } from 'next/navigation';

interface Props {
  producto: Producto;
}

export default function CardProducto({ producto }: Props) {
  const [hoveredVariantId, setHoveredVariantId] = useState<number | null>(null);
  const [isCardHovered, setIsCardHovered] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { agregar } = useCarritoStore();
  const { items, addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore();
  const { usuario } = useAuthStore();
  const router = useRouter();

  // Get all active variants
  const activeVariants = (producto.variantes || []).filter(v => v.activo);
  
  // Get the main variant (first one or esPrincipal = true)
  const mainVariant = activeVariants.find(v => v.esPrincipal) || activeVariants[0];
  
  // Get the currently displayed variant (based on hover or card hover)
  const displayedVariant = hoveredVariantId 
    ? activeVariants.find(v => v.id === hoveredVariantId) 
    : (isCardHovered && activeVariants.length > 1 
      ? activeVariants.find(v => v.id !== mainVariant?.id) 
      : mainVariant);

  // Get all unique colors from variants
  const variantsByColor = activeVariants.reduce((acc, variant) => {
    if (variant.color) {
      if (!acc.find(v => v.color?.id === variant.color.id)) {
        acc.push(variant);
      }
    }
    return acc;
  }, [] as VarianteProducto[]);

  const agregarAlCarrito = (e: React.MouseEvent) => {
    e.preventDefault();
    if (displayedVariant) {
      agregar(producto, displayedVariant, 1);
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
    if (displayedVariant?.imagenes?.length) {
      const mainVariantImage = displayedVariant.imagenes.find(img => img.principal) || displayedVariant.imagenes[0];
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
  const currentPrice = displayedVariant 
    ? (displayedVariant.enOferta && displayedVariant.precioOferta ? displayedVariant.precioOferta : displayedVariant.precioBase) 
    : 0;
  const originalPrice = displayedVariant?.precioBase || 0;
  const hasDiscount = displayedVariant?.enOferta && displayedVariant?.precioOferta && displayedVariant.precioOferta < displayedVariant.precioBase;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="card-producto group bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all"
      onMouseEnter={() => setIsCardHovered(true)}
      onMouseLeave={() => setIsCardHovered(false)}
    >
      <Link href={`/productos/${producto.slug}`}>
        {/* Imagen - Máxima calidad y mejor ajuste */}
        <div className="relative bg-gray-50 aspect-square sm:aspect-[4/5] overflow-hidden">
          {mainImage ? (
            <Image
              src={mainImage}
              alt={producto.nombre}
              fill
              className="object-contain p-2 group-hover:scale-105 transition-transform duration-400"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              quality={100}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <ShoppingCart size={40} className="text-gray-300" />
            </div>
          )}

          {/* Badges - Compactos */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {hasDiscount && displayedVariant?.porcentajeDescuento && (
              <span className="bg-rojito text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                -{displayedVariant.porcentajeDescuento}%
              </span>
            )}
            {producto.destacado && (
              <span className="bg-teal text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                Destacado
              </span>
            )}
            {displayedVariant && displayedVariant.stock <= displayedVariant.stockMinimo && displayedVariant.stock > 0 && (
              <span className="bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                ¡Últimas!
              </span>
            )}
            {displayedVariant && displayedVariant.stock === 0 && (
              <span className="bg-gray-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                Agotado
              </span>
            )}
          </div>

          {/* Acciones hover */}
          <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={toggleWishlist}
              disabled={isUpdating}
              className={`w-8 h-8 bg-white/95 rounded-full flex items-center justify-center shadow-md transition-all hover:scale-110 ${
                isInWishlist(producto.id)
                  ? 'bg-red-500 text-white'
                  : 'text-gray-600 hover:bg-red-50 hover:text-red-500'
              }`}
            >
              <Heart size={14} fill={isInWishlist(producto.id) ? 'currentColor' : 'none'} />
            </button>
            <div className="w-8 h-8 bg-white/95 rounded-full flex items-center justify-center shadow-md text-gray-600 hover:bg-teal hover:text-white transition-all hover:scale-110">
              <Eye size={14} />
            </div>
          </div>

          {/* Color swatches - Mejorados */}
          {variantsByColor.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 bg-white/90 px-2 py-1 rounded-full shadow-sm">
              {variantsByColor.map((variant) => (
                <button
                  key={variant.id}
                  type="button"
                  onClick={(e) => e.preventDefault()}
                  onMouseEnter={() => setHoveredVariantId(variant.id)}
                  onMouseLeave={() => setHoveredVariantId(null)}
                  className={`w-5 h-5 rounded-full border-2 transition-all ${
                    hoveredVariantId === variant.id ? 'border-gray-800 scale-125' : 'border-gray-200 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: variant.color?.hex || '#ccc' }}
                  title={variant.color?.nombre}
                />
              ))}
            </div>
          )}
        </div>

        {/* Info - Compacta pero completa */}
        <div className="p-3">
          {/* Categoría */}
          {producto.categoria && (
            <p className="text-[10px] text-teal font-medium mb-0.5 uppercase tracking-wide">
              {producto.categoria.nombre}
            </p>
          )}

          {/* Nombre */}
          <h3 className="text-sm font-semibold text-azul-oscuro line-clamp-2 mb-1.5 leading-snug">
            {producto.nombre}
          </h3>

          {/* Estrellas */}
          <div className="flex items-center gap-0.5 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={10}
                className={star <= Math.round(producto.calificacion) ? 'text-dorado fill-dorado' : 'text-gray-200 fill-gray-200'}
              />
            ))}
            <span className="text-[10px] text-gris-elegante ml-1">({producto.totalResenas})</span>
          </div>

          {/* Precio */}
          <div className="flex items-end justify-between">
            <div className="flex flex-col gap-0.5">
              <p className="text-base font-bold text-azul-oscuro leading-tight">
                {currentPrice > 0 ? precioFormateado(currentPrice) : 'Precio no disponible'}
              </p>
              {hasDiscount && (
                <p className="text-xs text-gris-elegante line-through leading-tight">
                  {precioFormateado(originalPrice)}
                </p>
              )}
            </div>

            {/* Botón carrito */}
            <button
              onClick={agregarAlCarrito}
              disabled={!displayedVariant || displayedVariant.stock === 0}
              className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 shadow-sm ${
                !displayedVariant || displayedVariant.stock === 0
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
