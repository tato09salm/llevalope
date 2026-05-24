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
exports.ReportesModule = exports.ReportesController = exports.ReportesService = void 0;
const common_1 = require("@nestjs/common");
const common_2 = require("@nestjs/common");
const common_3 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma/prisma.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let ReportesService = class ReportesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async resumenDashboard() {
        const hoy = new Date();
        const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        const [totalProductos, totalUsuarios, pedidosMes, ventasMes, productosStockBajo, ticketsAbiertos,] = await Promise.all([
            this.prisma.producto.count({ where: { activo: true } }),
            this.prisma.usuario.count({ where: { rol: 'CLIENTE' } }),
            this.prisma.pedido.count({ where: { creadoEn: { gte: inicioMes } } }),
            this.prisma.pedido.aggregate({
                where: { creadoEn: { gte: inicioMes }, estadoPago: 'PAGADO' },
                _sum: { total: true },
            }),
            this.prisma.producto.count({ where: { stock: { lte: 5 }, activo: true } }),
            this.prisma.ticketSoporte.count({ where: { estado: 'ABIERTO' } }),
        ]);
        return {
            totalProductos,
            totalUsuarios,
            pedidosMes,
            ventasMes: ventasMes._sum.total || 0,
            productosStockBajo,
            ticketsAbiertos,
        };
    }
    async ventasPorDia(dias = 30) {
        const desde = new Date();
        desde.setDate(desde.getDate() - dias);
        return this.prisma.pedido.groupBy({
            by: ['creadoEn'],
            where: { creadoEn: { gte: desde }, estadoPago: 'PAGADO' },
            _sum: { total: true },
            _count: { id: true },
        });
    }
    async productosMasVendidos(limite = 10) {
        return this.prisma.producto.findMany({
            where: { activo: true },
            orderBy: { totalVentas: 'desc' },
            take: limite,
            select: { id: true, nombre: true, totalVentas: true, precio: true, imagenPrincipal: true },
        });
    }
};
exports.ReportesService = ReportesService;
exports.ReportesService = ReportesService = __decorate([
    (0, common_3.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportesService);
let ReportesController = class ReportesController {
    constructor(s) {
        this.s = s;
    }
    dashboard() { return this.s.resumenDashboard(); }
    ventasPorDia() { return this.s.ventasPorDia(); }
    masVendidos() { return this.s.productosMasVendidos(); }
};
exports.ReportesController = ReportesController;
__decorate([
    (0, common_2.Get)('dashboard'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ReportesController.prototype, "dashboard", null);
__decorate([
    (0, common_2.Get)('ventas-por-dia'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ReportesController.prototype, "ventasPorDia", null);
__decorate([
    (0, common_2.Get)('productos-mas-vendidos'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ReportesController.prototype, "masVendidos", null);
exports.ReportesController = ReportesController = __decorate([
    (0, common_2.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_2.Controller)('reportes'),
    __metadata("design:paramtypes", [ReportesService])
], ReportesController);
let ReportesModule = class ReportesModule {
};
exports.ReportesModule = ReportesModule;
exports.ReportesModule = ReportesModule = __decorate([
    (0, common_1.Module)({ controllers: [ReportesController], providers: [ReportesService] })
], ReportesModule);
//# sourceMappingURL=reportes.module.js.map