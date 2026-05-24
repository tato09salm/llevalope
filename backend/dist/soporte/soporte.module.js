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
exports.SoporteModule = exports.SoporteController = exports.SoporteService = void 0;
const common_1 = require("@nestjs/common");
const common_2 = require("@nestjs/common");
const common_3 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma/prisma.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let SoporteService = class SoporteService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    crearTicket(usuarioId, datos) {
        return this.prisma.ticketSoporte.create({
            data: { ...datos, usuarioId },
            include: { usuario: { select: { nombre: true, apellido: true } } },
        });
    }
    misTickets(usuarioId) {
        return this.prisma.ticketSoporte.findMany({
            where: { usuarioId },
            include: { mensajes: true },
            orderBy: { creadoEn: 'desc' },
        });
    }
    listarTodos() {
        return this.prisma.ticketSoporte.findMany({
            include: {
                usuario: { select: { nombre: true, apellido: true, correo: true } },
                mensajes: { take: 1, orderBy: { creadoEn: 'desc' } },
            },
            orderBy: { creadoEn: 'desc' },
        });
    }
    responder(ticketId, mensaje, esAgente) {
        return this.prisma.mensajeTicket.create({
            data: { ticketId, mensaje, esAgente },
        });
    }
    actualizarEstado(id, estado) {
        return this.prisma.ticketSoporte.update({ where: { id }, data: { estado: estado } });
    }
};
exports.SoporteService = SoporteService;
exports.SoporteService = SoporteService = __decorate([
    (0, common_3.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SoporteService);
let SoporteController = class SoporteController {
    constructor(s) {
        this.s = s;
    }
    crear(req, d) { return this.s.crearTicket(req.user.id, d); }
    misTickets(req) { return this.s.misTickets(req.user.id); }
    listarTodos() { return this.s.listarTodos(); }
    responder(id, b, req) {
        const esAgente = ['ADMIN', 'GERENTE', 'OPERADOR'].includes(req.user.rol);
        return this.s.responder(id, b.mensaje, esAgente);
    }
    actualizarEstado(id, b) {
        return this.s.actualizarEstado(id, b.estado);
    }
};
exports.SoporteController = SoporteController;
__decorate([
    (0, common_2.Post)('tickets'),
    __param(0, (0, common_2.Request)()),
    __param(1, (0, common_2.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SoporteController.prototype, "crear", null);
__decorate([
    (0, common_2.Get)('mis-tickets'),
    __param(0, (0, common_2.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SoporteController.prototype, "misTickets", null);
__decorate([
    (0, common_2.Get)('admin/tickets'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SoporteController.prototype, "listarTodos", null);
__decorate([
    (0, common_2.Post)('tickets/:id/responder'),
    __param(0, (0, common_2.Param)('id', common_2.ParseIntPipe)),
    __param(1, (0, common_2.Body)()),
    __param(2, (0, common_2.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", void 0)
], SoporteController.prototype, "responder", null);
__decorate([
    (0, common_2.Patch)('tickets/:id/estado'),
    __param(0, (0, common_2.Param)('id', common_2.ParseIntPipe)),
    __param(1, (0, common_2.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], SoporteController.prototype, "actualizarEstado", null);
exports.SoporteController = SoporteController = __decorate([
    (0, common_2.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_2.Controller)('soporte'),
    __metadata("design:paramtypes", [SoporteService])
], SoporteController);
let SoporteModule = class SoporteModule {
};
exports.SoporteModule = SoporteModule;
exports.SoporteModule = SoporteModule = __decorate([
    (0, common_1.Module)({ controllers: [SoporteController], providers: [SoporteService] })
], SoporteModule);
//# sourceMappingURL=soporte.module.js.map