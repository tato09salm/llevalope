'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingCart, Star, Trash2, ArrowLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../../../components/layout/Navbar';
import Footer from '../../../components/layout/Footer';
import { useWishlistStore } from '../../../store/wishlist.store';
import { useCarritoStore } from '../../../store/carrito.store';
import { useAuthStore } from '../../../store/auth.store';
import { useRouter } from 'next/navigation';

export default function WishlistPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { items, removeFromWishlist, fetchWishlist } = useWishlistStore();
  const { usuario } = useAuthStore();
  const { agregar } = useCarritoStore();
  const router = useRouter();

  useEffect(() => {
    if (!usuario) {
      router.push('/auth/iniciar-sesion');
    }
  }, [usuario, router]);

  const handleRemoveFromWishlist = async (productoId: number) => {
    try {
      await removeFromWishlist(productoId);
      toast.success('Producto eliminado de la lista de deseos');
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar el producto');
    }
  };

  const handleAddToCart = (producto: any, variante: any) => {
    agregar(producto, variante, 1);
    toast.success(`${producto.nombre.substring(0, 30)}... agregado al carrito`);
  };

  const getMainImage = (producto: any) => {
    if (producto.imagenes?.length) {
      return producto.imagenes[0].url;
    }
    if (producto.imagenPrincipal) {
      return producto.imagenPrincipal;
    }
    return null;
  };

  const getMainVariant = (producto: any) => {
    const activeVariants = (producto.variantes || []).filter((v: any) => v.activo);
    return activeVariants.find((v: any) => v.esPrincipal) || activeVariants[0];
  };

  const formatPrecio = (precio: number) =>
    new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(precio);

  if (!usuario) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-teal" />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/cuenta" className="flex items-center gap-2 text-gray-600 hover:text-teal transition-colors">
            <ArrowLeft size={20} />
            <span>Volver a mi cuenta</span>
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-azul-oscuro mb-2">Mi Lista de Deseos</h1>
        <p className="text-gray-600 mb-8">
          {items.length === 0
            ? 'No tienes productos guardados aún'
            : `${items.length} producto${items.length !== 1 ? 's' : ''} guardado${items.length !== 1 ? 's' : ''}`}
        </p>

        {items.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-card">
            <Heart size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Tu lista de deseos está vacía</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Explora productos y guarda tus favoritos haciendo clic en el corazón en cada tarjeta de producto
            </p>
            <Link href="/productos" className="btn-primario">
              Explorar productos
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item: any) => {
              const producto = item.producto;
              const mainVariant = getMainVariant(producto);
              const mainImage = getMainImage(producto);
              const hasDiscount = mainVariant?.enOferta && mainVariant?.precioOferta < mainVariant?.precioBase;
              const currentPrice = hasDiscount ? mainVariant.precioOferta : mainVariant?.precioBase;

              return (
                <div key={item.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all">
                  <Link href={`/productos/${producto.slug}`} className="block relative">
                    <div className="relative bg-gray-50 aspect-square">
                      {mainImage ? (
                        <Image
                          src={mainImage}
                          alt={producto.nombre}
                          fill
                          className="object-contain p-3"
                          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingCart size={40} className="text-gray-300" />
                        </div>
                      )}
                    </div>
                  </Link>

                  <div className="p-4">
                    {producto.categoria && (
                      <p className="text-xs text-teal font-medium mb-1 uppercase">
                        {producto.categoria.nombre}
                      </p>
                    )}

                    <Link href={`/productos/${producto.slug}`} className="block">
                      <h3 className="text-sm font-semibold text-azul-oscuro mb-2 line-clamp-2 leading-snug">
                        {producto.nombre}
                      </h3>
                    </Link>

                    {producto.totalResenas > 0 && (
                      <div className="flex items-center gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={12}
                            className={
                              star <= Math.round(producto.calificacion)
                                ? 'text-dorado fill-dorado'
                                : 'text-gray-200 fill-gray-200'
                            }
                          />
                        ))}
                        <span className="text-xs text-gray-500 ml-1">
                          ({producto.totalResenas})
                        </span>
                      </div>
                    )}

                    <div className="flex items-end justify-between mb-4">
                      <div>
                        <p className="text-lg font-bold text-azul-oscuro">
                          {formatPrecio(currentPrice || 0)}
                        </p>
                        {hasDiscount && (
                          <p className="text-xs text-gray-500 line-through">
                            {formatPrecio(mainVariant.precioBase)}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {mainVariant && mainVariant.stock > 0 && (
                        <button
                          onClick={() => handleAddToCart(producto, mainVariant)}
                          className="flex-1 bg-azul-oscuro text-white text-sm font-medium py-2 px-4 rounded-lg hover:bg-teal transition-colors flex items-center justify-center gap-2"
                        >
                          <ShoppingCart size={16} />
                          Agregar
                        </button>
                      )}

                      <button
                        onClick={() => handleRemoveFromWishlist(producto.id)}
                        className="p-2 border border-gray-200 rounded-lg hover:bg-red-50 hover:border-red-200 transition-colors"
                        title="Eliminar de la lista"
                      >
                        <Trash2 size={18} className="text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
