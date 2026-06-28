'use client';

import { motion } from 'framer-motion';
import { Factory, Building2, Users, ArrowDown, CheckCircle, MessageCircle, Mail, Phone, HelpCircle } from 'lucide-react';
import Link from 'next/link';

export default function SeccionConfianza() {
  return (
    <>
      {/* Banner promocional */}
      <section className="py-6 bg-gradient-to-r from-teal to-azul-corp">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-white text-center md:text-left">
              <p className="font-montserrat text-xl font-bold">🎉 ¡Oferta exclusiva!</p>
              <p className="text-sm opacity-90">Usa el código <strong className="text-dorado">BIENVENIDO10</strong> y obtén 10% de descuento en tu primera compra</p>
            </div>
            <Link href="/productos" className="bg-dorado text-azul-oscuro font-bold px-8 py-3 rounded-xl hover:bg-dorado-claro transition-colors whitespace-nowrap">
              Comprar Ahora
            </Link>
          </div>
        </div>
      </section>

      {/* Cadena de suministro */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Texto */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <p className="text-teal text-sm font-semibold uppercase tracking-widest mb-2">Transparencia total</p>
              <h2 className="seccion-titulo mb-4">Nuestra Cadena de Suministro</h2>
              <p className="text-gris-elegante mb-8 leading-relaxed">
                Trabajamos directamente con los mejores proveedores para ofrecerte productos auténticos con el mejor precio y calidad garantizada.
              </p>

              <div className="space-y-4">
                {[
                  'Proveedores verificados y certificados',
                  'Control de calidad en cada etapa',
                  'Trazabilidad completa del producto',
                  'Tiempos de entrega garantizados',
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle size={18} className="text-teal shrink-0" />
                    <span className="text-azul-oscuro text-sm">{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Diagrama */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex flex-col items-center gap-2"
            >
              {[
                {
                  icono: Factory,
                  titulo: 'Proveedores',
                  desc: 'Abastecemos con los mejores productos y materias primas.',
                  color: 'bg-azul-corp',
                  linea: true,
                },
                {
                  icono: Building2,
                  titulo: 'LlevaloPe',
                  desc: 'Gestionamos, almacenamos y procesamos cada pedido con eficiencia.',
                  color: 'bg-teal',
                  linea: true,
                },
                {
                  icono: Users,
                  titulo: 'Clientes',
                  desc: 'Entregamos calidad y satisfacción en cada compra.',
                  color: 'bg-dorado',
                  linea: false,
                },
              ].map(({ icono: Icono, titulo, desc, color, linea }) => (
                <div key={titulo} className="flex flex-col items-center w-full max-w-xs">
                  <div className={`${color} rounded-2xl p-5 w-full text-white flex items-center gap-4 shadow-card`}>
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center shrink-0">
                      <Icono size={24} />
                    </div>
                    <div>
                      <p className="font-bold">{titulo}</p>
                      <p className="text-xs opacity-80">{desc}</p>
                    </div>
                  </div>
                  {linea && (
                    <div className="flex flex-col items-center py-1">
                      <div className="w-0.5 h-4 bg-gray-200" />
                      <ArrowDown size={16} className="text-gris-elegante" />
                      <div className="w-0.5 h-4 bg-gray-200" />
                    </div>
                  )}
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Atención al cliente */}
      <section className="py-16 bg-crema">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <p className="text-teal text-sm font-semibold uppercase tracking-widest mb-2">Siempre disponibles</p>
            <h2 className="seccion-titulo">Atención al Cliente</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { icono: MessageCircle, titulo: 'Chat en Línea', desc: 'Resolvemos tus dudas al instante.', color: 'bg-teal', ruta: '/ayuda/chat' },
              { icono: Mail, titulo: 'Correo Electrónico', desc: 'soporte@llevalope.pe', color: 'bg-azul-corp', ruta: 'mailto:soporte@llevalope.pe' },
              { icono: Phone, titulo: 'Teléfono', desc: '+51 900 123 456', color: 'bg-dorado', ruta: 'tel:+51900123456' },
              { icono: HelpCircle, titulo: 'Preguntas Frecuentes', desc: 'Encuentra respuestas rápidas.', color: 'bg-azul-oscuro', ruta: '/ayuda' },
            ].map(({ icono: Icono, titulo, desc, color, ruta }) => (
              <motion.a
                key={titulo}
                href={ruta}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -4 }}
                className="bg-white rounded-2xl p-6 shadow-card hover:shadow-hover transition-all duration-300 text-center cursor-pointer block"
              >
                <div className={`${color} w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                  <Icono size={24} className="text-white" />
                </div>
                <h3 className="font-bold text-azul-oscuro mb-1">{titulo}</h3>
                <p className="text-gris-elegante text-sm">{desc}</p>
              </motion.a>
            ))}
          </div>

          {/* CTA soporte */}
          <div className="bg-gradient-to-r from-azul-oscuro to-azul-corp rounded-2xl p-8 text-center text-white">
            <p className="text-2xl font-bold font-montserrat mb-2">¿Necesitas ayuda personalizada?</p>
            <p className="text-white text-opacity-80 mb-6">Nuestro equipo está disponible de lunes a sábado de 8am a 10pm</p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/ayuda" className="bg-dorado text-azul-oscuro font-bold px-8 py-3 rounded-xl hover:bg-dorado-claro transition-colors">
                Centro de Ayuda
              </Link>
              <Link href="/soporte/nuevo-ticket" className="bg-white bg-opacity-10 border border-white border-opacity-30 text-white font-bold px-8 py-3 rounded-xl hover:bg-opacity-20 transition-colors">
                Crear Ticket
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonios */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <p className="text-teal text-sm font-semibold uppercase tracking-widest mb-2">Lo que dicen</p>
            <h2 className="seccion-titulo">Nuestros Clientes</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { nombre: 'María G.', ciudad: 'Lima', texto: 'Excelente experiencia de compra. Recibí mi pedido en menos de 24 horas y el producto estaba perfectamente embalado.', cal: 5 },
              { nombre: 'Carlos R.', ciudad: 'Arequipa', texto: 'La calidad de los productos es increíble y los precios son los mejores que encontré. Ya hice 5 compras y todas perfectas.', cal: 5 },
              { nombre: 'Ana P.', ciudad: 'Trujillo', texto: 'El servicio al cliente es de primera. Tuve un problema con mi pedido y lo resolvieron en menos de 2 horas. ¡Recomendado!', cal: 5 },
            ].map(({ nombre, ciudad, texto, cal }) => (
              <motion.div
                key={nombre}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-crema rounded-2xl p-6 border border-gray-100"
              >
                <div className="flex gap-1 mb-3">
                  {Array(cal).fill(0).map((_, i) => (
                    <span key={i} className="text-dorado text-lg">★</span>
                  ))}
                </div>
                <p className="text-azul-oscuro text-sm leading-relaxed mb-4">"{texto}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-teal to-azul-corp rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {nombre[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-azul-oscuro text-sm">{nombre}</p>
                    <p className="text-gris-elegante text-xs">{ciudad}, Perú</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
