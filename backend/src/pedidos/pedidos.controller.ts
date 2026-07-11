import {
  Controller, Get, Post, Patch, Body, Param, Query,
  UseGuards, Request, ParseIntPipe,
} from '@nestjs/common';
import { PedidosService } from './pedidos.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  ActualizarEstadoPedidoDto,
  CrearPedidoDto,
  ListarPedidosAdminDto,
  PreviewCheckoutDto,
  SimularPagoDto,
} from './dto/pedidos.dto';

@UseGuards(JwtAuthGuard)
@Controller('pedidos')
export class PedidosController {
  constructor(private pedidosService: PedidosService) {}

  @Post()
  crear(@Request() req, @Body() datos: CrearPedidoDto) {
    return this.pedidosService.crearPedido(req.user.id, datos);
  }

  @Post('checkout-preview')
  preview(@Request() req, @Body() datos: PreviewCheckoutDto) {
    return this.pedidosService.previewCheckout(req.user.id, datos);
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

  @Post(':id/simular-pago')
  simularPago(
    @Param('id', ParseIntPipe) id: number,
    @Body() datos: SimularPagoDto,
    @Request() req,
  ) {
    const esAdmin = ['ADMIN', 'GERENTE', 'OPERADOR'].includes(req.user.rol);
    return this.pedidosService.simularPagoPedido(id, esAdmin ? undefined : req.user.id, datos);
  }

  @Get(':pedidoId/pagos')
  listarPagos(
    @Param('pedidoId', ParseIntPipe) pedidoId: number,
    @Request() req
  ) {
    const esAdmin = ['ADMIN', 'GERENTE', 'OPERADOR'].includes(req.user.rol);
    return this.pedidosService.listarPagosPedido(pedidoId, esAdmin ? undefined : req.user.id);
  }

  @Post(':pedidoId/pagos')
  crearPago(
    @Param('pedidoId', ParseIntPipe) pedidoId: number,
    @Body() datos: any,
    @Request() req
  ) {
    const esAdmin = ['ADMIN', 'GERENTE', 'OPERADOR'].includes(req.user.rol);
    return this.pedidosService.crearPago(pedidoId, datos, esAdmin ? undefined : req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'GERENTE', 'OPERADOR')
  @Patch('pagos/:pagoId')
  actualizarPago(
    @Param('pagoId', ParseIntPipe) pagoId: number,
    @Body() datos: any
  ) {
    return this.pedidosService.actualizarPago(pagoId, datos);
  }
}
