'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Compass, Loader2, RefreshCw, ShoppingBag, ArrowLeft, Clock } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

export default function SeguimientoPage() {
  const [trackingId, setTrackingId] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mostrarResultado, setMostrarResultado] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingId.trim()) return;

    setCargando(true);
    // Simular consulta de red
    setTimeout(() => {
      setCargando(false);
      setMostrarResultado(true);
    }, 1500);
  };

  return (
    <>
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-16 min-h-[60vh] flex flex-col justify-center">
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-gris-elegante hover:text-teal font-semibold transition-colors mb-4"
          >
            <ArrowLeft size={14} /> Volver al Inicio
          </Link>
          <h1 className="text-3xl font-bold font-montserrat text-azul-oscuro mb-2">
            Rastrear mi Pedido
          </h1>
          <p className="text-gris-elegante text-sm max-w-md mx-auto">
            Ingresa el código de seguimiento enviado a tu correo electrónico para conocer el estado de tu despacho.
          </p>
        </div>

        {/* Buscador de Tracking */}
        <div className="bg-white rounded-3xl shadow-card p-6 md:p-8 border border-gray-100 mb-8 max-w-2xl mx-auto w-full">
          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Ej. TRK-987654321-PE"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                disabled={cargando}
                required
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-dorado focus:border-transparent text-sm md:text-base text-azul-oscuro"
              />
              <Search className="absolute left-4 top-3.5 text-gris-elegante" size={18} />
            </div>
            <button
              type="submit"
              disabled={cargando}
              className="bg-azul-oscuro hover:bg-azul-corp text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm md:text-base shrink-0 disabled:opacity-75"
            >
              {cargando ? (
                <>
                  <Loader2 className="animate-spin" size={18} /> Consultando...
                </>
              ) : (
                'Buscar Pedido'
              )}
            </button>
          </form>
        </div>

        {/* Resultados / Caja informativa */}
        <AnimatePresence mode="wait">
          {mostrarResultado && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto w-full"
            >
              <div className="bg-amber-50 rounded-3xl border border-amber-200 p-8 text-center relative overflow-hidden">
                {/* Animación del reloj/compass de fondo */}
                <div className="absolute -right-8 -top-8 text-amber-100 opacity-30 transform rotate-12 pointer-events-none">
                  <Compass size={180} />
                </div>

                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-6 text-amber-500 border border-amber-100">
                  <Clock size={32} className="animate-pulse" />
                </div>

                <h3 className="text-xl font-bold font-montserrat text-amber-800 mb-3">
                  Módulo de Seguimiento en Desarrollo
                </h3>
                <p className="text-sm text-amber-700 max-w-md mx-auto mb-6 leading-relaxed">
                  Aún no está disponible este módulo, pero nuestro equipo sigue trabajando activamente para integrar el rastreo de envíos en tiempo real con las principales agencias del país (Olva, Shalom, y Envío Express).
                </p>

                <div className="flex flex-col sm:flex-row justify-center gap-3">
                  <Link
                    href="/ayuda"
                    className="bg-white hover:bg-gray-50 text-azul-oscuro border border-amber-200 font-semibold px-6 py-2.5 rounded-xl text-sm transition-all duration-200 inline-flex items-center justify-center gap-2"
                  >
                    Ir al Centro de Ayuda
                  </Link>
                  <button
                    onClick={() => {
                      setTrackingId('');
                      setMostrarResultado(false);
                    }}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-all duration-200 inline-flex items-center justify-center gap-2"
                  >
                    Realizar otra búsqueda
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Footer />
    </>
  );
}
