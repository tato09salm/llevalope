import { Module } from '@nestjs/common';
import { Controller, Get, Post, Put, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

// ===== PROVEEDORES =====
@Injectable()
export class ProveedoresService {
  constructor(private prisma: PrismaService) {}

  listar() {
    return this.prisma.proveedor.findMany({ where: { activo: true }, orderBy: { nombre: 'asc' } });
  }

  crear(datos: any) {
    return this.prisma.proveedor.create({ data: datos });
  }

  async crearOrdenCompra(datos: any) {
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

  listarOrdenes() {
    return this.prisma.ordenCompra.findMany({
      include: { proveedor: { select: { nombre: true } }, items: true },
      orderBy: { creadoEn: 'desc' },
    });
  }
}

@UseGuards(JwtAuthGuard)
@Controller('proveedores')
export class ProveedoresController {
  constructor(private s: ProveedoresService) {}

  @Get() listar() { return this.s.listar(); }
  @Post() crear(@Body() d: any) { return this.s.crear(d); }
  @Get('ordenes') listarOrdenes() { return this.s.listarOrdenes(); }
  @Post('ordenes') crearOrden(@Body() d: any) { return this.s.crearOrdenCompra(d); }
}

@Module({ controllers: [ProveedoresController], providers: [ProveedoresService] })
export class ProveedoresModule {}
