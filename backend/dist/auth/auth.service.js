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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcrypt");
const prisma_service_1 = require("../common/prisma/prisma.service");
let AuthService = class AuthService {
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    async registrar(dto) {
        const existe = await this.prisma.usuario.findUnique({
            where: { correo: dto.correo },
        });
        if (existe) {
            throw new common_1.ConflictException('El correo ya está registrado');
        }
        const hash = await bcrypt.hash(dto.contrasena, 10);
        const usuario = await this.prisma.usuario.create({
            data: {
                nombre: dto.nombre,
                apellido: dto.apellido,
                correo: dto.correo,
                contrasena: hash,
                telefono: dto.telefono,
            },
            select: {
                id: true,
                nombre: true,
                apellido: true,
                correo: true,
                rol: true,
                avatar: true,
                creadoEn: true,
            },
        });
        const token = this.generarToken(usuario);
        return { usuario, token };
    }
    async iniciarSesion(dto) {
        const usuario = await this.prisma.usuario.findUnique({
            where: { correo: dto.correo },
        });
        if (!usuario || !usuario.activo) {
            throw new common_1.UnauthorizedException('Credenciales inválidas');
        }
        const valido = await bcrypt.compare(dto.contrasena, usuario.contrasena);
        if (!valido) {
            throw new common_1.UnauthorizedException('Credenciales inválidas');
        }
        const { contrasena, ...datos } = usuario;
        const token = this.generarToken(datos);
        return { usuario: datos, token };
    }
    async perfil(usuarioId) {
        return this.prisma.usuario.findUnique({
            where: { id: usuarioId },
            select: {
                id: true,
                nombre: true,
                apellido: true,
                correo: true,
                telefono: true,
                rol: true,
                avatar: true,
                verificado: true,
                creadoEn: true,
                direcciones: true,
            },
        });
    }
    async validarUsuario(correo, contrasena) {
        const usuario = await this.prisma.usuario.findUnique({
            where: { correo },
        });
        if (usuario && (await bcrypt.compare(contrasena, usuario.contrasena))) {
            const { contrasena: _, ...resultado } = usuario;
            return resultado;
        }
        return null;
    }
    generarToken(usuario) {
        return this.jwtService.sign({
            sub: usuario.id,
            correo: usuario.correo,
            rol: usuario.rol,
        });
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map