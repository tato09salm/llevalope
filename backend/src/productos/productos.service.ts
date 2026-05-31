import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class ProductosService {
  constructor(private prisma: PrismaService) {}

  async listar(params: {
    pagina?: number;
    limite?: number;
    busqueda?: string;
    categoriaId?: number;
    categoria?: string;
    enOferta?: boolean;
    destacado?: boolean;
    precioMin?: number;
    precioMax?: number;
    ordenar?: string;
    todos?: boolean;
  }) {
    const {
      pagina = 1,
      limite = 20,
      busqueda,
      categoriaId,
      categoria,
      enOferta,
      destacado,
      precioMin,
      precioMax,
      ordenar = 'creadoEn',
      todos = false,
    } = params;

    const where: any = todos ? {} : { activo: true };

    if (busqueda) {
      where.OR = [
        { nombre: { contains: busqueda, mode: 'insensitive' } },
        { descripcion: { contains: busqueda, mode: 'insensitive' } },
      ];
    }

    // Handle category filtering by slug or ID, including subcategories
    if (categoria || categoriaId) {
      let categoriaIds: number[] = [];
      
      if (categoria) {
        // Find category by slug and get all subcategories
        const cat = await this.prisma.categoria.findFirst({
          where: { slug: categoria },
          include: { subcategorias: true },
        });
        
        if (cat) {
          categoriaIds = [cat.id, ...cat.subcategorias.map((sub) => sub.id)];
        }
      } else if (categoriaId) {
        // Find category by ID and get all subcategories
        const cat = await this.prisma.categoria.findUnique({
          where: { id: categoriaId },
          include: { subcategorias: true },
        });
        
        if (cat) {
          categoriaIds = [cat.id, ...cat.subcategorias.map((sub) => sub.id)];
        }
      }
      
      if (categoriaIds.length > 0) {
        where.categoriaId = { in: categoriaIds };
      }
    }
    
    if (destacado !== undefined) where.destacado = destacado;

    const skipValue = (pagina - 1) * limite;
    const takeValue = limite;

    const varianteWhere: any = { activo: true };
    if (enOferta) varianteWhere.enOferta = true;
    if (precioMin !== undefined || precioMax !== undefined) {
      varianteWhere.precioBase = {};
      if (precioMin !== undefined) varianteWhere.precioBase.gte = precioMin;
      if (precioMax !== undefined) varianteWhere.precioBase.lte = precioMax;
    }
    if (Object.keys(varianteWhere).length > 0) {
      where.variantes = { some: varianteWhere };
    }

    const orderBy: any = {};
    if (ordenar === 'calificacion') orderBy.calificacion = 'desc';
    else if (ordenar === 'ventas') orderBy.totalVentas = 'desc';
    else orderBy.creadoEn = 'desc';

    const [productos, total] = await Promise.all([
      this.prisma.producto.findMany({
        where,
        skip: skipValue,
        take: takeValue,
        orderBy,
        include: {
          categoria: { select: { id: true, nombre: true, slug: true } },
          marca: { select: { id: true, nombre: true } },
          imagenes: { where: { principal: true }, take: 1 },
          variantes: { 
            where: { activo: true },
            include: {
              color: true,
              size: true,
              imagenes: true,
            },
          },
        },
      }),
      this.prisma.producto.count({ where }),
    ]);

    return {
      datos: productos,
      total,
      pagina,
      limite,
      totalPaginas: Math.ceil(total / limite),
    };
  }

  async obtenerPorId(id: number) {
    const producto = await this.prisma.producto.findUnique({
      where: { id },
      include: {
        categoria: true,
        marca: true,
        imagenes: { orderBy: { orden: 'asc' } },
        variantes: { include: { color: true, size: true, imagenes: true } },
      },
    });

    if (!producto) throw new NotFoundException('Producto no encontrado');
    return producto;
  }

  async obtenerPorSlug(slug: string) {
    const producto = await this.prisma.producto.findUnique({
      where: { slug },
      include: {
        categoria: true,
        marca: true,
        imagenes: { orderBy: { orden: 'asc' } },
        variantes: { include: { color: true, size: true, imagenes: true } },
        resenas: {
          where: { aprobada: true },
          include: {
            usuario: { select: { nombre: true, apellido: true, avatar: true } },
          },
          take: 10,
          orderBy: { creadoEn: 'desc' },
        },
      },
    });

    if (!producto) throw new NotFoundException('Producto no encontrado');
    return producto;
  }

  async obtenerDestacados() {
    return this.prisma.producto.findMany({
      where: { activo: true, destacado: true },
      take: 8,
      orderBy: { totalVentas: 'desc' },
      include: {
        categoria: { select: { nombre: true, slug: true } },
        imagenes: { where: { principal: true }, take: 1 },
        variantes: { 
          where: { activo: true },
          include: {
            color: true,
            size: true,
            imagenes: true,
          },
        },
      },
    });
  }

  async obtenerOfertas() {
    return this.prisma.producto.findMany({
      where: { activo: true, variantes: { some: { activo: true, enOferta: true } } },
      take: 12,
      orderBy: { totalVentas: 'desc' },
      include: {
        categoria: { select: { nombre: true, slug: true } },
        imagenes: { where: { principal: true }, take: 1 },
        variantes: { 
          where: { activo: true },
          include: {
            color: true,
            size: true,
            imagenes: true,
          },
        },
      },
    });
  }

  async crear(datos: any) {
    const slug = this.generarSlug(datos.nombre);
    const { variantes = [], imagenes = [], ...productoData } = datos;

    // Filtrar campos válidos del producto
    const camposValidosProducto = [
      'nombre', 'descripcion', 'descripcionCorta', 'categoriaId',
      'marcaId', 'peso', 'dimensiones', 'activo', 'destacado', 'imagenPrincipal'
    ];
    const productoDataLimpio: any = {};
    for (const campo of camposValidosProducto) {
      if (productoData[campo] !== undefined) {
        productoDataLimpio[campo] = productoData[campo];
      }
    }

    // Convertir peso a Decimal
    if (productoDataLimpio.peso !== undefined && productoDataLimpio.peso !== null && productoDataLimpio.peso !== '') {
      productoDataLimpio.peso = Number(productoDataLimpio.peso);
    } else {
      productoDataLimpio.peso = null;
    }

    // First create the product with its global images and variants (without variant images)
    const producto = await this.prisma.producto.create({
      data: {
        ...productoDataLimpio,
        slug,
        imagenes: { create: imagenes },
        variantes: {
          create: variantes.map((v: any) => {
            const { imagenes: variantImages = [], ...variantData } = v;
            
            // Convertir valores numéricos
            const cleanedData: any = { ...variantData };
            
            // Eliminar campo id si existe (para crear nuevas variantes)
            delete cleanedData.id;
            
            // Precio Base - obligatorio
            cleanedData.precioBase = cleanedData.precioBase !== undefined && cleanedData.precioBase !== '' 
              ? Number(cleanedData.precioBase) 
              : 0;
            
            // Precio Oferta - opcional
            if (cleanedData.precioOferta !== undefined && cleanedData.precioOferta !== null && cleanedData.precioOferta !== '') {
              cleanedData.precioOferta = Number(cleanedData.precioOferta);
            } else {
              cleanedData.precioOferta = null;
            }
            
            // Stock - obligatorio
            cleanedData.stock = cleanedData.stock !== undefined && cleanedData.stock !== '' 
              ? Math.floor(Number(cleanedData.stock)) 
              : 0;
            
            // Stock Mínimo - obligatorio
            cleanedData.stockMinimo = cleanedData.stockMinimo !== undefined && cleanedData.stockMinimo !== '' 
              ? Math.floor(Number(cleanedData.stockMinimo)) 
              : 5;
            
            // Calcular enOferta y porcentajeDescuento
            if (cleanedData.precioBase > 0 && cleanedData.precioOferta && cleanedData.precioOferta < cleanedData.precioBase) {
              cleanedData.enOferta = true;
              cleanedData.porcentajeDescuento = Math.round(
                ((cleanedData.precioBase - cleanedData.precioOferta) / cleanedData.precioBase) * 100
              );
            } else {
              cleanedData.enOferta = false;
              cleanedData.porcentajeDescuento = null;
            }

            return cleanedData;
          }),
        },
      },
      include: {
        variantes: true,
      },
    });

    // Now create the variant images with both productoId and varianteId
    for (let i = 0; i < variantes.length; i++) {
      const variant = variantes[i];
      const variantDb = producto.variantes[i];
      const variantImages = variant.imagenes || [];
      
      if (variantImages.length > 0) {
        await this.prisma.imagenProducto.createMany({
          data: variantImages.map((img: any) => ({
            ...img,
            productoId: producto.id,
            varianteId: variantDb.id,
          })),
        });
      }
    }

    // Finally return the complete product
    return this.prisma.producto.findUnique({
      where: { id: producto.id },
      include: {
        imagenes: true,
        variantes: { include: { color: true, size: true, imagenes: true } },
      },
    });
  }

  async actualizar(id: number, datos: any) {
    const existe = await this.prisma.producto.findUnique({ where: { id } });
    if (!existe) throw new NotFoundException('Producto no encontrado');

    const { variantes = [], imagenes = [], ...productoData } = datos;

    // Filtrar campos válidos del producto
    const camposValidosProducto = [
      'nombre', 'descripcion', 'descripcionCorta', 'categoriaId',
      'marcaId', 'peso', 'dimensiones', 'activo', 'destacado', 'imagenPrincipal'
    ];
    const productoDataLimpio: any = {};
    for (const campo of camposValidosProducto) {
      if (productoData[campo] !== undefined) {
        productoDataLimpio[campo] = productoData[campo];
      }
    }

    // Convertir peso a Decimal
    if (productoDataLimpio.peso !== undefined && productoDataLimpio.peso !== null && productoDataLimpio.peso !== '') {
      productoDataLimpio.peso = Number(productoDataLimpio.peso);
    } else {
      productoDataLimpio.peso = null;
    }

    // Eliminar variantes y imágenes anteriores (simplificado)
    await this.prisma.varianteProducto.deleteMany({ where: { productoId: id } });
    await this.prisma.imagenProducto.deleteMany({ where: { productoId: id } });

    // First update the product with its global images and variants (without variant images)
    const producto = await this.prisma.producto.update({
      where: { id },
      data: {
        ...productoDataLimpio,
        imagenes: { create: imagenes },
        variantes: {
          create: variantes.map((v: any) => {
            const { imagenes: variantImages = [], ...variantData } = v;
            
            // Convertir valores numéricos
            const cleanedData: any = { ...variantData };
            
            // Eliminar campo id si existe (para crear nuevas variantes)
            delete cleanedData.id;
            
            // Precio Base - obligatorio
            cleanedData.precioBase = cleanedData.precioBase !== undefined && cleanedData.precioBase !== '' 
              ? Number(cleanedData.precioBase) 
              : 0;
            
            // Precio Oferta - opcional
            if (cleanedData.precioOferta !== undefined && cleanedData.precioOferta !== null && cleanedData.precioOferta !== '') {
              cleanedData.precioOferta = Number(cleanedData.precioOferta);
            } else {
              cleanedData.precioOferta = null;
            }
            
            // Stock - obligatorio
            cleanedData.stock = cleanedData.stock !== undefined && cleanedData.stock !== '' 
              ? Math.floor(Number(cleanedData.stock)) 
              : 0;
            
            // Stock Mínimo - obligatorio
            cleanedData.stockMinimo = cleanedData.stockMinimo !== undefined && cleanedData.stockMinimo !== '' 
              ? Math.floor(Number(cleanedData.stockMinimo)) 
              : 5;
            
            // Calcular enOferta y porcentajeDescuento
            if (cleanedData.precioBase > 0 && cleanedData.precioOferta && cleanedData.precioOferta < cleanedData.precioBase) {
              cleanedData.enOferta = true;
              cleanedData.porcentajeDescuento = Math.round(
                ((cleanedData.precioBase - cleanedData.precioOferta) / cleanedData.precioBase) * 100
              );
            } else {
              cleanedData.enOferta = false;
              cleanedData.porcentajeDescuento = null;
            }

            return cleanedData;
          }),
        },
      },
      include: {
        variantes: true,
      },
    });

    // Now create the variant images with both productoId and varianteId
    for (let i = 0; i < variantes.length; i++) {
      const variant = variantes[i];
      const variantDb = producto.variantes[i];
      const variantImages = variant.imagenes || [];
      
      if (variantImages.length > 0) {
        await this.prisma.imagenProducto.createMany({
          data: variantImages.map((img: any) => ({
            ...img,
            productoId: producto.id,
            varianteId: variantDb.id,
          })),
        });
      }
    }

    // Finally return the complete product
    return this.prisma.producto.findUnique({
      where: { id },
      include: {
        imagenes: true,
        variantes: { include: { color: true, size: true, imagenes: true } },
      },
    });
  }

  async toggleActive(id: number) {
    const producto = await this.obtenerPorId(id);
    return this.prisma.producto.update({
      where: { id },
      data: { activo: !producto.activo },
    });
  }

  async eliminar(id: number) {
    // Eliminar primero variantes, imágenes, etc.
    await this.prisma.varianteProducto.deleteMany({ where: { productoId: id } });
    await this.prisma.imagenProducto.deleteMany({ where: { productoId: id } });
    // Luego eliminar el producto
    return this.prisma.producto.delete({
      where: { id },
    });
  }

  private generarSlug(texto: string): string {
    return texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
      .replace(/^-+|-+$/g, ''); // Remove leading and trailing hyphens
  }
}
