import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class PedidosService {
  constructor(private prisma: PrismaService) {}

  async crearPedido(usuarioId: number, datos: any) {
    const { items, direccionId, metodoPago, notas, cupon } = datos;

    if (!items || items.length === 0) {
      throw new BadRequestException('El pedido debe tener al menos un producto');
    }

    // Calcular totales
    let subtotal = 0;
    const itemsValidados = [];

    for (const item of items) {
      const producto = await this.prisma.producto.findUnique({
        where: { id: item.productoId },
      });

      if (!producto) throw new NotFoundException(`Producto ${item.productoId} no encontrado`);
      if (producto.stock < item.cantidad) {
        throw new BadRequestException(`Stock insuficiente para: ${producto.nombre}`);
      }

      const itemSubtotal = Number(producto.precio) * item.cantidad;
      subtotal += itemSubtotal;

      itemsValidados.push({
        productoId: item.productoId,
        nombre: producto.nombre,
        cantidad: item.cantidad,
        precioUnit: producto.precio,
        subtotal: itemSubtotal,
        imagen: producto.imagenPrincipal,
      });
    }

    const costoEnvio = subtotal >= 149 ? 0 : 10;
    const igv = subtotal * 0.18;
    const total = subtotal + costoEnvio + igv;

    const numeroPedido = `LLP-${Date.now()}`;

    const pedido = await this.prisma.$transaction(async (tx) => {
      // Crear pedido
      const nuevoPedido = await tx.pedido.create({
        data: {
          numeroPedido,
          usuarioId,
          direccionId,
          metodoPago: metodoPago || 'TARJETA',
          subtotal,
          costoEnvio,
          impuestos: igv,
          total,
          notas,
          items: {
            create: itemsValidados,
          },
          historial: {
            create: {
              estado: 'PENDIENTE',
              descripcion: 'Pedido recibido y en proceso de confirmación',
            },
          },
        },
        include: { items: true, historial: true },
      });

      // Actualizar stock
      for (const item of itemsValidados) {
        await tx.producto.update({
          where: { id: item.productoId },
          data: { stock: { decrement: item.cantidad }, totalVentas: { increment: item.cantidad } },
        });
      }

      // Limpiar carrito
      await tx.itemCarrito.deleteMany({ where: { usuarioId } });

      return nuevoPedido;
    });

    return pedido;
  }

  async listarPedidosUsuario(usuarioId: number) {
    return this.prisma.pedido.findMany({
      where: { usuarioId },
      include: {
        items: true,
        historial: { orderBy: { creadoEn: 'desc' } },
        envio: true,
      },
      orderBy: { creadoEn: 'desc' },
    });
  }

  async obtenerPedido(id: number, usuarioId?: number) {
    const where: any = { id };
    if (usuarioId) where.usuarioId = usuarioId;

    const pedido = await this.prisma.pedido.findFirst({
      where,
      include: {
        usuario: { select: { nombre: true, apellido: true, correo: true, telefono: true } },
        direccion: true,
        items: true,
        historial: { orderBy: { creadoEn: 'asc' } },
        envio: true,
      },
    });

    if (!pedido) throw new NotFoundException('Pedido no encontrado');
    return pedido;
  }

  async actualizarEstado(id: number, estado: string, descripcion?: string) {
    const pedido = await this.prisma.pedido.findUnique({ where: { id } });
    if (!pedido) throw new NotFoundException('Pedido no encontrado');

    return this.prisma.$transaction([
      this.prisma.pedido.update({
        where: { id },
        data: { estado: estado as any },
      }),
      this.prisma.historialPedido.create({
        data: {
          pedidoId: id,
          estado: estado as any,
          descripcion: descripcion || `Estado actualizado a ${estado}`,
        },
      }),
    ]);
  }

  async listarTodos(params: { pagina?: number; limite?: number; estado?: string }) {
    const { pagina = 1, limite = 20, estado } = params;
    const where: any = {};
    if (estado) where.estado = estado;

    const [pedidos, total] = await Promise.all([
      this.prisma.pedido.findMany({
        where,
        skip: (pagina - 1) * limite,
        take: limite,
        include: {
          usuario: { select: { nombre: true, apellido: true, correo: true } },
          items: { select: { nombre: true, cantidad: true } },
        },
        orderBy: { creadoEn: 'desc' },
      }),
      this.prisma.pedido.count({ where }),
    ]);

    return { datos: pedidos, total, pagina, limite, totalPaginas: Math.ceil(total / limite) };
  }
}
