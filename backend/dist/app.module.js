"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const throttler_1 = require("@nestjs/throttler");
const prisma_module_1 = require("./common/prisma/prisma.module");
const auth_module_1 = require("./auth/auth.module");
const usuarios_module_1 = require("./usuarios/usuarios.module");
const productos_module_1 = require("./productos/productos.module");
const categorias_module_1 = require("./categorias/categorias.module");
const pedidos_module_1 = require("./pedidos/pedidos.module");
const proveedores_module_1 = require("./proveedores/proveedores.module");
const inventario_module_1 = require("./inventario/inventario.module");
const soporte_module_1 = require("./soporte/soporte.module");
const reportes_module_1 = require("./reportes/reportes.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            throttler_1.ThrottlerModule.forRoot([
                {
                    ttl: 60000,
                    limit: 100,
                },
            ]),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            usuarios_module_1.UsuariosModule,
            productos_module_1.ProductosModule,
            categorias_module_1.CategoriasModule,
            pedidos_module_1.PedidosModule,
            proveedores_module_1.ProveedoresModule,
            inventario_module_1.InventarioModule,
            soporte_module_1.SoporteModule,
            reportes_module_1.ReportesModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map