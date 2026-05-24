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
exports.ProductosController = void 0;
const common_1 = require("@nestjs/common");
const productos_service_1 = require("./productos.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
let ProductosController = class ProductosController {
    constructor(productosService) {
        this.productosService = productosService;
    }
    listar(pagina, limite, busqueda, categoriaId, enOferta, destacado, precioMin, precioMax, ordenar, todos) {
        return this.productosService.listar({
            pagina: pagina ? +pagina : 1,
            limite: limite ? +limite : 20,
            busqueda,
            categoriaId: categoriaId ? +categoriaId : undefined,
            enOferta: enOferta !== undefined ? enOferta === true || enOferta === 'true' : undefined,
            destacado: destacado !== undefined ? destacado === true || destacado === 'true' : undefined,
            precioMin: precioMin ? +precioMin : undefined,
            precioMax: precioMax ? +precioMax : undefined,
            ordenar,
            todos: todos !== undefined ? todos === true || todos === 'true' : undefined,
        });
    }
    obtenerDestacados() {
        return this.productosService.obtenerDestacados();
    }
    obtenerOfertas() {
        return this.productosService.obtenerOfertas();
    }
    obtenerPorSlug(slug) {
        return this.productosService.obtenerPorSlug(slug);
    }
    crear(datos) {
        return this.productosService.crear(datos);
    }
    actualizar(id, datos) {
        return this.productosService.actualizar(id, datos);
    }
    eliminar(id) {
        return this.productosService.eliminar(id);
    }
};
exports.ProductosController = ProductosController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('pagina')),
    __param(1, (0, common_1.Query)('limite')),
    __param(2, (0, common_1.Query)('busqueda')),
    __param(3, (0, common_1.Query)('categoria')),
    __param(4, (0, common_1.Query)('enOferta')),
    __param(5, (0, common_1.Query)('destacado')),
    __param(6, (0, common_1.Query)('precioMin')),
    __param(7, (0, common_1.Query)('precioMax')),
    __param(8, (0, common_1.Query)('ordenar')),
    __param(9, (0, common_1.Query)('todos')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, Number, Boolean, Boolean, Number, Number, String, Boolean]),
    __metadata("design:returntype", void 0)
], ProductosController.prototype, "listar", null);
__decorate([
    (0, common_1.Get)('destacados'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ProductosController.prototype, "obtenerDestacados", null);
__decorate([
    (0, common_1.Get)('ofertas'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ProductosController.prototype, "obtenerOfertas", null);
__decorate([
    (0, common_1.Get)(':slug'),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProductosController.prototype, "obtenerPorSlug", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GERENTE', 'OPERADOR'),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ProductosController.prototype, "crear", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GERENTE', 'OPERADOR'),
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], ProductosController.prototype, "actualizar", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GERENTE'),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ProductosController.prototype, "eliminar", null);
exports.ProductosController = ProductosController = __decorate([
    (0, common_1.Controller)('productos'),
    __metadata("design:paramtypes", [productos_service_1.ProductosService])
], ProductosController);
//# sourceMappingURL=productos.controller.js.map