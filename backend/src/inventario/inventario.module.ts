import { Module } from '@nestjs/common';
import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Injectable()
export class InventarioService {
  constructor(private prisma: PrismaService) {}

  async stockBajo() {
    return this.prisma.varianteProducto.findMany({
      where: { activo: true, stock: { lte: this.prisma.varianteProducto.fields.stockMinimo as any } },
      select: { id: true, sku: true, stock: true, stockMinimo: true, producto: { select: { id: true, nombre: true } } },
    });
  }

  async movimientos(varianteId?: number) {
    const where: any = {};
    if (varianteId) where.varianteId = varianteId;
    return this.prisma.movimientoInventario.findMany({
      where,
      include: { variante: { select: { sku: true, producto: { select: { nombre: true } } } } },
      orderBy: { creadoEn: 'desc' },
      take: 100,
    });
  }

  async ajustarStock(varianteId: number, cantidad: number, motivo: string, tipo: string) {
    const variante = await this.prisma.varianteProducto.findUnique({ 
      where: { id: varianteId },
      select: { id: true, stock: true, productoId: true }
    });
    const stockAnterior = variante.stock;
    const stockNuevo = tipo === 'SALIDA' ? stockAnterior - cantidad : stockAnterior + cantidad;

    return this.prisma.$transaction([
      this.prisma.varianteProducto.update({ where: { id: varianteId }, data: { stock: stockNuevo } }),
      this.prisma.movimientoInventario.create({
        data: { 
          productoId: variante.productoId,
          varianteId, 
          tipo: tipo as any, 
          cantidad, 
          stockAnterior, 
          stockNuevo, 
          motivo 
        },
      }),
    ]);
  }
}

@UseGuards(JwtAuthGuard)
@Controller('inventario')
export class InventarioController {
  constructor(private s: InventarioService) {}

  @Get('stock-bajo') stockBajo() { return this.s.stockBajo(); }
  @Get('movimientos') movimientos(@Query('varianteId') id?: number) { return this.s.movimientos(id ? +id : undefined); }
  @Post('ajustar') ajustar(@Body() b: any) { return this.s.ajustarStock(b.varianteId, b.cantidad, b.motivo, b.tipo); }
}

@Module({ controllers: [InventarioController], providers: [InventarioService] })
export class InventarioModule {}
