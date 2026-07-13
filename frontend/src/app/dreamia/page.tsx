'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Camera, ArrowRight, Loader2, ShoppingCart, CheckCircle, Info, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { dreamiaAPI } from '../../lib/api';
import { useCarritoStore } from '../../store/carrito.store';
import { useAuthStore } from '../../store/auth.store';
import { Producto, VarianteProducto } from '../../types';

// Antes / Después imágenes de muestra
const IMAGEN_ANTES = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200'; // Sala vacía / en construcción

export default function DreamiaPage() {
  const router = useRouter();
  const { usuario } = useAuthStore();
  const { agregar } = useCarritoStore();

  const [estilo, setEstilo] = useState('moderno');
  const [antesImagen, setAntesImagen] = useState(IMAGEN_ANTES);
  const [nombreEstancia, setNombreEstancia] = useState('Mi Sala de Estar');
  const [cargando, setCargando] = useState(false);
  const [pasoActual, setPasoActual] = useState(0);
  const [disenoGenerado, setDisenoGenerado] = useState<any | null>(null);
  const [sliderPos, setSliderPos] = useState(50);

  // Pasos de carga del motor IA
  const pasosCarga = [
    'Escaneando dimensiones del espacio...',
    'Identificando contornos de paredes y distribución de luz...',
    'Buscando mobiliario complementario en el catálogo de LlevaloPe...',
    'Generando iluminación y renderizado fotorrealista final...',
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (cargando) {
      setPasoActual(0);
      interval = setInterval(() => {
        setPasoActual((prev) => {
          if (prev >= pasosCarga.length - 1) {
            clearInterval(interval);
            return prev;
          }
          return prev + 1;
        });
      }, 700);
    }
    return () => clearInterval(interval);
  }, [cargando]);

  const procesarDiseno = async () => {
    setCargando(true);
    setDisenoGenerado(null);
    try {
      const resp = await dreamiaAPI.generar(estilo);
      setDisenoGenerado(resp);
      toast.success('¡Diseño decorativo generado con éxito! ✨');
    } catch (err: any) {
      toast.error('Ocurrió un error al procesar el diseño.');
    } finally {
      setCargando(false);
    }
  };

  const getPrecioVigente = (variante: VarianteProducto) => {
    return variante.precioOferta || variante.precioBase || 0;
  };

  const formatPrecio = (precio: number) => {
    return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(precio);
  };

  const agregarAlCarrito = (producto: Producto, variante: VarianteProducto) => {
    if (!usuario) {
      toast.error('Debe iniciar sesión para agregar productos al carrito');
      router.push('/auth/iniciar-sesion?redirigido=agregar-carrito');
      return;
    }
    agregar(producto, variante, 1);
    toast.success(`${producto.nombre} agregado al carrito!`);
  };

  const agregarTodoAlCarrito = () => {
    if (!usuario) {
      toast.error('Debe iniciar sesión para agregar productos al carrito');
      router.push('/auth/iniciar-sesion?redirigido=agregar-carrito');
      return;
    }
    if (!disenoGenerado?.productosRecomendados) return;

    disenoGenerado.productosRecomendados.forEach((prod: Producto) => {
      const principal = prod.variantes?.find(v => v.esPrincipal) || prod.variantes?.[0];
      if (principal) {
        agregar(prod, principal, 1);
      }
    });

    toast.success('¡Todos los muebles del diseño han sido agregados al carrito! 🎉');
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-crema">
        {/* Banner Hero */}
        <section className="bg-gradient-to-br from-azul-oscuro via-azul-corp to-teal py-16 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-10 left-10 w-48 h-48 border border-white rounded-full" />
            <div className="absolute bottom-10 right-10 w-96 h-96 border border-white rounded-full" />
          </div>

          <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-20 rounded-full px-4 py-1.5 mb-6">
              <Sparkles size={16} className="text-dorado" />
              <span className="text-xs font-semibold uppercase tracking-wider">DreamHome AI Portal</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold font-montserrat tracking-tight mb-4">
              Dream<span className="text-teal-claro text-dorado">IA</span>: Decora con Inteligencia Artificial
            </h1>
            <p className="max-w-2xl mx-auto text-white/80 text-sm md:text-base leading-relaxed">
              Transforma cualquier habitación al instante. Sube una foto de tu sala, cocina u oficina, elige un estilo y visualiza muebles reales de nuestra tienda integrados perfectamente en tu espacio.
            </p>
          </div>
        </section>

        {/* Formulario de configuración y subida */}
        <section className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid lg:grid-cols-3 gap-8 items-start">
            {/* Opciones */}
            <div className="bg-white rounded-3xl p-6 shadow-premium space-y-6">
              <h2 className="text-lg font-bold text-azul-oscuro flex items-center gap-2">
                ⚙️ Configurar Escenario
              </h2>

              {/* Nombre de la estancia */}
              <div>
                <label className="label-campo">Nombre del espacio</label>
                <input
                  type="text"
                  value={nombreEstancia}
                  onChange={(e) => setNombreEstancia(e.target.value)}
                  placeholder="Ej. Mi Sala de Estar, Dormitorio principal"
                  className="input-campo"
                />
              </div>

              {/* Selector de estilos */}
              <div>
                <label className="label-campo">Estilo decorativo</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'moderno', label: 'Moderno Glam', desc: 'Metales, dorado y elegancia' },
                    { id: 'nordico', label: 'Nórdico Escandinavo', desc: 'Madera clara y colores pastel' },
                    { id: 'industrial', label: 'Industrial Loft', desc: 'Madera oscura, metal y ladrillo' },
                    { id: 'rustico', label: 'Rústico Country', desc: 'Madera natural y aire rústico' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setEstilo(item.id)}
                      className={`p-3 rounded-2xl text-left border-2 transition-all cursor-pointer ${
                        estilo === item.id
                          ? 'border-teal bg-teal/5 shadow-sm'
                          : 'border-gray-100 hover:border-gray-300'
                      }`}
                    >
                      <p className="font-bold text-sm text-azul-oscuro">{item.label}</p>
                      <p className="text-[10px] text-gris-elegante mt-0.5 leading-tight">{item.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Subida de foto (Manejo simulado o templates) */}
              <div>
                <label className="label-campo">Subir foto o usar plantilla</label>
                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-5 text-center bg-crema/20 hover:bg-crema/40 transition-colors cursor-pointer relative overflow-hidden group">
                  <Camera size={28} className="mx-auto text-gris-elegante mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-xs font-semibold text-azul-oscuro">Arrastra tu foto aquí</p>
                  <p className="text-[10px] text-gris-elegante mt-1">Formatos JPG, PNG (máx. 10MB)</p>
                </div>
              </div>

              {/* Botón generar */}
              <button
                onClick={procesarDiseno}
                disabled={cargando}
                className="btn-primario w-full text-center flex items-center justify-center gap-2 text-base"
              >
                {cargando ? (
                  <>
                    <Loader2 size={20} className="animate-spin" /> Procesando...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} className="text-white" /> Diseñar con IA
                  </>
                )}
              </button>
            </div>

            {/* Visualizador central */}
            <div className="lg:col-span-2 space-y-6">
              {cargando && (
                <div className="bg-white rounded-3xl p-12 shadow-premium text-center flex flex-col items-center justify-center aspect-[16/9] border border-gray-100">
                  <Loader2 size={48} className="text-teal animate-spin mb-6" />
                  <h3 className="text-xl font-bold text-azul-oscuro font-montserrat">
                    El motor DreamIA está decorando tu habitación
                  </h3>
                  <div className="w-64 h-2 bg-crema rounded-full overflow-hidden mt-4 relative">
                    <div
                      className="h-full bg-teal transition-all duration-700"
                      style={{ width: `${((pasoActual + 1) / pasosCarga.length) * 100}%` }}
                    />
                  </div>
                  <p className="text-sm text-gris-elegante mt-3 italic animate-pulse">
                    {pasosCarga[pasoActual]}
                  </p>
                </div>
              )}

              {!cargando && !disenoGenerado && (
                <div className="bg-white rounded-3xl p-6 shadow-premium space-y-4 border border-gray-100">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-lg text-azul-oscuro">{nombreEstancia}</h3>
                      <p className="text-xs text-gris-elegante">Foto original cargada por el usuario</p>
                    </div>
                    <span className="bg-teal/15 text-teal text-xs font-bold px-3 py-1 rounded-full uppercase">Original</span>
                  </div>
                  <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden shadow-card">
                    <img src={antesImagen} alt="Habitación original" className="w-full h-full object-cover" />
                  </div>
                  <div className="bg-crema/40 rounded-2xl p-4 flex items-start gap-3 border border-gray-100">
                    <Info size={18} className="text-teal shrink-0 mt-0.5" />
                    <p className="text-xs text-azul-oscuro leading-relaxed">
                      Presiona el botón <strong>Diseñar con IA</strong> de la izquierda para comenzar el renderizado y recomendación inteligente de productos.
                    </p>
                  </div>
                </div>
              )}

              {!cargando && disenoGenerado && (
                <div className="bg-white rounded-3xl p-6 shadow-premium space-y-6 border border-gray-100">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-lg text-azul-oscuro">{nombreEstancia} (Estilo {estilo.toUpperCase()})</h3>
                      <p className="text-xs text-gris-elegante">Desliza la barra central para comparar el antes y después</p>
                    </div>
                    <span className="bg-dorado/15 text-dorado text-xs font-bold px-3 py-1 rounded-full uppercase">Decorado con IA</span>
                  </div>

                  {/* Comparador deslizante Before/After */}
                  <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden shadow-premium group select-none">
                    {/* Después */}
                    <img
                      src={disenoGenerado.imagenResultado}
                      alt="Habitación decorada"
                      className="absolute inset-0 w-full h-full object-cover"
                    />

                    {/* Antes */}
                    <div
                      className="absolute inset-y-0 left-0 right-0 overflow-hidden"
                      style={{ clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)` }}
                    >
                      <img
                        src={antesImagen}
                        alt="Habitación original"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </div>

                    {/* Línea divisoria */}
                    <div
                      className="absolute inset-y-0 w-1 bg-white cursor-ew-resize z-20 flex items-center justify-center"
                      style={{ left: `${sliderPos}%` }}
                    >
                      <div className="w-9 h-9 bg-white text-azul-oscuro rounded-full shadow-premium flex items-center justify-center border border-gray-100 text-sm font-bold scale-90 group-hover:scale-100 transition-transform">
                        ↔
                      </div>
                    </div>

                    {/* Control de rango invisible */}
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={sliderPos}
                      onChange={(e) => setSliderPos(Number(e.target.value))}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
                    />
                  </div>

                  {/* Resultados y compra consolidada */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-teal/5 border border-teal/10 rounded-2xl p-5">
                    <div>
                      <p className="font-bold text-azul-oscuro text-sm">¿Te gusta todo el diseño?</p>
                      <p className="text-xs text-gris-elegante mt-0.5">Puedes llevar todos los muebles juntos con un clic.</p>
                    </div>
                    <button
                      onClick={agregarTodoAlCarrito}
                      className="btn-primario inline-flex items-center gap-2 cursor-pointer w-full sm:w-auto text-center justify-center"
                    >
                      <ShoppingCart size={16} /> Comprar todo el diseño
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Listado de productos recomendados */}
        {disenoGenerado && (
          <section className="max-w-7xl mx-auto px-4 pb-20">
            <h2 className="text-2xl font-bold font-montserrat text-azul-oscuro mb-2">
              Productos recomendados en este diseño
            </h2>
            <p className="text-gris-elegante text-sm mb-8">
              Muebles reales del catálogo que encajan perfectamente con el modelado 3D de la habitación.
            </p>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
              {disenoGenerado.productosRecomendados &&
                disenoGenerado.productosRecomendados.map((prod: Producto) => {
                  const principal = prod.variantes?.find(v => v.esPrincipal) || prod.variantes?.[0];
                  if (!principal) return null;

                  const precioVigente = getPrecioVigente(principal);

                  return (
                    <div
                      key={prod.id}
                      className="bg-white rounded-3xl overflow-hidden shadow-card border border-gray-100 hover:shadow-hover transition-all duration-300 group"
                    >
                      <Link href={`/productos/${prod.slug}`}>
                        <div className="relative aspect-[4/3] w-full overflow-hidden bg-crema/20">
                          <img
                            src={prod.imagenPrincipal}
                            alt={prod.nombre}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      </Link>

                      <div className="p-5 space-y-3">
                        <div>
                          <span className="text-[10px] text-teal font-bold uppercase tracking-wider bg-teal/10 px-2 py-0.5 rounded-full">
                            Muebles y Hogar
                          </span>
                          <Link href={`/productos/${prod.slug}`} className="block mt-2">
                            <h3 className="font-bold text-azul-oscuro hover:text-teal transition-colors line-clamp-1">
                              {prod.nombre}
                            </h3>
                          </Link>
                          <p className="text-xs text-gris-elegante mt-1 line-clamp-2">
                            {prod.descripcionCorta}
                          </p>
                        </div>

                        <div className="flex justify-between items-center pt-2">
                          <div>
                            <p className="text-xs text-gris-elegante">Precio unitario</p>
                            <p className="text-lg font-bold text-azul-oscuro">
                              {formatPrecio(precioVigente)}
                            </p>
                          </div>
                          <button
                            onClick={() => agregarAlCarrito(prod, principal)}
                            className="w-10 h-10 rounded-xl bg-teal/10 text-teal hover:bg-teal hover:text-white transition-all flex items-center justify-center cursor-pointer"
                            title="Añadir al carrito"
                          >
                            <ShoppingCart size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
