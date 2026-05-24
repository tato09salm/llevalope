'use client';

import Link from 'next/link';
import { ShoppingCart, Phone, Mail, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-azul-oscuro text-crema">
      {/* Banda de beneficios */}
      <div className="bg-azul-corp border-b border-white border-opacity-10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icono: '🛡️', titulo: 'Compra Segura', desc: 'Protegemos tus datos' },
              { icono: '🚚', titulo: 'Envíos Rápidos', desc: 'A todo el Perú' },
              { icono: '💬', titulo: 'Atención 24/7', desc: 'Soporte en línea' },
              { icono: '✅', titulo: 'Calidad Garantizada', desc: 'Productos confiables' },
            ].map((item) => (
              <div key={item.titulo} className="flex items-center gap-3">
                <span className="text-2xl">{item.icono}</span>
                <div>
                  <p className="font-semibold text-sm">{item.titulo}</p>
                  <p className="text-xs text-gris-elegante">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo y descripción */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-dorado rounded-lg flex items-center justify-center">
                <ShoppingCart size={20} className="text-azul-oscuro" />
              </div>
              <span className="font-montserrat font-bold text-xl">
                Lleva<span className="text-dorado">lo</span>Pe
              </span>
            </Link>
            <p className="text-sm text-gris-elegante leading-relaxed mb-4">
              Tu plataforma de confianza para compras online en Perú. Miles de productos al mejor precio con envíos rápidos a todo el país.
            </p>
            <div className="flex gap-3">
              {[Facebook, Instagram, Twitter].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 bg-white bg-opacity-10 rounded-lg flex items-center justify-center hover:bg-dorado hover:text-azul-oscuro transition-all duration-200"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Categorías */}
          <div>
            <h4 className="font-montserrat font-bold mb-4 text-dorado">Categorías</h4>
            <ul className="space-y-2 text-sm text-gris-elegante">
              {['Tecnología', 'Hogar y Muebles', 'Moda', 'Belleza', 'Deportes', 'Alimentos', 'Juguetes', 'Libros'].map((cat) => (
                <li key={cat}>
                  <Link href={`/productos?categoria=${cat.toLowerCase()}`} className="hover:text-dorado transition-colors">
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Mi Cuenta */}
          <div>
            <h4 className="font-montserrat font-bold mb-4 text-dorado">Mi Cuenta</h4>
            <ul className="space-y-2 text-sm text-gris-elegante">
              {[
                ['Iniciar Sesión', '/auth/iniciar-sesion'],
                ['Registrarse', '/auth/registrar'],
                ['Mis Pedidos', '/cuenta/pedidos'],
                ['Lista de Deseos', '/cuenta/wishlist'],
                ['Mis Direcciones', '/cuenta/direcciones'],
                ['Centro de Ayuda', '/ayuda'],
                ['Rastrear Pedido', '/seguimiento'],
              ].map(([nombre, ruta]) => (
                <li key={nombre}>
                  <Link href={ruta} className="hover:text-dorado transition-colors">
                    {nombre}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="font-montserrat font-bold mb-4 text-dorado">Contáctanos</h4>
            <ul className="space-y-3 text-sm text-gris-elegante">
              <li className="flex items-center gap-2">
                <Phone size={14} className="text-dorado shrink-0" />
                +51 900 123 456
              </li>
              <li className="flex items-center gap-2">
                <Mail size={14} className="text-dorado shrink-0" />
                soporte@llevalope.pe
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={14} className="text-dorado shrink-0 mt-0.5" />
                Av. Larco 1301, Miraflores, Lima, Perú
              </li>
            </ul>

            <div className="mt-6">
              <p className="text-xs text-gris-elegante mb-3">Métodos de pago aceptados:</p>
              <div className="flex flex-wrap gap-2">
                {['Visa', 'MC', 'Yape', 'Plin', 'PayPal'].map((pago) => (
                  <span
                    key={pago}
                    className="bg-white bg-opacity-10 text-xs px-2 py-1 rounded border border-white border-opacity-10"
                  >
                    {pago}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-white border-opacity-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-2">
          <p className="text-xs text-gris-elegante">
            © {new Date().getFullYear()} LlevaloPe. Todos los derechos reservados.
          </p>
          <div className="flex gap-4 text-xs text-gris-elegante">
            <Link href="/terminos" className="hover:text-dorado">Términos y Condiciones</Link>
            <Link href="/privacidad" className="hover:text-dorado">Política de Privacidad</Link>
            <Link href="/cookies" className="hover:text-dorado">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
