# PLAN_EBUSINESS

## 1. Diagnostico General
El proyecto `Llevalope` no parte desde cero: ya cuenta con una base tecnica moderna, un dominio de datos amplio y varios modulos funcionales propios de un comercio electronico. Sin embargo, todavia esta lejos de convertirse en un e-business completo porque no cubre de punta a punta el ciclo comercial, operativo y relacional del negocio.

### Nivel de madurez observado
| Dimension | Estado actual | Nivel estimado |
|---|---|---|
| Arquitectura web | Frontend y backend separados, stack moderno | Medio-Alto |
| Catalogo digital | Funcional con variantes, filtros y admin basico | Medio-Alto |
| Flujo de compra | Incompleto, sin checkout real | Bajo |
| Pagos digitales | No integrados | Muy bajo |
| Operaciones internas | Parciales: inventario, proveedores, soporte y reportes basicos | Medio-Bajo |
| CRM y experiencia cliente | Basico, sin cuenta cliente real ni fidelizacion | Bajo |
| Analitica gerencial | Basica | Bajo-Medio |
| Seguridad empresarial | Parcial, con brechas de autorizacion y sesiones | Bajo-Medio |

### Conclusión diagnóstica
El proyecto esta en una situacion apta para evolucionar a un **MVP e-business**, pero aun no alcanza el nivel de una plataforma integral por estas razones:

- no existe checkout operativo en frontend
- no existe integracion real de pagos
- el carrito del frontend y el carrito del backend no estan unificados
- faltan vistas administrativas criticas
- la gestion de roles y permisos no es consistente
- no hay automatizaciones de relacion con clientes
- no hay facturacion ni integraciones operativas externas

## 2. Brechas Identificadas

### Brechas funcionales
| Brecha | Evidencia del estado actual | Impacto |
|---|---|---|
| Checkout inexistente | `/carrito` enlaza a `/checkout`, pero no existe pagina | Impide cerrar ventas |
| Pagos no integrados | Solo enums y etiquetas visuales de pago | Impide monetizacion real |
| Carrito no consolidado | Frontend usa Zustand local; backend expone carrito persistente sin consumo desde UI | Inconsistencias de compra |
| Pedidos sin front completo | Backend implementado, vistas admin/cliente faltantes | Baja operatividad |
| Clientes sin panel | Menu admin incluye clientes, pero no existe la vista | Baja gestion comercial |
| Inventario sin vista admin | API existe, UI no | Baja visibilidad operacional |
| Proveedores sin vista admin | API existe, UI no | Supply chain incompleto |
| Soporte sin UI funcional | API existe, UI no | Atencion al cliente incompleta |
| Reportes sin modulo visual | API existe, solo dashboard parcial | Toma de decisiones limitada |
| Cuenta cliente ausente | Hay links a `/cuenta/*`, pero no existen las paginas | Mala experiencia postcompra |
| Recuperacion de contraseña ausente | La UI enlaza a `/auth/recuperar`, pero no existe | Friccion de acceso |
| Wishlist ausente de punta a punta | Modelo y enlaces existen, sin implementacion real | Valor comercial no capturado |
| Cupones sin motor real | El carrito usa cupones hardcodeados | Promociones poco confiables |
| Facturacion ausente | No hay evidencia de facturacion | Incompleto para operacion real |
| Seguimiento de entregas ausente | Modelos de envio existen, vistas/flujo no | Logistica incompleta |

### Brechas tecnicas
| Brecha | Impacto |
|---|---|
| Autorizacion inconsistente en backend | Riesgo de acceso indebido |
| Token accesible desde JavaScript | Riesgo de seguridad |
| Falta de DTOs y validaciones por modulo | Riesgo de datos invalidos |
| Uso extensivo de `any` | Baja mantenibilidad |
| Falta de pruebas automatizadas | Riesgo de regresiones |
| Falta de CI/CD | Riesgo de despliegues manuales inseguros |
| Doble fuente estructural (`schema.prisma` + `init.sql`) | Riesgo de deriva y errores de entorno |
| Integraciones externas inexistentes | Limita madurez e-business |

