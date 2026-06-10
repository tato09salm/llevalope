import { Module } from '@nestjs/common';
import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AjustarStockDto, MovimientosInventarioQueryDto } from './dto/inventario.dto';

@Injectable()
export class InventarioService {
  constructor(private prisma: PrismaService) {}

  async stockBajo() {
    // Obtener todas las variantes y filtrar manualmente (Prisma no permite campos en where directamente)
    const variantes = await this.prisma.varianteProducto.findMany({
      where: { activo: true },
      select: { id: true, sku: true, stock: true, stockMinimo: true, producto: { select: { id: true, nombre: true } } },
    });
    return variantes.filter(v => v.stock <= v.stockMinimo);
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
    if (!variante) {
      throw new NotFoundException('Variante no encontrada');
    }
    const stockAnterior = variante.stock;
    const stockNuevo = tipo === 'SALIDA' ? stockAnterior - cantidad : stockAnterior + cantidad;
    if (stockNuevo < 0) {
      throw new BadRequestException('El ajuste deja el stock en un valor negativo');
    }

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

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'GERENTE', 'OPERADOR')
@Controller('inventario')
export class InventarioController {
  constructor(private s: InventarioService) {}

  @Get('stock-bajo') stockBajo() { return this.s.stockBajo(); }
  @Get('movimientos') movimientos(@Query() query: MovimientosInventarioQueryDto) { return this.s.movimientos(query.varianteId); }
  @Post('ajustar') ajustar(@Body() b: AjustarStockDto) { return this.s.ajustarStock(b.varianteId, b.cantidad, b.motivo, b.tipo); }
}

@Module({ controllers: [InventarioController], providers: [InventarioService] })
export class InventarioModule {}
