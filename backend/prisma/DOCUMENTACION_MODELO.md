# Documentación del Modelo de Base de Datos Profesional para E-Commerce

## Arquitecto Senior: Análisis y Mejoras Completas

---

## 📋 RESUMEN EJECUTIVO

He analizado tu modelo actual y propuesto una estructura enterprise-grade diseñada para:
- **Escalabilidad**: Soporta millones de productos y órdenes
- **Rendimiento**: Índices óptimos y normalización adecuada
- **Flexibilidad**: Atributos dinámicos para cualquier tipo de producto
- **Mantenibilidad**: Código limpio y estructurado
- **Auditoría**: Registro completo de cambios

---

## 🔍 ANÁLISIS DEL MODELO ACTUAL

### Problemas Críticos Identificados:

1. **Duplicidad de Datos**: Precios y stock en `productos` y `variantes_producto`
2. **Datos Calculados**: `porcentaje_descuento`, `calificacion` - se pueden calcular en tiempo real
3. **Atributos Rígidos**: Solo Color y Tamaño, no soporta otros atributos
4. **Falta de Inventario Distribuido**: No hay multi-almacén
5. **Falta de Auditoría**: No hay registro de quién cambió qué y cuándo
6. **Falta de SEO**: No hay tabla dedicada para metadatos SEO
7. **Imágenes Insuficientes**: Solo una tabla, falta diferenciar entre imágenes de producto y variante
8. **Stock Reservado**: No hay forma de reservar stock para pedidos pendientes
9. **Costo de Producto**: No hay registro del costo de adquisición (importante para márgenes)
10. **UUID Faltante**: No hay identificadores únicos globales para integraciones

---

## 🏗️ DISEÑO FINAL: MEJORAS IMPLEMENTADAS

---

### 1. **Tabla `productos` - Rediseñada**

#### Campos Eliminados (y por qué):
- ❌ `sku`: Pertenece a la variante, no al producto
- ❌ `precio`: Pertenece a la variante
- ❌ `precio_anterior`: Pertenece a la variante
- ❌ `porcentaje_descuento`: Dato calculable (no guardar)
- ❌ `stock`: Pertenece a la variante y a inventario
- ❌ `stock_minimo`: Pertenece a la variante/inventario
- ❌ `en_oferta`: Pertenece a la variante
- ❌ `calificacion`: Dato calculable (promedio de reseñas)
- ❌ `total_resenas`: Dato calculable (COUNT de reseñas)
- ❌ `total_ventas`: Dato calculable (SUM de items de pedido)

#### Campos Nuevos/Añadidos:
- ✅ `uuid`: Identificador único global para integraciones
- ✅ `tipo_producto`: Enum (FISICO, DIGITAL, SERVICIO, CONFIGURABLE)
- ✅ `creado_por_id`: Quién creó el producto
- ✅ `actualizado_por_id`: Quién actualizó el producto

**Por qué es importante**:
- Separación clara entre metadatos del producto y datos específicos de variante
- Mejor normalización, sin duplicidad
- Mayor flexibilidad para diferentes tipos de productos

---

### 2. **Tabla `variantes_producto` - Rediseñada Profesionalmente**

#### Campos Nuevos/Añadidos:
- ✅ `uuid`: Identificador único
- ✅ `codigo_barra`: EAN, UPC, etc.
- ✅ `precio_base`: Precio normal (anteriormente `precio`)
- ✅ `precio_oferta`: Precio en oferta (anteriormente `precio_anterior` pero con mejor nombre)
- ✅ `fecha_inicio_oferta` y `fecha_fin_oferta`: Control temporal de ofertas
- ✅ `costo`: Costo de adquisición (para cálculo de márgenes)
- ✅ `es_principal`: Marca la variante principal/default
- ✅ `orden`: Orden de visualización
- ✅ `activo`: Estado de la variante

**Por qué es importante**:
- Toda la información específica de la variante está en un solo lugar
- Control preciso de ofertas por fecha
- Cálculo de margen de ganancia (precio_venta - costo)
- Mejor organización de variantes

