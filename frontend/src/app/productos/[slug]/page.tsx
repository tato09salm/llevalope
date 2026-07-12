'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Star, ShoppingCart, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { productosAPI } from '@/lib/api';
import { Producto, VarianteProducto } from '@/types';
import { useCarritoStore } from '@/store/carrito.store';
import { useAuthStore } from '@/store/auth.store';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function ProductoDetallePage() {
  const params = useParams();
  const router = useRouter();
  const { slug } = params;
  const [producto, setProducto] = useState<Producto | null>(null);
  const [cargando, setCargando] = useState(true);
  const [imagenActual, setImagenActual] = useState(0);
  const [colorSeleccionado, setColorSeleccionado] = useState<VarianteProducto | null>(null);
  const [tallaSeleccionada, setTallaSeleccionada] = useState<VarianteProducto | null>(null);
  const { agregar } = useCarritoStore();
  const { usuario } = useAuthStore();

  useEffect(() => {
    if (slug) {
      cargarProducto();
    }
  }, [slug]);

  const cargarProducto = async () => {
    try {
      setCargando(true);
      const data = await productosAPI.obtener(slug as string);
      setProducto(data);
      
      // Seleccionar la primera variante activa como predeterminada
      if (data.variantes && data.variantes.length > 0) {
        const variantesActivas = data.variantes.filter((v: VarianteProducto) => v.activo);
        if (variantesActivas.length > 0) {
          const principal = variantesActivas.find((v: VarianteProducto) => v.esPrincipal) || variantesActivas[0];
          setColorSeleccionado(principal);
          setTallaSeleccionada(principal);
        }
      }
    } catch (error) {
      const mensaje =
        typeof error === 'string'
          ? error
          : (error as any)?.message || (error as any)?.error || 'No se pudo cargar el producto';
      console.error('Error al cargar el producto:', error);
      toast.error(mensaje);
      router.push('/productos');
    } finally {
      setCargando(false);
    }
  };

  const variantesActivas = producto?.variantes?.filter((v: VarianteProducto) => v.activo) || [];
  
  // Obtener colores únicos
  const coloresUnicos = variantesActivas.reduce((acc: VarianteProducto[], v) => {
    if (v.color && !acc.find(x => x.colorId === v.colorId)) {
      acc.push(v);
    }
    return acc;
  }, []);
  
  // Obtener tallas disponibles para el color seleccionado
  const tallasDisponibles = colorSeleccionado
    ? variantesActivas.filter((v) => v.colorId === colorSeleccionado.colorId && v.size)
    : [];

  // Obtener la variante final seleccionada
  const varianteSeleccionada = (() => {
    if (!colorSeleccionado) return null;
    if (tallasDisponibles.length === 0) return colorSeleccionado;
    if (tallaSeleccionada && tallaSeleccionada.colorId === colorSeleccionado.colorId) return tallaSeleccionada;
    return tallasDisponibles[0];
  })();

  const seleccionarColor = (variante: VarianteProducto) => {
    setColorSeleccionado(variante);
    setImagenActual(0);
    // Si el nuevo color tiene tallas, seleccionar la primera talla disponible
    const nuevasTallas = variantesActivas.filter((v) => v.colorId === variante.colorId && v.size);
    if (nuevasTallas.length > 0) {
      setTallaSeleccionada(nuevasTallas[0]);
    } else {
      setTallaSeleccionada(null);
    }
  };

  const seleccionarTalla = (variante: VarianteProducto) => {
    setTallaSeleccionada(variante);
  };

  const agregarAlCarrito = () => {
    if (!producto || !varianteSeleccionada) return;
    if (!usuario) {
      toast.error('Debe iniciar sesión para agregar productos al carrito');
      router.push('/auth/iniciar-sesion?redirigido=agregar-carrito');
      return;
    }
    agregar(producto, varianteSeleccionada, 1);
    toast.success(`${producto.nombre} agregado al carrito`);
  };

  const precioFormateado = (precio: number) =>
    new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(precio);

  const siguienteImagen = () => {
    setImagenActual((prev) => (prev + 1) % (todasImagenes.length || 1));
  };

  const anteriorImagen = () => {
    setImagenActual((prev) => (prev - 1 + (todasImagenes.length || 1)) % (todasImagenes.length || 1));
  };

  // Obtener imágenes para mostrar
  const varianteImagenes = varianteSeleccionada?.imagenes || [];
  const todasImagenes =
    varianteImagenes.length > 0
      ? varianteImagenes
      : (producto?.imagenes && producto.imagenes.length > 0)
        ? producto.imagenes
        : producto?.imagenPrincipal
          ? [{ url: producto.imagenPrincipal, alt: producto.nombre, orden: 0, principal: true }]
          : [];
  const imagenPrincipal = todasImagenes[imagenActual] || null;

  const precio = varianteSeleccionada 
    ? (varianteSeleccionada.enOferta && varianteSeleccionada.precioOferta 
        ? varianteSeleccionada.precioOferta 
        : varianteSeleccionada.precioBase) 
    : 0;
  const precioOriginal = varianteSeleccionada?.precioBase || 0;
  const tieneDescuento = varianteSeleccionada?.enOferta && varianteSeleccionada?.precioOferta && precio < precioOriginal;

  if (cargando) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-crema flex items-center justify-center">
          <div className="animate-spin text-teal text-4xl">⟳</div>
        </div>
        <Footer />
      </>
    );
  }

  if (!producto) {
    return null;
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-crema py-6 lg:py-10">
        <div className="max-w-6xl mx-auto px-4">
          <button 
            onClick={() => router.back()} 
            className="flex items-center gap-2 text-gris-elegante hover:text-azul-oscuro mb-6 transition-colors text-sm"
          >
            <ChevronLeft size={16} />
            <span>Volver al catálogo</span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Galería de Imágenes - Mejorada */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="relative bg-white rounded-2xl overflow-hidden shadow-card">
                <div className="aspect-square relative bg-gray-50">
                  {imagenPrincipal ? (
                    <Image
                      src={imagenPrincipal.url}
                      alt={producto.nombre}
                      fill
                      className="object-contain p-4"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      priority
                      quality={100}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                      <ShoppingCart size={64} className="text-gray-300" />
                    </div>
                  )}
                  
                  {todasImagenes.length > 1 && (
                    <>
                      <button
                        onClick={anteriorImagen}
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-crema transition-all hover:scale-110"
                      >
                        <ChevronLeft size={20} className="text-azul-oscuro" />
                      </button>
                      <button
                        onClick={siguienteImagen}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-crema transition-all hover:scale-110"
                      >
                        <ChevronRight size={20} className="text-azul-oscuro" />
                      </button>
                    </>
                  )}
                </div>

                {/* Miniaturas - Mejoradas y compactas */}
                {todasImagenes.length > 1 && (
                  <div className="flex gap-2 p-3 overflow-x-auto">
                    {todasImagenes.map((imagen, idx) => (
                      <button
                        key={imagen.id || idx}
                        onClick={() => setImagenActual(idx)}
                        className={`relative w-14 h-14 rounded-md overflow-hidden flex-shrink-0 transition-all ${
                          imagenActual === idx 
                            ? 'ring-2 ring-teal ring-offset-2' 
                            : 'border border-gray-200 hover:border-teal hover:scale-105'
                        }`}
                      >
                        <Image
                          src={imagen.url}
                          alt={`Vista ${idx + 1}`}
                          fill
                          className="object-contain bg-gray-50 p-1"
                          quality={100}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Información del Producto */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
              {/* Header Info */}
              <div>
                {producto.categoria && (
                  <p className="text-teal text-xs font-semibold uppercase tracking-wide mb-1.5">
                    {producto.categoria.nombre}
                  </p>
                )}
                <h1 className="text-2xl lg:text-3xl font-bold text-azul-oscuro mb-2 leading-tight">{producto.nombre}</h1>
                
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={14}
                        className={star <= Math.round(producto.calificacion) ? 'text-dorado fill-dorado' : 'text-gray-200 fill-gray-200'}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gris-elegante">({producto.totalResenas} reseñas)</span>
                  <span className="text-xs text-gris-elegante">• {producto.totalVentas} vendidos</span>
                </div>
              </div>

              {/* Precios */}
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-bold text-azul-oscuro">
                  {precio > 0 ? precioFormateado(precio) : 'Precio no disponible'}
                </span>
                {tieneDescuento && (
                  <>
                    <span className="text-base text-gris-elegante line-through">
                      {precioFormateado(precioOriginal)}
                    </span>
                    <span className="bg-rojito/10 text-rojito text-xs font-bold px-2 py-0.5 rounded-full">
                      -{varianteSeleccionada?.porcentajeDescuento}%
                    </span>
                  </>
                )}
              </div>

              {/* SKU y Stock */}
              <div className="flex items-center gap-4 text-xs">
                {varianteSeleccionada?.sku && (
                  <p className="text-gris-elegante">SKU: {varianteSeleccionada.sku}</p>
                )}
                {varianteSeleccionada && (
                  <p className={`font-semibold ${
                    varianteSeleccionada.stock === 0 
                      ? 'text-rojito' 
                      : varianteSeleccionada.stock <= varianteSeleccionada.stockMinimo 
                        ? 'text-orange-500' 
                        : 'text-verde'
                  }`}>
                    {varianteSeleccionada.stock === 0 
                      ? 'Agotado' 
                      : varianteSeleccionada.stock <= varianteSeleccionada.stockMinimo 
                        ? `¡Solo quedan ${varianteSeleccionada.stock}!` 
                        : `${varianteSeleccionada.stock} disponibles`}
                  </p>
                )}
              </div>

              {/* Opciones de Producto */}
              <div className="space-y-4 pt-2">
                {/* Color */}
                {coloresUnicos.length > 0 && (
                  <div>
                    <label className="label-campo mb-2">Color: {colorSeleccionado?.color?.nombre}</label>
                    <div className="flex gap-2">
                      {coloresUnicos.map((variante) => (
                        <button
                          key={variante.id}
                          onClick={() => seleccionarColor(variante)}
                          className={`w-9 h-9 rounded-full border-3 transition-all hover:scale-110 ${
                            colorSeleccionado?.colorId === variante.colorId ? 'border-azul-oscuro scale-110' : 'border-gray-200'
                          }`}
                          style={{ backgroundColor: variante.color?.hex || '#ccc' }}
                          title={variante.color?.nombre}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Talla */}
                {tallasDisponibles.length > 0 && (
                  <div>
                    <label className="label-campo mb-2">Talla: {varianteSeleccionada?.size?.nombre}</label>
                    <div className="flex flex-wrap gap-2">
                      {tallasDisponibles.map((variante) => (
                        <button
                          key={variante.id}
                          onClick={() => seleccionarTalla(variante)}
                          disabled={variante.stock === 0}
                          className={`min-w-[2.5rem] h-10 px-3 border-2 rounded-lg font-medium text-sm transition-all ${
                            varianteSeleccionada?.id === variante.id
                              ? 'border-teal bg-teal text-white'
                              : variante.stock === 0
                                ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
                                : 'border-gray-200 hover:border-teal hover:bg-crema'
                          }`}
                        >
                          {variante.size?.nombre}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Botones de Acción */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={agregarAlCarrito}
                  disabled={!varianteSeleccionada || varianteSeleccionada.stock === 0}
                  className={`flex-1 py-3 px-5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                    !varianteSeleccionada || varianteSeleccionada.stock === 0
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-azul-oscuro text-white hover:bg-teal active:scale-[0.98]'
                  }`}
                >
                  <ShoppingCart size={18} />
                  {varianteSeleccionada?.stock === 0 ? 'Agotado' : 'Agregar al carrito'}
                </button>
                <button className="w-12 h-12 bg-white rounded-xl border border-gray-200 flex items-center justify-center hover:border-rojito hover:text-rojito hover:bg-rojito/5 transition-all">
                  <Heart size={20} />
                </button>
              </div>

              {/* Descripción */}
              {producto.descripcion && (
                <div className="pt-3 border-t border-gray-100">
                  <h3 className="font-semibold text-azul-oscuro mb-2">Descripción</h3>
                  <p className="text-sm text-gris-elegante leading-relaxed whitespace-pre-line max-h-32 overflow-y-auto pr-2">
                    {producto.descripcion}
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
