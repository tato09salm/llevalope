"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PedidosService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma/prisma.service");
let PedidosService = class PedidosService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async crearPedido(usuarioId, datos) {
        const { items, direccionId, metodoPago, notas, cupon } = datos;
        if (!items || items.length === 0) {
            throw new common_1.BadRequestException('El pedido debe tener al menos un producto');
        }
        let subtotal = 0;
        const itemsValidados = [];
        for (const item of items) {
            const producto = await this.prisma.producto.findUnique({
                where: { id: item.productoId },
            });
            if (!producto)
                throw new common_1.NotFoundException(`Producto ${item.productoId} no encontrado`);
            if (producto.stock < item.cantidad) {
                throw new common_1.BadRequestException(`Stock insuficiente para: ${producto.nombre}`);
            }
            const itemSubtotal = Number(producto.precio) * item.cantidad;
            subtotal += itemSubtotal;
            itemsValidados.push({
                productoId: item.productoId,
                nombre: producto.nombre,
                cantidad: item.cantidad,
                precioUnit: producto.precio,
                subtotal: itemSubtotal,
                imagen: producto.imagenPrincipal,
            });
        }
        const costoEnvio = subtotal >= 149 ? 0 : 10;
        const igv = subtotal * 0.18;
        const total = subtotal + costoEnvio + igv;
        const numeroPedido = `LLP-${Date.now()}`;
        const pedido = await this.prisma.$transaction(async (tx) => {
            const nuevoPedido = await tx.pedido.create({
                data: {
                    numeroPedido,
                    usuarioId,
                    direccionId,
                    metodoPago: metodoPago || 'TARJETA',
                    subtotal,
                    costoEnvio,
                    impuestos: igv,
                    total,
                    notas,
                    items: {
                        create: itemsValidados,
                    },
                    historial: {
                        create: {
                            estado: 'PENDIENTE',
                            descripcion: 'Pedido recibido y en proceso de confirmación',
                        },
                    },
                },
                include: { items: true, historial: true },
            });
            for (const item of itemsValidados) {
                await tx.producto.update({
                    where: { id: item.productoId },
                    data: { stock: { decrement: item.cantidad }, totalVentas: { increment: item.cantidad } },
                });
            }
            await tx.itemCarrito.deleteMany({ where: { usuarioId } });
            return nuevoPedido;
        });
        return pedido;
    }
    async listarPedidosUsuario(usuarioId) {
        return this.prisma.pedido.findMany({
            where: { usuarioId },
            include: {
                items: true,
                historial: { orderBy: { creadoEn: 'desc' } },
                envio: true,
            },
            orderBy: { creadoEn: 'desc' },
        });
    }
    async obtenerPedido(id, usuarioId) {
        const where = { id };
        if (usuarioId)
            where.usuarioId = usuarioId;
        const pedido = await this.prisma.pedido.findFirst({
            where,
            include: {
                usuario: { select: { nombre: true, apellido: true, correo: true, telefono: true } },
                direccion: true,
                items: true,
                historial: { orderBy: { creadoEn: 'asc' } },
                envio: true,
            },
        });
        if (!pedido)
            throw new common_1.NotFoundException('Pedido no encontrado');
        return pedido;
    }
    async actualizarEstado(id, estado, descripcion) {
        const pedido = await this.prisma.pedido.findUnique({ where: { id } });
        if (!pedido)
            throw new common_1.NotFoundException('Pedido no encontrado');
        return this.prisma.$transaction([
            this.prisma.pedido.update({
                where: { id },
                data: { estado: estado },
            }),
            this.prisma.historialPedido.create({
                data: {
                    pedidoId: id,
                    estado: estado,
                    descripcion: descripcion || `Estado actualizado a ${estado}`,
                },
            }),
        ]);
    }
    async listarTodos(params) {
        const { pagina = 1, limite = 20, estado } = params;
        const where = {};
        if (estado)
            where.estado = estado;
        const [pedidos, total] = await Promise.all([
            this.prisma.pedido.findMany({
                where,
                skip: (pagina - 1) * limite,
                take: limite,
                include: {
                    usuario: { select: { nombre: true, apellido: true, correo: true } },
                    items: { select: { nombre: true, cantidad: true } },
                },
                orderBy: { creadoEn: 'desc' },
            }),
            this.prisma.pedido.count({ where }),
        ]);
        return { datos: pedidos, total, pagina, limite, totalPaginas: Math.ceil(total / limite) };
    }
};
exports.PedidosService = PedidosService;
exports.PedidosService = PedidosService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PedidosService);
//# sourceMappingURL=pedidos.service.js.map