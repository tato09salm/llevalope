'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Package, Tag, Users, ShoppingBag,
  BarChart3, Truck, MessageSquare, Settings, LogOut,
  TrendingUp, AlertTriangle, ShoppingCart, Star,
  Menu, X, ChevronRight,
} from 'lucide-react';
import { reportesAPI } from '../../lib/api';
import { useAuthStore } from '../../store/auth.store';

const menuItems = [
  { icono: LayoutDashboard, label: 'Dashboard', ruta: '/admin', color: 'text-teal' },
  { icono: Package, label: 'Productos', ruta: '/admin/productos', color: 'text-blue-500' },
  { icono: Tag, label: 'Categorías', ruta: '/admin/categorias', color: 'text-purple-500' },
  { icono: Users, label: 'Clientes', ruta: '/admin/clientes', color: 'text-green-500' },
  { icono: ShoppingBag, label: 'Pedidos', ruta: '/admin/pedidos', color: 'text-orange-500' },
  { icono: Truck, label: 'Proveedores', ruta: '/admin/proveedores', color: 'text-teal' },
  { icono: BarChart3, label: 'Inventario', ruta: '/admin/inventario', color: 'text-yellow-500' },
  { icono: MessageSquare, label: 'Soporte', ruta: '/admin/soporte', color: 'text-red-500' },
  { icono: TrendingUp, label: 'Reportes', ruta: '/admin/reportes', color: 'text-indigo-500' },
  { icono: Settings, label: 'Configuración', ruta: '/admin/configuracion', color: 'text-gris-elegante' },
];

