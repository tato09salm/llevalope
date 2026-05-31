import { Controller, Get, Post, Put, Delete, Patch, Body, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ColoresService } from './colores.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('colores')
export class ColoresController {
  constructor(private coloresService: ColoresService) {}

  @Get()
  listar(@Query('todos') todos?: boolean) {
    return this.coloresService.listar(todos);
  }

  @Get(':id')
  obtenerPorId(@Param('id', ParseIntPipe) id: number) {
    return this.coloresService.obtenerPorId(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'GERENTE', 'OPERADOR')
  @Post()
  crear(@Body() datos: any) {
    return this.coloresService.crear(datos);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'GERENTE', 'OPERADOR')
  @Put(':id')
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() datos: any) {
    return this.coloresService.actualizar(id, datos);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'GERENTE', 'OPERADOR')
  @Patch(':id/toggle-activa')
  toggleActiva(@Param('id', ParseIntPipe) id: number) {
    return this.coloresService.toggleActive(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'GERENTE')
  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.coloresService.eliminar(id);
  }
}
