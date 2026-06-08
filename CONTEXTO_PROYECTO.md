# CONTEXTO_PROYECTO

## Resumen Ejecutivo
`Llevalope` es una plataforma web orientada al comercio electronico B2C con un frontend en Next.js y un backend API REST en NestJS sobre PostgreSQL/Prisma. El objetivo observable del sistema es permitir la exhibicion de un catalogo de productos, autenticacion de usuarios, administracion basica de catalogo y operaciones nucleares de venta como carrito, pedidos, inventario, proveedores, soporte y reportes.

El proyecto ya contiene una base tecnica util y varios modulos de negocio relevantes para un e-commerce; sin embargo, aun no puede considerarse un e-business completo. Hay una diferencia importante entre lo que el README y la interfaz sugieren y lo que realmente esta implementado de punta a punta. Existen funcionalidades reales y operativas, funcionalidades parciales y varias capacidades criticas aun ausentes: checkout, pagos integrados, vistas de clientes/pedidos/proveedores/inventario/soporte/reportes en frontend, facturacion, CRM formal, automatizaciones de marketing, trazabilidad logistica avanzada y despliegue productivo formal.

Este documento se basa exclusivamente en evidencia encontrada en el codigo fuente. Cuando algo no pudo verificarse con certeza, se indica expresamente.

## Objetivo Del Sistema
Construir una plataforma digital de venta online para gestionar:

- catalogo de productos y categorias
- autenticacion de usuarios y acceso administrativo
- carrito y pedidos
- administracion interna de productos, categorias, colores y tallas
- operaciones de soporte, inventario, proveedores y reportes

## Problema Que Resuelve
El sistema busca centralizar la operacion de una tienda digital que necesita:

- exhibir productos en un canal web
- permitir compras online
- administrar stock y catalogo
- registrar pedidos
- ofrecer soporte al cliente
- disponer de una capa administrativa para monitoreo del negocio

## Usuarios Involucrados
Con base en el enum `RolUsuario` del esquema Prisma, los usuarios contemplados son:

| Usuario | Evidencia | Rol en el negocio |
|---|---|---|
| Administrador | `ADMIN` en `schema.prisma` | Gestion integral del sistema |
| Gerente | `GERENTE` en `schema.prisma` | Supervision operativa/comercial |
| Operador | `OPERADOR` en `schema.prisma` | Gestion operativa del catalogo y procesos |
| Cliente | `CLIENTE` en `schema.prisma` | Compra productos, consulta pedidos |
| Proveedor | `PROVEEDOR` en `schema.prisma` | Actor modelado, sin portal visible dedicado |

## Tecnologias Utilizadas

### Frontend
- Next.js 15
- React 18
- TypeScript
- Tailwind CSS
- Framer Motion
- Zustand
- Axios
- js-cookie
- jsPDF

### Backend
- NestJS 10
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT
- Passport
- bcrypt
- class-validator / class-transformer
- ThrottlerModule

### Infraestructura
- Docker Compose
- Dockerfiles para frontend y backend
- Variables de entorno centralizadas en `.env`

## Arquitectura Identificada

### Estilo general
- Arquitectura cliente-servidor separada.
- Frontend desacoplado consumiendo API REST.
- Backend modular por dominio en NestJS.
- Persistencia relacional con Prisma sobre PostgreSQL.

### Componentes principales
| Capa | Implementacion observada |
|---|---|
| Presentacion | Next.js App Router en `frontend/src/app` |
| Estado cliente | Zustand persistente para autenticacion y carrito |
| Integracion API | Cliente Axios centralizado en `frontend/src/lib/api.ts` |
| API backend | Controladores NestJS con modulos por dominio |
| Persistencia | Prisma Client + PostgreSQL |
| Datos iniciales | `database/seeds/init.sql` y scripts de seed en backend |

### Patron modular del backend
Modulos efectivamente conectados en `AppModule`:

- `auth`
- `usuarios`
- `productos`
- `categorias`
- `colores`
- `tallas-colecciones`
- `tallas`
- `pedidos`
- `proveedores`
- `inventario`
- `soporte`
- `reportes`

### Observacion arquitectonica importante
El proyecto presenta una mezcla de patrones:

- Algunos dominios tienen `controller`, `service` y `module` en archivos separados.
- Otros dominios (`usuarios`, `inventario`, `proveedores`, `soporte`, `reportes`) declaran controlador, servicio y modulo en un solo archivo.

Esto no impide compilar, pero reduce consistencia y mantenibilidad.

## Estructura De Carpetas

### Frontend
- `src/app`: paginas con App Router
- `src/components`: componentes visuales
- `src/store`: estado cliente
- `src/lib`: cliente API
- `src/types`: contratos TypeScript

