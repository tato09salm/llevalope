import {
  Controller, Get, Post, Patch, Body, Param, Query,
  UseGuards, Request, ParseIntPipe,
} from '@nestjs/common';
import { PedidosService } from './pedidos.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('pedidos')
export class PedidosController {
  constructor(private pedidosService: PedidosService) {}

  @Post()
  crear(@Request() req, @Body() datos: any) {
    return this.pedidosService.crearPedido(req.user.id, datos);
  }

  @Get('mis-pedidos')
  listarMios(@Request() req) {
    return this.pedidosService.listarPedidosUsuario(req.user.id);
  }

  @Get('admin')
  listarTodos(
    @Query('pagina') pagina?: number,
    @Query('limite') limite?: number,
    @Query('estado') estado?: string,
  ) {
    return this.pedidosService.listarTodos({ pagina, limite, estado });
  }

  @Get(':id')
  obtener(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const esAdmin = ['ADMIN', 'GERENTE', 'OPERADOR'].includes(req.user.rol);
    return this.pedidosService.obtenerPedido(id, esAdmin ? undefined : req.user.id);
  }

  @Patch(':id/estado')
  actualizarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { estado: string; descripcion?: string },
  ) {
    return this.pedidosService.actualizarEstado(id, body.estado, body.descripcion);
  }
}
