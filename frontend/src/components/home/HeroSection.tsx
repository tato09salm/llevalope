'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ShoppingBag, Zap, Shield, Truck } from 'lucide-react';

const slides = [
  {
    id: 1,
    titulo: 'Compra inteligente,',
    subtitulo: 'vive mejor',
    descripcion: 'Miles de productos de calidad al mejor precio con envíos a todo el Perú.',
    boton: 'Comprar Ahora',
    botonRuta: '/productos',
    boton2: 'Ver Ofertas',
    boton2Ruta: '/productos?enOferta=true',
    badge: '🚀 Envíos a todo el país',
    gradiente: 'from-azul-oscuro via-azul-corp to-teal',
    acento: 'text-dorado',
  },
  {
    id: 2,
    titulo: 'Ofertas increíbles',
    subtitulo: 'hasta 50% OFF',
    descripcion: 'Descuentos exclusivos en tecnología, moda y hogar. ¡Solo por tiempo limitado!',
    boton: 'Ver Ofertas',
    botonRuta: '/productos?enOferta=true',
    boton2: 'Explorar Todo',
    boton2Ruta: '/productos',
    badge: '⚡ Ofertas del día',
    gradiente: 'from-teal via-azul-corp to-azul-oscuro',
    acento: 'text-dorado',
  },
  {
    id: 3,
    titulo: 'Tecnología de',
    subtitulo: 'última generación',
    descripcion: 'Los mejores gadgets y dispositivos electrónicos al alcance de tu mano.',
    boton: 'Ver Tecnología',
    botonRuta: '/productos?categoria=tecnologia',
    boton2: 'Ver Destacados',
    boton2Ruta: '/productos?destacado=true',
    badge: '💻 Nuevos arrivals',
    gradiente: 'from-azul-oscuro to-azul-corp',
    acento: 'text-dorado',
  },
];

const beneficios = [
  { icono: Shield, texto: 'Compra 100% Segura', color: 'text-teal' },
  { icono: Truck, texto: 'Envío Gratis +S/149', color: 'text-dorado' },
  { icono: Zap, texto: 'Entrega Express', color: 'text-teal' },
  { icono: ShoppingBag, texto: 'Devolución Gratis', color: 'text-dorado' },
];

export default function HeroSection() {
  const [actual, setActual] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActual((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const anterior = () => setActual((prev) => (prev - 1 + slides.length) % slides.length);
  const siguiente = () => setActual((prev) => (prev + 1) % slides.length);

  const slide = slides[actual];

  return (
    <div className="relative">
      {/* Hero principal */}
      <div className={`relative bg-gradient-to-br ${slide.gradiente} overflow-hidden min-h-[480px] md:min-h-[520px]`}>
        {/* Patrón de fondo decorativo */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full border-2 border-white" />
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full border border-white" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-128 h-128 rounded-full border border-white" />
        </div>

        <div className="max-w-7xl mx-auto px-4 py-16 md:py-20 relative z-10">
          <div className="max-w-2xl">
            {/* Badge */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`badge-${actual}`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="inline-flex items-center gap-2 bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-20 rounded-full px-4 py-1.5 mb-6"
              >
                <span className="text-sm text-white font-medium">{slide.badge}</span>
              </motion.div>
            </AnimatePresence>

            {/* Título */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`titulo-${actual}`}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                transition={{ duration: 0.4 }}
              >
                <h1 className="font-montserrat text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-2">
                  {slide.titulo}
                </h1>
                <h2 className={`font-montserrat text-4xl md:text-5xl lg:text-6xl font-black ${slide.acento} leading-tight mb-6`}>
                  {slide.subtitulo}
                </h2>
                <p className="text-white text-opacity-80 text-lg mb-8 leading-relaxed">
                  {slide.descripcion}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Botones */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`botones-${actual}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.1 }}
                className="flex flex-wrap gap-4"
              >
                <Link
                  href={slide.botonRuta}
                  className="bg-dorado text-azul-oscuro font-bold px-8 py-4 rounded-xl hover:bg-dorado-claro transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95 text-base"
                >
                  {slide.boton}
                </Link>
                <Link
                  href={slide.boton2Ruta}
                  className="bg-white bg-opacity-10 backdrop-blur-sm border-2 border-white border-opacity-30 text-white font-bold px-8 py-4 rounded-xl hover:bg-opacity-20 transition-all duration-200 text-base"
                >
                  {slide.boton2}
                </Link>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Controles del carrusel */}
        <button
          onClick={anterior}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-full flex items-center justify-center text-white transition-all border border-white border-opacity-20"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={siguiente}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-full flex items-center justify-center text-white transition-all border border-white border-opacity-20"
        >
          <ChevronRight size={20} />
        </button>

        {/* Indicadores */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setActual(i)}
              className={`transition-all duration-300 rounded-full ${
                i === actual ? 'w-8 h-2 bg-dorado' : 'w-2 h-2 bg-white bg-opacity-40'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Barra de beneficios */}
      <div className="bg-white shadow-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100">
            {beneficios.map(({ icono: Icono, texto, color }) => (
              <div key={texto} className="flex items-center justify-center gap-3 py-4 px-4">
                <Icono size={22} className={color} />
                <span className="text-sm font-semibold text-azul-oscuro">{texto}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
