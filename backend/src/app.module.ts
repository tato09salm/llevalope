import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './common/prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { ProductosModule } from './productos/productos.module';
import { CategoriasModule } from './categorias/categorias.module';
import { ColoresModule } from './colores/colores.module';
import { SizeCollectionsModule } from './tallas-colecciones/tallas-colecciones.module';
import { SizesModule } from './tallas/tallas.module';
import { PedidosModule } from './pedidos/pedidos.module';
import { ProveedoresModule } from './proveedores/proveedores.module';
import { InventarioModule } from './inventario/inventario.module';
import { SoporteModule } from './soporte/soporte.module';
import { ReportesModule } from './reportes/reportes.module';
import { MailModule } from './mail/mail.module';
import { ComprobantesModule } from './comprobantes/comprobantes.module';
import { DreamiaModule } from './dreamia/dreamia.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../.env'],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    PrismaModule,
    MailModule,
    AuthModule,
    UsuariosModule,
    ProductosModule,
    CategoriasModule,
    ColoresModule,
    SizeCollectionsModule,
    SizesModule,
    PedidosModule,
    ProveedoresModule,
    ComprobantesModule,
    InventarioModule,
    SoporteModule,
    ReportesModule,
    DreamiaModule,
  ],
})
export class AppModule {}
