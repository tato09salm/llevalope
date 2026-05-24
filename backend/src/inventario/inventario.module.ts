import { Module } from '@nestjs/common';
import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Injectable()
export class InventarioService {
  constructor(private prisma: PrismaService) {}

  async stockBajo() {
    return this.prisma.producto.findMany({
      where: { activo: true, stock: { lte: this.prisma.producto.fields.stockMinimo as any } },
      select: { id: true, nombre: true, sku: true, stock: true, stockMinimo: true },
    });
  }

  async movimientos(productoId?: number) {
    const where: any = {};
    if (productoId) where.productoId = productoId;
    return this.prisma.movimientoInventario.findMany({
      where,
      include: { producto: { select: { nombre: true, sku: true } } },
      orderBy: { creadoEn: 'desc' },
      take: 100,
    });
  }

  async ajustarStock(productoId: number, cantidad: number, motivo: string, tipo: string) {
    const producto = await this.prisma.producto.findUnique({ where: { id: productoId } });
    const stockAnterior = producto.stock;
    const stockNuevo = tipo === 'SALIDA' ? stockAnterior - cantidad : stockAnterior + cantidad;

    return this.prisma.$transaction([
      this.prisma.producto.update({ where: { id: productoId }, data: { stock: stockNuevo } }),
      this.prisma.movimientoInventario.create({
        data: { productoId, tipo: tipo as any, cantidad, stockAnterior, stockNuevo, motivo },
      }),
    ]);
  }
}

@UseGuards(JwtAuthGuard)
@Controller('inventario')
export class InventarioController {
  constructor(private s: InventarioService) {}

  @Get('stock-bajo') stockBajo() { return this.s.stockBajo(); }
  @Get('movimientos') movimientos(@Query('productoId') id?: number) { return this.s.movimientos(id ? +id : undefined); }
  @Post('ajustar') ajustar(@Body() b: any) { return this.s.ajustarStock(b.productoId, b.cantidad, b.motivo, b.tipo); }
}

@Module({ controllers: [InventarioController], providers: [InventarioService] })
export class InventarioModule {}
