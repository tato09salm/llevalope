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
      const variante = await this.prisma.varianteProducto.findUnique({
        where: { id: item.varianteId },
        include: { producto: true },
      });

      if (!variante) throw new NotFoundException(`Variante ${item.varianteId} no encontrada`);
      if (variante.stock < item.cantidad) {
        throw new BadRequestException(`Stock insuficiente para: ${variante.producto.nombre}`);
      }

      const precio = variante.enOferta && variante.precioOferta ? variante.precioOferta : variante.precioBase;
      const itemSubtotal = Number(precio) * item.cantidad;
      subtotal += itemSubtotal;

      itemsValidados.push({
        productoId: variante.productoId,
        varianteId: item.varianteId,
        nombre: variante.producto.nombre,
        sku: variante.sku,
        cantidad: item.cantidad,
        precioUnit: precio,
        subtotal: itemSubtotal,
        imagen: variante.producto.imagenPrincipal,
      });
    }

    let descuentoCupon = 0;
    let cuponAplicado = null;

    if (cupon) {
      const cuponEncontrado = await this.prisma.cupon.findFirst({
        where: {
          codigo: cupon,
          activo: true,
          fechaInicio: { lte: new Date() },
          OR: [
            { fechaFin: null },
            { fechaFin: { gte: new Date() } }
          ]
        }
      });

      if (!cuponEncontrado) {
        throw new BadRequestException('Cupón inválido o expirado');
      }

      // Verificar usos totales
      if (cuponEncontrado.maxUsos && cuponEncontrado.usos >= cuponEncontrado.maxUsos) {
        throw new BadRequestException('Cupón ha alcanzado el límite de usos');
      }

      // Verificar usos por usuario
      if (cuponEncontrado.maxUsosPorUsuario) {
        const usosUsuario = await this.prisma.cuponPedido.count({
          where: {
            cuponId: cuponEncontrado.id,
            pedido: { usuarioId }
          }
        });
        if (usosUsuario >= cuponEncontrado.maxUsosPorUsuario) {
          throw new BadRequestException('Ya has usado este cupón');
        }
      }

      // Verificar mínimo de compra
      if (subtotal < Number(cuponEncontrado.minCompra)) {
        throw new BadRequestException(`El pedido debe tener un mínimo de S/ ${cuponEncontrado.minCompra} para usar este cupón`);
      }

      // Calcular descuento
      if (cuponEncontrado.tipo === 'PORCENTAJE') {
        descuentoCupon = subtotal * (Number(cuponEncontrado.valor) / 100);
      } else {
        descuentoCupon = Number(cuponEncontrado.valor);
      }

      // Asegurarse que el descuento no supere el subtotal
      if (descuentoCupon > subtotal) {
        descuentoCupon = subtotal;
      }

      cuponAplicado = cuponEncontrado;
    }

    const costoEnvio = subtotal >= 149 ? 0 : 10;
    const igv = (subtotal - descuentoCupon) * 0.18;
    const total = (subtotal - descuentoCupon) + costoEnvio + igv;

    const numeroPedido = `LLP-${Date.now()}`;

    const pedido = await this.prisma.$transaction(async (tx) => {
      // Obtener stocks antes de actualizar
      const stocksAntes = new Map();
      for (const item of itemsValidados) {
        const variante = await tx.varianteProducto.findUnique({
          where: { id: item.varianteId },
          select: { stock: true }
        });
        if (variante) {
          stocksAntes.set(item.varianteId, variante.stock);
        }
      }

      // Crear pedido
      const nuevoPedido = await tx.pedido.create({
        data: {
          numeroPedido,
          usuarioId,
          direccionId,
          metodoPago: metodoPago || 'TARJETA',
          subtotal,
          descuento: descuentoCupon,
          descuentoCupon,
          costoEnvio,
          impuestos: igv,
          total,
          notas,
          cuponId: cuponAplicado?.id,
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
        include: { items: true, historial: true, cupon: true },
      });

      // Crear registro de cupón aplicado
      if (cuponAplicado) {
        await tx.cuponPedido.create({
          data: {
            pedidoId: nuevoPedido.id,
            cuponId: cuponAplicado.id,
            codigoCupon: cuponAplicado.codigo,
            tipoDescuento: cuponAplicado.tipo,
            valorDescuento: cuponAplicado.valor,
            montoAhorrado: descuentoCupon,
          }
        });

        // Incrementar usos del cupón
        await tx.cupon.update({
          where: { id: cuponAplicado.id },
          data: { usos: { increment: 1 } }
        });
      }

      // Actualizar stock y totalVentas
      for (const item of itemsValidados) {
        const stockAntes = stocksAntes.get(item.varianteId) || 0;
        const stockDespues = stockAntes - item.cantidad;
        await tx.varianteProducto.update({
          where: { id: item.varianteId },
          data: { stock: stockDespues },
        });
        await tx.producto.update({
          where: { id: item.productoId },
          data: { totalVentas: { increment: item.cantidad } },
        });
        // Crear movimiento de inventario
        await tx.movimientoInventario.create({
          data: {
            productoId: item.productoId,
            varianteId: item.varianteId,
            tipo: 'SALIDA',
            cantidad: item.cantidad,
            stockAnterior: stockAntes,
            stockNuevo: stockDespues,
            motivo: `Venta - Pedido ${numeroPedido}`,
            referencia: numeroPedido,
          }
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

  async listarPagosPedido(pedidoId: number, usuarioId?: number) {
    const where: any = { pedidoId };
    if (usuarioId) {
      const pedido = await this.prisma.pedido.findFirst({ where: { id: pedidoId, usuarioId } });
      if (!pedido) throw new NotFoundException('Pedido no encontrado');
    }

    return this.prisma.pagoPedido.findMany({
      where,
      orderBy: { creadoEn: 'desc' }
    });
  }

  async crearPago(pedidoId: number, datos: any, usuarioId?: number) {
    const pedido = await this.prisma.pedido.findUnique({ where: { id: pedidoId } });
    if (!pedido) throw new NotFoundException('Pedido no encontrado');
    if (usuarioId && pedido.usuarioId !== usuarioId) throw new NotFoundException('Pedido no encontrado');

    return this.prisma.pagoPedido.create({
      data: {
        pedidoId,
        metodo: datos.metodo,
        estado: datos.estado || 'PENDIENTE',
        monto: datos.monto,
        referenciaPago: datos.referenciaPago,
        codigoRespuesta: datos.codigoRespuesta,
        mensajeRespuesta: datos.mensajeRespuesta,
        intentoNumero: datos.intentoNumero || 1,
      }
    });
  }

  async actualizarPago(pagoId: number, datos: any, usuarioId?: number) {
    const pago = await this.prisma.pagoPedido.findUnique({
      where: { id: pagoId },
      include: { pedido: true }
    });
    if (!pago) throw new NotFoundException('Pago no encontrado');
    if (usuarioId && pago.pedido.usuarioId !== usuarioId) throw new NotFoundException('Pago no encontrado');

    return this.prisma.pagoPedido.update({
      where: { id: pagoId },
      data: datos
    });
  }
}
