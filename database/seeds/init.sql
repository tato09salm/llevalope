-- =============================================
-- LlevaloPe - Inicialización de Base de Datos
-- PostgreSQL
-- =============================================

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
-- TABLA: productos
-- ========================
CREATE TABLE productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(300) NOT NULL,
    slug VARCHAR(300) UNIQUE NOT NULL,
    descripcion TEXT,
    descripcion_corta VARCHAR(500),
    sku VARCHAR(100) UNIQUE NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    precio_anterior DECIMAL(10,2),
    porcentaje_descuento INTEGER DEFAULT 0,
    categoria_id INTEGER NOT NULL REFERENCES categorias(id),
    marca_id INTEGER REFERENCES marcas(id),
    stock INTEGER DEFAULT 0,
    stock_minimo INTEGER DEFAULT 5,
    peso DECIMAL(8,3),
    dimensiones JSONB,
    activo BOOLEAN DEFAULT true,
    destacado BOOLEAN DEFAULT false,
    en_oferta BOOLEAN DEFAULT false,
    calificacion DECIMAL(3,2) DEFAULT 0,
    total_resenas INTEGER DEFAULT 0,
    total_ventas INTEGER DEFAULT 0,
    imagen_principal VARCHAR(500),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================
-- TABLA: imagenes_producto
-- ========================
CREATE TABLE imagenes_producto (
    id SERIAL PRIMARY KEY,
    producto_id INTEGER NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    url VARCHAR(500) NOT NULL,
    alt VARCHAR(200),
    orden INTEGER DEFAULT 0,
    principal BOOLEAN DEFAULT false
);

-- ========================
-- TABLA: variantes_producto
-- ========================
CREATE TABLE variantes_producto (
    id SERIAL PRIMARY KEY,
    producto_id INTEGER NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    valor VARCHAR(100) NOT NULL,
    precio DECIMAL(10,2),
    stock INTEGER DEFAULT 0,
    sku VARCHAR(100)
);

-- ========================
-- TABLA: items_carrito
-- ========================
CREATE TABLE items_carrito (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    producto_id INTEGER NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    cantidad INTEGER DEFAULT 1,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(usuario_id, producto_id)
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
-- ÍNDICES
-- ========================
CREATE INDEX idx_productos_categoria ON productos(categoria_id);
CREATE INDEX idx_productos_slug ON productos(slug);
CREATE INDEX idx_productos_activo ON productos(activo);
CREATE INDEX idx_productos_destacado ON productos(destacado);
CREATE INDEX idx_pedidos_usuario ON pedidos(usuario_id);
CREATE INDEX idx_pedidos_estado ON pedidos(estado);
CREATE INDEX idx_items_carrito_usuario ON items_carrito(usuario_id);
CREATE INDEX idx_notificaciones_usuario ON notificaciones(usuario_id, leida);

-- ========================
-- DATOS INICIALES (SEMILLAS)
-- ========================

-- Usuario Administrador (contraseña: Admin123!)
INSERT INTO usuarios (nombre, apellido, correo, contrasena, rol, verificado) VALUES
('Admin', 'LlevaloPe', 'admin@llevalope.pe', '$2b$10$EIXJSrDiJpCiimkMJrz7MuXXv3CUuKzAy.6W.A8c8hL6C4HovJfuy', 'ADMIN', true),
('María', 'González', 'maria@ejemplo.com', '$2b$10$EIXJSrDiJpCiimkMJrz7MuXXv3CUuKzAy.6W.A8c8hL6C4HovJfuy', 'CLIENTE', true),
('Carlos', 'Quispe', 'carlos@ejemplo.com', '$2b$10$EIXJSrDiJpCiimkMJrz7MuXXv3CUuKzAy.6W.A8c8hL6C4HovJfuy', 'CLIENTE', true);

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

-- Productos de ejemplo
INSERT INTO productos (nombre, slug, descripcion_corta, sku, precio, precio_anterior, porcentaje_descuento, categoria_id, marca_id, stock, destacado, en_oferta, calificacion, total_resenas, imagen_principal) VALUES
('Audífonos Inalámbricos Sony WH-1000XM5', 'audifonos-sony-wh1000xm5', 'Cancelación de ruido líder en la industria', 'SON-AUD-001', 1299.90, 1599.90, 19, 1, 3, 45, true, true, 4.8, 128, '/imagenes/productos/audifonos-sony.jpg'),
('Smartwatch Pro Series 8', 'smartwatch-pro-series-8', 'Monitor de salud avanzado y GPS', 'SMP-WAT-001', 899.90, 1099.90, 18, 1, 1, 32, true, false, 4.6, 96, '/imagenes/productos/smartwatch.jpg'),
('Mochila Urbana Premium', 'mochila-urbana-premium', 'Resistente al agua, compartimento laptop 15"', 'MOC-URB-001', 299.90, 399.90, 25, 3, 9, 78, false, true, 4.5, 74, '/imagenes/productos/mochila.jpg'),
('Perfume Elegance Pour Femme', 'perfume-elegance-pour-femme', '50ml - Fragancia floral y fresca', 'PER-ELE-001', 399.90, 499.90, 20, 4, 9, 55, true, false, 4.7, 53, '/imagenes/productos/perfume.jpg'),
('Laptop Lenovo IdeaPad 5i', 'laptop-lenovo-ideapad-5i', 'Intel Core i7, 16GB RAM, 512GB SSD', 'LEN-LAP-001', 3299.90, 3999.90, 18, 1, 4, 20, true, true, 4.7, 62, '/imagenes/productos/laptop.jpg'),
('Smart TV LG 55" 4K OLED', 'smart-tv-lg-55-4k-oled', 'Resolución 4K, HDR Dolby Vision, WebOS', 'LGT-TV-001', 4599.90, 5499.90, 16, 1, 6, 15, true, true, 4.9, 41, '/imagenes/productos/tv.jpg'),
('Zapatillas Nike Air Max 270', 'zapatillas-nike-air-max-270', 'Comodidad extrema para el día a día', 'NIK-ZAP-001', 469.90, 599.90, 22, 5, 7, 120, false, true, 4.5, 89, '/imagenes/productos/zapatillas.jpg'),
('Cafetera Espresso DeLonghi', 'cafetera-espresso-delonghi', 'Presión 15 bar, espumador de leche', 'CAF-DEL-001', 899.90, 1099.90, 18, 2, 9, 28, false, false, 4.6, 37, '/imagenes/productos/cafetera.jpg');

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
