import { randomUUID } from 'crypto';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import {
  calcularCostoEnvio,
  calcularIgvIncluido,
  COSTO_ENVIO_STANDARD,
  DESCUENTO_VOLUMEN_TASA,
  ENVIO_GRATIS_DESDE,
  redondearMoneda,
  RESERVA_STOCK_MINUTOS,
  TipoEnvio,
} from './pedidos.rules';

@Injectable()
export class PedidosService {
  constructor(private prisma: PrismaService) {}

  async previewCheckout(usuarioId: number, datos: any) {
    return this.construirCheckout(usuarioId, datos, Boolean(datos.reservarStock));
  }

  async crearPedido(usuarioId: number, datos: any) {
    const { direccionId, metodoPago, notas, checkoutToken } = datos;

    if (!direccionId) {
      throw new BadRequestException('Debes seleccionar una dirección de envío');
    }

    const preview = await this.construirCheckout(usuarioId, datos, false);
    const numeroPedido = this.generarNumeroPedido();

    const pedido = await this.prisma.$transaction(async (tx) => {
      await this.validarDireccionUsuario(tx, usuarioId, direccionId);
      await this.liberarReservasExpiradas(tx);

      if (checkoutToken) {
        await this.validarReservasActivas(tx, usuarioId, checkoutToken, preview.items);
      }

      const stocksAntes = new Map<number, number>();

      for (const item of preview.items) {
        const varianteActual = await tx.varianteProducto.findUnique({
          where: { id: item.varianteId },
          select: { stock: true },
        });

        if (!varianteActual) {
          throw new NotFoundException(`Variante ${item.varianteId} no encontrada`);
        }

        if (varianteActual.stock < item.cantidad) {
          throw new BadRequestException(`Stock insuficiente para ${item.nombre}`);
        }

        stocksAntes.set(item.varianteId, varianteActual.stock);
      }

      const nuevoPedido = await tx.pedido.create({
        data: {
          numeroPedido,
          usuarioId,
          direccionId,
          metodoPago: metodoPago || 'TARJETA',
          subtotal: preview.resumen.subtotalProductos,
          descuento: preview.resumen.descuentoVolumen + preview.resumen.descuentoCupon,
          descuentoCupon: preview.resumen.descuentoCupon,
          descuentoVolumen: preview.resumen.descuentoVolumen,
          costoEnvio: preview.resumen.costoEnvio,
          impuestos: preview.resumen.igvIncluido,
          total: preview.resumen.total,
          ahorroTotal: preview.resumen.ahorroTotal,
          tipoEnvio: preview.resumen.tipoEnvio,
          notas,
          cuponId: preview.cupon?.id,
          items: {
            create: preview.items.map((item) => ({
              productoId: item.productoId,
              varianteId: item.varianteId,
              nombre: item.nombre,
              cantidad: item.cantidad,
              precioUnit: item.precioUnitario,
              subtotal: item.subtotalFinal,
              imagen: item.imagen,
            })),
          },
          historial: {
            create: {
              estado: 'PENDIENTE',
              descripcion:
                preview.resumen.tipoEnvio === 'EXPRESS'
                  ? 'Pedido recibido con despacho express'
                  : 'Pedido recibido y pendiente de confirmacion',
            },
          },
        },
        include: {
          items: true,
          historial: true,
          cupon: true,
        },
      });

      if (preview.cupon) {
        await tx.cuponPedido.create({
          data: {
            pedidoId: nuevoPedido.id,
            cuponId: preview.cupon.id,
            codigoCupon: preview.cupon.codigo,
            tipoDescuento: preview.cupon.tipo,
            valorDescuento: preview.cupon.valor,
            montoAhorrado: preview.resumen.descuentoCupon,
          },
        });

        await tx.cupon.update({
          where: { id: preview.cupon.id },
          data: { usos: { increment: 1 } },
        });
      }

      for (const item of preview.items) {
        const stockAntes = stocksAntes.get(item.varianteId) || 0;
        const stockNuevo = stockAntes - item.cantidad;

        await tx.varianteProducto.update({
          where: { id: item.varianteId },
          data: { stock: stockNuevo },
        });

        await tx.producto.update({
          where: { id: item.productoId },
          data: { totalVentas: { increment: item.cantidad } },
        });

        await tx.movimientoInventario.create({
          data: {
            productoId: item.productoId,
            varianteId: item.varianteId,
            tipo: 'SALIDA',
            cantidad: item.cantidad,
            stockAnterior: stockAntes,
            stockNuevo,
            motivo: `Venta - Pedido ${numeroPedido}`,
            referencia: numeroPedido,
          },
        });
      }

      await tx.itemCarrito.deleteMany({ where: { usuarioId } });
      await tx.reservaStock.deleteMany({ where: { usuarioId } });

      return nuevoPedido;
    });

    return pedido;
  }

