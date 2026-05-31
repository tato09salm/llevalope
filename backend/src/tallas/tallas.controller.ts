import { Controller, Get, Post, Put, Delete, Patch, Body, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { SizesService } from './tallas.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('tallas')
export class SizesController {
  constructor(private sizesService: SizesService) {}

  @Get()
  listar(@Query('todos') todos?: boolean) {
    return this.sizesService.listar(todos);
  }

  @Get(':id')
  obtenerPorId(@Param('id', ParseIntPipe) id: number) {
    return this.sizesService.obtenerPorId(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'GERENTE', 'OPERADOR')
  @Post()
  crear(@Body() datos: any) {
    return this.sizesService.crear(datos);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'GERENTE', 'OPERADOR')
  @Put(':id')
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() datos: any) {
    return this.sizesService.actualizar(id, datos);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'GERENTE', 'OPERADOR')
  @Patch(':id/toggle-activo')
  toggleActivo(@Param('id', ParseIntPipe) id: number) {
    return this.sizesService.toggleActive(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'GERENTE')
  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.sizesService.eliminar(id);
  }
}