---

### 3. **Sistema de Atributos Dinámicos** (NUEVO!)

#### Tablas Creadas:
- `tipos_atributo`: Color, Tamaño, Material, Estilo, etc.
- `atributos`: Valores específicos (Rojo, Azul, S, M, L, etc.)
- `productos_atributos`: Qué atributos aplican a cada producto
- `variantes_atributos`: Valores de atributos para cada variante

**Ventajas**:
- ✅ Cualquier tipo de atributo (no solo color y tamaño)
- ✅ Filtros dinámicos en frontend
- ✅ Facilita la creación de productos configurables
- ✅ SEO mejorado (URLs con atributos)

**Ejemplo de Uso**:
```
TipoAtributo: Color
  Atributo: Rojo
  Atributo: Azul
  Atributo: Verde

TipoAtributo: Tamaño
  Atributo: S
  Atributo: M
  Atributo: L

Producto: Camiseta
  ProductoAtributo: Color (requerido)
  ProductoAtributo: Tamaño (requerido)
  
Variante 1: Camiseta Roja S
  VarianteAtributo: Rojo
  VarianteAtributo: S
  
Variante 2: Camiseta Roja M
  VarianteAtributo: Rojo
  VarianteAtributo: M
```

---

### 4. **Sistema de Imágenes Profesional** (NUEVO!)

#### Tablas:
- `imagenes_producto`: Imágenes del producto general
- `imagenes_variante`: Imágenes específicas de cada variante

#### Campos Mejorados:
- `url_thumbnail`, `url_medium`, `url_large`: Diferentes tamaños para rendimiento
- `titulo`: Para accesibilidad y SEO
- `orden`: Control de visualización

**Por qué es importante**:
- Imágenes específicas por variante (ej: camiseta roja tiene su propia foto)
- Mejor rendimiento con tamaños pre-generados
- SEO mejorado con atributos alt y título

---

### 5. **SEO Estructurado** (NUEVO!)

#### Tabla `productos_seo`:
- `titulo_seo`: Título personalizado para motores de búsqueda
- `descripcion_seo`: Meta descripción
- `palabras_clave`: Palabras clave objetivo
- `meta_robots`: Instrucciones para crawlers
- `canonical_url`: Para evitar contenido duplicado
- `structured_data`: JSON-LD para rich snippets

**Ventajas**:
- ✅ Mejor posicionamiento en buscadores
- ✅ Control total sobre meta tags
- ✅ Rich snippets en resultados de Google

---

### 6. **Sistema de Inventario Multi-Almacén** (NUEVO!)

#### Tablas:
- `almacenes`: Ubicaciones físicas/digitales
- `inventario`: Stock por variante y almacén
- `movimientos_inventario`: Historial completo de movimientos

#### Campos Clave:
- `cantidad_disponible`: Stock real disponible
- `cantidad_reservada`: Stock reservado para pedidos pendientes
- `stock_minimo` y `stock_maximo`: Límites para alertas
- `ubicacion_en_almacen`: Pasillo, estante, etc.

**Por qué es importante**:
- ✅ Soporta múltiples warehouses
- ✅ Control preciso de stock reservado
- ✅ Historial completo de movimientos
- ✅ Alertas de stock bajo
- ✅ FIFO/LIFO si es necesario

---

### 7. **Sistema de Descuentos Flexible** (NUEVO!)

#### Tablas:
- `descuentos`: Reglas de descuento
- `descuentos_variantes`: Asignación a variantes específicas

#### Características:
- Porcentaje o monto fijo
- Fechas de inicio y fin
- Límite de usos
- Monto mínimo de compra

**Ventajas**:
- ✅ Descuentos globales o por variante
- ✅ Control temporal
- ✅ Estadísticas de uso

---

### 8. **Auditoría Completa** (NUEVO!)

