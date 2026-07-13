import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

console.log('[API Config] URL base:', API_URL);

// Configuración de reintentos
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 segundo

// Función para esperar
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Función para verificar si un error debe ser reintentado
const shouldRetry = (error: AxiosError, retryCount: number): boolean => {
  if (retryCount >= MAX_RETRIES) return false;
  
  // Reintentar errores de red (sin respuesta)
  if (!error.response) return true;
  
  // Reintentar errores 5xx (error del servidor)
  if (error.response.status >= 500) return true;
  
  // Reintentar timeout
  if (error.code === 'ECONNABORTED') return true;
  
  return false;
};

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000, // Reducir a 15 segundos para detectar problemas más rápido
  withCredentials: true,
});

// Interceptor: agregar token JWT y log de request
api.interceptors.request.use((config) => {
  console.log('[API Request]', config.method?.toUpperCase(), config.url);
  const token = Cookies.get('llevalope_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  console.error('[API Request Error]', error);
  return Promise.reject(error);
});

// Interceptor: manejar respuestas y errores detallados con reintentos
api.interceptors.response.use(
  (response) => {
    console.log('[API Response]', response.status, response.config.url);
    // Si es blob, retornar toda la respuesta para acceder a .data
    if (response.config.responseType === 'blob') {
      return response;
    }
    return response.data;
  },
  async (error: AxiosError) => {
    const config = error.config as AxiosRequestConfig & { _retryCount?: number };
    config._retryCount = config._retryCount || 0;

    console.error('[API Error] Objeto de error completo:', error);
    console.error('[API Error] Detalles:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: config?.url,
      data: error.response?.data,
      headers: error.response?.headers,
      request: error.request,
      retryCount: config._retryCount,
    });

    // Verificar si debemos reintentar
    if (shouldRetry(error, config._retryCount)) {
      config._retryCount += 1;
      console.log(`[API Retry] Reintentando ${config.url} (${config._retryCount}/${MAX_RETRIES})...`);
      
      await delay(RETRY_DELAY * config._retryCount); // Backoff exponencial simple
      return api(config);
    }

    if (error.response?.status === 401) {
      Cookies.remove('llevalope_token');
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/iniciar-sesion';
      }
    }
    
    // If it's a blob error, we can't parse JSON, reject with a useful error
    if (config?.responseType === 'blob') {
      console.error('[API Interceptor] Error en respuesta blob:', error);
      return Promise.reject(new Error('Error al descargar el archivo. Por favor intenta nuevamente.'));
    }

    // Mejorar el mensaje de error para el usuario
    let userMessage = 'Ocurrió un error inesperado';
    
    if (!error.response) {
      // Error de red (no hay respuesta del servidor)
      if (error.code === 'ECONNABORTED') {
        userMessage = 'Tiempo de espera agotado. Por favor verifica tu conexión e intenta nuevamente.';
      } else {
        userMessage = 'No se pudo conectar con el servidor. Por favor verifica que el backend esté activo y tu conexión a internet.';
      }
    } else if (error.response.status >= 500) {
      userMessage = 'Error interno del servidor. Por favor intenta nuevamente más tarde.';
    } else {
      userMessage = (error.response.data as any)?.message || userMessage;
    }

    const enhancedError = new Error(userMessage);
    (enhancedError as any).originalError = error;
    (enhancedError as any).status = error.response?.status;
    
    return Promise.reject(enhancedError);
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
  loginGoogle: (idToken: string) => post('/auth/google', { idToken }),
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
  previewCheckout: (datos: any) => post('/pedidos/checkout-preview', datos),
  listarMios: () => get('/pedidos/mis-pedidos'),
  obtener: (id: number) => get(`/pedidos/${id}`),
  listarAdmin: (params?: any) => get('/pedidos/admin', { params }),
  actualizarEstado: (id: number, datos: any) => patch(`/pedidos/${id}/estado`, datos),
  simularPago: (id: number, datos?: { numeroOperacion?: string; voucher?: string }) =>
    post(`/pedidos/${id}/simular-pago`, datos || {}),
};

