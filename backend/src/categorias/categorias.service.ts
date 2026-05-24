import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class CategoriasService {
  constructor(private prisma: PrismaService) {}

  async listar(todos?: boolean) {
    try {
      return await this.prisma.categoria.findMany({
        where: todos ? undefined : { activa: true },
        include: { subcategorias: todos ? true : { where: { activa: true } } },
        orderBy: { orden: 'asc' },
      });
    } catch (e) {
      console.error('Error in CategoriasService.listar:', e);
      throw e;
    }
  }
}
