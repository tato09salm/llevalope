'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Star, ShoppingCart, Heart, ChevronLeft, ChevronRight, X, RotateCw, Maximize2, Minimize2, Camera, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [mostrarAR, setMostrarAR] = useState(false);
  const [arGiro, setArGiro] = useState(0);
  const [arEscala, setArEscala] = useState(1);

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

              {producto.categoria?.slug === 'hogar' && (
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setArGiro(0);
                      setArEscala(1);
                      setMostrarAR(true);
                    }}
                    className="w-full py-3 px-5 rounded-xl border-2 border-teal bg-teal/5 text-teal hover:bg-teal hover:text-white font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer shadow-sm"
                  >
                    ✨ Ver en tu espacio (RA)
                  </button>
                </div>
              )}

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
      {/* Modal de Realidad Aumentada DreamIA */}
      <AnimatePresence>
        {mostrarAR && (
          <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl overflow-hidden max-w-xl w-full shadow-premium relative border border-gray-100"
            >
              {/* Encabezado */}
              <div className="bg-azul-oscuro text-white px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-left">
                  <Sparkles size={18} className="text-dorado" />
                  <div>
                    <h3 className="font-bold text-sm font-montserrat">DreamIA — Realidad Aumentada</h3>
                    <p className="text-[9px] text-white/60 mt-0.5">Ajusta el mueble en la habitación de muestra</p>
                  </div>
                </div>
                <button
                  onClick={() => setMostrarAR(false)}
                  className="p-1 rounded-full hover:bg-white/10 text-white transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Contenedor del simulador */}
              <div className="relative aspect-[4/3] w-full bg-gray-900 overflow-hidden select-none">
                {/* Imagen de fondo (habitación vacía) */}
                <img
                  src="https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800"
                  alt="Habitación vacía"
                  className="w-full h-full object-cover pointer-events-none"
                />

                {/* Producto superpuesto */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div
                    className="relative w-56 h-56 transition-transform duration-200"
                    style={{
                      transform: `rotate(${arGiro}deg) scale(${arEscala})`,
                    }}
                  >
                    <img
                      src={producto.imagenPrincipal}
                      alt={producto.nombre}
                      className="w-full h-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.5)]"
                    />
                  </div>
                </div>

                {/* Controles flotantes inferiores */}
                <div className="absolute bottom-4 inset-x-4 flex justify-between items-center bg-black bg-opacity-65 backdrop-blur-md rounded-2xl p-2.5 border border-white border-opacity-10">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setArGiro((prev) => (prev - 45) % 360)}
                      className="w-8 h-8 rounded-lg bg-white bg-opacity-10 hover:bg-opacity-20 text-white flex items-center justify-center transition-colors cursor-pointer"
                      title="Girar izquierda"
                    >
                      <RotateCw size={14} className="transform -scale-x-100" />
                    </button>
                    <button
                      onClick={() => setArGiro((prev) => (prev + 45) % 360)}
                      className="w-8 h-8 rounded-lg bg-white bg-opacity-10 hover:bg-opacity-20 text-white flex items-center justify-center transition-colors cursor-pointer"
                      title="Girar derecha"
                    >
                      <RotateCw size={14} />
                    </button>
                  </div>

                  <div className="flex gap-1.5 items-center">
                    <button
                      onClick={() => setArEscala((prev) => Math.max(prev - 0.1, 0.5))}
                      className="w-8 h-8 rounded-lg bg-white bg-opacity-10 hover:bg-opacity-20 text-white flex items-center justify-center transition-colors cursor-pointer font-bold text-xs"
                      title="Reducir"
                    >
                      -
                    </button>
                    <span className="text-white text-[11px] font-semibold min-w-[36px] text-center">
                      {Math.round(arEscala * 100)}%
                    </span>
                    <button
                      onClick={() => setArEscala((prev) => Math.min(prev + 0.1, 1.5))}
                      className="w-8 h-8 rounded-lg bg-white bg-opacity-10 hover:bg-opacity-20 text-white flex items-center justify-center transition-colors cursor-pointer font-bold text-xs"
                      title="Agrandar"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      toast.success("Foto guardada en tu galería local 📸");
                    }}
                    className="bg-teal hover:bg-teal-oscuro text-white text-[11px] font-bold px-3 py-2 rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    <Camera size={12} /> Capturar
                  </button>
                </div>
              </div>

              {/* Información y acción */}
              <div className="p-4 flex items-center justify-between border-t border-gray-100">
                <div className="max-w-[65%] text-left">
                  <p className="font-bold text-azul-oscuro text-xs truncate">{producto.nombre}</p>
                  <p className="text-[10px] text-gris-elegante mt-0.5">
                    Visualizado fotorrealista en escala simulada.
                  </p>
                </div>
                <button
                  onClick={() => {
                    agregarAlCarrito();
                    setMostrarAR(false);
                  }}
                  className="btn-primario inline-flex items-center gap-1 text-[11px] px-3.5 py-2 cursor-pointer"
                >
                  <ShoppingCart size={12} /> Comprar ahora
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </>
  );
}
