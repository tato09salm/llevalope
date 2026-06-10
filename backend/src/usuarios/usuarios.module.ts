import { Module } from '@nestjs/common';
import { Controller, Get, Patch, Post, Put, Delete, Body, Request, UseGuards, Param, ParseIntPipe, Query } from '@nestjs/common';
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ActualizarPerfilDto, AgregarCarritoDto } from './dto/usuarios.dto';

// DTOs para direcciones y carrito
class ActualizarCantidadCarritoDto {
  cantidad: number;
}
class ListarUsuariosDto {
  pagina?: number;
  limite?: number;
  rol?: string;
  activo?: boolean;
  busqueda?: string;
}

@Injectable()
export class UsuariosService {
  constructor(private prisma: PrismaService) {}

  async listar(params: ListarUsuariosDto = {}) {
    const { pagina = 1, limite = 20, rol, activo, busqueda } = params;
    const where: any = {};
    
    if (rol) where.rol = rol;
    if (activo !== undefined) where.activo = activo;
    if (busqueda) {
      where.OR = [
        { nombre: { contains: busqueda, mode: 'insensitive' } },
        { apellido: { contains: busqueda, mode: 'insensitive' } },
        { correo: { contains: busqueda, mode: 'insensitive' } }
      ];
    }

    const [usuarios, total] = await Promise.all([
      this.prisma.usuario.findMany({
        where,
        select: {
          id: true, nombre: true, apellido: true, correo: true,
          rol: true, activo: true, verificado: true, creadoEn: true, telefono: true,
        },
        skip: (pagina - 1) * limite,
        take: limite,
        orderBy: { creadoEn: 'desc' },
      }),
      this.prisma.usuario.count({ where })
    ]);

    return { datos: usuarios, total, pagina, limite, totalPaginas: Math.ceil(total / limite) };
  }

  async actualizarPerfil(id: number, datos: any) {
    return this.prisma.usuario.update({
      where: { id },
      data: { nombre: datos.nombre, apellido: datos.apellido, telefono: datos.telefono },
      select: { id: true, nombre: true, apellido: true, correo: true, telefono: true },
    });
  }

  async agregarDireccion(usuarioId: number, datos: any) {
    if (datos.predeterminada) {
      await this.prisma.direccionUsuario.updateMany({
        where: { usuarioId },
        data: { predeterminada: false },
      });
    }
    return this.prisma.direccionUsuario.create({ data: { ...datos, usuarioId } });
  }

  async actualizarDireccion(usuarioId: number, direccionId: number, datos: any) {
    const direccion = await this.prisma.direccionUsuario.findFirst({
      where: { id: direccionId, usuarioId }
    });
    if (!direccion) throw new NotFoundException('Dirección no encontrada');

    if (datos.predeterminada) {
      await this.prisma.direccionUsuario.updateMany({
        where: { usuarioId },
        data: { predeterminada: false },
      });
    }

    return this.prisma.direccionUsuario.update({
      where: { id: direccionId },
      data: datos
    });
  }

  async eliminarDireccion(usuarioId: number, direccionId: number) {
    const direccion = await this.prisma.direccionUsuario.findFirst({
      where: { id: direccionId, usuarioId }
    });
    if (!direccion) throw new NotFoundException('Dirección no encontrada');

    return this.prisma.direccionUsuario.delete({ where: { id: direccionId } });
  }

  async listarDirecciones(usuarioId: number) {
    return this.prisma.direccionUsuario.findMany({ where: { usuarioId } });
  }

  async agregarCarrito(usuarioId: number, productoId: number, varianteId: number, cantidad: number) {
    const existe = await this.prisma.itemCarrito.findUnique({
      where: { usuarioId_varianteId: { usuarioId, varianteId } },
    });

    if (existe) {
      return this.prisma.itemCarrito.update({
        where: { id: existe.id },
        data: { cantidad: existe.cantidad + cantidad },
        include: { producto: true, variante: true },
      });
    }

    return this.prisma.itemCarrito.create({
      data: { usuarioId, productoId, varianteId, cantidad },
      include: { producto: true, variante: true },
    });
  }