### Backend
- `src/auth`: autenticacion JWT
- `src/productos`, `categorias`, `colores`, `tallas`, `tallas-colecciones`
- `src/pedidos`
- `src/usuarios`
- `src/proveedores`
- `src/inventario`
- `src/soporte`
- `src/reportes`
- `src/common/prisma`

### Base de datos
- `backend/prisma/schema.prisma`: esquema activo
- `database/seeds/init.sql`: creacion manual de estructura + datos
- `backend/prisma/schema_propuesto.prisma`: artefacto adicional no integrado al runtime actual

## Base De Datos

### Entidades implementadas en el esquema activo
Se verifican modelos para:

- usuarios y direcciones
- categorias, marcas, productos, variantes, imagenes
- carrito y wishlist
- pedidos, items, historial, envios
- proveedores, ordenes de compra, items de orden, movimientos de inventario
- tickets de soporte y mensajes
- resenas
- banners
- cupones
- notificaciones

### Evaluacion
- La base de datos esta mas avanzada que la interfaz.
- Existen entidades de negocio aun no expuestas por UI o API completa.
- Hay riesgo de deriva entre `schema.prisma` y `init.sql` por doble mantenimiento manual.

## APIs Identificadas

### APIs efectivamente implementadas
| Dominio | Estado | Observacion |
|---|---|---|
| Auth | Implementado | registro, login, perfil |
| Productos | Implementado | listado, destacados, ofertas, detalle por slug, CRUD admin |
| Categorias | Implementado | listado, padres, CRUD admin |
| Colores | Implementado | CRUD admin |
| Tallas | Implementado | CRUD admin |
| Tallas colecciones | Implementado | CRUD admin |
| Pedidos | Implementado parcialmente | crear, listar propios, listar admin, detalle, actualizar estado |
| Usuarios | Implementado parcialmente | listado, perfil, carrito, direcciones |
| Proveedores | Implementado parcialmente | listado, alta y ordenes de compra |
| Inventario | Implementado parcialmente | stock bajo, movimientos, ajuste |
| Soporte | Implementado parcialmente | tickets y respuestas |
| Reportes | Implementado parcialmente | dashboard, ventas por dia, mas vendidos |

### Observaciones
- El contrato de frontend para varias APIs existe, pero varias no tienen vistas conectadas.
- El frontend no consume las APIs de usuarios, pedidos, proveedores, inventario o soporte de manera integral.

## Seguridad, Autenticacion Y Roles

### Fortalezas verificadas
- JWT para autenticacion.
- `JwtAuthGuard` y `RolesGuard` existentes.
- `ValidationPipe` global con `whitelist`, `forbidNonWhitelisted` y `transform`.
- Rate limiting via `ThrottlerModule`.
- Hash de contrasenas con bcrypt.
- CORS configurado.

### Debilidades verificadas
- El token se almacena en cookie desde frontend con `js-cookie`, no como cookie `HttpOnly`; por tanto, es accesible desde JavaScript.
- No se evidencian refresh tokens, rotacion de sesiones, revocacion, bloqueo por intentos fallidos ni cierre remoto de sesiones.
- El campo `verificado` existe, pero no se encontro flujo de verificacion por correo.
- No se encontro flujo de recuperacion de contrasena, aunque la UI enlaza a `/auth/recuperar`.
- La separacion de roles es parcial: algunos endpoints sensibles solo usan `JwtAuthGuard` sin `RolesGuard`, por ejemplo en `usuarios`, `pedidos/admin`, `inventario`, `proveedores`, `soporte` y `reportes`.
- En frontend existe proteccion del layout admin, pero no reemplaza controles de autorizacion estrictos en backend.

## Analisis Funcional Actual

### Casos de uso implementados
| Caso de uso | Estado | Evidencia funcional |
|---|---|---|
| Registro de usuario | Implementado | pagina y endpoint |
| Inicio de sesion | Implementado | pagina y endpoint |
| Ver catalogo | Implementado | `/productos` |
| Filtrar productos | Implementado | filtros por categoria, precio, oferta, destacado |
| Ver detalle de producto | Implementado | `/productos/[slug]` |
| Agregar al carrito local | Implementado | Zustand en frontend |
| Ver carrito | Implementado | `/carrito` |
| Crear pedido desde API | Implementado | backend `pedidos` |
| Gestion admin de productos | Implementado | CRUD UI + API |
| Gestion admin de categorias | Implementado | CRUD UI + API |
| Gestion admin de colores | Implementado | CRUD UI + API |
| Gestion admin de tallas | Implementado | CRUD UI + API |
| Dashboard admin basico | Implementado parcialmente | vista principal y metricas basicas |

