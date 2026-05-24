import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class ProductosService {
  constructor(private prisma: PrismaService) {}

  async listar(params: {
    pagina?: number;
    limite?: number;
    busqueda?: string;
    categoriaId?: number;
    enOferta?: boolean;
    destacado?: boolean;
    precioMin?: number;
    precioMax?: number;
    ordenar?: string;
    todos?: boolean;
  }) {
    const {
      pagina = 1,
      limite = 20,
      busqueda,
      categoriaId,
      enOferta,
      destacado,
      precioMin,
      precioMax,
      ordenar = 'creadoEn',
      todos = false,
    } = params;

    const skip = (pagina - 1) * limite;

    const where: any = todos ? {} : { activo: true };

    if (busqueda) {
      where.OR = [
        { nombre: { contains: busqueda, mode: 'insensitive' } },
        { descripcionCorta: { contains: busqueda, mode: 'insensitive' } },
        { sku: { contains: busqueda, mode: 'insensitive' } },
      ];
    }

    if (categoriaId) where.categoriaId = categoriaId;
    if (enOferta !== undefined) where.enOferta = enOferta;
    if (destacado !== undefined) where.destacado = destacado;

    if (precioMin !== undefined || precioMax !== undefined) {
      where.precio = {};
      if (precioMin !== undefined) where.precio.gte = precioMin;
      if (precioMax !== undefined) where.precio.lte = precioMax;
    }

    const orderBy: any = {};
    if (ordenar === 'precio_asc') orderBy.precio = 'asc';
    else if (ordenar === 'precio_desc') orderBy.precio = 'desc';
    else if (ordenar === 'calificacion') orderBy.calificacion = 'desc';
    else if (ordenar === 'ventas') orderBy.totalVentas = 'desc';
    else orderBy.creadoEn = 'desc';

    const [productos, total] = await Promise.all([
      this.prisma.producto.findMany({
        where,
        skip,
        take: limite,
        orderBy,
        include: {
          categoria: { select: { id: true, nombre: true, slug: true } },
          marca: { select: { id: true, nombre: true } },
          imagenes: { where: { principal: true }, take: 1 },
        },
      }),
      this.prisma.producto.count({ where }),
    ]);

    return {
      datos: productos,
      total,
      pagina,
      limite,
      totalPaginas: Math.ceil(total / limite),
    };
  }

  async obtenerPorSlug(slug: string) {
    const producto = await this.prisma.producto.findUnique({
      where: { slug },
      include: {
        categoria: true,
        marca: true,
        imagenes: { orderBy: { orden: 'asc' } },
        variantes: true,
        resenas: {
          where: { aprobada: true },
          include: {
            usuario: { select: { nombre: true, apellido: true, avatar: true } },
          },
          take: 10,
          orderBy: { creadoEn: 'desc' },
        },
      },
    });

    if (!producto) throw new NotFoundException('Producto no encontrado');
    return producto;
  }

  async obtenerDestacados() {
    return this.prisma.producto.findMany({
      where: { activo: true, destacado: true },
      take: 8,
      orderBy: { totalVentas: 'desc' },
      include: {
        categoria: { select: { nombre: true, slug: true } },
        imagenes: { where: { principal: true }, take: 1 },
      },
    });
  }

  async obtenerOfertas() {
    return this.prisma.producto.findMany({
      where: { activo: true, enOferta: true },
      take: 12,
      orderBy: { porcentajeDescuento: 'desc' },
      include: {
        imagenes: { where: { principal: true }, take: 1 },
      },
    });
  }

  async crear(datos: any) {
    const slug = this.generarSlug(datos.nombre);
    return this.prisma.producto.create({
      data: { ...datos, slug },
    });
  }

  async actualizar(id: number, datos: any) {
    const existe = await this.prisma.producto.findUnique({ where: { id } });
    if (!existe) throw new NotFoundException('Producto no encontrado');

    return this.prisma.producto.update({
      where: { id },
      data: datos,
    });
  }

  async eliminar(id: number) {
    return this.prisma.producto.update({
      where: { id },
      data: { activo: false },
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
      .trim();
  }
}
