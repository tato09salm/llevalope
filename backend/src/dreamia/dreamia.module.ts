import { Module } from '@nestjs/common';
import { DreamiaController } from './dreamia.controller';
import { DreamiaService } from './dreamia.service';
import { PrismaModule } from '../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DreamiaController],
  providers: [DreamiaService],
  exports: [DreamiaService],
})
export class DreamiaModule {}
