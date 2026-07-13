import { Controller, Post, Body } from '@nestjs/common';
import { DreamiaService } from './dreamia.service';

@Controller('dreamia')
export class DreamiaController {
  constructor(private readonly dreamiaService: DreamiaService) {}

  @Post('generar')
  async generarDiseno(@Body() body: { estilo: string }) {
    // Simula una pequeña demora del procesamiento de la IA para dar un efecto más realista
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return this.dreamiaService.generarDiseno(body.estilo || 'moderno');
  }
}
