import {
  LayoutDashboard,
  Package,
  Tag,
  Palette,
  Ruler,
  Users,
  ShoppingBag,
  BarChart3,
  Truck,
  MessageSquare,
  TrendingUp,
  Settings,
} from 'lucide-react';

export const adminMenuItems = [
  { icono: LayoutDashboard, label: 'Dashboard', ruta: '/admin', color: 'text-teal' },
  { icono: Package, label: 'Productos', ruta: '/admin/productos', color: 'text-blue-500' },
  { icono: Tag, label: 'Categorias', ruta: '/admin/categorias', color: 'text-purple-500' },
  { icono: Palette, label: 'Colores', ruta: '/admin/colores', color: 'text-pink-500' },
  { icono: Ruler, label: 'Tallas', ruta: '/admin/tallas', color: 'text-cyan-500' },
  { icono: Users, label: 'Clientes', ruta: '/admin/clientes', color: 'text-green-500' },
  { icono: ShoppingBag, label: 'Pedidos', ruta: '/admin/pedidos', color: 'text-orange-500' },
  { icono: Truck, label: 'Proveedores', ruta: '/admin/proveedores', color: 'text-teal' },
  { icono: BarChart3, label: 'Inventario', ruta: '/admin/inventario', color: 'text-yellow-500' },
  { icono: MessageSquare, label: 'Soporte', ruta: '/admin/soporte', color: 'text-red-500' },
  { icono: TrendingUp, label: 'Reportes', ruta: '/admin/reportes', color: 'text-indigo-500' },
  { icono: Settings, label: 'Configuracion', ruta: '/admin/configuracion', color: 'text-gris-elegante' },
] as const;
