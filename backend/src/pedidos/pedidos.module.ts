import { Module } from '@nestjs/common';
import { PedidosController } from './pedidos.controller';
import { PedidosService } from './pedidos.service';
import { MailModule } from '../mail/mail.module';
import { ComprobantesModule } from '../comprobantes/comprobantes.module';

@Module({
  imports: [
    MailModule,
    ComprobantesModule,
  ],
  controllers: [PedidosController],
  providers: [PedidosService],
})
export class PedidosModule {}