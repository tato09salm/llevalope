import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../common/prisma/prisma.service';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class DreamiaService {
  private readonly logger = new Logger(DreamiaService.name);
  private genAI: GoogleGenerativeAI | null = null;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('GOOGLE_API_KEY');
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.logger.log('✅ Gemini API configurada correctamente');
    } else {
      this.logger.warn('⚠️ GOOGLE_API_KEY no configurada — DreamIA usará modo simulación');
    }
  }

  async generarDiseno(estilo: string, imagenBase64?: string, mimeType?: string) {
    // Definición de imágenes de diseño generado según el estilo (fallback)
    const imagenesEstilo: Record<string, string> = {
      nordico: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200',
      industrial: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200',
      moderno: 'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?w=1200',
      rustico: 'https://images.unsplash.com/photo-1600210491369-e753d80a41f3?w=1200',
    };

    const estiloClave = estilo.toLowerCase();
    let imagenResultado: string;
    let generadoPorIA = false;

    // Si hay imagen y API key, generar con Gemini
    if (imagenBase64 && this.genAI) {
      try {
        imagenResultado = await this.generarConGemini(imagenBase64, mimeType || 'image/jpeg', estiloClave);
        generadoPorIA = true;
        this.logger.log(`✅ Imagen generada exitosamente con Gemini (estilo: ${estiloClave})`);
      } catch (error) {
        this.logger.error(`❌ Error al generar con Gemini: ${error.message}`);
        // Fallback a imagen estática
        imagenResultado = imagenesEstilo[estiloClave] || imagenesEstilo.moderno;
      }
    } else {
      imagenResultado = imagenesEstilo[estiloClave] || imagenesEstilo.moderno;
    }

    // Buscar productos recomendados
    const productosRecomendados = await this.obtenerProductosRecomendados(estiloClave);

    return {
      imagenResultado,
      estilo,
      generadoPorIA,
      productosRecomendados,
    };
  }

  private async generarConGemini(imagenBase64: string, mimeType: string, estilo: string): Promise<string> {
    const model = this.genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-preview-image-generation',
    });

    // Descripción de estilos decorativos para el prompt
    const estiloDescripciones: Record<string, string> = {
      moderno: 'modern glamour style with gold metallic accents, elegant minimalist furniture, crystal chandeliers, velvet sofas in neutral tones (gray, cream, white), glass coffee tables with gold frames, contemporary art on walls, warm ambient lighting',
      nordico: 'Scandinavian Nordic style with light wood furniture (birch, pine), pastel colors (soft white, light gray, pale blue), minimalist design, cozy textiles (wool throws, linen cushions), indoor plants, paper pendant lamps, clean lines and natural materials',
      industrial: 'industrial loft style with exposed brick walls, dark reclaimed wood furniture, black iron pipe shelving, vintage Edison bulb lighting, leather Chesterfield sofa in aged brown, metal gear wall clock, concrete and steel elements, raw urban aesthetic',
      rustico: 'rustic country farmhouse style with natural solid wood furniture, warm earth tones (brown, beige, terracotta), wrought iron accents, woven jute rugs, lantern-style lighting, stone or wood wall textures, cozy and warm atmosphere with natural textures',
    };

    const descripcionEstilo = estiloDescripciones[estilo] || estiloDescripciones.moderno;

    const prompt = `You are an expert interior designer AI. Look at this photo of a room and transform it into a beautifully decorated space.

STYLE: ${descripcionEstilo}

INSTRUCTIONS:
- Keep the exact same room structure, walls, floor, windows and architectural elements
- Add appropriate furniture, decoration, lighting and textiles matching the specified style
- Make the result look photorealistic and professionally designed
- Include a sofa/seating, coffee table, lighting, rugs, wall decoration and plants if appropriate
- Maintain proper scale and perspective of all added elements
- Use warm, inviting lighting that matches the style
- The result should look like a real professional interior design photograph

Generate the transformed, decorated version of this room.`;

    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: mimeType,
                data: imagenBase64,
              },
            },
          ],
        },
      ],
      generationConfig: {
        responseModalities: ['TEXT', 'IMAGE'],
      } as any,
    });

    const response = result.response;
    const parts = response.candidates?.[0]?.content?.parts;

    if (!parts) {
      throw new Error('No se recibió respuesta de Gemini');
    }

    // Buscar la parte que contiene la imagen generada
    for (const part of parts) {
      if (part.inlineData) {
        // Retornar como data URL para mostrar directamente en el frontend
        const dataUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        return dataUrl;
      }
    }

    throw new Error('Gemini no generó una imagen en la respuesta');
  }

  private async obtenerProductosRecomendados(estilo: string) {
    // Mapeo de slugs de productos reales a sugerir por estilo
    let slugsRecomendados: string[] = [];
    if (estilo === 'nordico') {
      slugsRecomendados = [
        'sofa-moderno-seccional-escandinavo',
        'lampara-de-pie-tripode-nordica',
        'alfombra-geometrica-pastel',
      ];
    } else if (estilo === 'industrial') {
      slugsRecomendados = [
        'mesa-de-centro-rustica-loft',
        'estante-modular-industrial',
        'espejo-pared-redondo-dorado',
      ];
    } else if (estilo === 'rustico') {
      slugsRecomendados = [
        'mesa-de-centro-rustica-loft',
        'lampara-de-pie-tripode-nordica',
        'estante-modular-industrial',
      ];
    } else {
      // Moderno
      slugsRecomendados = [
        'sofa-moderno-seccional-escandinavo',
        'silla-comedor-velvet-gold',
        'espejo-pared-redondo-dorado',
      ];
    }

    // Consultar los productos en la base de datos
    const productos = await this.prisma.producto.findMany({
      where: {
        slug: { in: slugsRecomendados },
        activo: true,
      },
      include: {
        variantes: {
          where: { activo: true },
          include: {
            color: true,
            size: true,
          },
        },
      },
    });

    return productos;
  }
}
