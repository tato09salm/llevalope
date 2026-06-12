import {
  Controller, Get, Post, Put, Delete, Patch,
  Body, Param, Query, UseGuards, Request, ParseIntPipe,
} from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  ActualizarCantidadCarritoDto,
  ActualizarPerfilDto,
  AgregarCarritoDto,
  DireccionUsuarioDto,
  ListarUsuariosDto,
} from './dto/usuarios.dto';

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

  // Wishlist endpoints
  @Get('wishlist')
  obtenerWishlist(@Request() req) {
    return this.usuariosService.obtenerWishlist(req.user.id);
  }

  @Post('wishlist')
  agregarAWishlist(
    @Request() req,
    @Body() body: { productoId: number }
  ) {
    return this.usuariosService.agregarAWishlist(req.user.id, body.productoId);
  }

  @Delete('wishlist/:productoId')
  eliminarDeWishlist(
    @Request() req,
    @Param('productoId', ParseIntPipe) productoId: number
  ) {
    return this.usuariosService.eliminarDeWishlist(req.user.id, productoId);
  }
}
