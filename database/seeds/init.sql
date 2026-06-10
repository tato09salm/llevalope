-- =============================================
-- LlevaloPe - Inicialización de Base de Datos
-- PostgreSQL
-- =============================================

-- Reiniciar el esquema para poder re-ejecutar este script sin errores
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

-- Crear tipos ENUM
CREATE TYPE rol_usuario AS ENUM ('ADMIN', 'GERENTE', 'OPERADOR', 'CLIENTE', 'PROVEEDOR');
CREATE TYPE estado_pedido AS ENUM ('PENDIENTE', 'CONFIRMADO', 'EN_PREPARACION', 'ENVIADO', 'EN_CAMINO', 'ENTREGADO', 'CANCELADO', 'DEVUELTO');
CREATE TYPE estado_pago AS ENUM ('PENDIENTE', 'PAGADO', 'FALLIDO', 'REEMBOLSADO');
CREATE TYPE metodo_pago AS ENUM ('TARJETA', 'YAPE', 'PLIN', 'TRANSFERENCIA', 'CONTRA_ENTREGA', 'PAYPAL');
CREATE TYPE estado_orden_compra AS ENUM ('BORRADOR', 'ENVIADA', 'CONFIRMADA', 'EN_TRANSITO', 'RECIBIDA_PARCIAL', 'RECIBIDA', 'CANCELADA');
CREATE TYPE tipo_movimiento AS ENUM ('ENTRADA', 'SALIDA', 'AJUSTE', 'DEVOLUCION');
CREATE TYPE categoria_ticket AS ENUM ('CONSULTA', 'RECLAMO', 'DEVOLUCION', 'PAGO', 'ENVIO', 'PRODUCTO', 'OTRO');
CREATE TYPE prioridad_ticket AS ENUM ('BAJA', 'MEDIA', 'ALTA', 'URGENTE');
CREATE TYPE estado_ticket AS ENUM ('ABIERTO', 'EN_ATENCION', 'PENDIENTE_CLIENTE', 'RESUELTO', 'CERRADO');
CREATE TYPE tipo_cupon AS ENUM ('PORCENTAJE', 'MONTO_FIJO');

-- ========================
-- TABLA: usuarios
-- ========================
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    correo VARCHAR(255) UNIQUE NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    rol rol_usuario DEFAULT 'CLIENTE',
    activo BOOLEAN DEFAULT true,
    verificado BOOLEAN DEFAULT false,
    avatar VARCHAR(500),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================
