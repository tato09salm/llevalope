import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class DreamiaService {
  constructor(private prisma: PrismaService) {}

  async generarDiseno(estilo: string) {
    // Definición de imágenes de diseño generado según el estilo
    const imagenesEstilo: Record<string, string> = {
      nordico: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200', // Sala Nórdica
      industrial: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200', // Sala Industrial Loft
      moderno: 'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?w=1200', // Sala Moderna
      rustico: 'https://images.unsplash.com/photo-1618219942942-be914a7f33d2?w=1200', // Sala Rústica
    };

    const estiloClave = estilo.toLowerCase();
    const imagenResultado = imagenesEstilo[estiloClave] || imagenesEstilo.moderno;

    // Mapeo de slugs de productos reales a sugerir por estilo
    let slugsRecomendados: string[] = [];
    if (estiloClave === 'nordico') {
      slugsRecomendados = [
        'sofa-moderno-seccional-escandinavo',
        'lampara-de-pie-tripode-nordica',
        'alfombra-geometrica-pastel',
      ];
    } else if (estiloClave === 'industrial') {
      slugsRecomendados = [
        'mesa-de-centro-rustica-loft',
        'estante-modular-industrial',
        'espejo-pared-redondo-dorado',
      ];
    } else if (estiloClave === 'rustico') {
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

    return {
      imagenResultado,
      estilo,
      productosRecomendados: productos,
    };
  }
}
