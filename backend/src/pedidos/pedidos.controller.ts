import {
  Controller, Get, Post, Patch, Body, Param, Query,
  UseGuards, Request, ParseIntPipe,
} from '@nestjs/common';
import { PedidosService } from './pedidos.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ActualizarEstadoPedidoDto, CrearPedidoDto, ListarPedidosAdminDto } from './dto/pedidos.dto';

@UseGuards(JwtAuthGuard)
@Controller('pedidos')
export class PedidosController {
  constructor(private pedidosService: PedidosService) {}

  @Post()
  crear(@Request() req, @Body() datos: CrearPedidoDto) {
    return this.pedidosService.crearPedido(req.user.id, datos);
  }

  @Get('mis-pedidos')
  listarMios(@Request() req) {
    return this.pedidosService.listarPedidosUsuario(req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'GERENTE', 'OPERADOR')
  @Get('admin')
  listarTodos(@Query() query: ListarPedidosAdminDto) {
    return this.pedidosService.listarTodos(query);
  }

  @Get(':id')
  obtener(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const esAdmin = ['ADMIN', 'GERENTE', 'OPERADOR'].includes(req.user.rol);
    return this.pedidosService.obtenerPedido(id, esAdmin ? undefined : req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'GERENTE', 'OPERADOR')
  @Patch(':id/estado')
  actualizarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: ActualizarEstadoPedidoDto,
  ) {
    return this.pedidosService.actualizarEstado(id, body.estado, body.descripcion);
  }
}