#### Tabla `auditoria_productos`:
- `accion`: CREATE, UPDATE, DELETE
- `datos_anteriores`: JSON con estado antes del cambio
- `datos_nuevos`: JSON con estado después del cambio
- `usuario_id`: Quién hizo el cambio
- `ip`: Dirección IP
- `user_agent`: Navegador/dispositivo

**Por qué es importante**:
- ✅ Trazabilidad completa
- ✅ Recuperación de datos
- ✅ Responsabilidad
- ✅ Cumplimiento normativo

---

## 📊 ÍNDICES RECOMENDADOS (Para Máximo Rendimiento)

### Índices Primarios (ya incluidos):
- Todas las tablas tienen `id serial PRIMARY KEY`

### Índices Secundarios (Incluidos en el Schema):

```sql
-- Productos
CREATE INDEX idx_productos_categoria_id ON productos(categoria_id);
CREATE INDEX idx_productos_marca_id ON productos(marca_id);
CREATE INDEX idx_productos_activo_destacado ON productos(activo, destacado);
CREATE INDEX idx_productos_slug ON productos(slug);

-- Variantes
CREATE INDEX idx_variantes_producto_id ON variantes_producto(producto_id);
CREATE INDEX idx_variantes_sku ON variantes_producto(sku);
CREATE INDEX idx_variantes_activo ON variantes_producto(activo);
CREATE INDEX idx_variantes_precio_base ON variantes_producto(precio_base);

-- Inventario
CREATE INDEX idx_inventario_variante_id ON inventario(variante_id);
CREATE INDEX idx_inventario_almacen_id ON inventario(almacen_id);

-- Pedidos
CREATE INDEX idx_pedidos_usuario_id ON pedidos(usuario_id);
CREATE INDEX idx_pedidos_estado ON pedidos(estado);
CREATE INDEX idx_pedidos_numero_pedido ON pedidos(numero_pedido);

-- Categorías
CREATE INDEX idx_categorias_categoria_padre_id ON categorias(categoria_padre_id);
CREATE INDEX idx_categorias_activa ON categorias(activa);
CREATE INDEX idx_categorias_slug ON categorias(slug);

-- Auditoría
CREATE INDEX idx_auditoria_productos_producto_id ON auditoria_productos(producto_id);
CREATE INDEX idx_auditoria_productos_creado_en ON auditoria_productos(creado_en);
```

---

## 🔗 CONSTRAINTS Y FOREIGN KEYS

### Claves Foráneas (Incluidas en el Schema):
- Todas las relaciones tienen `ON DELETE CASCADE` o `ON DELETE RESTRICT` según corresponda
- `UNIQUE` constraints en campos como `sku`, `slug`, `uuid`
- `NOT NULL` en campos obligatorios

---

## 🎯 CÓMO MANEJAR ESCENARIOS COMUNES

---

### 1. **Productos sin Variantes**
- Crear **una sola variante** con `es_principal = true`
- La variante contiene todo el precio, stock, etc.
- Frontend puede ocultar la selección de variantes si solo hay una

---

### 2. **Productos Configurables**
- Usar el sistema de atributos dinámicos
- Cada combinación de atributos es una variante
- Ej: Camiseta × Color × Tamaño = múltiples variantes

---

### 3. **Descuentos y Ofertas**
- Opción 1: Usar `precio_oferta` con fechas en la variante
- Opción 2: Usar la tabla `descuentos` para reglas más complejas
- **NO guardar `porcentaje_descuento`**: Calcularlo como `((precio_base - precio_oferta) / precio_base) * 100`

---

### 4. **Stock Reservado**
- Cuando un cliente hace un pedido:
  1. Incrementar `cantidad_reservada` en `inventario`
  2. Crear registro en `movimientos_inventario` con tipo `RESERVA`
- Cuando se confirma el pago/retira:
  1. Decrementar `cantidad_disponible` y `cantidad_reservada`
  2. Crear registro con tipo `SALIDA`
- Si se cancela:
  1. Decrementar `cantidad_reservada`
  2. Crear registro con tipo `LIBERACION_RESERVA`

