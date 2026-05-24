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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventarioModule = exports.InventarioController = exports.InventarioService = void 0;
const common_1 = require("@nestjs/common");
const common_2 = require("@nestjs/common");
const common_3 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma/prisma.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let InventarioService = class InventarioService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async stockBajo() {
        return this.prisma.producto.findMany({
            where: { activo: true, stock: { lte: this.prisma.producto.fields.stockMinimo } },
            select: { id: true, nombre: true, sku: true, stock: true, stockMinimo: true },
        });
    }
    async movimientos(productoId) {
        const where = {};
        if (productoId)
            where.productoId = productoId;
        return this.prisma.movimientoInventario.findMany({
            where,
            include: { producto: { select: { nombre: true, sku: true } } },
            orderBy: { creadoEn: 'desc' },
            take: 100,
        });
    }
    async ajustarStock(productoId, cantidad, motivo, tipo) {
        const producto = await this.prisma.producto.findUnique({ where: { id: productoId } });
        const stockAnterior = producto.stock;
        const stockNuevo = tipo === 'SALIDA' ? stockAnterior - cantidad : stockAnterior + cantidad;
        return this.prisma.$transaction([
            this.prisma.producto.update({ where: { id: productoId }, data: { stock: stockNuevo } }),
            this.prisma.movimientoInventario.create({
                data: { productoId, tipo: tipo, cantidad, stockAnterior, stockNuevo, motivo },
            }),
        ]);
    }
};
exports.InventarioService = InventarioService;
exports.InventarioService = InventarioService = __decorate([
    (0, common_3.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], InventarioService);
let InventarioController = class InventarioController {
    constructor(s) {
        this.s = s;
    }
    stockBajo() { return this.s.stockBajo(); }
    movimientos(id) { return this.s.movimientos(id ? +id : undefined); }
    ajustar(b) { return this.s.ajustarStock(b.productoId, b.cantidad, b.motivo, b.tipo); }
};
exports.InventarioController = InventarioController;
__decorate([
    (0, common_2.Get)('stock-bajo'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], InventarioController.prototype, "stockBajo", null);
__decorate([
    (0, common_2.Get)('movimientos'),
    __param(0, (0, common_2.Query)('productoId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], InventarioController.prototype, "movimientos", null);
__decorate([
    (0, common_2.Post)('ajustar'),
    __param(0, (0, common_2.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], InventarioController.prototype, "ajustar", null);
exports.InventarioController = InventarioController = __decorate([
    (0, common_2.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_2.Controller)('inventario'),
    __metadata("design:paramtypes", [InventarioService])
], InventarioController);
let InventarioModule = class InventarioModule {
};
exports.InventarioModule = InventarioModule;
exports.InventarioModule = InventarioModule = __decorate([
    (0, common_1.Module)({ controllers: [InventarioController], providers: [InventarioService] })
], InventarioModule);
//# sourceMappingURL=inventario.module.js.map