  async listarPedidosUsuario(usuarioId: number) {
    return this.prisma.pedido.findMany({
      where: { usuarioId },
      include: {
        items: {
          include: {
            producto: {
              include: {
                categoria: { select: { id: true, nombre: true, slug: true } },
                imagenes: { where: { principal: true }, take: 1 },
              },
            },
            variante: {
              include: {
                color: true,
                size: true,
                imagenes: true,
              },
            },
          },
        },
        historial: { orderBy: { creadoEn: 'desc' } },
        envio: true,
        cupon: true,
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
        items: {
          include: {
            producto: {
              include: {
                categoria: { select: { id: true, nombre: true, slug: true } },
                imagenes: { where: { principal: true }, take: 1 },
              },
            },
            variante: {
              include: {
                color: true,
                size: true,
                imagenes: true,
              },
            },
          },
        },
        historial: { orderBy: { creadoEn: 'asc' } },
        envio: true,
        cupon: true,
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
      orderBy: { creadoEn: 'desc' },
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
      },
    });
  }

  async actualizarPago(pagoId: number, datos: any, usuarioId?: number) {
    const pago = await this.prisma.pagoPedido.findUnique({
      where: { id: pagoId },
      include: { pedido: true },
    });
    if (!pago) throw new NotFoundException('Pago no encontrado');
    if (usuarioId && pago.pedido.usuarioId !== usuarioId) throw new NotFoundException('Pago no encontrado');

    return this.prisma.pagoPedido.update({
      where: { id: pagoId },
      data: datos,
    });
  }

  private async construirCheckout(usuarioId: number, datos: any, reservarStock: boolean) {
    const { items, direccionId, cupon, tipoEnvio = 'STANDARD' } = datos;

    if (!items || items.length === 0) {
      throw new BadRequestException('El pedido debe tener al menos un producto');
    }

    await this.liberarReservasExpiradas(this.prisma);

    if (direccionId) {
      await this.validarDireccionUsuario(this.prisma, usuarioId, direccionId);
    }

    const itemsValidados = await this.validarItems(usuarioId, items);
    const subtotalOriginal = redondearMoneda(
      itemsValidados.reduce((acc, item) => acc + item.subtotalOriginal, 0),
    );
    const descuentoOferta = redondearMoneda(
      itemsValidados.reduce((acc, item) => acc + item.descuentoOferta, 0),
    );
    const descuentoVolumen = redondearMoneda(
      itemsValidados.reduce((acc, item) => acc + item.descuentoVolumen, 0),
    );
    const subtotalPostVolumen = redondearMoneda(
      itemsValidados.reduce((acc, item) => acc + item.subtotalDespuesVolumen, 0),
    );

    const cuponAplicado = cupon
      ? await this.validarCupon(usuarioId, cupon, itemsValidados, subtotalPostVolumen)
      : null;

    const descuentoCupon = cuponAplicado?.descuento ?? 0;
    const totalMercaderia = redondearMoneda(subtotalPostVolumen - descuentoCupon);
    const costoEnvio = calcularCostoEnvio(totalMercaderia, tipoEnvio as TipoEnvio);
    const igvIncluido = calcularIgvIncluido(totalMercaderia);
    const ahorroEnvio =
      (tipoEnvio as TipoEnvio) === 'STANDARD' && totalMercaderia >= ENVIO_GRATIS_DESDE
        ? COSTO_ENVIO_STANDARD
        : 0;
    const ahorroTotal = redondearMoneda(
      descuentoOferta + descuentoVolumen + descuentoCupon + ahorroEnvio,
    );
    const total = redondearMoneda(totalMercaderia + costoEnvio);

    let checkoutToken: string | undefined;
    let reservaExpiraEn: Date | undefined;

    if (reservarStock) {
      checkoutToken = randomUUID();
      reservaExpiraEn = new Date(Date.now() + RESERVA_STOCK_MINUTOS * 60 * 1000);

      await this.prisma.$transaction(async (tx) => {
        await tx.reservaStock.deleteMany({ where: { usuarioId } });

        await tx.reservaStock.createMany({
          data: itemsValidados.map((item) => ({
            usuarioId,
            varianteId: item.varianteId,
            cantidad: item.cantidad,
            checkoutToken: checkoutToken!,
            expiraEn: reservaExpiraEn!,
          })),
        });
      });
    }

    return {
      items: itemsValidados.map((item) => ({
        productoId: item.productoId,
        categoriaId: item.categoriaId,
        varianteId: item.varianteId,
        nombre: item.nombre,
        sku: item.sku,
        cantidad: item.cantidad,
        imagen: item.imagen,
        precioBase: item.precioBase,
        precioUnitario: item.precioUnitario,
        subtotalOriginal: item.subtotalOriginal,
        descuentoOferta: item.descuentoOferta,
        descuentoVolumen: item.descuentoVolumen,
        subtotalFinal: item.subtotalDespuesVolumen,
        stockDisponible: item.stockDisponible,
      })),
      resumen: {
        subtotalOriginal,
        subtotalProductos: totalMercaderia,
        descuentoOferta,
        descuentoVolumen,
        descuentoCupon,
        costoEnvio,
        envioGratis: costoEnvio === 0 && (tipoEnvio as TipoEnvio) === 'STANDARD',
        igvIncluido,
        total,
        ahorroTotal,
        tipoEnvio,
        umbralEnvioGratis: ENVIO_GRATIS_DESDE,
        faltanteEnvioGratis:
          (tipoEnvio as TipoEnvio) === 'STANDARD' && totalMercaderia < ENVIO_GRATIS_DESDE
            ? redondearMoneda(ENVIO_GRATIS_DESDE - totalMercaderia)
            : 0,
      },
      cupon: cuponAplicado
        ? {
            id: cuponAplicado.id,
            codigo: cuponAplicado.codigo,
            tipo: cuponAplicado.tipo,
            valor: cuponAplicado.valor,
            descuento: cuponAplicado.descuento,
          }
        : null,
      checkoutToken,
      reservaExpiraEn,
    };
  }