### Brechas de negocio
| Brecha | Impacto de negocio |
|---|---|
| Sin pagos digitales reales | No hay conversion efectiva |
| Sin CRM ni segmentacion | Poca retencion y personalizacion |
| Sin fidelizacion | Menor recompra |
| Sin automatizacion de notificaciones | Menor engagement y seguimiento |
| Sin dashboards gerenciales completos | Menor control del negocio |
| Sin integracion operativa externa | Baja escalabilidad real |

## 3. Priorizacion

### Alta prioridad
| Tarea | Motivo |
|---|---|
| Unificar autenticacion y autorizacion | Base de seguridad y control operativo |
| Corregir roles y permisos en backend | Protege funciones criticas |
| Unificar carrito cliente-backend | Requisito para compra real |
| Implementar checkout | Cierra el embudo de ventas |
| Implementar gestion integral de pedidos | Operacion comercial central |
| Implementar vistas admin faltantes: pedidos, clientes, inventario, proveedores, soporte | Hace util la plataforma para operar |
| Integrar pasarela de pago real | Habilita monetizacion |
| Implementar direccionamiento y datos del cliente en compra | Requisito para despacho |
| Integrar cupones reales y reglas comerciales | Impacta ventas y marketing |
| Fortalecer seguridad de sesiones | Riesgo alto actual |

### Media prioridad
| Tarea | Motivo |
|---|---|
| Implementar panel de cuenta cliente | Mejora postventa |
| Implementar wishlist real | Mejora conversion y remarketing |
| Implementar notificaciones por correo y sistema interno | Mejora experiencia operativa |
| Implementar modulo visual de reportes | Mejora decisiones |
| Implementar soporte frontend | Mejora atencion al cliente |
| Implementar gestion de proveedores e inventario enriquecida | Mejora operaciones |
| Normalizar DTOs, errores y contratos API | Mejora mantenibilidad |
| Crear pruebas criticas de negocio | Reduce regresiones |

### Baja prioridad
| Tarea | Motivo |
|---|---|
| Programa de fidelizacion | Potencia crecimiento posterior |
| Recomendaciones personalizadas | Requiere mas datos y madurez |
| Integracion con redes sociales | Complementa marketing |
| Automatizacion avanzada de campañas | Etapa posterior |
| Analitica avanzada y prediccion | Requiere madurez operativa y datos historicos |

## 4. Roadmap

## Fase 1 (MVP E-Business)
Objetivo: habilitar el flujo minimo comercial y operativo para vender de forma consistente.

### Alcance
- seguridad y roles consistentes
- carrito persistente unificado
- checkout
- pedidos end-to-end
- direcciones de usuario
- vistas admin de pedidos, clientes, inventario, proveedores y soporte
- pasarela de pago inicial
- notificaciones basicas por correo

### Resultado esperado
Una tienda capaz de registrar usuarios, autenticar, comprar, pagar, generar pedido, descontar stock y permitir gestion administrativa basica.

## Fase 2 (Optimizacion)
Objetivo: mejorar eficiencia, control y experiencia del negocio digital.

### Alcance
- reportes gerenciales con KPIs mas utiles
- cupones reales y motor de promociones
- soporte al cliente visual
- panel de cuenta cliente
- wishlist real
- mejoras de seguridad de sesiones
- pruebas automatizadas principales
- integracion de inventario y proveedores con pantallas completas

### Resultado esperado
Una plataforma mas robusta, medible y operable con menos friccion.

## Fase 3 (Escalamiento)
Objetivo: evolucionar de e-commerce funcional a e-business mas completo.

### Alcance
- fidelizacion
- recomendaciones
- automatizaciones de marketing
- integraciones sociales y campañas
- observabilidad, auditoria y hardening
- despliegue productivo con pipeline
- mejoras de rendimiento y escalabilidad

### Resultado esperado
Una plataforma preparada para crecimiento, optimizacion comercial y operacion sostenida.

## 5. Distribucion Del Trabajo
La distribucion propuesta es **consecutiva y dependiente**. Cada integrante recibe insumos del anterior y construye sobre ellos. La secuencia recomendada es:

**Germain -> Ricardo -> Jose -> Tania -> Samira**

---

## Germain

