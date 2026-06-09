import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
  withCredentials: true,
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

const get = async (url: string, config?: any): Promise<any> => api.get(url, config);
const post = async (url: string, data?: any, config?: any): Promise<any> => api.post(url, data, config);
const put = async (url: string, data?: any, config?: any): Promise<any> => api.put(url, data, config);
const patch = async (url: string, data?: any, config?: any): Promise<any> => api.patch(url, data, config);
const del = async (url: string, config?: any): Promise<any> => api.delete(url, config);

export const authAPI = {
  registrar: (datos: any) => post('/auth/registrar', datos),
  iniciarSesion: (datos: any) => post('/auth/iniciar-sesion', datos),
  perfil: () => get('/auth/perfil'),
};

export const productosAPI = {
  listar: (params?: any) => get('/productos', { params }),
  listarAdmin: (params?: any) => get('/productos/admin/todos', { params }),
  obtener: (slug: string) => get(`/productos/slug/${slug}`),
  obtenerPorId: (id: number) => get(`/productos/${id}`),
  destacados: () => get('/productos/destacados'),
  ofertas: () => get('/productos/ofertas'),
  crear: (datos: any) => post('/productos', datos),
  actualizar: (id: number, datos: any) => put(`/productos/${id}`, datos),
  toggleActivo: (id: number) => patch(`/productos/${id}/toggle-activo`),
  eliminar: (id: number) => del(`/productos/${id}`),
};

export const categoriasAPI = {
  listar: (params?: any) => get('/categorias', { params }),
  listarPadres: (params?: any) => get('/categorias/padres', { params }),
  listarAdmin: () => get('/categorias/admin/todos'),
  listarPadresAdmin: () => get('/categorias/admin/padres'),
  obtener: (id: number) => get(`/categorias/${id}`),
  crear: (datos: any) => post('/categorias', datos),
  actualizar: (id: number, datos: any) => put(`/categorias/${id}`, datos),
  toggleActiva: (id: number) => patch(`/categorias/${id}/toggle-activa`),
  eliminar: (id: number) => del(`/categorias/${id}`),
};

export const coloresAPI = {
  listar: (params?: any) => get('/colores', { params }),
  listarAdmin: () => get('/colores/admin/todos'),
  obtener: (id: number) => get(`/colores/${id}`),
  crear: (datos: any) => post('/colores', datos),
  actualizar: (id: number, datos: any) => put(`/colores/${id}`, datos),
  toggleActiva: (id: number) => patch(`/colores/${id}/toggle-activa`),
  eliminar: (id: number) => del(`/colores/${id}`),
};

export const sizeCollectionsAPI = {
  listar: (params?: any) => get('/tallas-colecciones', { params }),
  listarAdmin: () => get('/tallas-colecciones/admin/todos'),
  obtener: (id: number) => get(`/tallas-colecciones/${id}`),
  crear: (datos: any) => post('/tallas-colecciones', datos),
  actualizar: (id: number, datos: any) => put(`/tallas-colecciones/${id}`, datos),
  toggleActiva: (id: number) => patch(`/tallas-colecciones/${id}/toggle-activa`),
  eliminar: (id: number) => del(`/tallas-colecciones/${id}`),
};

export const sizesAPI = {
  listar: (params?: any) => get('/tallas', { params }),
  listarAdmin: () => get('/tallas/admin/todos'),
  obtener: (id: number) => get(`/tallas/${id}`),
  crear: (datos: any) => post('/tallas', datos),
  actualizar: (id: number, datos: any) => put(`/tallas/${id}`, datos),
  toggleActiva: (id: number) => patch(`/tallas/${id}/toggle-activa`),
  eliminar: (id: number) => del(`/tallas/${id}`),
};

export const pedidosAPI = {
  crear: (datos: any) => post('/pedidos', datos),
  listarMios: () => get('/pedidos/mis-pedidos'),
  obtener: (id: number) => get(`/pedidos/${id}`),
  listarAdmin: (params?: any) => get('/pedidos/admin', { params }),
  actualizarEstado: (id: number, datos: any) => patch(`/pedidos/${id}/estado`, datos),
};

export const usuariosAPI = {
  listar: () => get('/usuarios'),
  actualizarPerfil: (datos: any) => patch('/usuarios/perfil', datos),
  obtenerCarrito: () => get('/usuarios/carrito'),
  agregarCarrito: (productoId: number, varianteId: number, cantidad = 1) =>
    patch('/usuarios/carrito', { productoId, varianteId, cantidad }),
  listarDirecciones: () => get('/usuarios/direcciones'),
};

export const proveedoresAPI = {
  listar: () => get('/proveedores'),
  crear: (datos: any) => post('/proveedores', datos),
  listarOrdenes: () => get('/proveedores/ordenes'),
  crearOrden: (datos: any) => post('/proveedores/ordenes', datos),
};

export const inventarioAPI = {
  stockBajo: () => get('/inventario/stock-bajo'),
  movimientos: (productoId?: number) =>
    get('/inventario/movimientos', { params: { productoId } }),
  ajustar: (datos: any) => post('/inventario/ajustar', datos),
};

export const soporteAPI = {
  crearTicket: (datos: any) => post('/soporte/tickets', datos),
  misTickets: () => get('/soporte/mis-tickets'),
  listarAdmin: () => get('/soporte/admin/tickets'),
  responder: (id: number, mensaje: string) =>
    post(`/soporte/tickets/${id}/responder`, { mensaje }),
  actualizarEstado: (id: number, estado: string) =>
    patch(`/soporte/tickets/${id}/estado`, { estado }),
};

export const reportesAPI = {
  dashboard: () => get('/reportes/dashboard'),
  ventasPorDia: () => get('/reportes/ventas-por-dia'),
  masVendidos: () => get('/reportes/productos-mas-vendidos'),
};

export default api;
