import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class ColoresService {
  constructor(private prisma: PrismaService) {}

  async listar(todos?: boolean) {
    try {
      return await this.prisma.color.findMany({
        where: todos ? undefined : { activo: true },
        orderBy: { nombre: 'asc' },
      });
    } catch (e) {
      console.error('Error in ColoresService.listar:', e);
      throw e;
    }
  }

  async obtenerPorId(id: number) {
    const color = await this.prisma.color.findUnique({
      where: { id },
    });
    if (!color) throw new NotFoundException('Color no encontrado');
    return color;
  }

  async crear(datos: any) {
    const nombre = datos.nombre.toUpperCase();
    const hex = datos.hex.toUpperCase().startsWith('#') 
      ? datos.hex.toUpperCase() 
      : `#${datos.hex.toUpperCase()}`;
    
    // Verificar si el HEX ya existe
    const colorExistente = await this.prisma.color.findUnique({
      where: { hex },
    });
    
    if (colorExistente) {
      throw new BadRequestException(`El color ${colorExistente.nombre} ya existe con el HEX ${hex}`);
    }
    
    return this.prisma.color.create({
      data: { 
        ...datos, 
        nombre, 
        hex,
      },
    });
  }

  async actualizar(id: number, datos: any) {
    const existe = await this.prisma.color.findUnique({ where: { id } });
    if (!existe) throw new NotFoundException('Color no encontrado');

    const updateData: any = { ...datos };
    if (updateData.nombre) updateData.nombre = updateData.nombre.toUpperCase();
    if (updateData.hex) {
      updateData.hex = updateData.hex.toUpperCase().startsWith('#') 
        ? updateData.hex.toUpperCase() 
        : `#${updateData.hex.toUpperCase()}`;
        
      // Verificar si el HEX ya existe en otro color
      const colorExistente = await this.prisma.color.findUnique({
        where: { hex: updateData.hex },
      });
      
      if (colorExistente && colorExistente.id !== id) {
        throw new BadRequestException(`El color ${colorExistente.nombre} ya existe con el HEX ${updateData.hex}`);
      }
    }

    return this.prisma.color.update({
      where: { id },
      data: updateData,
    });
  }

  async toggleActive(id: number) {
    const color = await this.obtenerPorId(id);
    return this.prisma.color.update({
      where: { id },
      data: { activo: !color.activo },
    });
  }

  async eliminar(id: number) {
    const existe = await this.prisma.color.findUnique({ where: { id } });
    if (!existe) throw new NotFoundException('Color no encontrado');

    return this.prisma.color.delete({
      where: { id },
    });
  }
}
