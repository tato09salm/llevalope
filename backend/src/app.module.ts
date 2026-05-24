import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './common/prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { ProductosModule } from './productos/productos.module';
import { CategoriasModule } from './categorias/categorias.module';
import { PedidosModule } from './pedidos/pedidos.module';
import { ProveedoresModule } from './proveedores/proveedores.module';
import { InventarioModule } from './inventario/inventario.module';
import { SoporteModule } from './soporte/soporte.module';
import { ReportesModule } from './reportes/reportes.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    PrismaModule,
    AuthModule,
    UsuariosModule,
    ProductosModule,
    CategoriasModule,
    PedidosModule,
    ProveedoresModule,
    InventarioModule,
    SoporteModule,
    ReportesModule,
  ],
})
export class AppModule {}
