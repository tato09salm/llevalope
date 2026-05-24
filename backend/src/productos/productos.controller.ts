import {
  Controller, Get, Post, Put, Delete, Patch,
  Body, Param, Query, UseGuards, ParseIntPipe,
} from '@nestjs/common';
import { ProductosService } from './productos.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('productos')
export class ProductosController {
  constructor(private productosService: ProductosService) {}

  @Get()
  listar(
    @Query('pagina') pagina?: number,
    @Query('limite') limite?: number,
    @Query('busqueda') busqueda?: string,
    @Query('categoria') categoriaId?: number,
    @Query('enOferta') enOferta?: boolean,
    @Query('destacado') destacado?: boolean,
    @Query('precioMin') precioMin?: number,
    @Query('precioMax') precioMax?: number,
    @Query('ordenar') ordenar?: string,
    @Query('todos') todos?: boolean,
  ) {
    return this.productosService.listar({
      pagina: pagina ? +pagina : 1,
      limite: limite ? +limite : 20,
      busqueda,
      categoriaId: categoriaId ? +categoriaId : undefined,
      enOferta: enOferta !== undefined ? enOferta === true || (enOferta as any) === 'true' : undefined,
      destacado: destacado !== undefined ? destacado === true || (destacado as any) === 'true' : undefined,
      precioMin: precioMin ? +precioMin : undefined,
      precioMax: precioMax ? +precioMax : undefined,
      ordenar,
      todos: todos !== undefined ? todos === true || (todos as any) === 'true' : undefined,
    });
  }

  @Get('destacados')
  obtenerDestacados() {
    return this.productosService.obtenerDestacados();
  }

  @Get('ofertas')
  obtenerOfertas() {
    return this.productosService.obtenerOfertas();
  }

  @Get(':slug')
  obtenerPorSlug(@Param('slug') slug: string) {
    return this.productosService.obtenerPorSlug(slug);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'GERENTE', 'OPERADOR')
  @Post()
  crear(@Body() datos: any) {
    return this.productosService.crear(datos);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'GERENTE', 'OPERADOR')
  @Put(':id')
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() datos: any) {
    return this.productosService.actualizar(id, datos);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'GERENTE')
  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.productosService.eliminar(id);
  }
}
