import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // 1. Verificar si ya hay categorías
  let categoria = await prisma.categoria.findFirst();
  if (!categoria) {
    categoria = await prisma.categoria.create({
      data: {
        nombre: 'Tecnología',
        slug: 'tecnologia',
        descripcion: 'Productos electrónicos y tecnología',
        activa: true,
        orden: 1,
      },
    });
    console.log('✅ Categoría creada:', categoria.nombre);

    // Crear subcategoría
    const subcategoria = await prisma.categoria.create({
      data: {
        nombre: 'Audífonos',
        slug: 'audifonos',
        descripcion: 'Audífonos y auriculares',
        categoriaPadreId: categoria.id,
        activa: true,
        orden: 1,
      },
    });
    console.log('✅ Subcategoría creada:', subcategoria.nombre);
    categoria = subcategoria;
  }

  // 2. Verificar si hay colores
  let color = await prisma.color.findFirst();
  if (!color) {
    color = await prisma.color.create({
      data: {
        nombre: 'Negro',
        hex: '#000000',
        activo: true,
      },
    });
    console.log('✅ Color creado:', color.nombre);
  }

  // 3. Verificar si hay tallas
  let talla = await prisma.size.findFirst();
  let coleccion = await prisma.sizeCollection.findFirst();
  if (!coleccion) {
    coleccion = await prisma.sizeCollection.create({
      data: {
        nombre: 'Unico',
        activo: true,
        orden: 1,
      },
    });
  }
  if (!talla) {
    talla = await prisma.size.create({
      data: {
        nombre: 'Talla Única',
        coleccionId: coleccion.id,
        activo: true,
        orden: 1,
      },
    });
    console.log('✅ Talla creada:', talla.nombre);
  }

  // 4. Crear producto
  const producto = await prisma.producto.create({
    data: {
      nombre: 'Audífonos Sony WH-1000XM5',
      slug: 'audifonos-sony-wh1000xm5',
      descripcion: 'Los mejores audífonos de cancelación de ruido del mercado. Sonido premium y comodidad todo el día.',
      descripcionCorta: 'Audífonos inalámbricos con cancelación de ruido',
      categoriaId: categoria.id,
      activo: true,
      destacado: true,
      peso: 0.250,
      imagenes: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500',
            alt: 'Audífonos Sony WH-1000XM5',
            orden: 0,
            principal: true,
          },
        ],
      },
    },
    include: {
      imagenes: true,
    },
  });

  console.log('✅ Producto creado:', producto.nombre);

  // 5. Crear variante del producto
  const variante = await prisma.varianteProducto.create({
    data: {
      productoId: producto.id,
      sku: 'SONY-WH1000XM5-NEGRO',
      precioBase: 1499.00,
      precioOferta: 1299.00,
      porcentajeDescuento: 13,
      stock: 50,
      stockMinimo: 10,
      enOferta: true,
      activo: true,
      esPrincipal: true,
      orden: 0,
      colorId: color.id,
      sizeId: talla.id,
    },
  });

  console.log('✅ Variante creada:', variante.sku);
  
  console.log('🎉 Seed completado!');
  console.log('👉 Producto creado con éxito! Ve a http://localhost:3000/admin/productos para verlo');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
