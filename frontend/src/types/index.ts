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
  categoriaPadreId?: number | null;
  categoriaPadre?: Categoria;
  subcategorias?: Categoria[];
  activa: boolean;
  orden: number;
  creadoEn: string;
  actualizadoEn: string;
  cantidadProductos?: number;
}

export interface Marca {
  id: number;
  nombre: string;
  slug: string;
  logo?: string;
}

export interface Color {
  id: number;
  nombre: string;
  hex: string;
  activo: boolean;
  creadoEn: string;
  actualizadoEn: string;
}

export interface SizeCollection {
  id: number;
  nombre: string;
  orden: number;
  activo: boolean;
  creadoEn: string;
  actualizadoEn: string;
  tallas?: Size[];
}

export interface Size {
  id: number;
  nombre: string;
  orden: number;
  activo: boolean;
  creadoEn: string;
  actualizadoEn: string;
  coleccionId?: number;
  coleccion?: SizeCollection;
}

export interface Producto {
  id: number;
  nombre: string;
  slug: string;
  descripcion?: string;
  descripcionCorta?: string;
  categoriaId: number;
  categoria?: Categoria;
  marca?: Marca;
  peso?: number;
  dimensiones?: any;
  activo: boolean;
  destacado: boolean;
  calificacion: number;
  totalResenas: number;
  totalVentas: number;
  imagenPrincipal?: string;
  imagenes?: ImagenProducto[];
  variantes?: VarianteProducto[];
  resenas?: Resena[];
  creadoEn: string;
  actualizadoEn: string;
}

export interface ImagenProducto {
  id: number;
  productoId: number;
  varianteId?: number | null;
  url: string;
  alt?: string;
  orden: number;
  principal: boolean;
}

export interface VarianteProducto {
  id: number;
  productoId: number;
  colorId?: number | null;
  sizeId?: number | null;
  sku: string;
  precioBase: number;
  precioOferta?: number | null;
  porcentajeDescuento?: number | null;
  stock: number;
  stockMinimo: number;
  enOferta: boolean;
  activo: boolean;
  esPrincipal: boolean;
  orden: number;
  color?: Color;
  size?: Size;
  imagenes?: ImagenProducto[];
}

export interface ItemCarrito {
  id: number;
  usuarioId: number;
  productoId: number;
  varianteId: number;
  cantidad: number;
  producto: Producto;
  variante: VarianteProducto;
  creadoEn: string;
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
  creadoEn?: string;
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
  descuentoCupon?: number;
  descuentoVolumen?: number;
  costoEnvio: number;
  impuestos: number;
  total: number;
  ahorroTotal?: number;
  tipoEnvio?: 'STANDARD' | 'EXPRESS';
  metodoPago: MetodoPago;
  estadoPago: 'PENDIENTE' | 'PAGADO' | 'FALLIDO' | 'REEMBOLSADO';
  notas?: string;
  items: ItemPedido[];
  historial?: HistorialPedido[];
  envio?: EnvioPedido;
  cupon?: { codigo: string; descripcion?: string };
  creadoEn: string;
}

export interface ItemPedido {
  id: number;
  varianteId?: number;
  productoId: number;
  nombre: string;
  cantidad: number;
  precioUnit: number;
  subtotal: number;
  imagen?: string;
  producto?: Producto;
  variante?: VarianteProducto;
}

export interface CheckoutPreviewItem {
  productoId: number;
  categoriaId: number;
  varianteId: number;
  nombre: string;
  sku: string;
  cantidad: number;
  imagen?: string;
  precioBase: number;
  precioUnitario: number;
  subtotalOriginal: number;
  descuentoOferta: number;
  descuentoVolumen: number;
  subtotalFinal: number;
  stockDisponible: number;
}

export interface CheckoutResumen {
  subtotalOriginal: number;
  subtotalProductos: number;
  descuentoOferta: number;
  descuentoVolumen: number;
  descuentoCupon: number;
  costoEnvio: number;
  envioGratis: boolean;
  igvIncluido: number;
  total: number;
  ahorroTotal: number;
  tipoEnvio: 'STANDARD' | 'EXPRESS';
  umbralEnvioGratis: number;
  faltanteEnvioGratis: number;
}

export interface CheckoutPreview {
  items: CheckoutPreviewItem[];
  resumen: CheckoutResumen;
  cupon: null | {
    id: number;
    codigo: string;
    tipo: 'PORCENTAJE' | 'MONTO_FIJO';
    valor: number;
    descuento: number;
  };
  checkoutToken?: string;
  reservaExpiraEn?: string;
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

export interface MovimientoInventario {
  id: number;
  productoId: number;
  varianteId: number;
  tipo: 'ENTRADA' | 'SALIDA' | 'AJUSTE' | 'DEVOLUCION';
  cantidad: number;
  stockAnterior: number;
  stockNuevo: number;
  motivo: string;
  referencia?: string;
  creadoEn: string;
  variante?: {
    sku: string;
    producto?: {
      nombre: string;
    };
  };
}

export interface OrdenCompraItem {
  id: number;
  productoId: number;
  varianteId: number;
  cantidadPedida: number;
  precioUnit: number;
  subtotal: number;
}

export interface OrdenCompra {
  id: number;
  numeroOrden: string;
  proveedorId: number;
  estado?: string;
  subtotal: number;
  total: number;
  notas?: string;
  creadoEn: string;
  proveedor?: {
    nombre: string;
  };
  items: OrdenCompraItem[];
}

export interface TicketMensaje {
  id: number;
  mensaje: string;
  esAgente: boolean;
  creadoEn: string;
}

export interface TicketSoporte {
  id: number;
  usuarioId: number;
  asunto: string;
  descripcion: string;
  categoria: string;
  prioridad: string;
  estado: string;
  creadoEn: string;
  usuario?: Pick<Usuario, 'id' | 'nombre' | 'apellido' | 'correo' | 'telefono'>;
  mensajes?: TicketMensaje[];
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