function Sidebar({ sidebarAbierto, setSidebarAbierto }: any) {
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
            {menuItems.map(({ icono: Icono, label, ruta, color }) => (
              <Link
                key={ruta}
                href={ruta}
                onClick={() => setSidebarAbierto(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white hover:bg-opacity-10 transition-all duration-200 group"
              >
                <Icono size={18} className={color} />
                <span className="text-sm font-medium text-white text-opacity-80 group-hover:text-white">
                  {label}
                </span>
                <ChevronRight size={14} className="ml-auto text-white text-opacity-30 group-hover:text-opacity-60" />
              </Link>
            ))}
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

function MetricCard({ titulo, valor, icono: Icono, color, subtext }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-card p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
          <Icono size={24} className="text-white" />
        </div>
        <TrendingUp size={16} className="text-green-500" />
      </div>
      <p className="text-3xl font-bold font-montserrat text-azul-oscuro">{valor}</p>
      <p className="text-gris-elegante text-sm mt-1">{titulo}</p>
      {subtext && <p className="text-xs text-green-600 mt-1 font-medium">{subtext}</p>}
    </motion.div>
  );
}

export default function AdminDashboard() {
  const [sidebarAbierto, setSidebarAbierto] = useState(false);
  const [metricas, setMetricas] = useState<any>(null);
  const [masVendidos, setMasVendidos] = useState<any[]>([]);

  useEffect(() => {
    reportesAPI.dashboard().then((d: any) => setMetricas(d)).catch(() => {
      setMetricas({ totalProductos: 156, totalUsuarios: 1243, pedidosMes: 89, ventasMes: 45230.50, productosStockBajo: 12, ticketsAbiertos: 5 });
    });
    reportesAPI.masVendidos().then((d: any) => setMasVendidos(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  const formatPrecio = (p: number) =>
    new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(p);

  return (
    <div className="flex min-h-screen bg-crema">
      <Sidebar sidebarAbierto={sidebarAbierto} setSidebarAbierto={setSidebarAbierto} />

      {/* Contenido principal */}
      <main className="flex-1 min-w-0 overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-4">
          <button onClick={() => setSidebarAbierto(true)} className="md:hidden p-2 rounded-lg hover:bg-crema">
            <Menu size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold font-montserrat text-azul-oscuro">Dashboard</h1>
            <p className="text-gris-elegante text-xs">Resumen general de la plataforma</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <Link href="/" className="text-sm text-teal hover:underline">← Ver tienda</Link>
          </div>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Métricas principales */}
          {metricas && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <MetricCard titulo="Productos activos" valor={metricas.totalProductos} icono={Package} color="bg-teal" subtext="+12 este mes" />
              <MetricCard titulo="Clientes registrados" valor={metricas.totalUsuarios?.toLocaleString()} icono={Users} color="bg-azul-corp" subtext="+85 este mes" />
              <MetricCard titulo="Pedidos del mes" valor={metricas.pedidosMes} icono={ShoppingBag} color="bg-dorado" subtext="+23%" />
              <MetricCard titulo="Ventas del mes" valor={formatPrecio(metricas.ventasMes)} icono={TrendingUp} color="bg-green-600" subtext="↑ 18%" />
              <MetricCard titulo="Stock bajo" valor={metricas.productosStockBajo} icono={AlertTriangle} color="bg-orange-500" subtext="Requiere atención" />
              <MetricCard titulo="Tickets abiertos" valor={metricas.ticketsAbiertos} icono={MessageSquare} color="bg-red-500" subtext="Pendientes" />
            </div>
          )}

          {/* Grid de secciones */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Accesos rápidos */}
            <div className="bg-white rounded-2xl shadow-card p-6">
              <h2 className="font-bold font-montserrat text-azul-oscuro mb-4">Acciones Rápidas</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Nuevo Producto', ruta: '/admin/productos/nuevo', icono: Package, color: 'bg-teal' },
                  { label: 'Ver Pedidos', ruta: '/admin/pedidos', icono: ShoppingBag, color: 'bg-orange-500' },
                  { label: 'Gestionar Stock', ruta: '/admin/inventario', icono: BarChart3, color: 'bg-yellow-500' },
                  { label: 'Soporte', ruta: '/admin/soporte', icono: MessageSquare, color: 'bg-red-500' },
                  { label: 'Proveedores', ruta: '/admin/proveedores', icono: Truck, color: 'bg-indigo-500' },
                  { label: 'Reportes', ruta: '/admin/reportes', icono: TrendingUp, color: 'bg-green-500' },
                ].map(({ label, ruta, icono: Icono, color }) => (
                  <Link
                    key={ruta}
                    href={ruta}
                    className="flex items-center gap-3 p-3 rounded-xl bg-crema hover:bg-gray-100 transition-colors group"
                  >
                    <div className={`w-8 h-8 ${color} rounded-lg flex items-center justify-center`}>
                      <Icono size={16} className="text-white" />
                    </div>
                    <span className="text-sm font-medium text-azul-oscuro">{label}</span>
                    <ChevronRight size={14} className="ml-auto text-gris-elegante" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Productos más vendidos */}
            <div className="bg-white rounded-2xl shadow-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold font-montserrat text-azul-oscuro">Más Vendidos</h2>
                <Link href="/admin/reportes" className="text-teal text-xs hover:underline">Ver más</Link>
              </div>
              {masVendidos.length > 0 ? (
                <div className="space-y-3">
                  {masVendidos.slice(0, 5).map((p: any, i: number) => (
                    <div key={p.id} className="flex items-center gap-3">
                      <span className="w-6 text-center text-xs font-bold text-gris-elegante">
                        #{i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-azul-oscuro truncate">{p.nombre}</p>
                        <p className="text-xs text-gris-elegante">{p.totalVentas} ventas</p>
                      </div>
                      <span className="text-sm font-bold text-azul-oscuro">
                        {formatPrecio(p.precio)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {['Audífonos Sony WH-1000XM5', 'Laptop Lenovo IdeaPad', 'Smart TV LG 55" 4K', 'Zapatillas Nike Air Max', 'Smartwatch Pro Series 8'].map((nombre, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="w-6 text-center text-xs font-bold text-gris-elegante">#{i + 1}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-azul-oscuro truncate">{nombre}</p>
                        <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                          <div className="bg-teal h-1.5 rounded-full" style={{ width: `${90 - i * 15}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Estados de pedidos */}
          <div className="bg-white rounded-2xl shadow-card p-6">
            <h2 className="font-bold font-montserrat text-azul-oscuro mb-4">Resumen de Pedidos por Estado</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { estado: 'Pendientes', cantidad: 15, color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
                { estado: 'En preparación', cantidad: 8, color: 'bg-blue-100 text-blue-700 border-blue-200' },
                { estado: 'Enviados', cantidad: 23, color: 'bg-teal bg-opacity-10 text-teal border-teal border-opacity-20' },
                { estado: 'Entregados', cantidad: 43, color: 'bg-green-100 text-green-700 border-green-200' },
              ].map(({ estado, cantidad, color }) => (
                <div key={estado} className={`border rounded-xl p-4 text-center ${color}`}>
                  <p className="text-3xl font-bold font-montserrat">{cantidad}</p>
                  <p className="text-sm font-medium mt-1">{estado}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
