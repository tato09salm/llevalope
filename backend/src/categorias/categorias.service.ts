import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class CategoriasService {
  constructor(private prisma: PrismaService) {}

  async listar(todos?: boolean) {
    try {
      return await this.prisma.categoria.findMany({
        where: todos ? undefined : { activa: true },
        include: { 
          categoriaPadre: { select: { id: true, nombre: true, slug: true } },
          subcategorias: todos ? true : { where: { activa: true } } 
        },
        orderBy: { orden: 'asc' },
      });
    } catch (e) {
      console.error('Error in CategoriasService.listar:', e);
      throw e;
    }
  }

  async listarCategoriasPadre(todos?: boolean) {
    try {
      const categorias = await this.prisma.categoria.findMany({
        where: {
          ...(todos ? {} : { activa: true }),
          categoriaPadreId: null,
        },
        include: {
          subcategorias: {
            where: todos ? {} : { activa: true },
          },
        },
        orderBy: { orden: 'asc' },
      });

      // Add product count for each parent category
      const categoriasConCantidad = await Promise.all(
        categorias.map(async (categoria) => {
          // Count products in parent category and all subcategories
          const subcategoriaIds = categoria.subcategorias.map((sub) => sub.id);
          const count = await this.prisma.producto.count({
            where: {
              categoriaId: {
                in: [categoria.id, ...subcategoriaIds],
              },
              ...(todos ? {} : { activo: true }),
            },
          });

          return {
            ...categoria,
            cantidadProductos: count,
          };
        })
      );

      return categoriasConCantidad;
    } catch (e) {
      console.error('Error in CategoriasService.listarCategoriasPadre:', e);
      throw e;
    }
  }

  async obtenerPorId(id: number) {
    const categoria = await this.prisma.categoria.findUnique({
      where: { id },
      include: {
        categoriaPadre: true,
        subcategorias: true,
      },
    });
    if (!categoria) throw new NotFoundException('Categoría no encontrada');
    return categoria;
  }

  async crear(datos: any) {
    let slug = this.generarSlug(datos.nombre);
    let counter = 1;
    let slugExistente = await this.prisma.categoria.findUnique({ where: { slug } });
    
    while (slugExistente) {
      slug = `${this.generarSlug(datos.nombre)}-${counter}`;
      slugExistente = await this.prisma.categoria.findUnique({ where: { slug } });
      counter++;
    }

    return this.prisma.categoria.create({
      data: { ...datos, slug },
    });
  }

  async actualizar(id: number, datos: any) {
    const existe = await this.prisma.categoria.findUnique({ where: { id } });
    if (!existe) throw new NotFoundException('Categoría no encontrada');

    return this.prisma.categoria.update({
      where: { id },
      data: datos,
    });
  }

  async toggleActive(id: number) {
    const categoria = await this.obtenerPorId(id);
    return this.prisma.categoria.update({
      where: { id },
      data: { activa: !categoria.activa },
    });
  }

  async eliminar(id: number) {
    const productosAsociados = await this.prisma.producto.count({
      where: { categoriaId: id },
    });
    
    const subcategorias = await this.prisma.categoria.findMany({
      where: { categoriaPadreId: id },
    });

    for (const sub of subcategorias) {
      const subProductos = await this.prisma.producto.count({
        where: { categoriaId: sub.id },
      });
      if (subProductos > 0) {
        throw new Error('Esta categoría tiene subcategorías con productos asociados');
      }
    }

    if (productosAsociados > 0) {
      throw new Error('Esta categoría tiene productos asociados');
    }

    return this.prisma.categoria.delete({
      where: { id },
    });
  }

  private generarSlug(texto: string): string {
    return texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
      .replace(/^-+|-+$/g, ''); // Remove leading and trailing hyphens
  }
}
