// ========================
// LlevaloPe - Tipos TypeScript
// ========================

export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  telefono?: string;
  rol: 'ADMIN' | 'GERENTE' | 'OPERADOR' | 'CLIENTE' | 'PROVEEDOR';
  activo: boolean;
  verificado: boolean;
  avatar?: string;
  creadoEn: string;
}

export interface Categoria {
  id: number;
  nombre: string;
  slug: string;
  descripcion?: string;
  imagen?: string;
  icono?: string;
  subcategorias?: Categoria[];
}

export interface Marca {
  id: number;
  nombre: string;
  slug: string;
  logo?: string;
}

export interface Producto {
  id: number;
  nombre: string;
  slug: string;
  descripcion?: string;
  descripcionCorta?: string;
  sku: string;
  precio: number;
  precioAnterior?: number;
  porcentajeDescuento?: number;
  categoriaId: number;
  categoria?: Categoria;
  marca?: Marca;
  stock: number;
  stockMinimo: number;
  activo: boolean;
  destacado: boolean;
  enOferta: boolean;
  calificacion: number;
  totalResenas: number;
  totalVentas: number;
  imagenPrincipal?: string;
  imagenes?: ImagenProducto[];
  variantes?: VarianteProducto[];
  resenas?: Resena[];
  creadoEn: string;
}

export interface ImagenProducto {
  id: number;
  url: string;
  alt?: string;
  orden: number;
  principal: boolean;
}

export interface VarianteProducto {
  id: number;
  nombre: string;
  valor: string;
  precio?: number;
  stock: number;
}

export interface ItemCarrito {
  id: number;
  productoId: number;
  producto: Producto;
  cantidad: number;
}

export interface DireccionUsuario {
  id: number;
  alias: string;
  nombreCompleto: string;
  telefono: string;
  departamento: string;
  provincia: string;
  distrito: string;
  direccion: string;
  referencia?: string;
  predeterminada: boolean;
}

export type EstadoPedido =
  | 'PENDIENTE'
  | 'CONFIRMADO'
  | 'EN_PREPARACION'
  | 'ENVIADO'
  | 'EN_CAMINO'
  | 'ENTREGADO'
  | 'CANCELADO'
  | 'DEVUELTO';

export type MetodoPago = 'TARJETA' | 'YAPE' | 'PLIN' | 'TRANSFERENCIA' | 'CONTRA_ENTREGA' | 'PAYPAL';

export interface Pedido {
  id: number;
  numeroPedido: string;
  usuarioId: number;
  usuario?: Pick<Usuario, 'nombre' | 'apellido' | 'correo'>;
  direccion?: DireccionUsuario;
  estado: EstadoPedido;
  subtotal: number;
  descuento: number;
  costoEnvio: number;
  impuestos: number;
  total: number;
  metodoPago: MetodoPago;
  estadoPago: 'PENDIENTE' | 'PAGADO' | 'FALLIDO' | 'REEMBOLSADO';
  notas?: string;
  items: ItemPedido[];
  historial?: HistorialPedido[];
  envio?: EnvioPedido;
  creadoEn: string;
}

export interface ItemPedido {
  id: number;
  productoId: number;
  nombre: string;
  cantidad: number;
  precioUnit: number;
  subtotal: number;
  imagen?: string;
}

export interface HistorialPedido {
  id: number;
  estado: EstadoPedido;
  descripcion: string;
  creadoEn: string;
}

export interface EnvioPedido {
  transportista: string;
  codigoTracking: string;
  estado: string;
  ubicacionActual?: string;
  estimadoEntrega?: string;
}

export interface Resena {
  id: number;
  calificacion: number;
  titulo?: string;
  comentario?: string;
  verificada: boolean;
  usuario: Pick<Usuario, 'nombre' | 'apellido' | 'avatar'>;
  creadoEn: string;
}

export interface Proveedor {
  id: number;
  nombre: string;
  ruc: string;
  contacto?: string;
  correo?: string;
  telefono?: string;
  pais: string;
  activo: boolean;
  calificacion: number;
}

export interface PaginatedResponse<T> {
  datos: T[];
  total: number;
  pagina: number;
  limite: number;
  totalPaginas: number;
}

export interface AuthResponse {
  usuario: Usuario;
  token: string;
}

export interface Banner {
  id: number;
  titulo: string;
  subtitulo?: string;
  imagen: string;
  enlace?: string;
}
