import { Module } from '@nestjs/common';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Injectable()
export class ReportesService {
  constructor(private prisma: PrismaService) {}

  async resumenDashboard() {
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

    const [
      totalProductos,
      totalUsuarios,
      pedidosMes,
      ventasMes,
      productosStockBajo,
      ticketsAbiertos,
    ] = await Promise.all([
      this.prisma.producto.count({ where: { activo: true } }),
      this.prisma.usuario.count({ where: { rol: 'CLIENTE' } }),
      this.prisma.pedido.count({ where: { creadoEn: { gte: inicioMes } } }),
      this.prisma.pedido.aggregate({
        where: { creadoEn: { gte: inicioMes }, estadoPago: 'PAGADO' },
        _sum: { total: true },
      }),
      this.prisma.varianteProducto.count({ where: { stock: { lte: 5 }, activo: true } }),
      this.prisma.ticketSoporte.count({ where: { estado: 'ABIERTO' } }),
    ]);

    return {
      totalProductos,
      totalUsuarios,
      pedidosMes,
      ventasMes: ventasMes._sum.total || 0,
      productosStockBajo,
      ticketsAbiertos,
    };
  }

  async ventasPorDia(dias = 30) {
    const desde = new Date();
    desde.setDate(desde.getDate() - dias);

    return this.prisma.pedido.groupBy({
      by: ['creadoEn'],
      where: { creadoEn: { gte: desde }, estadoPago: 'PAGADO' },
      _sum: { total: true },
      _count: { id: true },
    });
  }

  async productosMasVendidos(limite = 10) {
    return this.prisma.producto.findMany({
      where: { activo: true },
      orderBy: { totalVentas: 'desc' },
      take: limite,
      select: { 
        id: true, 
        nombre: true, 
        totalVentas: true, 
        imagenPrincipal: true,
        variantes: { 
          where: { activo: true, esPrincipal: true }, 
          take: 1,
          select: { precioBase: true, precioOferta: true }
        }
      },
    });
  }
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'GERENTE', 'OPERADOR')
@Controller('reportes')
export class ReportesController {
  constructor(private s: ReportesService) {}

  @Get('dashboard') dashboard() { return this.s.resumenDashboard(); }
  @Get('ventas-por-dia') ventasPorDia() { return this.s.ventasPorDia(); }
  @Get('productos-mas-vendidos') masVendidos() { return this.s.productosMasVendidos(); }
}

@Module({ controllers: [ReportesController], providers: [ReportesService] })
export class ReportesModule {}
