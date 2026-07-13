import { Module } from '@nestjs/common';
import { ComprobantesService } from './comprobantes.service';

@Module({
  providers: [ComprobantesService],
  exports: [ComprobantesService],
})
export class ComprobantesModule {}