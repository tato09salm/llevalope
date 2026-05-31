import { Module } from '@nestjs/common';
import { SizesService } from './tallas.service';
import { SizesController } from './tallas.controller';
import { PrismaModule } from '../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SizesController],
  providers: [SizesService],
  exports: [SizesService],
})
export class SizesModule {}