### Funcionalidades existentes
#### Frontoffice
- home comercial
- catalogo con filtros
- detalle de producto con variantes e imagenes
- carrito persistente en cliente
- login y registro

#### Backoffice
- dashboard admin
- mantenimiento de productos
- mantenimiento de categorias
- mantenimiento de colores
- mantenimiento de tallas y colecciones

#### Backend de negocio
- autenticacion
- gestion de usuarios
- creacion y consulta de pedidos
- soporte basico por tickets
- inventario basico
- proveedores y ordenes de compra
- reportes resumidos

### Funcionalidades parcialmente implementadas
| Funcionalidad | Situacion actual |
|---|---|
| Carrito | Existe carrito local en frontend y carrito persistente en backend, pero no estan integrados entre si |
| Cupones | Hay modelo `Cupon` y seeds, pero el carrito aplica cupones hardcodeados en frontend; no se verifica motor real |
| Wishlist | Existe modelo y enlaces en UI, pero no se encontro API ni vistas operativas |
| Soporte | Backend funcional, pero no hay centro de soporte visible en frontend |
| Reportes | Backend con endpoints basicos y dashboard admin parcial; no existe vista dedicada de reportes |
| Proveedores | Backend funcional basico; no existe vista admin correspondiente |
| Inventario | Backend funcional basico; no existe vista admin correspondiente |
| Pedidos | Backend funcional, pero falta checkout y vistas administrativas/cliente para explotarlo |
| Roles | Existen en modelo, JWT y algunas rutas; aplicacion inconsistente en backend y frontend |
| Imagenes de productos | Carga basica disponible en admin, sin gestion media robusta ni storage dedicado |

### Funcionalidades ausentes o no verificables
| Funcionalidad | Estado |
|---|---|
| Checkout web | Ausente en frontend |
| Pasarela de pago real | Ausente |
| Facturacion electronica | No verificada |
| Gestion de pedidos en frontend admin | Ausente |
| Gestion de clientes en frontend admin | Ausente |
| CRM formal | Ausente |
| Automatizacion de marketing | Ausente |
| Recomendaciones personalizadas | Ausente |
| Programa de fidelizacion | Ausente |
| Seguimiento logistico visible al cliente | Ausente |
| Centro de cuenta del cliente | Ausente |
| Recuperacion de contrasena | Ausente |
| Verificacion de correo | Ausente |
| Notificaciones reales por email/push/SMS | Ausente |
| Integraciones con redes sociales | Solo enlaces placeholder |
| Observabilidad, logging estructurado y auditoria | Ausente |
| Suite de pruebas automatizadas | Ausente |
| CI/CD | No encontrado |

## Evaluacion Del Proyecto Como E-Business

### Comercio electronico
| Componente | Estado |
|---|---|
| Catalogo de productos | Existe |
| Carrito de compras | Existe, pero local y no consolidado con backend |
| Checkout | Falta |
| Gestion de pedidos | Existe en backend, no completa en frontend |
| Facturacion | No evidenciada |

### Pagos digitales
| Componente | Estado |
|---|---|
| Tipos de pago modelados | Existe como enum |
| Integracion bancaria | No encontrada |
| Pago con tarjeta | No encontrado |
| Yape / Plin / PayPal | Solo nombres y enum; sin integracion |
| Pasarela de pago | No encontrada |

### Relacion con clientes
| Componente | Estado |
|---|---|
| Gestion de usuarios | Basica |
| Historial de compras | Backend disponible, UI ausente |
| CRM | No encontrado |
| Soporte por tickets | Backend existe |
| Chat de soporte | No encontrado |

### Marketing digital
| Componente | Estado |
|---|---|
| Promociones y ofertas | Parcial |
| Cupones | Parcial, sin motor integrado real |
| Campañas | No encontradas |
| Fidelizacion | No encontrada |
| Recomendaciones | No encontradas |
| Banners | Modelados en BD, no expuestos claramente por UI/API |

### Analitica
| Componente | Estado |
|---|---|
| Dashboard administrativo | Basico |
| KPIs | Basicos |
| Reportes | Basicos en backend, UI ausente |
| Metricas de negocio | Parciales |

### Seguridad
| Componente | Estado |
|---|---|
| Proteccion de datos | Basica |
| Roles y permisos | Parcial e inconsistente |
| Auditoria | No encontrada |
| Gestion de sesiones | Basica, sin mecanismos avanzados |