---

### 5. **Multi-Almacén**
- Cada almacén tiene su propio registro en `inventario`
- Para mostrar stock total: SUMAR `cantidad_disponible` de todos los almacenes
- Para envíos: Seleccionar almacén más cercano o con stock disponible

---

### 6. **Productos Digitales vs Físicos**
- Campo `tipo_producto` en `productos`:
  - `FISICO`: Requiere envío, tiene peso/dimensiones
  - `DIGITAL`: No requiere envío, entrega instantánea
  - `SERVICIO`: Citas, suscripciones, etc.
  - `CONFIGURABLE`: Producto con múltiples opciones

---

### 7. **Evitar Inconsistencias de Stock y Precio**
- **Transacciones SQL**: Usar BEGIN/COMMIT para operaciones que afectan múltiples tablas
- **Optimistic Locking**: Usar `actualizado_en` para detectar cambios concurrentes
- **Pessimistic Locking**: Bloquear filas durante operaciones críticas
- **Validaciones en BD**: CHECK constraints para stock ≥ 0
- **Historial de Movimientos**: Todo cambio registrado en `movimientos_inventario`

---

## 🚀 PREPARACIÓN PARA MILLONES DE PRODUCTOS

### Estrategias de Escalabilidad:

1. **Particionamiento de Tablas**:
   - Particionar `pedidos` e `inventario` por fecha
   - Particionar `productos` por `categoria_id` o región

2. **Sharding**:
   - Shard por `categoria_id` o región geográfica
   - Usar UUIDs para IDs globales

3. **Caché**:
   - Cachear productos frecuentes en Redis
   - Cachear categorías y filtros
   - Invalidación de caché en actualizaciones

4. **Indices Compuestos**:
   - Índices para consultas comunes (ej: `(categoria_id, activo, destacado)`)
   - Índices parciales (solo productos activos)

5. **Lecturas/Escrituras Separadas**:
   - Replicas para consultas de lectura
   - Master solo para escrituras

6. **Batch Processing**:
   - Cálculo de `total_ventas` y `calificacion` en jobs nocturnos
   - No calcular en tiempo real para millones de productos

---

## ❌ ERRORES COMUNES EN E-COMMERCE (Y CÓMO EVITARLOS)

### Error 1: Guardar datos calculados
- **Mal**: `porcentaje_descuento`, `total_resenas`, `calificacion`
- **Bien**: Calcular en tiempo real o en batch
- **Por qué**: Datos obsoletos, inconsistencias

### Error 2: Duplicar datos en múltiples tablas
- **Mal**: Precio y stock en `productos` y `variantes`
- **Bien**: Un solo origen de verdad
- **Por qué**: Inconsistencias, mayor mantenimiento

### Error 3: Sin auditoría
- **Mal**: No saber quién cambió qué
- **Bien**: Tabla de auditoría completa
- **Por qué**: Responsabilidad, recuperación, cumplimiento

### Error 4: Sistema de atributos rígido
- **Mal**: Solo color y tamaño como campos
- **Bien**: Atributos dinámicos en tablas separadas
- **Por qué**: Flexibilidad, filtros dinámicos

### Error 5: Sin control de stock reservado
- **Mal**: Vender productos que no están disponibles
- **Bien**: Separar `disponible` vs `reservado`
- **Por qué**: Experiencia de usuario, confianza

### Error 6: Imágenes sin organización
- **Mal**: Todas las imágenes en una carpeta
- **Bien**: Tablas separadas, múltiples tamaños
- **Por qué**: Rendimiento, organización, SEO

---

