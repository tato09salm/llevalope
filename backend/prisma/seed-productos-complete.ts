
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Función para generar slugs
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Datos de productos (con precio base por si lo necesitamos)
const productosData = [
  {
    nombre: 'Camiseta Básica Blanca',
    descripcion: 'Camiseta de algodón 100% para uso diario. Suave y cómoda.',
    descripcionCorta: 'Camiseta básica de algodón',
    categoriaSlug: 'polos',
    destacado: true,
    precioBase: 49.99,
    peso: 0.15,
  },
  {
    nombre: 'Audífonos Bluetooth Inalámbricos',
    descripcion: 'Audífonos con cancelación de ruido y batería de 20h.',
    descripcionCorta: 'Audífonos Bluetooth premium',
    categoriaSlug: 'audifonos',
    destacado: true,
    precioBase: 299.99,
    peso: 0.2,
  },
  {
    nombre: 'Smartphone XYZ Pro',
    descripcion: 'Smartphone con pantalla AMOLED 6.5", cámara 50MP y 256GB.',
    descripcionCorta: 'Smartphone de alta gama',
    categoriaSlug: 'smartphone',
    destacado: true,
    precioBase: 1499.99,
    peso: 0.2,
  },
  {
    nombre: 'Gorra Deportiva Unisex',
    descripcion: 'Gorra ajustable con protección UV para actividades al aire libre.',
    descripcionCorta: 'Gorra deportiva UV',
    categoriaSlug: 'accesorios',
    destacado: false,
    precioBase: 39.99,
    peso: 0.05,
  },
  {
    nombre: 'Polo Casual Rayado',
    descripcion: 'Polo de algodón con rayas clásicas, perfecto para looks casuales.',
    descripcionCorta: 'Polo rayado casual',
    categoriaSlug: 'polos',
    destacado: false,
    precioBase: 69.99,
    peso: 0.18,
  },
  {
    nombre: 'Audífonos Deportivos',
    descripcion: 'Audífonos resistentes al sudor con diseño ergonómico para entrenamientos.',
    descripcionCorta: 'Audífonos para deporte',
    categoriaSlug: 'audifonos',
    destacado: false,
    precioBase: 129.99,
    peso: 0.1,
  },
  {
    nombre: 'Cámara de Acción 4K',
    descripcion: 'Cámara resistente al agua con video 4K y estabilización.',
    descripcionCorta: 'Cámara de acción 4K',
    categoriaSlug: 'tecnologia',
    destacado: true,
    precioBase: 449.99,
    peso: 0.12,
  },
  {
    nombre: 'Chaqueta Ligera Casual',
    descripcion: 'Chaqueta de poliéster ligera, ideal para días frescos.',
    descripcionCorta: 'Chaqueta ligera',
    categoriaSlug: 'moda-masculina',
    destacado: false,
    precioBase: 149.99,
    peso: 0.35,
  },
  {
    nombre: 'Mochila Porta Laptop',
    descripcion: 'Mochila con compartimento para laptop 15.6" y múltiples bolsillos.',
    descripcionCorta: 'Mochila para laptop',
    categoriaSlug: 'accesorios',
    destacado: true,
    precioBase: 99.99,
    peso: 0.5,
  },
  {
    nombre: 'Reloj Inteligente',
    descripcion: 'Reloj con monitor de frecuencia cardíaca, GPS y notificaciones.',
    descripcionCorta: 'Smartwatch completo',
    categoriaSlug: 'tecnologia',
    destacado: true,
    precioBase: 399.99,
    peso: 0.08,
  },
  {
    nombre: 'Jeans Slim Fit',
    descripcion: 'Jeans de denim elástico con corte slim fit.',
    descripcionCorta: 'Jeans slim fit',
    categoriaSlug: 'moda-masculina',
    destacado: false,
    precioBase: 129.99,
    peso: 0.5,
  },
  {
    nombre: 'Zapatillas Running',
    descripcion: 'Zapatillas con amortiguación premium para running.',
    descripcionCorta: 'Zapatillas de running',
    categoriaSlug: 'accesorios',
    destacado: false,
    precioBase: 199.99,
    peso: 0.6,
  },
  {
    nombre: 'Tablet 10" 64GB',
    descripcion: 'Tablet con pantalla HD, 64GB de almacenamiento y batería de 8h.',
    descripcionCorta: 'Tablet HD 64GB',
    categoriaSlug: 'tecnologia',
    destacado: false,
    precioBase: 599.99,
    peso: 0.3,
  },
  {
    nombre: 'Camiseta Estampada',
    descripcion: 'Camiseta con diseño estampado moderno y 100% algodón.',
    descripcionCorta: 'Camiseta estampada',
    categoriaSlug: 'polos',
    destacado: false,
    precioBase: 59.99,
    peso: 0.15,
  },
  {
    nombre: 'Auriculares In-Ear',
    descripcion: 'Auriculares in-ear con sonido de alta fidelidad y micrófono.',
    descripcionCorta: 'Auriculares in-ear',
    categoriaSlug: 'audifonos',
    destacado: false,
    precioBase: 79.99,
    peso: 0.03,
  },
  {
    nombre: 'Billetera de Cuero',
    descripcion: 'Billetera de cuero genuino con múltiples compartimentos.',
    descripcionCorta: 'Billetera de cuero',
    categoriaSlug: 'accesorios',
    destacado: false,
    precioBase: 89.99,
    peso: 0.1,
  },
  {
    nombre: 'Polo de Piqué',
    descripcion: 'Polo clásico de piqué, ideal para looks semi-formales.',
    descripcionCorta: 'Polo de piqué',
    categoriaSlug: 'polos',
    destacado: true,
    precioBase: 89.99,
    peso: 0.2,
  },
  {
    nombre: 'Altavoz Bluetooth Portable',
    descripcion: 'Altavoz resistente al agua con sonido 360° y batería de 12h.',
    descripcionCorta: 'Altavoz Bluetooth portable',
    categoriaSlug: 'tecnologia',
    destacado: false,
    precioBase: 149.99,
    peso: 0.4,
  },
  {
    nombre: 'Sudadera con Capucha',
    descripcion: 'Sudadera de felpa suave con capucha y bolsillo canguro.',
    descripcionCorta: 'Sudadera con capucha',
    categoriaSlug: 'moda-masculina',
    destacado: true,
    precioBase: 119.99,
    peso: 0.4,
  },
  {
    nombre: 'Cargador Portátil 20000mAh',
    descripcion: 'Power bank con carga rápida y capacidad para 4 cargas completas.',
    descripcionCorta: 'Power bank 20000mAh',
    categoriaSlug: 'accesorios',
    destacado: true,
    precioBase: 79.99,
    peso: 0.25,
  },
];

