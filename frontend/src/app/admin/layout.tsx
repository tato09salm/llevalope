'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  LayoutDashboard, Package, Tag, Palette, Ruler, Users, ShoppingBag,
  BarChart3, Truck, MessageSquare, Settings, LogOut,
  TrendingUp, Menu, X, ChevronRight, ShoppingCart
} from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';

const menuItems = [
  { icono: LayoutDashboard, label: 'Dashboard', ruta: '/admin', color: 'text-teal' },
  { icono: Package, label: 'Productos', ruta: '/admin/productos', color: 'text-blue-500' },
  { icono: Tag, label: 'Categorías', ruta: '/admin/categorias', color: 'text-purple-500' },
  { icono: Palette, label: 'Colores', ruta: '/admin/colores', color: 'text-pink-500' },
  { icono: Ruler, label: 'Tallas', ruta: '/admin/tallas', color: 'text-cyan-500' },
  { icono: Users, label: 'Clientes', ruta: '/admin/clientes', color: 'text-green-500' },
  { icono: ShoppingBag, label: 'Pedidos', ruta: '/admin/pedidos', color: 'text-orange-500' },
  { icono: Truck, label: 'Proveedores', ruta: '/admin/proveedores', color: 'text-teal' },
  { icono: BarChart3, label: 'Inventario', ruta: '/admin/inventario', color: 'text-yellow-500' },
  { icono: MessageSquare, label: 'Soporte', ruta: '/admin/soporte', color: 'text-red-500' },
  { icono: TrendingUp, label: 'Reportes', ruta: '/admin/reportes', color: 'text-indigo-500' },
  { icono: Settings, label: 'Configuración', ruta: '/admin/configuracion', color: 'text-gris-elegante' },
];

function Sidebar({ sidebarAbierto, setSidebarAbierto, currentPath }: any) {
  const { usuario, cerrarSesion } = useAuthStore();

  return (
    <>
      {/* Overlay móvil */}
      {sidebarAbierto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={() => setSidebarAbierto(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:sticky top-0 h-screen bg-azul-oscuro text-white w-64 z-50 flex flex-col transition-transform duration-300 ${sidebarAbierto ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        {/* Logo */}
        <div className="p-6 border-b border-white border-opacity-10">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-dorado rounded-lg flex items-center justify-center">
              <ShoppingCart size={16} className="text-azul-oscuro" />
            </div>
            <span className="font-montserrat font-bold">Lleva<span className="text-dorado">lo</span>Pe</span>
          </Link>
          <p className="text-xs text-white text-opacity-50 mt-1">Panel Administrativo</p>
        </div>

        {/* Navegación */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <p className="text-xs text-white text-opacity-40 uppercase tracking-widest mb-3 px-2">Menú</p>
          <div className="space-y-1">
            {menuItems.map(({ icono: Icono, label, ruta, color }) => {
              const isActive = currentPath === ruta;
              return (
                <Link
                  key={ruta}
                  href={ruta}
                  onClick={() => setSidebarAbierto(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${isActive ? 'bg-white bg-opacity-10' : 'hover:bg-white hover:bg-opacity-10'}`}
                >
                  <Icono size={18} className={isActive ? color.replace('text-', 'text-white') : color} />
                  <span className={`text-sm font-medium text-white ${isActive ? 'opacity-100' : 'opacity-80 group-hover:text-white'}`}>
                    {label}
                  </span>
                  <ChevronRight size={14} className={`ml-auto text-white opacity-30 ${isActive ? 'opacity-60' : 'group-hover:text-opacity-60'}`} />
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Usuario */}
        <div className="p-4 border-t border-white border-opacity-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-dorado rounded-full flex items-center justify-center font-bold text-azul-oscuro text-sm">
              {usuario?.nombre[0]}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{usuario?.nombre} {usuario?.apellido}</p>
              <p className="text-xs text-white text-opacity-50">{usuario?.rol}</p>
            </div>
          </div>
          <button
            onClick={cerrarSesion}
            className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm w-full px-2 py-1.5 rounded-lg hover:bg-white hover:bg-opacity-5 transition-colors"
          >
            <LogOut size={16} /> Cerrar Sesión
          </button>
        </div>
      </aside>
    </>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { usuario, cargarPerfil } = useAuthStore();
  const [verificando, setVerificando] = useState(true);
  const [sidebarAbierto, setSidebarAbierto] = useState(false);

  const rolesPermitidos = useMemo(() => new Set(['ADMIN', 'GERENTE', 'OPERADOR']), []);

  useEffect(() => {
    (async () => {
      await cargarPerfil();
      setVerificando(false);
    })();
  }, [cargarPerfil]);

  useEffect(() => {
    if (verificando) return;

    if (!usuario) {
      router.replace('/auth/iniciar-sesion');
      return;
    }

    if (!rolesPermitidos.has(usuario.rol)) {
      router.replace('/');
    }
  }, [router, rolesPermitidos, usuario, verificando]);

  if (verificando) {
    return (
      <div className="min-h-screen bg-crema flex items-center justify-center">
        <Loader2 size={36} className="animate-spin text-teal" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-crema">
      <Sidebar sidebarAbierto={sidebarAbierto} setSidebarAbierto={setSidebarAbierto} currentPath={pathname} />

      {/* Contenido principal */}
      <main className="flex-1 min-w-0">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-4 sticky top-0 z-30">
          <button onClick={() => setSidebarAbierto(true)} className="md:hidden p-2 rounded-lg hover:bg-crema">
            <Menu size={20} />
          </button>
          <div className="ml-auto flex items-center gap-3">
            <Link href="/" className="text-sm text-teal hover:underline">← Ver tienda</Link>
          </div>
        </div>

        <div className="p-0">
          {children}
        </div>
      </main>
    </div>
  );
}