export const usuariosAPI = {
  listar: (params?: any) => get('/usuarios', { params }),
  actualizarEstado: (id: number, activo: boolean) => patch(`/usuarios/${id}/activo`, { activo }),
  actualizarPerfil: (datos: any) => patch('/usuarios/perfil', datos),
  obtenerCarrito: () => get('/usuarios/carrito'),
  agregarCarrito: (productoId: number, varianteId: number, cantidad = 1) =>
    patch('/usuarios/carrito', { productoId, varianteId, cantidad }),
  actualizarCantidadCarrito: (varianteId: number, cantidad: number) =>
    put(`/usuarios/carrito/${varianteId}`, { cantidad }),
  eliminarDelCarrito: (varianteId: number) => del(`/usuarios/carrito/${varianteId}`),
  vaciarCarrito: () => del('/usuarios/carrito'),
  listarDirecciones: () => get('/usuarios/direcciones'),
  crearDireccion: (datos: any) => post('/usuarios/direcciones', datos),
  actualizarDireccion: (id: number, datos: any) => put(`/usuarios/direcciones/${id}`, datos),
  eliminarDireccion: (id: number) => del(`/usuarios/direcciones/${id}`),
  // Wishlist
  obtenerWishlist: () => get('/usuarios/wishlist'),
  agregarAWishlist: (productoId: number) => post('/usuarios/wishlist', { productoId }),
  eliminarDeWishlist: (productoId: number) => del(`/usuarios/wishlist/${productoId}`),
};

export const proveedoresAPI = {
  listar: (params?: any) => get('/proveedores', { params }),
  obtener: (id: number) => get(`/proveedores/${id}`),
  crear: (datos: any) => post('/proveedores', datos),
  actualizar: (id: number, datos: any) => put(`/proveedores/${id}`, datos),
  eliminar: (id: number) => del(`/proveedores/${id}`),
  listarOrdenes: (params?: any) => get('/proveedores/ordenes', { params }),
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
  obtener: (id: number) => get(`/soporte/tickets/${id}`),
  responder: (id: number, mensaje: string) =>
    post(`/soporte/tickets/${id}/responder`, { mensaje }),
  actualizarEstado: (id: number, estado: string) =>
    patch(`/soporte/tickets/${id}/estado`, { estado }),
};

export const reportesAPI = {
  dashboard: () => get('/reportes/dashboard'),
  ventasPorDia: () => get('/reportes/ventas-por-dia'),
  masVendidos: () => get('/reportes/productos-mas-vendidos'),
  // PDF
  descargarPDFVentas: () => api.get('/reportes/ventas/pdf', { responseType: 'blob' }),
  descargarPDFProductos: () => api.get('/reportes/productos/pdf', { responseType: 'blob' }),
  descargarPDFPedidos: () => api.get('/reportes/pedidos/pdf', { responseType: 'blob' }),
  descargarPDFInventario: () => api.get('/reportes/inventario/pdf', { responseType: 'blob' }),
  descargarPDFClientes: () => api.get('/reportes/clientes/pdf', { responseType: 'blob' }),
  // Excel
  descargarExcelVentas: () => api.get('/reportes/ventas/excel', { responseType: 'blob' }),
  descargarExcelProductos: () => api.get('/reportes/productos/excel', { responseType: 'blob' }),
  descargarExcelPedidos: () => api.get('/reportes/pedidos/excel', { responseType: 'blob' }),
  descargarExcelInventario: () => api.get('/reportes/inventario/excel', { responseType: 'blob' }),
  descargarExcelClientes: () => api.get('/reportes/clientes/excel', { responseType: 'blob' }),
};

export const dreamiaAPI = {
  generar: (estilo: string) => post('/dreamia/generar', { estilo }),
};

export default api;
