import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class SizesService {
  constructor(private prisma: PrismaService) {}

  async listar(todos?: boolean) {
    return await this.prisma.size.findMany({
      where: todos ? undefined : { activo: true },
      include: { coleccion: true },
      orderBy: [
        { orden: 'asc' },
      ],
    });
  }

  async obtenerPorId(id: number) {
    const talla = await this.prisma.size.findUnique({
      where: { id },
      include: { coleccion: true },
    });
    if (!talla) throw new NotFoundException('Talla no encontrada');
    return talla;
  }

  async crear(datos: any) {
    const nombre = datos.nombre.toUpperCase();
    
    return this.prisma.size.create({
      data: { ...datos, nombre },
      include: { coleccion: true },
    });
  }

  async actualizar(id: number, datos: any) {
    const existe = await this.prisma.size.findUnique({ where: { id } });
    if (!existe) throw new NotFoundException('Talla no encontrada');

    const updateData: any = { ...datos };
    if (updateData.nombre) {
      updateData.nombre = updateData.nombre.toUpperCase();
    }

    return this.prisma.size.update({
      where: { id },
      data: updateData,
      include: { coleccion: true },
    });
  }

  async toggleActive(id: number) {
    const talla = await this.obtenerPorId(id);
    return this.prisma.size.update({
      where: { id },
      data: { activo: !talla.activo },
    });
  }

  async eliminar(id: number) {
    const existe = await this.prisma.size.findUnique({ where: { id } });
    if (!existe) throw new NotFoundException('Talla no encontrada');

    return this.prisma.size.delete({
      where: { id },
    });
  }
}