import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class SizeCollectionsService {
  constructor(private prisma: PrismaService) {}

  async listar(todos?: boolean) {
    return await this.prisma.sizeCollection.findMany({
      where: todos ? undefined : { activo: true },
      include: { tallas: { orderBy: { orden: 'asc' } } },
      orderBy: { orden: 'asc' },
    });
  }

  async obtenerPorId(id: number) {
    const coleccion = await this.prisma.sizeCollection.findUnique({
      where: { id },
      include: { tallas: { orderBy: { orden: 'asc' } } },
    });
    if (!coleccion) throw new NotFoundException('Colección no encontrada');
    return coleccion;
  }

  async crear(datos: any) {
    const nombre = datos.nombre.toUpperCase();
    
    const coleccionExistente = await this.prisma.sizeCollection.findUnique({
      where: { nombre },
    });
    
    if (coleccionExistente) {
      throw new BadRequestException(`La colección ${nombre} ya existe`);
    }
    
    return this.prisma.sizeCollection.create({
      data: { ...datos, nombre },
    });
  }

  async actualizar(id: number, datos: any) {
    const existe = await this.prisma.sizeCollection.findUnique({ where: { id } });
    if (!existe) throw new NotFoundException('Colección no encontrada');

    const updateData: any = { ...datos };
    if (updateData.nombre) {
      const nombre = updateData.nombre.toUpperCase();
      const coleccionExistente = await this.prisma.sizeCollection.findUnique({
        where: { nombre },
      });
      
      if (coleccionExistente && coleccionExistente.id !== id) {
        throw new BadRequestException(`La colección ${nombre} ya existe`);
      }
      updateData.nombre = nombre;
    }

    return this.prisma.sizeCollection.update({
      where: { id },
      data: updateData,
    });
  }

  async toggleActive(id: number) {
    const coleccion = await this.obtenerPorId(id);
    return this.prisma.sizeCollection.update({
      where: { id },
      data: { activo: !coleccion.activo },
    });
  }

  async eliminar(id: number) {
    const existe = await this.prisma.sizeCollection.findUnique({ where: { id }, include: { tallas: true } });
    if (!existe) throw new NotFoundException('Colección no encontrada');
    
    if (existe.tallas.length > 0) {
      throw new BadRequestException('No se puede eliminar la colección porque tiene tallas asociadas');
    }

    return this.prisma.sizeCollection.delete({
      where: { id },
    });
  }
}