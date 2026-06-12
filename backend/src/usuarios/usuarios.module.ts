import { Module } from '@nestjs/common';
import { Controller, Get, Patch, Post, Put, Delete, Body, Request, UseGuards, Param, ParseIntPipe, Query } from '@nestjs/common';
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  ActualizarCantidadCarritoDto,
  ActualizarPerfilDto,
  AgregarCarritoDto,
  DireccionUsuarioDto,
} from './dto/usuarios.dto';

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

  async actualizarEstadoUsuario(id: number, activo: boolean) {
    return this.prisma.usuario.update({
      where: { id },
      data: { activo },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        correo: true,
        telefono: true,
        rol: true,
        activo: true,
        verificado: true,
        creadoEn: true,
      },
    });
  }

  async agregarCarrito(usuarioId: number, productoId: number, varianteId: number, cantidad: number) {
    const variante = await this.prisma.varianteProducto.findUnique({
      where: { id: varianteId },
      include: { producto: { select: { id: true, nombre: true, activo: true } } },
    });

    if (!variante || !variante.activo || !variante.producto.activo) {
      throw new NotFoundException('La variante seleccionada no esta disponible');
    }

    if (variante.productoId !== productoId) {
      throw new BadRequestException('La variante no pertenece al producto enviado');
    }

    const existe = await this.prisma.itemCarrito.findUnique({
      where: { usuarioId_varianteId: { usuarioId, varianteId } },
    });

    const cantidadFinal = (existe?.cantidad || 0) + cantidad;
    if (cantidadFinal > variante.stock) {
      throw new BadRequestException(`Solo hay ${variante.stock} unidades disponibles para esta variante`);
    }

    if (existe) {
      return this.prisma.itemCarrito.update({
        where: { id: existe.id },
        data: { cantidad: cantidadFinal },
        include: this.includeCarrito(),
      });
    }

    return this.prisma.itemCarrito.create({
      data: { usuarioId, productoId, varianteId, cantidad },
      include: this.includeCarrito(),
    });
  }

  async actualizarCantidadCarrito(usuarioId: number, varianteId: number, cantidad: number) {
    if (cantidad <= 0) throw new BadRequestException('La cantidad debe ser mayor a 0');
    
    const item = await this.prisma.itemCarrito.findUnique({
      where: { usuarioId_varianteId: { usuarioId, varianteId } },
      include: { variante: true },
    });
    if (!item) throw new NotFoundException('Item no encontrado en el carrito');
    if (cantidad > item.variante.stock) {
      throw new BadRequestException(`Solo hay ${item.variante.stock} unidades disponibles para esta variante`);
    }

    return this.prisma.itemCarrito.update({
      where: { id: item.id },
      data: { cantidad },
      include: this.includeCarrito(),
    });
  }

  async obtenerCarrito(usuarioId: number) {
    return this.prisma.itemCarrito.findMany({
      where: { usuarioId },
      include: this.includeCarrito(),
    });
  }

  async eliminarDelCarrito(usuarioId: number, varianteId: number) {
    return this.prisma.itemCarrito.deleteMany({
      where: { usuarioId, varianteId },
    });
  }

  async vaciarCarrito(usuarioId: number) {
    return this.prisma.itemCarrito.deleteMany({ where: { usuarioId } });
  }

  private includeCarrito() {
    return {
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
    };
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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'GERENTE', 'OPERADOR')
  @Patch(':id/activo')
  actualizarEstadoUsuario(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { activo: boolean }
  ) {
    return this.usuariosService.actualizarEstadoUsuario(id, body.activo);
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
  agregarDireccion(@Request() req, @Body() datos: DireccionUsuarioDto) {
    return this.usuariosService.agregarDireccion(req.user.id, datos);
  }

  @Put('direcciones/:direccionId')
  actualizarDireccion(
    @Request() req,
    @Param('direccionId', ParseIntPipe) direccionId: number,
    @Body() datos: DireccionUsuarioDto
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
