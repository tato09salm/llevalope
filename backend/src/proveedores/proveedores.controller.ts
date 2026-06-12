import {
  Controller, Get, Post, Put, Patch, Delete,
  Body, Param, Query, UseGuards, ParseIntPipe,
} from '@nestjs/common';
import { ProveedoresService } from './proveedores.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  ActualizarEstadoOrdenDto,
  CrearOrdenCompraDto,
  CrearProveedorDto,
} from './dto/proveedores.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'GERENTE', 'OPERADOR')
@Controller('proveedores')
export class ProveedoresController {
  constructor(private proveedoresService: ProveedoresService) {}

  @Get()
  listar(@Query('activo') activo?: string) {
    const activoBool = activo === undefined ? undefined : activo === 'true';
    return this.proveedoresService.listar(activoBool);
  }

  @Get('ordenes')
  listarOrdenes(@Query('proveedorId') proveedorId?: string) {
    const id = proveedorId ? parseInt(proveedorId) : undefined;
    return this.proveedoresService.listarOrdenes(id);
  }

  @Post('ordenes')
  crearOrden(@Body() datos: CrearOrdenCompraDto) {
    return this.proveedoresService.crearOrdenCompra(datos);
  }

  @Patch('ordenes/:id/estado')
  actualizarEstadoOrden(
    @Param('id', ParseIntPipe) id: number,
    @Body() datos: ActualizarEstadoOrdenDto,
  ) {
    return this.proveedoresService.actualizarEstadoOrden(id, datos.estado);
  }

  @Get(':id')
  obtenerPorId(@Param('id', ParseIntPipe) id: number) {
    return this.proveedoresService.obtenerPorId(id);
  }

  @Post()
  crear(@Body() datos: CrearProveedorDto) {
    return this.proveedoresService.crear(datos);
  }

  @Put(':id')
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() datos: Partial<CrearProveedorDto>) {
    return this.proveedoresService.actualizar(id, datos);
  }

  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.proveedoresService.eliminar(id);
  }
}
