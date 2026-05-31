import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Interceptor: agregar token JWT
api.interceptors.request.use((config) => {
  const token = Cookies.get('llevalope_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor: manejar respuestas
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('llevalope_token');
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/iniciar-sesion';
      }
    }
    return Promise.reject(error.response?.data || error);
  },
);

// ========================
// SERVICIOS API
// ========================

export const authAPI = {
  registrar: (datos: any) => api.post('/auth/registrar', datos),
  iniciarSesion: (datos: any) => api.post('/auth/iniciar-sesion', datos),
  perfil: () => api.get('/auth/perfil'),
};

export const productosAPI = {
  listar: (params?: any) => api.get('/productos', { params }),
  obtener: (slug: string) => api.get(`/productos/slug/${slug}`),
  obtenerPorId: (id: number) => api.get(`/productos/${id}`),
  destacados: () => api.get('/productos/destacados'),
  ofertas: () => api.get('/productos/ofertas'),
  crear: (datos: any) => api.post('/productos', datos),
  actualizar: (id: number, datos: any) => api.put(`/productos/${id}`, datos),
  toggleActivo: (id: number) => api.patch(`/productos/${id}/toggle-activo`),
  eliminar: (id: number) => api.delete(`/productos/${id}`),
};

export const categoriasAPI = {
  listar: (params?: any) => api.get('/categorias', { params }),
  listarPadres: (params?: any) => api.get('/categorias/padres', { params }),
  obtener: (id: number) => api.get(`/categorias/${id}`),
  crear: (datos: any) => api.post('/categorias', datos),
  actualizar: (id: number, datos: any) => api.put(`/categorias/${id}`, datos),
  toggleActiva: (id: number) => api.patch(`/categorias/${id}/toggle-activa`),
  eliminar: (id: number) => api.delete(`/categorias/${id}`),
};

export const coloresAPI = {
  listar: (params?: any) => api.get('/colores', { params }),
  obtener: (id: number) => api.get(`/colores/${id}`),
  crear: (datos: any) => api.post('/colores', datos),
  actualizar: (id: number, datos: any) => api.put(`/colores/${id}`, datos),
  toggleActiva: (id: number) => api.patch(`/colores/${id}/toggle-activa`),
  eliminar: (id: number) => api.delete(`/colores/${id}`),
};

export const sizeCollectionsAPI = {
  listar: (params?: any) => api.get('/tallas-colecciones', { params }),
  obtener: (id: number) => api.get(`/tallas-colecciones/${id}`),
  crear: (datos: any) => api.post('/tallas-colecciones', datos),
  actualizar: (id: number, datos: any) => api.put(`/tallas-colecciones/${id}`, datos),
  toggleActiva: (id: number) => api.patch(`/tallas-colecciones/${id}/toggle-activa`),
  eliminar: (id: number) => api.delete(`/tallas-colecciones/${id}`),
};

export const sizesAPI = {
  listar: (params?: any) => api.get('/tallas', { params }),
  obtener: (id: number) => api.get(`/tallas/${id}`),
  crear: (datos: any) => api.post('/tallas', datos),
  actualizar: (id: number, datos: any) => api.put(`/tallas/${id}`, datos),
  toggleActiva: (id: number) => api.patch(`/tallas/${id}/toggle-activa`),
  eliminar: (id: number) => api.delete(`/tallas/${id}`),
};

export const pedidosAPI = {
  crear: (datos: any) => api.post('/pedidos', datos),
  listarMios: () => api.get('/pedidos/mis-pedidos'),
  obtener: (id: number) => api.get(`/pedidos/${id}`),
  listarAdmin: (params?: any) => api.get('/pedidos/admin', { params }),
  actualizarEstado: (id: number, datos: any) => api.patch(`/pedidos/${id}/estado`, datos),
};

export const usuariosAPI = {
  listar: () => api.get('/usuarios'),
  actualizarPerfil: (datos: any) => api.patch('/usuarios/perfil', datos),
  obtenerCarrito: () => api.get('/usuarios/carrito'),
  agregarCarrito: (productoId: number, varianteId: number, cantidad = 1) =>
    api.patch('/usuarios/carrito', { productoId, varianteId, cantidad }),
  listarDirecciones: () => api.get('/usuarios/direcciones'),
};

export const proveedoresAPI = {
  listar: () => api.get('/proveedores'),
  crear: (datos: any) => api.post('/proveedores', datos),
  listarOrdenes: () => api.get('/proveedores/ordenes'),
  crearOrden: (datos: any) => api.post('/proveedores/ordenes', datos),
};

export const inventarioAPI = {
  stockBajo: () => api.get('/inventario/stock-bajo'),
  movimientos: (productoId?: number) =>
    api.get('/inventario/movimientos', { params: { productoId } }),
  ajustar: (datos: any) => api.post('/inventario/ajustar', datos),
};

export const soporteAPI = {
  crearTicket: (datos: any) => api.post('/soporte/tickets', datos),
  misTickets: () => api.get('/soporte/mis-tickets'),
  listarAdmin: () => api.get('/soporte/admin/tickets'),
  responder: (id: number, mensaje: string) =>
    api.post(`/soporte/tickets/${id}/responder`, { mensaje }),
  actualizarEstado: (id: number, estado: string) =>
    api.patch(`/soporte/tickets/${id}/estado`, { estado }),
};

export const reportesAPI = {
  dashboard: () => api.get('/reportes/dashboard'),
  ventasPorDia: () => api.get('/reportes/ventas-por-dia'),
  masVendidos: () => api.get('/reportes/productos-mas-vendidos'),
};

export default api;
