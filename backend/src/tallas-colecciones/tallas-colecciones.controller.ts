import { Controller, Get, Post, Put, Delete, Patch, Body, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { SizeCollectionsService } from './tallas-colecciones.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('tallas-colecciones')
export class SizeCollectionsController {
  constructor(private sizeCollectionsService: SizeCollectionsService) {}

  @Get()
  listar() {
    return this.sizeCollectionsService.listar(false);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'GERENTE', 'OPERADOR')
  @Get('admin/todos')
  listarAdmin() {
    return this.sizeCollectionsService.listar(true);
  }

  @Get(':id')
  obtenerPorId(@Param('id', ParseIntPipe) id: number) {
    return this.sizeCollectionsService.obtenerPorId(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'GERENTE', 'OPERADOR')
  @Post()
  crear(@Body() datos: any) {
    return this.sizeCollectionsService.crear(datos);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'GERENTE', 'OPERADOR')
  @Put(':id')
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() datos: any) {
    return this.sizeCollectionsService.actualizar(id, datos);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'GERENTE', 'OPERADOR')
  @Patch(':id/toggle-activo')
  toggleActivo(@Param('id', ParseIntPipe) id: number) {
    return this.sizeCollectionsService.toggleActive(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'GERENTE')
  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.sizeCollectionsService.eliminar(id);
  }
}
