import { Controller, Post, Body } from '@nestjs/common';
import { DreamiaService } from './dreamia.service';

@Controller('dreamia')
export class DreamiaController {
  constructor(private readonly dreamiaService: DreamiaService) {}

  @Post('generar')
  async generarDiseno(
    @Body() body: { estilo: string; imagenBase64?: string; mimeType?: string },
  ) {
    // Simula una pequeña demora del procesamiento de la IA para dar un efecto más realista
    // (solo cuando NO hay imagen real, porque Gemini ya tarda un poco)
    if (!body.imagenBase64) {
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }

    return this.dreamiaService.generarDiseno(
      body.estilo || 'moderno',
      body.imagenBase64,
      body.mimeType,
    );
  }
}