### Integraciones externas
| Componente | Estado |
|---|---|
| Redes sociales | Links placeholder |
| Correo electronico | No evidenciado |
| Notificaciones | Modelo en BD, sin integracion observable |
| APIs de terceros | No evidenciadas |

### Operaciones del negocio
| Componente | Estado |
|---|---|
| Gestion de inventario | Backend basico |
| Gestion de proveedores | Backend basico |
| Logistica | Parcial por modelos de envio |
| Seguimiento de entregas | No expuesto al usuario final |

## Estado Actual Del Proyecto

### Diagnostico sintetico
El sistema se encuentra en una etapa intermedia entre:

1. un MVP de e-commerce tecnico
2. una plataforma administrativa parcial
3. una vision mas amplia de e-business todavia no materializada

### Interpretacion academica
`Llevalope` ya sirve como base para demostrar:

- arquitectura web moderna
- modelado de dominio e-commerce
- autenticacion y roles
- administracion basica de catalogo
- primeros componentes de supply chain, soporte y analitica

Sin embargo, todavia no demuestra de forma integral:

- monetizacion real por pagos digitales
- relacion omnicanal con clientes
- procesos completos de compra
- inteligencia comercial
- integraciones operativas propias de un e-business maduro

## Fortalezas
- Stack moderno y coherente para una plataforma web.
- Base de datos relativamente rica en entidades de negocio.
- Modularidad razonable en backend.
- Catalogo, variantes, categorias y paneles maestros ya funcionales.
- Dashboard admin inicial disponible.
- Docker Compose disponible para entorno integrado.
- Compilacion verificada de frontend y backend.

## Debilidades
- Varias vistas del admin prometidas por el menu no existen.
- Falta checkout y flujo de compra end-to-end.
- Pagos digitales no estan integrados.
- Carrito duplicado: local en frontend y persistente en backend sin unificacion.
- Amplio uso de `any` en backend y frontend.
- Falta de DTOs/validaciones especificas fuera de auth.
- Seguridad de sesiones insuficiente para produccion.
- Inconsistencia en aplicacion de roles/permisos.
- Falta de pruebas automatizadas.
- Falta de CI/CD, observabilidad y auditoria.
- README describe una plataforma mas completa que la realmente implementada.

## Riesgos Tecnicos
| Riesgo | Impacto |
|---|---|
| Deriva entre `schema.prisma` e `init.sql` | Inconsistencias de datos y fallos en despliegue |
| Tokens no `HttpOnly` | Mayor superficie de ataque ante XSS |
| Permisos incompletos en backend | Exposicion indebida de informacion y operaciones |
| Ausencia de tests | Mayor riesgo de regresiones |
| Uso extensivo de `any` | Menor confiabilidad y mantenibilidad |
| Modulos con clases concentradas en un solo archivo | Dificulta escalamiento y trabajo en equipo |
| Links y vistas no existentes | Mala experiencia de usuario y deuda funcional |
| Fallbacks demo en frontend | Riesgo de resultados inconsistentes y ocultamiento de errores reales |

## Riesgos De Negocio
| Riesgo | Impacto |
|---|---|
| No existe flujo de pago real | No se concreta la conversion del negocio |
| No existe checkout funcional | El embudo comercial queda incompleto |
| Sin CRM ni fidelizacion | Baja retencion y poco conocimiento del cliente |
| Sin facturacion ni integraciones operativas | Dificultad para operar en un entorno real |
| Reportes gerenciales limitados | Menor capacidad de decision basada en datos |
| Soporte no expuesto al cliente | Menor capacidad de atencion postventa |
| Vistas admin faltantes | Limitaciones operativas para el negocio |

## Conclusiones
`Llevalope` es una base util, seria y tecnicamente aprovechable para evolucionar hacia un e-business, pero todavia no constituye una solucion integral lista para operacion real. Su mayor valor actual esta en:

- la arquitectura moderna ya montada
- el dominio de datos de e-commerce bastante amplio
- la existencia de modulos clave que pueden madurar sin rehacer el proyecto

Su principal brecha esta en la capa de integracion de negocio: pago, checkout, CRM, reportes gerenciales, operaciones completas, experiencia de cliente y vistas administrativas faltantes.

### Recomendacion para futuras IAs
Antes de agregar nuevas funcionalidades, conviene tomar este orden:

1. consolidar seguridad y permisos
2. cerrar el flujo comercial minimo: carrito persistente + checkout + pedido + pago
3. completar vistas admin faltantes conectadas a APIs ya existentes
4. profesionalizar integraciones y operaciones de negocio

### Nivel de madurez estimado
- Como prototipo tecnico: **medio**
- Como e-commerce academico: **medio**
- Como e-business integral: **bajo a medio**

