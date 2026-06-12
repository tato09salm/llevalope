import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class ProveedoresService {
  constructor(private prisma: PrismaService) {}

  private limpiarDatosProveedor(datos: Record<string, any>) {
    const limpio = { ...datos };
    for (const campo of ['contacto', 'correo', 'telefono', 'direccion', 'notas']) {
      if (limpio[campo] === '') limpio[campo] = null;
    }
    return limpio;
  }

  listar(activo?: boolean) {
    const where: any = {};
    if (activo !== undefined) where.activo = activo;
    return this.prisma.proveedor.findMany({ where, orderBy: { nombre: 'asc' } });
  }

  obtenerPorId(id: number) {
    return this.prisma.proveedor.findUnique({ where: { id } });
  }

  crear(datos: any) {
    return this.prisma.proveedor.create({ data: this.limpiarDatosProveedor(datos) as any });
  }

  actualizar(id: number, datos: any) {
    return this.prisma.proveedor.update({
      where: { id },
      data: this.limpiarDatosProveedor(datos) as any,
    });
  }

  eliminar(id: number) {
    return this.prisma.proveedor.update({ where: { id }, data: { activo: false } });
  }

  async crearOrdenCompra(datos: any) {
    if (!datos.items?.length) {
      throw new BadRequestException('La orden de compra debe incluir al menos un item');
    }

    const proveedor = await this.prisma.proveedor.findUnique({
      where: { id: datos.proveedorId },
      select: { id: true, activo: true },
    });
    if (!proveedor || !proveedor.activo) {
      throw new NotFoundException('Proveedor no encontrado o inactivo');
    }

    const numeroOrden = `OC-${Date.now()}`;
    const subtotal = datos.items.reduce((s: number, i: any) => s + i.precioUnit * i.cantidadPedida, 0);
    return this.prisma.ordenCompra.create({
      data: {
        ...datos,
        numeroOrden,
        subtotal,
        total: subtotal,
        items: { create: datos.items.map((i: any) => ({ ...i, subtotal: i.precioUnit * i.cantidadPedida })) },
      },
      include: { items: true, proveedor: true },
    });
  }

  listarOrdenes(proveedorId?: number) {
    const where: any = {};
    if (proveedorId) where.proveedorId = proveedorId;
    return this.prisma.ordenCompra.findMany({
      where,
      include: {
        proveedor: { select: { nombre: true } },
        items: {
          include: {
            producto: { select: { nombre: true } },
            variante: { select: { sku: true } },
          },
        },
      },
      orderBy: { creadoEn: 'desc' },
    });
  }

  async actualizarEstadoOrden(id: number, estado: string) {
    const orden = await this.prisma.ordenCompra.findUnique({ where: { id } });
    if (!orden) {
      throw new NotFoundException('Orden de compra no encontrada');
    }

    return this.prisma.ordenCompra.update({
      where: { id },
      data: { estado: estado as any },
      include: {
        proveedor: { select: { nombre: true } },
        items: {
          include: {
            producto: { select: { nombre: true } },
            variante: { select: { sku: true } },
          },
        },
      },
    });
  }
}