## 📐 DIAGRAMA CONCEPTUAL DEL MODELO

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          CORE: PRODUCTOS Y VARIANTES                            │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌──────────────┐         ┌──────────────────────┐                              │
│  │  Productos   │◄────────┤ VarianteProducto    │                              │
│  └──────────────┘         └──────────────────────┘                              │
│         │                           │                                             │
│         │                           │                                             │
│         ▼                           ▼                                             │
│  ┌──────────────┐         ┌──────────────────────┐                              │
│  │ProductoSEO   │         │  VarianteAtributo    │                              │
│  └──────────────┘         └──────────────────────┘                              │
│         │                           │                                             │
│         │                           │                                             │
│         ▼                           ▼                                             │
│  ┌──────────────┐         ┌──────────────────────┐         ┌─────────────────┐│
│  │ImagenProducto│         │     Atributo         │◄────────┤  TipoAtributo   ││
│  └──────────────┘         └──────────────────────┘         └─────────────────┘│
│                                     │                                             │
│                                     │                                             │
│                                     ▼                                             │
│  ┌──────────────┐         ┌──────────────────────┐                              │
│  │AuditoriaProd │         │   ProductoAtributo   │                              │
│  └──────────────┘         └──────────────────────┘                              │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
                                         │
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                               INVENTARIO Y ALMACÉN                                │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌──────────────┐         ┌──────────────────────┐                              │
│  │   Almacenes  │         │     Inventario       │◄──────────┐                 │
│  └──────────────┘         └──────────────────────┘           │                 │
│                                     │                           │                 │
│                                     │                           │                 │
│                                     ▼                           │                 │
│                          ┌──────────────────────┐               │                 │
│                          │MovimientoInventario  │───────────────┘                 │
│                          └──────────────────────┘                                 │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
                                         │
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                  PEDIDOS Y CARRITO                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌──────────────┐         ┌──────────────────────┐                              │
│  │   Pedidos    │         │     ItemPedido       │                              │
│  └──────────────┘         └──────────────────────┘                              │
│         │                           │                                             │
│         │                           │                                             │
│         ▼                           ▼                                             │
│  ┌──────────────┐         ┌──────────────────────┐                              │
│  │ HistorialPed │         │     ItemCarrito      │                              │
│  └──────────────┘         └──────────────────────┘                              │
│         │                                                                         │
│         ▼                                                                         │
│  ┌──────────────┐                                                               │
│  │  EnvioPedido │                                                               │
│  └──────────────┘                                                               │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📝 RESUMEN DE CAMBIOS CLAVE

| Aspecto | Antes | Ahora | Mejora |
|---------|-------|-------|--------|
| **Precio/Stock** | En productos y variantes | Solo en variantes | ✅ Sin duplicidad |
| **Atributos** | Solo Color y Tamaño | Sistema dinámico | ✅ Flexibilidad total |
| **Inventario** | Solo stock total | Multi-almacén, reservado | ✅ Control preciso |
| **Auditoría** | Nada | Registro completo | ✅ Trazabilidad |
| **SEO** | Nada | Tabla dedicada | ✅ Mejor posicionamiento |
| **Imágenes** | Una tabla | Separadas por producto/variante | ✅ Mejor organización |
| **UUID** | No | Sí | ✅ Integraciones |
| **Costo** | No | Sí | ✅ Cálculo de márgenes |

---

## 🚀 PASOS SIGUIENTES PARA IMPLEMENTACIÓN

1. **Backup**: Haz backup de tu BD actual
2. **Migración**: Crea migración Prisma para aplicar cambios
3. **Data Migration**: Script para migrar datos existentes
4. **Actualizar Backend**: Modifica servicios para usar el nuevo schema
5. **Actualizar Frontend**: Ajusta tipos y llamadas API
6. **Testing**: Prueba exhaustivamente todas las funcionalidades
7. **Deploy**: Despliegue gradual con monitoreo

---

## 💡 CONSEJOS FINALES

- **Empieza con lo básico**: Implementa primero los cambios críticos (productos, variantes, inventario)
- **Usa migraciones seguras**: Prisma Migrate es tu amigo
- **Monitorea**: Observa el rendimiento después del cambio
- **Documenta**: Mantén este documento actualizado
- **Iterar**: Mejora el modelo gradualmente según necesidades

¡Este modelo está listo para escalar a millones de productos y órdenes! 🎉