### Objetivo
Construir la base tecnica, de seguridad y de autorizacion sobre la que el resto del equipo desarrollara las funcionalidades de e-business.

### Dependencias
- No depende de otro integrante; inicia el trabajo base.

### Tareas concretas
- Revisar y endurecer autenticacion JWT.
- Implementar politicas de sesiones mas seguras.
- Migrar el manejo del token a una estrategia mas segura si el alcance lo permite.
- Aplicar `RolesGuard` y `@Roles(...)` de forma consistente en todos los endpoints administrativos.
- Definir matriz de permisos por rol: `ADMIN`, `GERENTE`, `OPERADOR`, `CLIENTE`, `PROVEEDOR`.
- Crear DTOs y validaciones base para modulos faltantes o debiles: pedidos, proveedores, inventario, soporte, usuarios.
- Estandarizar respuestas de error y control de acceso.
- Preparar configuracion base para integraciones futuras: pagos, correo y notificaciones.
- Organizar la estructura de modulos backend donde hoy hay mezcla excesiva en un solo archivo.

### Entregables
- Endpoints protegidos consistentemente.
- Documento de matriz de roles y permisos.
- DTOs base y validaciones implementadas.
- Refactor base de modulos backend prioritarios.
- Configuracion inicial de proveedores externos mediante variables de entorno.

### Criterios de aceptacion
- Ningun endpoint administrativo queda protegido solo por autenticacion cuando requiere autorizacion por rol.
- Los roles tienen permisos definidos y comprobables.
- Los endpoints criticos rechazan entradas invalidas con mensajes consistentes.
- El backend compila y mantiene compatibilidad con el frontend actual.

---

## Ricardo

### Objetivo
Extender y consolidar la persistencia y las APIs del negocio sobre la base de seguridad y estructura entregada por Germain.

### Dependencias
- Recibe insumos de **Germain**: permisos definidos, DTOs base, estructura backend estabilizada y configuracion de seguridad.

### Tareas concretas
- Diseñar y ajustar tablas/relaciones necesarias para cerrar brechas:
  - checkout
  - direccionamiento de compra
  - cupones aplicados a pedido
  - trazabilidad de pago
  - seguimiento de envios
  - auditoria de operaciones clave
- Resolver la estrategia de fuente unica para la base de datos:
  - alinear `schema.prisma`
  - alinear `init.sql`
  - definir proceso de inicializacion/migracion
- Crear/mejorar APIs para:
  - checkout
  - carrito persistente
  - pedidos administrativos
  - clientes
  - inventario
  - proveedores
  - soporte
  - reportes
- Implementar reglas de integridad:
  - stock no negativo
  - validacion de cupones
  - propiedad del pedido por usuario
  - consistencia de estados de pedido y pago
- Optimizar consultas con `select/include`, indices y paginacion donde haga falta.

### Entregables
- Esquema de base de datos consolidado.
- APIs nuevas o corregidas para negocio central.
- Validaciones de integridad y consistencia transaccional.
- Consultas optimizadas y documentadas a nivel tecnico.

### Criterios de aceptacion
- El modelo de datos soporta el flujo de compra completo.
- El carrito persistente y pedidos usan reglas consistentes.
- Los endpoints administrativos devuelven datos listos para interfaz.
- La base de datos puede recrearse sin contradicciones entre Prisma y SQL.

---

## Jose

### Objetivo
Implementar la logica de negocio sobre las APIs y persistencia consolidadas por Ricardo.

### Dependencias
- Recibe insumos de **Ricardo**: esquema final, APIs operativas, reglas de integridad y endpoints para dominio.

### Tareas concretas
- Implementar el flujo completo de negocio para:
  - carrito persistente
  - checkout
  - generacion de pedido
  - aplicacion de cupones
  - actualizacion de stock
  - actualizacion de estados de pedido
- Implementar reglas comerciales:
  - envio gratis por umbral
  - impuestos
  - descuentos
  - validacion de cupones
  - restricciones por stock
- Completar la gestion de productos:
  - variantes
  - imagenes
  - stock
  - activacion/desactivacion
- Completar gestion de clientes:
  - perfil
  - direcciones
  - historial de pedidos
  - wishlist si se incluye en Fase 2