  private async validarItems(usuarioId: number, items: Array<{ varianteId: number; cantidad: number }>) {
    const ahora = new Date();
    const itemsValidados = [];

    for (const item of items) {
      const variante = await this.prisma.varianteProducto.findUnique({
        where: { id: item.varianteId },
        include: {
          producto: {
            include: {
              categoria: { select: { id: true, nombre: true, slug: true } },
            },
          },
        },
      });

      if (!variante || !variante.activo || !variante.producto.activo) {
        throw new NotFoundException(`Variante ${item.varianteId} no encontrada`);
      }

      const reservadoPorOtros = await this.prisma.reservaStock.aggregate({
        _sum: { cantidad: true },
        where: {
          varianteId: item.varianteId,
          expiraEn: { gt: ahora },
          usuarioId: { not: usuarioId },
        },
      });

      const stockDisponible = variante.stock - (reservadoPorOtros._sum.cantidad || 0);
      if (stockDisponible < item.cantidad) {
        throw new BadRequestException(`Stock insuficiente para ${variante.producto.nombre}`);
      }

      const precioCatalogo = variante.enOferta && variante.precioOferta
        ? Number(variante.precioOferta)
        : Number(variante.precioBase);
      const precioBase = Number(variante.precioBase);
      const subtotalOriginal = redondearMoneda(precioCatalogo * item.cantidad);
      const descuentoOferta = redondearMoneda(
        variante.enOferta && variante.precioOferta && Number(variante.precioOferta) < precioBase
          ? (precioBase - Number(variante.precioOferta)) * item.cantidad
          : 0,
      );
      const descuentoVolumen = item.cantidad >= 3
        ? redondearMoneda(subtotalOriginal * DESCUENTO_VOLUMEN_TASA)
        : 0;
      const subtotalDespuesVolumen = redondearMoneda(subtotalOriginal - descuentoVolumen);

      itemsValidados.push({
        productoId: variante.productoId,
        categoriaId: variante.producto.categoriaId,
        varianteId: variante.id,
        nombre: variante.producto.nombre,
        sku: variante.sku,
        cantidad: item.cantidad,
        imagen: variante.producto.imagenPrincipal,
        precioBase,
        precioUnitario: redondearMoneda(precioCatalogo),
        subtotalOriginal,
        descuentoOferta,
        descuentoVolumen,
        subtotalDespuesVolumen,
        stockDisponible,
      });
    }

    return itemsValidados;
  }

