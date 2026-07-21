
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

async function main() {
  console.log('🌱 Iniciando seed de 20 productos...');

  // 1. Obtener datos existentes
  const [categorias, colores, tallas] = await Promise.all([
    prisma.categoria.findMany(),
    prisma.color.findMany(),
    prisma.size.findMany(),
  ]);

  console.log(`✅ Categorías: ${categorias.length}, Colores: ${colores.length}, Tallas: ${tallas.length}`);

  // 2. Datos de los 20 productos
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

  // 3. Crear cada producto con variantes
  let productosCreados = 0;
  let variantesCreadas = 0;

  for (let i = 0; i < productosData.length; i++) {
    const data = productosData[i];
    
    // Encontrar la categoría
    const categoria = categorias.find(c => c.slug === data.categoriaSlug);
    if (!categoria) {
      console.log(`⚠️ Categoría ${data.categoriaSlug} no encontrada, saltando producto ${data.nombre}`);
      continue;
    }

    // Generar slug único
    const baseSlug = slugify(data.nombre);
    let slug = baseSlug;
    let count = 1;
    while (await prisma.producto.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${count}`;
      count++;
    }

    // Skip product if a similar one already exists (with baseSlug)
    const existingProduct = await prisma.producto.findFirst({
      where: {
        OR: [
          { slug: baseSlug },
          { nombre: data.nombre }
        ]
      }
    });
    if (existingProduct) {
      console.log(`ℹ️ Producto "${data.nombre}" ya existe, saltando...`);
      continue;
    }

    // Crear producto
    const producto = await prisma.producto.create({
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
        imagenes: true,
      },
    });

    productosCreados++;
    console.log(`✅ Producto creado: ${producto.nombre} (slug: ${producto.slug})`);

    // Crear variantes (combinaciones de color y talla)
    let ordenVariante = 0;
    for (const color of colores) {
      // Seleccionar tallas dependiendo de la categoría
      let tallasDisponibles = tallas;
      if (['audifonos', 'tecnologia', 'accesorios', 'smartphone'].includes(categoria.slug)) {
        // Categorías sin tallas: solo "Talla Única"
        tallasDisponibles = tallas.filter(t => t.nombre === 'Talla Única');
      }

      for (const talla of tallasDisponibles) {
        // SKU único: incluye timestamp para evitar conflictos
        const sku = `${slug.toUpperCase().substring(0, 8)}-${color.nombre.substring(0, 3).toUpperCase()}-${talla.nombre}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        
        // Precio oferta aleatorio para algunas variantes
        const enOferta = Math.random() > 0.7;
        const porcentajeDescuento = enOferta ? Math.floor(Math.random() * 20) + 5 : 0;
        const precioOferta = enOferta ? data.precioBase * (1 - porcentajeDescuento / 100) : null;
        const stock = Math.floor(Math.random() * 50) + 10;

        const variante = await prisma.varianteProducto.create({
          data: {
            productoId: producto.id,
            sku: sku,
            precioBase: data.precioBase,
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

        variantesCreadas++;
        ordenVariante++;
      }
    }
  }

  console.log('\n🎉 Seed completado!');
  console.log(`✅ ${productosCreados} productos creados`);
  console.log(`✅ ${variantesCreadas} variantes creadas`);
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