- Completar logica de inventario, proveedores y soporte.
- Preparar servicios listos para ser consumidos por Tania desde la interfaz.

### Entregables
- Servicios y reglas de negocio funcionando end-to-end.
- Casos de uso centrales del e-business operativos.
- APIs consumibles con contratos estables para frontend.

### Criterios de aceptacion
- Un pedido puede crearse validando stock, direcciones, metodo de pago y total.
- El inventario se actualiza de forma consistente.
- Cupones, totales y estados siguen reglas verificables.
- Los servicios se comportan correctamente ante errores y casos borde.

---

## Tania

### Objetivo
Transformar la logica y APIs entregadas por Jose en una experiencia usable, coherente y responsive para clientes y administradores.

### Dependencias
- Recibe insumos de **Jose**: logica de negocio completa, endpoints estables y flujo comercial implementado.

### Tareas concretas
- Implementar la vista de checkout completa.
- Conectar el carrito del frontend al carrito persistente del backend.
- Implementar panel de cuenta del cliente:
  - perfil
  - direcciones
  - historial de pedidos
  - detalle de pedido
- Implementar vistas admin faltantes:
  - clientes
  - pedidos
  - inventario
  - proveedores
  - soporte
  - reportes
  - configuracion si entra al alcance
- Mejorar UX del catalogo, detalle y carrito.
- Implementar estados vacios, errores, confirmaciones y feedback visual.
- Adaptar todas las vistas nuevas a responsive.
- Eliminar enlaces rotos o placeholders no respaldados por funcionalidad real.

### Entregables
- Checkout funcional en frontend.
- Panel cliente funcional.
- Panel administrativo ampliado y conectado a APIs reales.
- Mejoras de experiencia y navegacion coherente.

### Criterios de aceptacion
- El usuario puede comprar desde catalogo hasta confirmacion.
- El administrador puede visualizar y gestionar pedidos, clientes, stock, proveedores y soporte.
- No quedan rutas visibles que conduzcan a paginas inexistentes dentro del alcance comprometido.
- Las nuevas vistas funcionan en movil y escritorio.

---

## Samira

### Objetivo
Completar la capa de integraciones externas, metricas de negocio, notificaciones y preparacion para produccion a partir de la plataforma ya operativa.

### Dependencias
- Recibe insumos de **Tania**: interfaces funcionales, flujos completos y paneles ya conectados.

### Tareas concretas
- Integrar pasarela de pago real.
- Integrar envio de correo electronico:
  - confirmacion de registro
  - confirmacion de pedido
  - cambios de estado
  - recuperacion de contraseña
- Implementar notificaciones internas y, si aplica, push o mensajeria adicional.
- Integrar redes sociales a nivel funcional:
  - enlaces reales
  - compartir producto
  - trafico desde campañas, si aplica
- Implementar dashboards de negocio con KPIs utiles:
  - ventas
  - conversion
  - ticket promedio
  - productos mas vendidos
  - stock critico
  - tickets abiertos
- Implementar reportes gerenciales exportables.
- Preparar configuracion de despliegue y puesta en produccion:
  - variables de entorno
  - build
  - hardening basico
  - checklist operativo

### Entregables
- Integracion de pagos operativa.
- Correos transaccionales y notificaciones configuradas.
- Dashboard y reportes gerenciales mejorados.
- Preparacion tecnica para despliegue.

### Criterios de aceptacion
- El pago puede procesarse con una pasarela real o sandbox verificable.
- El usuario recibe comunicaciones clave del ciclo de compra.
- Gerencia dispone de reportes accionables.
- El proyecto queda listo para una demostracion de entorno preproductivo.

## Recomendacion Final De Ejecucion
Para fines academicos y de gestion de proyecto, la secuencia mas efectiva es:

1. **Cerrar seguridad y permisos**
2. **Consolidar datos y APIs**
3. **Completar logica comercial**
4. **Construir interfaces faltantes**
5. **Integrar pagos, comunicaciones y analitica**

Si el tiempo del curso es limitado, el minimo viable recomendable es completar la **Fase 1**, porque es la fase que convierte el proyecto de una base tecnica prometedora en un **MVP e-business demostrable**.