async function main() {
  console.log('🌱 Iniciando seed COMPLETO de productos...');

  const [categorias, colores, tallas] = await Promise.all([
    prisma.categoria.findMany(),
    prisma.color.findMany(),
    prisma.size.findMany(),
  ]);

  // Paso 1: Asegurar que todos los productos de la lista existen
  let productosCreados = 0;
  let productosExistentes = 0;

  for (const data of productosData) {
    // Encontrar categoría
    const categoria = categorias.find(c => c.slug === data.categoriaSlug);
    if (!categoria) {
      console.log(`⚠️ Categoría ${data.categoriaSlug} no encontrada, saltando ${data.nombre}`);
      continue;
    }

    // Buscar producto por nombre o slug
    const baseSlug = slugify(data.nombre);
    let producto = await prisma.producto.findFirst({
      where: {
        OR: [
          { nombre: data.nombre },
          { slug: baseSlug },
        ],
      },
      include: { variantes: true },
    });

    if (!producto) {
      // Generar slug único
      let slug = baseSlug;
      let count = 1;
      while (await prisma.producto.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${count}`;
        count++;
      }

      // Crear producto
      producto = await prisma.producto.create({
        data: {
          nombre: data.nombre,
          slug: slug,
          descripcion: data.descripcion,
          descripcionCorta: data.descripcionCorta,
          categoriaId: categoria.id,
          activo: true,
          destacado: data.destacado,
          peso: data.peso,
          imagenPrincipal: `https://picsum.photos/seed/${slug}/500/500`,
          imagenes: {
            create: [
              {
                url: `https://picsum.photos/seed/${slug}/500/500`,
                alt: data.nombre,
                orden: 0,
                principal: true,
              },
              {
                url: `https://picsum.photos/seed/${slug}-2/500/500`,
                alt: `${data.nombre} (vista 2)`,
                orden: 1,
                principal: false,
              },
            ],
          },
        },
        include: {
          variantes: true,
          imagenes: true,
        },
      });
      productosCreados++;
      console.log(`✅ Producto CREADO: ${producto.nombre}`);
    } else {
      productosExistentes++;
      console.log(`ℹ️ Producto ya existe: ${producto.nombre}`);
    }

    // Paso 2: Asegurar que el producto tenga todas las variantes necesarias
    const variantesExistentes = producto.variantes;

    // Determinar tallas disponibles para el producto
    let tallasDisponibles = tallas;
    if (['audifonos', 'tecnologia', 'accesorios', 'smartphone'].includes(categoria.slug)) {
      tallasDisponibles = tallas.filter(t => t.nombre === 'Talla Única');
    }

    // Obtener precio base (si no está en data, usar un valor predeterminado o tomar de variante existente)
    const precioBase = data.precioBase || (variantesExistentes[0]?.precioBase.toNumber()) || 99.99;

    let ordenVariante = 0;
    for (const color of colores) {
      for (const talla of tallasDisponibles) {
        // Verificar si la variante ya existe
        const varianteExistente = variantesExistentes.find(
          v => v.colorId === color.id && v.sizeId === talla.id
        );

        if (!varianteExistente) {
          // Crear variante
          const sku = `${producto.slug.toUpperCase().substring(0, 8)}-${color.nombre.substring(0, 3).toUpperCase()}-${talla.nombre}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

          const enOferta = Math.random() > 0.7;
          const porcentajeDescuento = enOferta ? Math.floor(Math.random() * 20) + 5 : 0;
          const precioOferta = enOferta ? precioBase * (1 - porcentajeDescuento / 100) : null;
          const stock = Math.floor(Math.random() * 50) + 10;

          await prisma.varianteProducto.create({
            data: {
              productoId: producto.id,
              sku: sku,
              precioBase: precioBase,
              precioOferta: precioOferta,
              porcentajeDescuento: porcentajeDescuento,
              enOferta: enOferta,
              stock: stock,
              stockMinimo: 5,
              activo: true,
              esPrincipal: ordenVariante === 0,
              orden: ordenVariante,
              colorId: color.id,
              sizeId: talla.id,
            },
          });
          console.log(`  ✅ Variante CREADA: ${color.nombre} - ${talla.nombre}`);
        }
        ordenVariante++;
      }
    }
  }

  console.log('\n🎉 Seed COMPLETO terminado!');
  console.log(`✅ ${productosCreados} productos nuevos creados`);
  console.log(`✅ ${productosExistentes} productos ya existentes`);

  // Verificar total
  const totalProductos = await prisma.producto.count();
  const totalVariantes = await prisma.varianteProducto.count();
  console.log(`\n📊 Total en BD: ${totalProductos} productos y ${totalVariantes} variantes`);
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
