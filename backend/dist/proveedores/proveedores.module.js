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
exports.ProveedoresModule = exports.ProveedoresController = exports.ProveedoresService = void 0;
const common_1 = require("@nestjs/common");
const common_2 = require("@nestjs/common");
const common_3 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma/prisma.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let ProveedoresService = class ProveedoresService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    listar() {
        return this.prisma.proveedor.findMany({ where: { activo: true }, orderBy: { nombre: 'asc' } });
    }
    crear(datos) {
        return this.prisma.proveedor.create({ data: datos });
    }
    async crearOrdenCompra(datos) {
        const numeroOrden = `OC-${Date.now()}`;
        const subtotal = datos.items.reduce((s, i) => s + i.precioUnit * i.cantidadPedida, 0);
        return this.prisma.ordenCompra.create({
            data: {
                ...datos,
                numeroOrden,
                subtotal,
                total: subtotal,
                items: { create: datos.items.map((i) => ({ ...i, subtotal: i.precioUnit * i.cantidadPedida })) },
            },
            include: { items: true, proveedor: true },
        });
    }
    listarOrdenes() {
        return this.prisma.ordenCompra.findMany({
            include: { proveedor: { select: { nombre: true } }, items: true },
            orderBy: { creadoEn: 'desc' },
        });
    }
};
exports.ProveedoresService = ProveedoresService;
exports.ProveedoresService = ProveedoresService = __decorate([
    (0, common_3.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProveedoresService);
let ProveedoresController = class ProveedoresController {
    constructor(s) {
        this.s = s;
    }
    listar() { return this.s.listar(); }
    crear(d) { return this.s.crear(d); }
    listarOrdenes() { return this.s.listarOrdenes(); }
    crearOrden(d) { return this.s.crearOrdenCompra(d); }
};
exports.ProveedoresController = ProveedoresController;
__decorate([
    (0, common_2.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ProveedoresController.prototype, "listar", null);
__decorate([
    (0, common_2.Post)(),
    __param(0, (0, common_2.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ProveedoresController.prototype, "crear", null);
__decorate([
    (0, common_2.Get)('ordenes'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ProveedoresController.prototype, "listarOrdenes", null);
__decorate([
    (0, common_2.Post)('ordenes'),
    __param(0, (0, common_2.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ProveedoresController.prototype, "crearOrden", null);
exports.ProveedoresController = ProveedoresController = __decorate([
    (0, common_2.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_2.Controller)('proveedores'),
    __metadata("design:paramtypes", [ProveedoresService])
], ProveedoresController);
let ProveedoresModule = class ProveedoresModule {
};
exports.ProveedoresModule = ProveedoresModule;
exports.ProveedoresModule = ProveedoresModule = __decorate([
    (0, common_1.Module)({ controllers: [ProveedoresController], providers: [ProveedoresService] })
], ProveedoresModule);
//# sourceMappingURL=proveedores.module.js.map