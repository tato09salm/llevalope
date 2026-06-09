import { Module } from '@nestjs/common';
import { Controller, Get, Post, Put, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CrearOrdenCompraDto, CrearProveedorDto } from './dto/proveedores.dto';

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

  listarOrdenes() {
    return this.prisma.ordenCompra.findMany({
      include: { proveedor: { select: { nombre: true } }, items: true },
      orderBy: { creadoEn: 'desc' },
    });
  }
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'GERENTE', 'OPERADOR')
@Controller('proveedores')
export class ProveedoresController {
  constructor(private s: ProveedoresService) {}

  @Get() listar() { return this.s.listar(); }
  @Post() crear(@Body() d: CrearProveedorDto) { return this.s.crear(d); }
  @Get('ordenes') listarOrdenes() { return this.s.listarOrdenes(); }
  @Post('ordenes') crearOrden(@Body() d: CrearOrdenCompraDto) { return this.s.crearOrdenCompra(d); }
}

@Module({ controllers: [ProveedoresController], providers: [ProveedoresService] })
export class ProveedoresModule {}