-- TABLA: direcciones_usuario
-- ========================
CREATE TABLE direcciones_usuario (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    alias VARCHAR(50) NOT NULL,
    nombre_completo VARCHAR(200) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    departamento VARCHAR(100) NOT NULL,
    provincia VARCHAR(100) NOT NULL,
    distrito VARCHAR(100) NOT NULL,
    direccion VARCHAR(500) NOT NULL,
    referencia VARCHAR(300),
    predeterminada BOOLEAN DEFAULT false,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================
-- TABLA: categorias
-- ========================
CREATE TABLE categorias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    descripcion TEXT,
    imagen VARCHAR(500),
    icono VARCHAR(100),
    categoria_padre_id INTEGER REFERENCES categorias(id),
    activa BOOLEAN DEFAULT true,
    orden INTEGER DEFAULT 0,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================
-- TABLA: marcas
-- ========================
CREATE TABLE marcas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    logo VARCHAR(500),
    descripcion TEXT,
    activa BOOLEAN DEFAULT true,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================
-- TABLA: colores
-- ========================
CREATE TABLE colores (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    hex VARCHAR(7) UNIQUE NOT NULL,
    activo BOOLEAN DEFAULT true,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================
-- TABLA: tallas_colecciones
-- ========================
CREATE TABLE tallas_colecciones (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE NOT NULL,
    orden INTEGER DEFAULT 0,
    activo BOOLEAN DEFAULT true,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================
-- TABLA: tallas
-- ========================
CREATE TABLE tallas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    orden INTEGER DEFAULT 0,
    activo BOOLEAN DEFAULT true,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    coleccion_id INTEGER REFERENCES tallas_colecciones(id)
);

-- ========================
-- TABLA: productos
-- ========================
CREATE TABLE productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(300) NOT NULL,
    slug VARCHAR(300) UNIQUE NOT NULL,
    descripcion TEXT,
    descripcion_corta VARCHAR(500),
    categoria_id INTEGER NOT NULL REFERENCES categorias(id),
    marca_id INTEGER REFERENCES marcas(id),
    peso DECIMAL(8,3),
    dimensiones JSONB,
    activo BOOLEAN DEFAULT true,
    destacado BOOLEAN DEFAULT false,
    calificacion DECIMAL(3,2) DEFAULT 0,
    total_resenas INTEGER DEFAULT 0,
    total_ventas INTEGER DEFAULT 0,
    imagen_principal VARCHAR(500),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================
-- TABLA: variantes_producto
-- ========================
CREATE TABLE variantes_producto (
    id SERIAL PRIMARY KEY,
    producto_id INTEGER NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    color_id INTEGER REFERENCES colores(id),
    size_id INTEGER REFERENCES tallas(id),
    sku VARCHAR(100) UNIQUE NOT NULL,
    precio_base DECIMAL(10,2) NOT NULL,
    precio_oferta DECIMAL(10,2),
    porcentaje_descuento INTEGER DEFAULT 0,
    stock INTEGER DEFAULT 0,
    stock_minimo INTEGER DEFAULT 5,
    en_oferta BOOLEAN DEFAULT false,
    activo BOOLEAN DEFAULT true,
    es_principal BOOLEAN DEFAULT false,
    orden INTEGER DEFAULT 0
);

-- ========================
-- TABLA: imagenes_producto
-- ========================
CREATE TABLE imagenes_producto (
    id SERIAL PRIMARY KEY,
    producto_id INTEGER NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    variante_id INTEGER REFERENCES variantes_producto(id),
    url TEXT NOT NULL,
    alt VARCHAR(200),
    orden INTEGER DEFAULT 0,
    principal BOOLEAN DEFAULT false
);

-- ========================
-- TABLA: items_carrito
-- ========================
CREATE TABLE items_carrito (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    producto_id INTEGER NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    variante_id INTEGER NOT NULL REFERENCES variantes_producto(id) ON DELETE CASCADE,
    cantidad INTEGER DEFAULT 1,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(usuario_id, variante_id)
);

-- ========================
-- TABLA: items_wishlist
-- ========================
CREATE TABLE items_wishlist (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    producto_id INTEGER NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(usuario_id, producto_id)
);

-- ========================
-- TABLA: pedidos
-- ========================
CREATE TABLE pedidos (
    id SERIAL PRIMARY KEY,
    numero_pedido VARCHAR(20) UNIQUE NOT NULL,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
    direccion_id INTEGER REFERENCES direcciones_usuario(id),
    estado estado_pedido DEFAULT 'PENDIENTE',
    subtotal DECIMAL(10,2) NOT NULL,
    descuento DECIMAL(10,2) DEFAULT 0,
    costo_envio DECIMAL(10,2) DEFAULT 0,
    impuestos DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    metodo_pago metodo_pago DEFAULT 'TARJETA',
    estado_pago estado_pago DEFAULT 'PENDIENTE',
    notas TEXT,
    fecha_entrega_est TIMESTAMP,
    fecha_entrega TIMESTAMP,
    tracking_code VARCHAR(100),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================
-- TABLA: items_pedido
-- ========================
CREATE TABLE items_pedido (
    id SERIAL PRIMARY KEY,
    pedido_id INTEGER NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    producto_id INTEGER NOT NULL REFERENCES productos(id),
    variante_id INTEGER NOT NULL REFERENCES variantes_producto(id),
    nombre VARCHAR(300) NOT NULL,
    cantidad INTEGER NOT NULL,
    precio_unit DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    imagen VARCHAR(500)
);

-- ========================
-- TABLA: historial_pedido
-- ========================
CREATE TABLE historial_pedido (
    id SERIAL PRIMARY KEY,
    pedido_id INTEGER NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    estado estado_pedido NOT NULL,
    descripcion VARCHAR(500) NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================
-- TABLA: envios_pedido
-- ========================
CREATE TABLE envios_pedido (
    id SERIAL PRIMARY KEY,
    pedido_id INTEGER UNIQUE NOT NULL REFERENCES pedidos(id),
    transportista VARCHAR(100) NOT NULL,
    codigo_tracking VARCHAR(100) NOT NULL,
    estado VARCHAR(50) NOT NULL,
    ubicacion_actual VARCHAR(300),
    estimado_entrega TIMESTAMP,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================
-- TABLA: proveedores
-- ========================
CREATE TABLE proveedores (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    ruc VARCHAR(11) UNIQUE NOT NULL,
    contacto VARCHAR(100),
    correo VARCHAR(255),
    telefono VARCHAR(20),
    direccion VARCHAR(500),
    pais VARCHAR(100) DEFAULT 'Perú',
    activo BOOLEAN DEFAULT true,
    calificacion DECIMAL(3,2) DEFAULT 5,
    notas TEXT,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================
-- TABLA: ordenes_compra
-- ========================
CREATE TABLE ordenes_compra (
    id SERIAL PRIMARY KEY,
    numero_orden VARCHAR(20) UNIQUE NOT NULL,
    proveedor_id INTEGER NOT NULL REFERENCES proveedores(id),
    estado estado_orden_compra DEFAULT 'BORRADOR',
    subtotal DECIMAL(10,2) NOT NULL,
    descuento DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    fecha_esperada TIMESTAMP,
    fecha_recepcion TIMESTAMP,
    notas TEXT,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================
-- TABLA: items_orden_compra
-- ========================
CREATE TABLE items_orden_compra (
    id SERIAL PRIMARY KEY,
    orden_compra_id INTEGER NOT NULL REFERENCES ordenes_compra(id) ON DELETE CASCADE,
    producto_id INTEGER NOT NULL REFERENCES productos(id),
    variante_id INTEGER NOT NULL REFERENCES variantes_producto(id),
    cantidad_pedida INTEGER NOT NULL,
    cantidad_recibida INTEGER DEFAULT 0,
    precio_unit DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL
);

-- ========================
-- TABLA: movimientos_inventario
-- ========================
CREATE TABLE movimientos_inventario (
    id SERIAL PRIMARY KEY,
    producto_id INTEGER NOT NULL REFERENCES productos(id),
    variante_id INTEGER NOT NULL REFERENCES variantes_producto(id),
    tipo tipo_movimiento NOT NULL,
    cantidad INTEGER NOT NULL,
    stock_anterior INTEGER NOT NULL,
    stock_nuevo INTEGER NOT NULL,
    motivo VARCHAR(300) NOT NULL,
    referencia VARCHAR(100),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================
-- TABLA: tickets_soporte
-- ========================
CREATE TABLE tickets_soporte (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
    asunto VARCHAR(300) NOT NULL,
    descripcion TEXT NOT NULL,
    categoria categoria_ticket DEFAULT 'CONSULTA',
    prioridad prioridad_ticket DEFAULT 'MEDIA',
    estado estado_ticket DEFAULT 'ABIERTO',
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================
-- TABLA: mensajes_ticket
-- ========================
CREATE TABLE mensajes_ticket (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER NOT NULL REFERENCES tickets_soporte(id) ON DELETE CASCADE,
    es_agente BOOLEAN DEFAULT false,
    mensaje TEXT NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================
-- TABLA: resenas
-- ========================
CREATE TABLE resenas (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
    producto_id INTEGER NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    calificacion SMALLINT NOT NULL CHECK (calificacion BETWEEN 1 AND 5),
    titulo VARCHAR(200),
    comentario TEXT,
    verificada BOOLEAN DEFAULT false,
    aprobada BOOLEAN DEFAULT true,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(usuario_id, producto_id)
);

-- ========================
-- TABLA: banners
-- ========================
CREATE TABLE banners (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    subtitulo VARCHAR(300),
    imagen VARCHAR(500) NOT NULL,
    enlace VARCHAR(500),
    activo BOOLEAN DEFAULT true,
    orden INTEGER DEFAULT 0,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================
-- TABLA: cupones
-- ========================
CREATE TABLE cupones (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    descripcion VARCHAR(300),
    tipo tipo_cupon DEFAULT 'PORCENTAJE',
    valor DECIMAL(10,2) NOT NULL,
    min_compra DECIMAL(10,2) DEFAULT 0,
    usos INTEGER DEFAULT 0,
    max_usos INTEGER,
    activo BOOLEAN DEFAULT true,
    fecha_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_fin TIMESTAMP
);

-- ========================
-- TABLA: notificaciones
-- ========================
CREATE TABLE notificaciones (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    titulo VARCHAR(200) NOT NULL,
    mensaje VARCHAR(500) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    leida BOOLEAN DEFAULT false,
    enlace VARCHAR(300),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================
-- TABLA: cupones_pedido
-- ========================
CREATE TABLE cupones_pedido (
    id SERIAL PRIMARY KEY,
    pedido_id INTEGER UNIQUE NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    cupon_id INTEGER NOT NULL REFERENCES cupones(id),
    codigo_cupon VARCHAR(50) NOT NULL,
    tipo_descuento tipo_cupon NOT NULL,
    valor_descuento DECIMAL(10,2) NOT NULL,
    monto_ahorrado DECIMAL(10,2) NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================
-- TABLA: pagos_pedido
-- ========================
CREATE TABLE pagos_pedido (
    id SERIAL PRIMARY KEY,
    pedido_id INTEGER NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    metodo metodo_pago NOT NULL,
    estado estado_pago DEFAULT 'PENDIENTE',
    monto DECIMAL(10,2) NOT NULL,
    referencia_pago VARCHAR(200),
    codigo_respuesta VARCHAR(100),
    mensaje_respuesta VARCHAR(500),
    intento_numero INTEGER DEFAULT 1,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================
-- TABLA: historial_envio
-- ========================
CREATE TABLE historial_envio (
    id SERIAL PRIMARY KEY,
    envio_pedido_id INTEGER NOT NULL REFERENCES envios_pedido(id) ON DELETE CASCADE,
    estado VARCHAR(50) NOT NULL,
    ubicacion VARCHAR(300),
    descripcion VARCHAR(500),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================
-- TABLA: auditoria_log
-- ========================
CREATE TABLE auditoria_log (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    accion VARCHAR(100) NOT NULL,
    entidad VARCHAR(100) NOT NULL,
    entidad_id INTEGER,
    datos_antes JSONB,
    datos_despues JSONB,
    ip VARCHAR(45),
    user_agent VARCHAR(500),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Agregar columnas nuevas a tablas existentes
ALTER TABLE pedidos
    ADD COLUMN IF NOT EXISTS cupon_id INTEGER REFERENCES cupones(id),
    ADD COLUMN IF NOT EXISTS descuento_cupon DECIMAL(10,2) DEFAULT 0;

ALTER TABLE cupones
    ADD COLUMN IF NOT EXISTS max_usos_por_usuario INTEGER DEFAULT 1;

-- ========================
-- ÍNDICES
-- ========================
CREATE INDEX idx_productos_categoria ON productos(categoria_id);
CREATE INDEX idx_productos_slug ON productos(slug);
CREATE INDEX idx_productos_activo ON productos(activo);
CREATE INDEX idx_productos_destacado ON productos(destacado);
CREATE INDEX idx_variantes_producto_producto ON variantes_producto(producto_id);
CREATE INDEX idx_variantes_producto_activo ON variantes_producto(activo);
CREATE INDEX idx_variantes_producto_en_oferta ON variantes_producto(en_oferta);
CREATE INDEX idx_pedidos_usuario ON pedidos(usuario_id);
CREATE INDEX idx_pedidos_estado ON pedidos(estado);
CREATE INDEX idx_items_carrito_usuario ON items_carrito(usuario_id);
CREATE INDEX idx_notificaciones_usuario ON notificaciones(usuario_id, leida);
-- Índices nuevos
CREATE INDEX idx_pagos_pedido_pedido ON pagos_pedido(pedido_id);
CREATE INDEX idx_pagos_pedido_referencia ON pagos_pedido(referencia_pago);
CREATE INDEX idx_historial_envio_envio ON historial_envio(envio_pedido_id);
CREATE INDEX idx_auditoria_log_usuario ON auditoria_log(usuario_id);
CREATE INDEX idx_auditoria_log_entidad ON auditoria_log(entidad, entidad_id);
CREATE INDEX idx_auditoria_log_fecha ON auditoria_log(creado_en);
CREATE INDEX idx_cupones_pedido_pedido ON cupones_pedido(pedido_id);
-- ========================
-- DATOS INICIALES (SEMILLAS)
-- ========================

-- Usuario Administrador (contraseña: Admin123!)
INSERT INTO usuarios (nombre, apellido, correo, contrasena, rol, verificado) VALUES
('Admin', 'LlevaloPe', 'admin@llevalope.pe', '$2b$10$QgnHUBHCP/9aOSNeXyOdaeSk4gK26v5EAO7pZ0QtI0JICBJJEb9SO', 'ADMIN', true),
('María', 'González', 'maria@ejemplo.com', '$2b$10$QgnHUBHCP/9aOSNeXyOdaeSk4gK26v5EAO7pZ0QtI0JICBJJEb9SO', 'CLIENTE', true),
('Carlos', 'Quispe', 'carlos@ejemplo.com', '$2b$10$QgnHUBHCP/9aOSNeXyOdaeSk4gK26v5EAO7pZ0QtI0JICBJJEb9SO', 'CLIENTE', true);

-- Categorías principales
INSERT INTO categorias (nombre, slug, descripcion, icono, orden) VALUES
('Tecnología', 'tecnologia', 'Electrónica, gadgets y más', '💻', 1),
('Hogar y Muebles', 'hogar', 'Todo para tu hogar', '🏠', 2),
('Moda', 'moda', 'Ropa y accesorios', '👗', 3),
('Belleza y Cuidado', 'belleza', 'Cosméticos y cuidado personal', '💄', 4),
('Deportes', 'deportes', 'Equipos y ropa deportiva', '⚽', 5),
('Alimentos', 'alimentos', 'Abarrotes y comida', '🛒', 6),
('Juguetes', 'juguetes', 'Para los más pequeños', '🧸', 7),
('Libros', 'libros', 'Libros y material educativo', '📚', 8);

-- Marcas
INSERT INTO marcas (nombre, slug) VALUES
('Samsung', 'samsung'),
('Apple', 'apple'),
('Sony', 'sony'),
('Lenovo', 'lenovo'),
('HP', 'hp'),
('LG', 'lg'),
('Nike', 'nike'),
('Adidas', 'adidas'),
('Marca Propia', 'marca-propia');

-- Colores
INSERT INTO colores (nombre, hex, activo) VALUES
('Negro', '#000000', true),
('Blanco', '#FFFFFF', true);

-- Tallas
INSERT INTO tallas_colecciones (nombre, orden, activo) VALUES
('Unico', 1, true);

INSERT INTO tallas (nombre, orden, activo, coleccion_id) VALUES
('Talla Única', 1, true, 1);

-- Productos de ejemplo
INSERT INTO productos (nombre, slug, descripcion_corta, categoria_id, marca_id, activo, destacado, calificacion, total_resenas, total_ventas, imagen_principal) VALUES
('Audífonos Inalámbricos Sony WH-1000XM5', 'audifonos-sony-wh1000xm5', 'Cancelación de ruido líder en la industria', 1, 3, true, true, 4.8, 128, 342, 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=1200'),
('Smartwatch Pro Series 8', 'smartwatch-pro-series-8', 'Monitor de salud avanzado y GPS', 1, 1, true, true, 4.6, 96, 215, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200'),
('Mochila Urbana Premium', 'mochila-urbana-premium', 'Resistente al agua, compartimento laptop 15\"', 3, 9, true, false, 4.5, 74, 189, 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=1200'),
('Perfume Elegance Pour Femme', 'perfume-elegance-pour-femme', '50ml - Fragancia floral y fresca', 4, 9, true, true, 4.7, 53, 167, 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=1200'),
('Laptop Lenovo IdeaPad 5i', 'laptop-lenovo-ideapad-5i', 'Intel Core i7, 16GB RAM, 512GB SSD', 1, 4, true, true, 4.7, 62, 120, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200'),
('Smart TV LG 55\" 4K OLED', 'smart-tv-lg-55-4k-oled', 'Resolución 4K, HDR Dolby Vision, WebOS', 1, 6, true, true, 4.9, 41, 95, 'https://images.unsplash.com/photo-1527443154391-507e9dc6c5cc?w=1200'),
('Zapatillas Nike Air Max 270', 'zapatillas-nike-air-max-270', 'Comodidad extrema para el día a día', 5, 7, true, false, 4.5, 89, 210, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200'),
('Cafetera Espresso DeLonghi', 'cafetera-espresso-delonghi', 'Presión 15 bar, espumador de leche', 2, 9, true, false, 4.6, 37, 80, 'https://images.unsplash.com/photo-1509460913899-515f1df34fea?w=1200');

-- Variantes (1 por producto para que el catálogo muestre precio y stock)
INSERT INTO variantes_producto (
  producto_id, color_id, size_id, sku,
  precio_base, precio_oferta, porcentaje_descuento,
  stock, stock_minimo, en_oferta, activo, es_principal, orden
) VALUES
(1, 1, 1, 'SON-AUD-001', 1599.90, 1299.90, 19, 45, 5, true, true, true, 0),
(2, 1, 1, 'SMP-WAT-001', 899.90, NULL, 0, 32, 5, false, true, true, 0),
(3, 1, 1, 'MOC-URB-001', 399.90, 299.90, 25, 78, 10, true, true, true, 0),
(4, 1, 1, 'PER-ELE-001', 399.90, NULL, 0, 55, 5, false, true, true, 0),
(5, 1, 1, 'LEN-LAP-001', 3999.90, 3299.90, 18, 20, 3, true, true, true, 0),
(6, 1, 1, 'LGT-TV-001', 5499.90, 4599.90, 16, 15, 2, true, true, true, 0),
(7, 1, 1, 'NIK-ZAP-001', 599.90, 469.90, 22, 120, 10, true, true, true, 0),
(8, 1, 1, 'CAF-DEL-001', 899.90, NULL, 0, 28, 5, false, true, true, 0);

-- Imágenes (para que el detalle del producto muestre galería)
INSERT INTO imagenes_producto (producto_id, url, alt, orden, principal) VALUES
(1, 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=1200', 'Audífonos Inalámbricos Sony WH-1000XM5', 0, true),
(2, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200', 'Smartwatch Pro Series 8', 0, true),
(3, 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=1200', 'Mochila Urbana Premium', 0, true),
(4, 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=1200', 'Perfume Elegance Pour Femme', 0, true),
(5, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200', 'Laptop Lenovo IdeaPad 5i', 0, true),
(6, 'https://images.unsplash.com/photo-1527443154391-507e9dc6c5cc?w=1200', 'Smart TV LG 55\" 4K OLED', 0, true),
(7, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200', 'Zapatillas Nike Air Max 270', 0, true),
(8, 'https://images.unsplash.com/photo-1509460913899-515f1df34fea?w=1200', 'Cafetera Espresso DeLonghi', 0, true);

-- Proveedores
INSERT INTO proveedores (nombre, ruc, contacto, correo, telefono, pais) VALUES
('Tech Importaciones SAC', '20123456789', 'Juan Rodríguez', 'ventas@techimport.pe', '01-2345678', 'Perú'),
('Distribuidora Andina EIRL', '20987654321', 'Ana López', 'ana@distribandina.pe', '01-8765432', 'Perú'),
('Global Supply Co.', '20555555555', 'Roberto Chen', 'rchen@globalsupply.com', '+1-555-0100', 'USA');

-- Banners
INSERT INTO banners (titulo, subtitulo, imagen, enlace, orden) VALUES
('Ofertas de Temporada', 'Hasta 50% de descuento en tecnología', '/imagenes/banners/banner-tecnologia.jpg', '/productos?categoria=tecnologia&oferta=true', 1),
('Envíos Gratis', 'En compras mayores a S/ 149', '/imagenes/banners/banner-envio.jpg', '/productos', 2),
('Nuevos Arrivals', 'Lo último en moda y accesorios', '/imagenes/banners/banner-moda.jpg', '/productos?categoria=moda', 3);

-- Cupones de ejemplo
INSERT INTO cupones (codigo, descripcion, tipo, valor, min_compra, max_usos, fecha_fin) VALUES
('BIENVENIDO10', '10% de descuento para nuevos usuarios', 'PORCENTAJE', 10, 100, 1000, '2025-12-31'),
('LLEVA20', 'S/ 20 de descuento en tu compra', 'MONTO_FIJO', 20, 150, 500, '2025-06-30'),
('CYBER30', '30% de descuento - Cyber Monday', 'PORCENTAJE', 30, 200, 200, '2025-06-15');

-- Función para actualizar timestamp
CREATE OR REPLACE FUNCTION actualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.actualizado_en = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar timestamps
CREATE TRIGGER trigger_usuarios_timestamp BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE PROCEDURE actualizar_timestamp();
CREATE TRIGGER trigger_productos_timestamp BEFORE UPDATE ON productos FOR EACH ROW EXECUTE PROCEDURE actualizar_timestamp();
CREATE TRIGGER trigger_pedidos_timestamp BEFORE UPDATE ON pedidos FOR EACH ROW EXECUTE PROCEDURE actualizar_timestamp();

SELECT 'Base de datos LlevaloPe inicializada correctamente ✅' AS mensaje;