  private async validarCupon(
    usuarioId: number,
    codigoCupon: string,
    itemsValidados: any[],
    subtotalPostVolumen: number,
  ) {
    const cupon = await this.prisma.cupon.findFirst({
      where: {
        codigo: codigoCupon,
        activo: true,
        fechaInicio: { lte: new Date() },
        OR: [{ fechaFin: null }, { fechaFin: { gte: new Date() } }],
      },
    });

    if (!cupon) {
      throw new BadRequestException('Cupon invalido o expirado');
    }

    if (cupon.maxUsos && cupon.usos >= cupon.maxUsos) {
      throw new BadRequestException('El cupon ya alcanzo el limite de usos');
    }

    if (cupon.maxUsosPorUsuario) {
      const usosUsuario = await this.prisma.cuponPedido.count({
        where: { cuponId: cupon.id, pedido: { usuarioId } },
      });
      if (usosUsuario >= cupon.maxUsosPorUsuario) {
        throw new BadRequestException('Ya usaste este cupon anteriormente');
      }
    }

    if (subtotalPostVolumen < Number(cupon.minCompra)) {
      throw new BadRequestException(
        `El pedido debe tener un minimo de S/ ${cupon.minCompra} para usar este cupon`,
      );
    }

    const productosAplicables = this.parseJsonIds(cupon.productosAplicables);
    const categoriasAplicables = this.parseJsonIds(cupon.categoriasAplicables);
    const tieneRestricciones = productosAplicables.length > 0 || categoriasAplicables.length > 0;

    const itemsElegibles = itemsValidados.filter((item) => {
      if (!tieneRestricciones) return true;
      return (
        productosAplicables.includes(item.productoId) ||
        categoriasAplicables.includes(item.categoriaId)
      );
    });

    if (tieneRestricciones && itemsElegibles.length === 0) {
      throw new BadRequestException('El cupon no aplica a los productos del carrito');
    }

    const subtotalElegible = redondearMoneda(
      itemsElegibles.reduce((acc, item) => acc + item.subtotalDespuesVolumen, 0),
    );

    let descuento = cupon.tipo === 'PORCENTAJE'
      ? redondearMoneda(subtotalElegible * (Number(cupon.valor) / 100))
      : redondearMoneda(Number(cupon.valor));

    if (descuento > subtotalElegible) {
      descuento = subtotalElegible;
    }

    return {
      id: cupon.id,
      codigo: cupon.codigo,
      tipo: cupon.tipo,
      valor: Number(cupon.valor),
      descuento,
    };
  }

  private async validarDireccionUsuario(prisma: PrismaService | any, usuarioId: number, direccionId: number) {
    const direccion = await prisma.direccionUsuario.findFirst({
      where: { id: direccionId, usuarioId },
    });

    if (!direccion) {
      throw new BadRequestException('La direccion seleccionada no pertenece al usuario');
    }

    return direccion;
  }

  private async validarReservasActivas(
    prisma: PrismaService | any,
    usuarioId: number,
    checkoutToken: string,
    items: any[],
  ) {
    const reservas = await prisma.reservaStock.findMany({
      where: {
        usuarioId,
        checkoutToken,
        expiraEn: { gt: new Date() },
      },
    });

    if (reservas.length === 0) {
      throw new BadRequestException('La reserva de stock expiro. Vuelve a iniciar el checkout');
    }

    for (const item of items) {
      const reserva = reservas.find((entry) => entry.varianteId === item.varianteId);
      if (!reserva || reserva.cantidad < item.cantidad) {
        throw new BadRequestException(
          `No hay una reserva activa valida para ${item.nombre}. Vuelve a iniciar el checkout`,
        );
      }
    }
  }

  private async liberarReservasExpiradas(prisma: PrismaService | any) {
    await prisma.reservaStock.deleteMany({
      where: { expiraEn: { lte: new Date() } },
    });
  }

  private parseJsonIds(valor: unknown): number[] {
    if (!Array.isArray(valor)) return [];
    return valor
      .map((item) => Number(item))
      .filter((item) => Number.isInteger(item) && item > 0);
  }

  private generarNumeroPedido() {
    const timestamp = Date.now().toString().slice(-10);
    const random = Math.floor(Math.random() * 90 + 10);
    return `LLP${timestamp}${random}`;
  }
}
