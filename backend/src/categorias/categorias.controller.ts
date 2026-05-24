import { Controller, Get, Query } from '@nestjs/common';
import { CategoriasService } from './categorias.service';

@Controller('categorias')
export class CategoriasController {
  constructor(private categoriasService: CategoriasService) {}

  @Get()
  listar(@Query('todos') todos?: boolean) {
    return this.categoriasService.listar(todos);
  }
}
