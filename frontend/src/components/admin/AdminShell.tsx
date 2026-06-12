'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChevronRight,
  LogOut,
  Menu,
  ShoppingCart,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import { adminMenuItems } from './admin-menu';

interface AdminShellProps {
  title: string;
  description?: string;
  icon: LucideIcon;
  actions?: ReactNode;
  children: ReactNode;
}

export default function AdminShell({
  title,
  description,
  icon: Icon,
  actions,
  children,
}: AdminShellProps) {
  const pathname = usePathname();
  const { usuario, cerrarSesion } = useAuthStore();
  const [sidebarAbierto, setSidebarAbierto] = useState(false);

  return (
    <div className="flex min-h-screen bg-crema">
      {sidebarAbierto && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarAbierto(false)}
        />
      )}

      <aside
        className={`fixed md:sticky top-0 h-screen bg-azul-oscuro text-white w-64 z-50 flex flex-col transition-transform duration-300 ${
          sidebarAbierto ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between md:block">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-dorado rounded-lg flex items-center justify-center">
                <ShoppingCart size={16} className="text-azul-oscuro" />
              </div>
              <span className="font-montserrat font-bold">
                Lleva<span className="text-dorado">lo</span>Pe
              </span>
            </Link>
            <button onClick={() => setSidebarAbierto(false)} className="md:hidden p-1 rounded-lg">
              <X size={18} />
            </button>
          </div>
          <p className="text-xs text-white/50 mt-1">Panel Administrativo</p>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <p className="text-xs text-white/40 uppercase tracking-widest mb-3 px-2">Menu</p>
          <div className="space-y-1">
            {adminMenuItems.map(({ icono: ItemIcon, label, ruta, color }) => {
              const activo = pathname === ruta || pathname.startsWith(`${ruta}/`);
              return (
                <Link
                  key={ruta}
                  href={ruta}
                  onClick={() => setSidebarAbierto(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                    activo ? 'bg-white/10' : 'hover:bg-white/10'
                  }`}
                >
                  <ItemIcon size={18} className={color} />
                  <span className="text-sm font-medium text-white/85 group-hover:text-white">
                    {label}
                  </span>
                  <ChevronRight size={14} className="ml-auto text-white/30 group-hover:text-white/60" />
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-dorado rounded-full flex items-center justify-center font-bold text-azul-oscuro text-sm">
              {usuario?.nombre?.[0] || 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {usuario?.nombre} {usuario?.apellido}
              </p>
              <p className="text-xs text-white/50">{usuario?.rol}</p>
            </div>
          </div>
          <button
            onClick={cerrarSesion}
            className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm w-full px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
          >
            <LogOut size={16} /> Cerrar Sesion
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 overflow-hidden">
        <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-4">
          <button onClick={() => setSidebarAbierto(true)} className="md:hidden p-2 rounded-lg hover:bg-crema">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-teal/10 flex items-center justify-center shrink-0">
              <Icon size={20} className="text-teal" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold font-montserrat text-azul-oscuro truncate">{title}</h1>
              {description && <p className="text-gris-elegante text-xs">{description}</p>}
            </div>
          </div>
          {actions && <div className="ml-auto flex items-center gap-3">{actions}</div>}
        </div>

        <div className="p-6 space-y-6 overflow-y-auto">{children}</div>
      </main>
    </div>
  );
}
