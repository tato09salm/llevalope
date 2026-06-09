import { Module } from '@nestjs/common';
import { Controller, Get, Patch, Body, Request, UseGuards } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ActualizarPerfilDto, AgregarCarritoDto } from './dto/usuarios.dto';

@Injectable()
export class UsuariosService {
  constructor(private prisma: PrismaService) {}

  async listar() {
    return this.prisma.usuario.findMany({
      select: {
        id: true, nombre: true, apellido: true, correo: true,
        rol: true, activo: true, verificado: true, creadoEn: true,
      },
      orderBy: { creadoEn: 'desc' },
    });
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
}

@UseGuards(JwtAuthGuard)
@Controller('usuarios')
export class UsuariosController {
  constructor(private usuariosService: UsuariosService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'GERENTE', 'OPERADOR')
  @Get()
  listar() {
    return this.usuariosService.listar();
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

  @Get('direcciones')
  listarDirecciones(@Request() req) {
    return this.usuariosService.listarDirecciones(req.user.id);
  }
}

@Module({
  controllers: [UsuariosController],
  providers: [UsuariosService],
  exports: [UsuariosService],
})
export class UsuariosModule {}
