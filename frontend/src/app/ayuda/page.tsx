'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Truck,
  CreditCard,
  RotateCcw,
  User,
  ChevronDown,
  MessageSquare,
  MessageCircle,
  HelpCircle,
  ArrowRight,
  ClipboardList
} from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

interface FAQItem {
  id: string;
  pregunta: string;
  respuesta: string;
}

interface FAQCategory {
  id: string;
  titulo: string;
  icono: any;
  items: FAQItem[];
}

export default function AyudaPage() {
  const [buscarQuery, setBuscarQuery] = useState('');
  const [categoriaActiva, setCategoriaActiva] = useState('envios');
  const [faqAbierto, setFaqAbierto] = useState<string | null>(null);

  const categoriasFaq: FAQCategory[] = [
    {
      id: 'envios',
      titulo: 'Envíos y Entregas',
      icono: Truck,
      items: [
        {
          id: 'envio-1',
          pregunta: '¿Cuánto tiempo tarda en llegar mi pedido?',
          respuesta: 'El tiempo de entrega depende de tu ubicación. Para Lima Metropolitana, el plazo es de 24 a 48 horas hábiles. Para provincias, tarda entre 3 y 5 días hábiles a través de nuestros operadores logísticos asociados.'
        },
        {
          id: 'envio-2',
          pregunta: '¿Cuáles son los costos de envío?',
          respuesta: 'El envío estándar tiene un costo fijo de S/ 14.90 para todo el Perú. Sin embargo, si tu compra es superior a S/ 199.00, ¡el envío es totalmente gratuito!'
        },
        {
          id: 'envio-3',
          pregunta: '¿Realizan envíos a todo el Perú?',
          respuesta: 'Sí, llegamos a nivel nacional. Si tu dirección se encuentra en una zona de difícil acceso, nos comunicaremos contigo para coordinar la entrega en la oficina de encomiendas más cercana.'
        }
      ]
    },
    {
      id: 'pagos',
      titulo: 'Pagos y Facturación',
      icono: CreditCard,
      items: [
        {
          id: 'pago-1',
          pregunta: '¿Qué métodos de pago aceptan?',
          respuesta: 'Aceptamos transferencias bancarias, Yape, Plin y contra entrega. Próximamente habilitaremos el pago directo con tarjetas de débito/crédito y PayPal.'
        },
        {
          id: 'pago-2',
          pregunta: '¿Es seguro comprar en LlevaloPe?',
          respuesta: 'Completamente seguro. Contamos con certificados de seguridad SSL y protocolos de cifrado para proteger tus datos personales en todo momento.'
        },
        {
          id: 'pago-3',
          pregunta: '¿Cómo solicito mi boleta o factura?',
          respuesta: 'Durante el proceso de compra (Checkout) podrás seleccionar si deseas boleta o factura e ingresar tus datos de RUC o DNI. El documento se enviará automáticamente a tu correo una vez confirmado el pago.'
        }
      ]
    },
    {
      id: 'devoluciones',
      titulo: 'Devoluciones y Reembolsos',
      icono: RotateCcw,
      items: [
        {
          id: 'dev-1',
          pregunta: '¿Cuál es la política de devoluciones?',
          respuesta: 'Puedes solicitar la devolución o cambio de un producto dentro de los primeros 7 días calendario posteriores a la recepción, siempre y cuando se encuentre sellado, con etiquetas originales y sin signos de uso.'
        },
        {
          id: 'dev-2',
          pregunta: '¿Cómo solicito un reembolso?',
          respuesta: 'Debes registrar una solicitud desde tu panel de Soporte en la sección de cuenta, o escribirnos directamente a nuestro centro de atención. El reembolso se procesará en un plazo de 3 a 7 días hábiles según tu banco.'
        },
        {
          id: 'dev-3',
          pregunta: '¿Tiene algún costo realizar una devolución?',
          respuesta: 'Si la devolución es por un defecto de fábrica o error en el envío del producto, LlevaloPe asume el 100% de los costos logísticos. Si es por cambio de opinión, el cliente asume el costo de envío de retorno.'
        }
      ]
    },
    {
      id: 'cuenta',
      titulo: 'Mi Cuenta y Seguridad',
      icono: User,
      items: [
        {
          id: 'cuenta-1',
          pregunta: '¿Cómo cambio mis datos de contacto o direcciones?',
          respuesta: 'Inicia sesión, dirígete a "Mi Perfil" o "Mis Direcciones" en el menú de usuario. Allí podrás actualizar tus teléfonos, correo y agregar múltiples direcciones de entrega predeterminadas.'
        },
        {
          id: 'cuenta-2',
          pregunta: '¿Qué hago si olvidé mi contraseña?',
          respuesta: 'En la pantalla de inicio de sesión, haz clic en "¿Olvidaste tu contraseña?". Ingresa tu correo registrado y te enviaremos un enlace con las instrucciones para restablecerla de forma segura.'
        }
      ]
    }
  ];

  const handleToggleFaq = (id: string) => {
    setFaqAbierto(faqAbierto === id ? null : id);
  };

  const getFilteredFAQs = () => {
    if (!buscarQuery.trim()) {
      return categoriasFaq.find(c => c.id === categoriaActiva)?.items || [];
    }

    const query = buscarQuery.toLowerCase();
    const result: FAQItem[] = [];
    categoriasFaq.forEach(cat => {
      cat.items.forEach(item => {
        if (
          item.pregunta.toLowerCase().includes(query) ||
          item.respuesta.toLowerCase().includes(query)
        ) {
          result.push(item);
        }
      });
    });
    return result;
  };

  const faqsAMostrar = getFilteredFAQs();
  const categoriaSeleccionada = categoriasFaq.find(c => c.id === categoriaActiva);

  return (
    <>
      <Navbar />

      {/* Banner Principal / Buscador */}
      <div className="bg-azul-corp text-white py-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(212,175,55,0.05),transparent_60%)]" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold font-montserrat mb-4">
              ¿Cómo podemos ayudarte hoy?
            </h1>
            <p className="text-crema text-opacity-80 mb-8 max-w-xl mx-auto text-sm md:text-base">
              Busca respuestas rápidas a tus dudas sobre envíos, pagos, devoluciones y gestión de cuenta.
            </p>
          </motion.div>

          <div className="max-w-2xl mx-auto relative">
            <input
              type="text"
              placeholder="Escribe tu consulta aquí... (ej. envíos, costos, devoluciones)"
              value={buscarQuery}
              onChange={(e) => setBuscarQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border-none focus:ring-2 focus:ring-dorado focus:outline-none text-azul-oscuro text-sm md:text-base shadow-lg"
            />
            <Search className="absolute left-4 top-4 text-gris-elegante" size={20} />
          </div>
        </div>
      </div>

      {/* Módulos Rápidos de Contacto/Acción */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white p-6 rounded-2xl shadow-card border border-gray-100 flex flex-col justify-between hover:shadow-premium transition-all duration-300">
            <div>
              <div className="w-12 h-12 bg-crema text-dorado rounded-xl flex items-center justify-center mb-4">
                <ClipboardList size={24} />
              </div>
              <h3 className="font-bold text-azul-oscuro text-lg mb-2">Rastrear Pedido</h3>
              <p className="text-gris-elegante text-sm mb-6 leading-relaxed">
                ¿Quieres saber dónde se encuentra tu compra en tiempo real? Ingresa a nuestro módulo de seguimiento.
              </p>
            </div>
            <Link href="/seguimiento" className="text-teal font-semibold text-sm inline-flex items-center gap-1 hover:underline">
              Ir a rastreo <ArrowRight size={14} />
            </Link>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-card border border-gray-100 flex flex-col justify-between hover:shadow-premium transition-all duration-300">
            <div>
              <div className="w-12 h-12 bg-teal bg-opacity-10 text-teal rounded-xl flex items-center justify-center mb-4">
                <MessageCircle size={24} />
              </div>
              <h3 className="font-bold text-azul-oscuro text-lg mb-2">Chat en Línea</h3>
              <p className="text-gris-elegante text-sm mb-6 leading-relaxed">
                Resuelve dudas de compra o consulta sobre productos con nuestro equipo de atención inmediata.
              </p>
            </div>
            <Link href="/ayuda/chat" className="text-teal font-semibold text-sm inline-flex items-center gap-1 hover:underline">
              Iniciar chat <ArrowRight size={14} />
            </Link>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-card border border-gray-100 flex flex-col justify-between hover:shadow-premium transition-all duration-300">
            <div>
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                <MessageSquare size={24} />
              </div>
              <h3 className="font-bold text-azul-oscuro text-lg mb-2">Crear Ticket de Soporte</h3>
              <p className="text-gris-elegante text-sm mb-6 leading-relaxed">
                ¿Tienes un problema de postventa o reclamo? Crea un ticket para darle seguimiento formal.
              </p>
            </div>
            <Link href="/soporte/nuevo-ticket" className="text-teal font-semibold text-sm inline-flex items-center gap-1 hover:underline">
              Generar ticket <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Sección de FAQs */}
        <div className="bg-white rounded-3xl shadow-card p-6 md:p-10 border border-gray-100">
          <div className="text-center md:text-left mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold font-montserrat text-azul-oscuro flex items-center justify-center md:justify-start gap-2">
                <HelpCircle className="text-dorado" /> Preguntas Frecuentes
              </h2>
              <p className="text-gris-elegante text-sm mt-1">
                {buscarQuery ? `Resultados de búsqueda para "${buscarQuery}"` : 'Encuentra soluciones rápidas seleccionando una categoría'}
              </p>
            </div>

            {/* Buscador Borrar */}
            {buscarQuery && (
              <button
                onClick={() => setBuscarQuery('')}
                className="text-teal hover:underline text-sm font-semibold"
              >
                Limpiar búsqueda
              </button>
            )}
          </div>

          {/* Selector de Categorías (Solo se muestra si no se está buscando) */}
          {!buscarQuery && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-8">
              {categoriasFaq.map((cat) => {
                const Icon = cat.icono;
                const active = cat.id === categoriaActiva;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setCategoriaActiva(cat.id);
                      setFaqAbierto(null);
                    }}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border text-sm font-semibold transition-all duration-200 ${
                      active
                        ? 'bg-azul-oscuro text-white border-azul-oscuro shadow-premium scale-[1.02]'
                        : 'bg-white text-azul-oscuro border-gray-100 hover:bg-crema'
                    }`}
                  >
                    <Icon size={18} className={active ? 'text-dorado' : 'text-gris-elegante'} />
                    <span>{cat.titulo}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Acordeón de FAQs */}
          <div className="space-y-3 min-h-[200px]">
            {faqsAMostrar.length > 0 ? (
              faqsAMostrar.map((faq) => {
                const isOpen = faqAbierto === faq.id;
                return (
                  <div
                    key={faq.id}
                    className="border border-gray-100 rounded-2xl overflow-hidden transition-all duration-200"
                  >
                    <button
                      onClick={() => handleToggleFaq(faq.id)}
                      className="w-full flex items-center justify-between p-5 text-left bg-white hover:bg-gray-50 transition-colors focus:outline-none"
                    >
                      <span className="font-semibold text-azul-oscuro text-sm md:text-base">
                        {faq.pregunta}
                      </span>
                      <ChevronDown
                        size={18}
                        className={`text-gris-elegante transition-transform duration-200 shrink-0 ${
                          isOpen ? 'rotate-180 text-teal' : ''
                        }`}
                      />
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="bg-gray-50 border-t border-gray-100 overflow-hidden"
                        >
                          <div className="p-5 text-sm md:text-base text-gris-elegante leading-relaxed">
                            {faq.respuesta}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12">
                <HelpCircle size={40} className="text-gray-300 mx-auto mb-3" />
                <p className="text-azul-oscuro font-semibold">No se encontraron preguntas similares</p>
                <p className="text-gris-elegante text-sm mt-1">
                  Prueba con otras palabras o crea un ticket de soporte.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
