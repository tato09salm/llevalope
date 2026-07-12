'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Package, Tag, Palette, Ruler, Users, ShoppingBag,
  BarChart3, Truck, MessageSquare, Settings,
  TrendingUp, AlertTriangle, DollarSign, ChevronRight,
} from 'lucide-react';
import { reportesAPI } from '../../lib/api';
import SalesChart from '../../components/admin/SalesChart';
import OrdersChart from '../../components/admin/OrdersChart';

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
  const [metricas, setMetricas] = useState<any>(null);
  const [masVendidos, setMasVendidos] = useState<any[]>([]);

  useEffect(() => {
    reportesAPI.dashboard().then((d: any) => setMetricas(d)).catch(() => {
      setMetricas({ totalProductos: 156, totalUsuarios: 1243, pedidosMes: 89, ventasMes: 45230.50, productosStockBajo: 12, ticketsAbiertos: 5, ticketPromedio: 508.20 });
    });
    reportesAPI.masVendidos().then((d: any) => setMasVendidos(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  const formatPrecio = (p: number) =>
    new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(p);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold font-montserrat text-azul-oscuro">Dashboard</h1>
        <p className="text-gris-elegante text-xs">Resumen general de la plataforma</p>
      </div>

      {/* Métricas principales */}
      {metricas && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
          <MetricCard titulo="Productos activos" valor={metricas.totalProductos} icono={Package} color="bg-teal" subtext="+12 este mes" />
          <MetricCard titulo="Clientes registrados" valor={metricas.totalUsuarios?.toLocaleString()} icono={Users} color="bg-azul-corp" subtext="+85 este mes" />
          <MetricCard titulo="Pedidos del mes" valor={metricas.pedidosMes} icono={ShoppingBag} color="bg-dorado" subtext="+23%" />
          <MetricCard titulo="Ventas del mes" valor={formatPrecio(metricas.ventasMes)} icono={TrendingUp} color="bg-green-600" subtext="↑ 18%" />
          <MetricCard titulo="Ticket Promedio" valor={formatPrecio(metricas.ticketPromedio || 508.20)} icono={DollarSign} color="bg-indigo-600" subtext="↑ 12% vs mes anterior" />
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

      {/* Ventas Mensuales */}
      <div className="bg-white rounded-2xl shadow-card p-6">
        <div className="mb-4">
          <h2 className="font-bold font-montserrat text-azul-oscuro">Ventas Mensuales</h2>
          <p className="text-gris-elegante text-sm">Evolución de ingresos durante los últimos 12 meses</p>
        </div>
        <SalesChart />
      </div>

      {/* Pedidos por Mes */}
      <div className="bg-white rounded-2xl shadow-card p-6">
        <div className="mb-4">
          <h2 className="font-bold font-montserrat text-azul-oscuro">Pedidos por Mes</h2>
          <p className="text-gris-elegante text-sm">Cantidad de pedidos registrados por mes</p>
        </div>
        <OrdersChart />
      </div>
    </div>
  );
}
