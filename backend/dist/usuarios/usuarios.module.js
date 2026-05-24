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
exports.UsuariosModule = exports.UsuariosController = exports.UsuariosService = void 0;
const common_1 = require("@nestjs/common");
const common_2 = require("@nestjs/common");
const common_3 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma/prisma.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let UsuariosService = class UsuariosService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async listar() {
        return this.prisma.usuario.findMany({
            select: {
                id: true, nombre: true, apellido: true, correo: true,
                rol: true, activo: true, verificado: true, creadoEn: true,
            },
            orderBy: { creadoEn: 'desc' },
        });
    }
    async actualizarPerfil(id, datos) {
        return this.prisma.usuario.update({
            where: { id },
            data: { nombre: datos.nombre, apellido: datos.apellido, telefono: datos.telefono },
            select: { id: true, nombre: true, apellido: true, correo: true, telefono: true },
        });
    }
    async agregarDireccion(usuarioId, datos) {
        if (datos.predeterminada) {
            await this.prisma.direccionUsuario.updateMany({
                where: { usuarioId },
                data: { predeterminada: false },
            });
        }
        return this.prisma.direccionUsuario.create({ data: { ...datos, usuarioId } });
    }
    async listarDirecciones(usuarioId) {
        return this.prisma.direccionUsuario.findMany({ where: { usuarioId } });
    }
    async agregarCarrito(usuarioId, productoId, cantidad) {
        const existe = await this.prisma.itemCarrito.findUnique({
            where: { usuarioId_productoId: { usuarioId, productoId } },
        });
        if (existe) {
            return this.prisma.itemCarrito.update({
                where: { id: existe.id },
                data: { cantidad: existe.cantidad + cantidad },
                include: { producto: true },
            });
        }
        return this.prisma.itemCarrito.create({
            data: { usuarioId, productoId, cantidad },
            include: { producto: true },
        });
    }
    async obtenerCarrito(usuarioId) {
        return this.prisma.itemCarrito.findMany({
            where: { usuarioId },
            include: {
                producto: {
                    include: { imagenes: { where: { principal: true }, take: 1 } },
                },
            },
        });
    }
    async eliminarDelCarrito(usuarioId, productoId) {
        return this.prisma.itemCarrito.delete({
            where: { usuarioId_productoId: { usuarioId, productoId } },
        });
    }
};
exports.UsuariosService = UsuariosService;
exports.UsuariosService = UsuariosService = __decorate([
    (0, common_3.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsuariosService);
let UsuariosController = class UsuariosController {
    constructor(usuariosService) {
        this.usuariosService = usuariosService;
    }
    listar() {
        return this.usuariosService.listar();
    }
    actualizarPerfil(req, datos) {
        return this.usuariosService.actualizarPerfil(req.user.id, datos);
    }
    obtenerCarrito(req) {
        return this.usuariosService.obtenerCarrito(req.user.id);
    }
    agregarCarrito(req, body) {
        return this.usuariosService.agregarCarrito(req.user.id, body.productoId, body.cantidad || 1);
    }
    listarDirecciones(req) {
        return this.usuariosService.listarDirecciones(req.user.id);
    }
};
exports.UsuariosController = UsuariosController;
__decorate([
    (0, common_2.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], UsuariosController.prototype, "listar", null);
__decorate([
    (0, common_2.Patch)('perfil'),
    __param(0, (0, common_2.Request)()),
    __param(1, (0, common_2.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], UsuariosController.prototype, "actualizarPerfil", null);
__decorate([
    (0, common_2.Get)('carrito'),
    __param(0, (0, common_2.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsuariosController.prototype, "obtenerCarrito", null);
__decorate([
    (0, common_2.Patch)('carrito'),
    __param(0, (0, common_2.Request)()),
    __param(1, (0, common_2.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], UsuariosController.prototype, "agregarCarrito", null);
__decorate([
    (0, common_2.Get)('direcciones'),
    __param(0, (0, common_2.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsuariosController.prototype, "listarDirecciones", null);
exports.UsuariosController = UsuariosController = __decorate([
    (0, common_2.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_2.Controller)('usuarios'),
    __metadata("design:paramtypes", [UsuariosService])
], UsuariosController);
let UsuariosModule = class UsuariosModule {
};
exports.UsuariosModule = UsuariosModule;
exports.UsuariosModule = UsuariosModule = __decorate([
    (0, common_1.Module)({
        controllers: [UsuariosController],
        providers: [UsuariosService],
        exports: [UsuariosService],
    })
], UsuariosModule);
//# sourceMappingURL=usuarios.module.js.map