  async actualizarCantidadCarrito(usuarioId: number, varianteId: number, cantidad: number) {
    if (cantidad <= 0) throw new BadRequestException('La cantidad debe ser mayor a 0');
    
    const item = await this.prisma.itemCarrito.findUnique({
      where: { usuarioId_varianteId: { usuarioId, varianteId } }
    });
    if (!item) throw new NotFoundException('Item no encontrado en el carrito');

    return this.prisma.itemCarrito.update({
      where: { id: item.id },
      data: { cantidad },
      include: { producto: true, variante: true },
    });
  }

  async obtenerCarrito(usuarioId: number) {
    return this.prisma.itemCarrito.findMany({
      where: { usuarioId },
      include: {
        producto: {
          include: { imagenes: { where: { principal: true }, take: 1 } },
        },
        variante: true,
      },
    });
  }

  async eliminarDelCarrito(usuarioId: number, varianteId: number) {
    return this.prisma.itemCarrito.delete({
      where: { usuarioId_varianteId: { usuarioId, varianteId } },
    });
  }

  async vaciarCarrito(usuarioId: number) {
    return this.prisma.itemCarrito.deleteMany({ where: { usuarioId } });
  }
}

@UseGuards(JwtAuthGuard)
@Controller('usuarios')
export class UsuariosController {
  constructor(private usuariosService: UsuariosService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'GERENTE', 'OPERADOR')
  @Get()
  listar(@Query() params: ListarUsuariosDto) {
    return this.usuariosService.listar(params);
  }

  @Patch('perfil')
  actualizarPerfil(@Request() req, @Body() datos: ActualizarPerfilDto) {
    return this.usuariosService.actualizarPerfil(req.user.id, datos);
  }

  @Get('carrito')
  obtenerCarrito(@Request() req) {
    return this.usuariosService.obtenerCarrito(req.user.id);
  }

  @Patch('carrito')
  agregarCarrito(@Request() req, @Body() body: AgregarCarritoDto) {
    return this.usuariosService.agregarCarrito(req.user.id, body.productoId, body.varianteId, body.cantidad || 1);
  }

  @Put('carrito/:varianteId')
  actualizarCantidadCarrito(
    @Request() req,
    @Param('varianteId', ParseIntPipe) varianteId: number,
    @Body() body: ActualizarCantidadCarritoDto
  ) {
    return this.usuariosService.actualizarCantidadCarrito(req.user.id, varianteId, body.cantidad);
  }

  @Delete('carrito')
  vaciarCarrito(@Request() req) {
    return this.usuariosService.vaciarCarrito(req.user.id);
  }

  @Delete('carrito/:varianteId')
  eliminarDelCarrito(
    @Request() req,
    @Param('varianteId', ParseIntPipe) varianteId: number
  ) {
    return this.usuariosService.eliminarDelCarrito(req.user.id, varianteId);
  }

  @Get('direcciones')
  listarDirecciones(@Request() req) {
    return this.usuariosService.listarDirecciones(req.user.id);
  }

  @Post('direcciones')
  agregarDireccion(@Request() req, @Body() datos: any) {
    return this.usuariosService.agregarDireccion(req.user.id, datos);
  }

  @Put('direcciones/:direccionId')
  actualizarDireccion(
    @Request() req,
    @Param('direccionId', ParseIntPipe) direccionId: number,
    @Body() datos: any
  ) {
    return this.usuariosService.actualizarDireccion(req.user.id, direccionId, datos);
  }

  @Delete('direcciones/:direccionId')
  eliminarDireccion(
    @Request() req,
    @Param('direccionId', ParseIntPipe) direccionId: number
  ) {
    return this.usuariosService.eliminarDireccion(req.user.id, direccionId);
  }
}

@Module({
  controllers: [UsuariosController],
  providers: [UsuariosService],
  exports: [UsuariosService],
})
export class UsuariosModule {}
