import { Module } from '@nestjs/common';
import { SizeCollectionsService } from './tallas-colecciones.service';
import { SizeCollectionsController } from './tallas-colecciones.controller';
import { PrismaModule } from '../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SizeCollectionsController],
  providers: [SizeCollectionsService],
  exports: [SizeCollectionsService],
})
export class SizeCollectionsModule {}