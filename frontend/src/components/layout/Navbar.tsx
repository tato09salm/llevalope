'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingCart, Heart, User, Search, Menu, X,
  ChevronDown, Phone, MapPin, Bell,
} from 'lucide-react';
import { useCarritoStore } from '../../store/carrito.store';
import { useAuthStore } from '../../store/auth.store';
import { categoriasAPI } from '../../lib/api';
import type { Categoria } from '../../types';

export default function Navbar() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const { totalItems } = useCarritoStore();
  const { usuario, cerrarSesion } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const cargarCategorias = async () => {
      try {
        const datos = await categoriasAPI.listar();
        setCategorias(datos);
      } catch (error) {
        console.error('Error al cargar categorías:', error);
      }
    };
    cargarCategorias();
  }, []);

  useEffect(() => {
    const manejarScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', manejarScroll);
    return () => window.removeEventListener('scroll', manejarScroll);
  }, []);

  const buscar = (e: React.FormEvent) => {
    e.preventDefault();
    if (busqueda.trim()) {
      router.push(`/productos?busqueda=${encodeURIComponent(busqueda)}`);
    }
  };

  const categoriasPadre = categorias.filter(cat => !cat.categoriaPadreId);

  return (
    <>
      {/* Barra superior */}
      <div className="bg-azul-oscuro text-crema text-xs py-2 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1">
              <Phone size={12} className="text-dorado" />
              +51 900 123 456
            </span>
            <span className="flex items-center gap-1">
              <MapPin size={12} className="text-dorado" />
              Envíos a todo el Perú
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/ayuda" className="hover:text-dorado transition-colors">Centro de Ayuda</Link>
            <span>|</span>
            <Link href="/seguimiento" className="hover:text-dorado transition-colors">Rastrear Pedido</Link>
          </div>
        </div>
      </div>

      {/* Navbar principal */}
      <nav
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-azul-corp shadow-premium' : 'bg-azul-corp'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <div className="w-9 h-9 bg-dorado rounded-lg flex items-center justify-center">
                <ShoppingCart size={20} className="text-azul-oscuro" />
              </div>
              <div>
                <span className="text-white font-montserrat font-bold text-xl leading-none">
                  Lleva<span className="text-dorado">lo</span>Pe
                </span>
                <p className="text-crema text-[9px] opacity-70 leading-none">Tu tienda sin límites</p>
              </div>
            </Link>

            {/* Buscador */}
            <form onSubmit={buscar} className="flex-1 max-w-2xl hidden md:flex">
              <div className="flex w-full">
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar productos, marcas y más..."
                  className="flex-1 px-4 py-2.5 text-sm rounded-l-lg border-0 focus:outline-none text-azul-oscuro bg-white"
                />
                <button
                  type="submit"
                  className="bg-dorado hover:bg-dorado-oscuro px-4 rounded-r-lg transition-colors"
                >
                  <Search size={18} className="text-azul-oscuro" />
                </button>
              </div>
            </form>

            {/* Iconos de acción */}
            <div className="flex items-center gap-1">
              {/* Wishlist */}
              <Link
                href="/cuenta/wishlist"
                className="p-2.5 text-crema hover:text-dorado transition-colors relative hidden md:flex items-center"
                title="Lista de deseos"
              >
                <Heart size={22} />
              </Link>

              {/* Carrito */}
              <Link
                href="/carrito"
                className="p-2.5 text-crema hover:text-dorado transition-colors relative flex items-center"
                title="Carrito de compras"
              >
                <ShoppingCart size={22} />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-dorado text-azul-oscuro text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </Link>

              {/* Usuario */}
              {usuario ? (
                <div className="relative group hidden md:block">
                  <button className="flex items-center gap-2 p-2.5 text-crema hover:text-dorado transition-colors">
                    <User size={22} />
                    <span className="text-sm font-medium">{usuario.nombre}</span>
                    <ChevronDown size={14} />
                  </button>
                  <div className="absolute right-0 mt-1 w-52 bg-white rounded-xl shadow-premium opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2 z-50">
                    <Link href="/cuenta" className="flex items-center gap-3 px-4 py-2.5 text-azul-oscuro hover:bg-crema text-sm transition-colors">
                      <User size={15} /> Mi Perfil
                    </Link>
                    <Link href="/cuenta/pedidos" className="flex items-center gap-3 px-4 py-2.5 text-azul-oscuro hover:bg-crema text-sm transition-colors">
                      <ShoppingCart size={15} /> Mis Pedidos
                    </Link>
                    <Link href="/cuenta/wishlist" className="flex items-center gap-3 px-4 py-2.5 text-azul-oscuro hover:bg-crema text-sm transition-colors">
                      <Heart size={15} /> Lista de Deseos
                    </Link>
                    {['ADMIN', 'GERENTE', 'OPERADOR'].includes(usuario.rol) && (
                      <>
                        <hr className="my-1" />
                        <Link href="/admin" className="flex items-center gap-3 px-4 py-2.5 text-teal hover:bg-crema text-sm font-medium transition-colors">
                          Panel Admin
                        </Link>
                      </>
                    )}
                    <hr className="my-1" />
                    <button
                      onClick={cerrarSesion}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 text-sm transition-colors text-left"
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Link
                    href="/auth/iniciar-sesion"
                    className="text-crema hover:text-dorado text-sm font-medium transition-colors px-2"
                  >
                    Iniciar Sesión
                  </Link>
                  <Link
                    href="/auth/registrar"
                    className="bg-dorado text-azul-oscuro text-sm font-semibold px-4 py-2 rounded-lg hover:bg-dorado-claro transition-colors"
                  >
                    Registrarse
                  </Link>
                </div>
              )}

              {/* Menú móvil */}
              <button
                onClick={() => setMenuAbierto(!menuAbierto)}
                className="md:hidden p-2.5 text-crema"
              >
                {menuAbierto ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Menú de categorías */}
        <div className="bg-azul-oscuro border-t border-white border-opacity-10 hidden md:block">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center gap-1">
              {categoriasPadre.map((cat) => (
                <div key={cat.id} className="relative group">
                  <Link
                    href={`/productos?categoria=${cat.slug}`}
                    className="px-4 py-2.5 text-crema text-sm hover:text-dorado hover:bg-white hover:bg-opacity-5 transition-all duration-200 rounded flex items-center gap-1"
                  >
                    {cat.nombre}
                    {cat.subcategorias && cat.subcategorias.length > 0 && (
                      <ChevronDown size={12} />
                    )}
                  </Link>
                  {cat.subcategorias && cat.subcategorias.length > 0 && (
                    <div className="absolute left-0 mt-0 w-56 bg-white rounded-b-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2 z-50">
                      {cat.subcategorias.map((subcat) => (
                        <Link
                          key={subcat.id}
                          href={`/productos?categoria=${subcat.slug}`}
                          className="flex items-center gap-2 px-4 py-2.5 text-azul-oscuro hover:bg-crema text-sm transition-colors"
                        >
                          {subcat.nombre}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <Link
                href="/ofertas"
                className="px-4 py-2.5 text-dorado text-sm font-semibold hover:bg-white hover:bg-opacity-5 transition-all duration-200 rounded ml-auto flex items-center gap-1"
              >
                🔥 Ofertas
              </Link>
            </div>
          </div>
        </div>

        {/* Menú móvil expandido */}
        {menuAbierto && (
          <div className="md:hidden bg-azul-corp border-t border-white border-opacity-10 px-4 py-4">
            <form onSubmit={buscar} className="flex mb-4">
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar productos..."
                className="flex-1 px-4 py-2 text-sm rounded-l-lg border-0 focus:outline-none text-azul-oscuro"
              />
              <button type="submit" className="bg-dorado px-4 rounded-r-lg">
                <Search size={16} className="text-azul-oscuro" />
              </button>
            </form>
            <div className="grid grid-cols-2 gap-2">
              {categoriasPadre.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/productos?categoria=${cat.slug}`}
                  onClick={() => setMenuAbierto(false)}
                  className="text-crema text-sm py-2 px-3 rounded-lg bg-white bg-opacity-10 hover:bg-opacity-20 transition-colors"
                >
                  {cat.nombre}
                </Link>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              {usuario ? (
                <button onClick={cerrarSesion} className="flex-1 text-red-400 text-sm py-2 text-center">
                  Cerrar Sesión
                </button>
              ) : (
                <>
                  <Link href="/auth/iniciar-sesion" onClick={() => setMenuAbierto(false)} className="flex-1 btn-outline text-center text-sm py-2 text-crema border-crema">
                    Iniciar Sesión
                  </Link>
                  <Link href="/auth/registrar" onClick={() => setMenuAbierto(false)} className="flex-1 btn-primario text-center text-sm py-2">
                    Registrarse
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
