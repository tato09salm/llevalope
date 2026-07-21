
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

const newCategories = [
  {
    nombre: 'Hogar',
    slug: 'hogar',
    descripcion: 'Productos para el hogar y decoración',
    subcategorias: [
      {
        nombre: 'Decoración',
        slug: 'decoracion',
        descripcion: 'Artículos de decoración para tu hogar',
        productos: [
          {
            nombre: 'Maceta de Cerámica',
            descripcion: 'Maceta de cerámica moderna para plantas de interior',
            descripcionCorta: 'Maceta decorativa',
            precioBase: 59.99,
            peso: 1.5,
          },
          {
            nombre: 'Lámpara de Mesa LED',
            descripcion: 'Lámpara de mesa LED regulable con diseño minimalista',
            descripcionCorta: 'Lámpara LED decorativa',
            precioBase: 129.99,
            peso: 0.8,
          }
        ]
      },
      {
        nombre: 'Cocina',
        slug: 'cocina',
        descripcion: 'Utensilios y accesorios para la cocina',
        productos: [
          {
            nombre: 'Set de Ollas Antiadherentes',
            descripcion: 'Set de 5 ollas antiadherentes de alta calidad',
            descripcionCorta: 'Set de ollas',
            precioBase: 299.99,
            peso: 5.0,
          },
          {
            nombre: 'Cuchillo de Chef Profesional',
            descripcion: 'Cuchillo de chef de acero inoxidable con mango ergonómico',
            descripcionCorta: 'Cuchillo profesional',
            precioBase: 89.99,
            peso: 0.2,
          }
        ]
      }
    ]
  },
  {
    nombre: 'Moda Femenina',
    slug: 'moda-femenina',
    descripcion: 'Ropa y accesorios para mujer',
    subcategorias: [
      {
        nombre: 'Vestidos',
        slug: 'vestidos',
        descripcion: 'Vestidos casuales y formales para mujer',
        productos: [
          {
            nombre: 'Vestido Floral Casual',
            descripcion: 'Vestido de algodón con estampado floral, perfecto para el día',
            descripcionCorta: 'Vestido floral',
            precioBase: 149.99,
            peso: 0.3,
          },
          {
            nombre: 'Vestido de Noche Elegante',
            descripcion: 'Vestido largo de satén para ocasiones especiales',
            descripcionCorta: 'Vestido de noche',
            precioBase: 399.99,
            peso: 0.5,
          }
        ]
      },
      {
        nombre: 'Blusas',
        slug: 'blusas',
        descripcion: 'Blusas y tops para mujer',
        productos: [
          {
            nombre: 'Blusa de Seda',
            descripcion: 'Blusa de seda natural con cuello V',
            descripcionCorta: 'Blusa de seda',
            precioBase: 199.99,
            peso: 0.2,
          },
          {
            nombre: 'Top Crop',
            descripcion: 'Top crop de algodón elástico en colores neutros',
            descripcionCorta: 'Top crop',
            precioBase: 69.99,
            peso: 0.1,
          }
        ]
      }
    ]
  },
  {
    nombre: 'Niño',
    slug: 'nino',
    descripcion: 'Productos para niños y bebés',
    subcategorias: [
      {
        nombre: 'Juguetes',
        slug: 'juguetes',
        descripcion: 'Juguetes educativos y divertidos para niños',
        productos: [
          {
            nombre: 'Set de Bloques de Construcción',
            descripcion: 'Set de 200 bloques de construcción para desarrollar la creatividad',
            descripcionCorta: 'Bloques de construcción',
            precioBase: 99.99,
            peso: 1.2,
          },
          {
            nombre: 'Muñeca Interactiva',
            descripcion: 'Muñeca que habla y responde a estímulos',
            descripcionCorta: 'Muñeca interactiva',
            precioBase: 149.99,
            peso: 0.6,
          }
        ]
      },
      {
        nombre: 'Ropa de Niño',
        slug: 'ropa-nino',
        descripcion: 'Ropa cómoda y resistente para niños',
        productos: [
          {
            nombre: 'Pijama de Niño',
            descripcion: 'Pijama de algodón suave con diseño de dinosaurios',
            descripcionCorta: 'Pijama de dinosaurios',
            precioBase: 79.99,
            peso: 0.3,
          },
          {
            nombre: 'Sudadera con Capucha para Niños',
            descripcion: 'Sudadera con capucha y bolsillo canguro',
            descripcionCorta: 'Sudadera para niños',
            precioBase: 99.99,
            peso: 0.4,
          }
        ]
      }
    ]
  },
  {
    nombre: 'Belleza y Cuidado Personal',
    slug: 'belleza-cuidado-personal',
    descripcion: 'Productos de belleza, cuidado de la piel y salud',
    subcategorias: [
      {
        nombre: 'Cuidado Facial',
        slug: 'cuidado-facial',
        descripcion: 'Productos para el cuidado de la piel del rostro',
        productos: [
          {
            nombre: 'Set de Skincare Básico',
            descripcion: 'Set de limpiador, tónico y humectante para piel normal',
            descripcionCorta: 'Set de skincare',
            precioBase: 199.99,
            peso: 0.5,
          },
          {
            nombre: 'Crema Antiage',
            descripcion: 'Crema facial con ácido hialurónico y vitamina C',
            descripcionCorta: 'Crema antiage',
            precioBase: 149.99,
            peso: 0.1,
          }
        ]
      },
      {
        nombre: 'Maquillaje',
        slug: 'maquillaje',
        descripcion: 'Cosméticos y maquillaje para todos los estilos',
        productos: [
          {
            nombre: 'Paleta de Sombras',
            descripcion: 'Paleta de 16 sombras de ojos en tonos neutros',
            descripcionCorta: 'Paleta de sombras',
            precioBase: 89.99,
            peso: 0.2,
          },
          {
            nombre: 'Labial Mate de Larga Duración',
            descripcion: 'Labial mate que dura hasta 12 horas',
            descripcionCorta: 'Labial mate',
            precioBase: 49.99,
            peso: 0.05,
          }
        ]
      }
    ]
  }
];

async function main() {
  console.log('🌱 Iniciando seed de categorías y productos nuevos');

  const [colores, tallas] = await Promise.all([
    prisma.color.findMany(),
    prisma.size.findMany(),
  ]);

  let categoriasPadreCreadas = 0;
  let subcategoriasCreadas = 0;
  let productosCreados = 0;
  let variantesCreadas = 0;

  for (const catPadre of newCategories) {
    // 1. Crear/Obtener categoría padre
    let categoriaPadre = await prisma.categoria.findUnique({
      where: { slug: catPadre.slug },
    });

    if (!categoriaPadre) {
      categoriaPadre = await prisma.categoria.create({
        data: {
          nombre: catPadre.nombre,
          slug: catPadre.slug,
          descripcion: catPadre.descripcion,
          activa: true,
          orden: 0,
        },
      });
      categoriasPadreCreadas++;
      console.log(`✅ Categoría padre creada: ${categoriaPadre.nombre}`);
    } else {
      console.log(`ℹ️ Categoría padre ya existe: ${categoriaPadre.nombre}`);
    }

    // 2. Crear/Obtener subcategorías
    for (const subcat of catPadre.subcategorias) {
      let subcategoria = await prisma.categoria.findUnique({
        where: { slug: subcat.slug },
      });

      if (!subcategoria) {
        subcategoria = await prisma.categoria.create({
          data: {
            nombre: subcat.nombre,
            slug: subcat.slug,
            descripcion: subcat.descripcion,
            categoriaPadreId: categoriaPadre.id,
            activa: true,
            orden: 0,
          },
        });
        subcategoriasCreadas++;
        console.log(`  ✅ Subcategoría creada: ${subcategoria.nombre}`);
      } else {
        console.log(`  ℹ️ Subcategoría ya existe: ${subcategoria.nombre}`);
      }

      // 3. Crear productos para subcategoría
      for (const prodData of subcat.productos) {
        const baseSlug = slugify(prodData.nombre);
        
        let producto = await prisma.producto.findFirst({
          where: {
            OR: [
              { nombre: prodData.nombre },
              { slug: baseSlug }
            ],
          },
          include: { variantes: true },
        });

        if (!producto) {
          let slug = baseSlug;
          let count = 1;
          while (await prisma.producto.findUnique({ where: { slug } })) {
            slug = `${baseSlug}-${count}`;
            count++;
          }

          producto = await prisma.producto.create({
            data: {
              nombre: prodData.nombre,
              slug: slug,
              descripcion: prodData.descripcion,
              descripcionCorta: prodData.descripcionCorta,
              categoriaId: subcategoria.id,
              activo: true,
              destacado: Math.random() > 0.5,
              peso: prodData.peso,
              imagenPrincipal: `https://picsum.photos/seed/${slug}/500/500`,
              imagenes: {
                create: [
                  {
                    url: `https://picsum.photos/seed/${slug}/500/500`,
                    alt: prodData.nombre,
                    orden: 0,
                    principal: true,
                  },
                  {
                    url: `https://picsum.photos/seed/${slug}-2/500/500`,
                    alt: `${prodData.nombre} (vista 2)`,
                    orden: 1,
                    principal: false,
                  }
                ]
              }
            },
            include: { variantes: true },
          });
          productosCreados++;
          console.log(`    ✅ Producto creado: ${producto.nombre}`);
        } else {
          console.log(`    ℹ️ Producto ya existe: ${producto.nombre}`);
        }

        // 4. Crear variantes para el producto
        let tallasDisponibles = tallas;
        if (['hogar', 'belleza-cuidado-personal', 'juguetes'].includes(categoriaPadre.slug) || 
            ['decoracion', 'cocina', 'cuidado-facial', 'maquillaje', 'juguetes'].includes(subcategoria.slug)) {
          tallasDisponibles = tallas.filter(t => t.nombre === 'Talla Única');
        }

        let ordenVariante = 0;
        for (const color of colores) {
          for (const talla of tallasDisponibles) {
            const varianteExistente = producto.variantes.find(
              v => v.colorId === color.id && v.sizeId === talla.id
            );

            if (!varianteExistente) {
              const sku = `${producto.slug.toUpperCase().substring(0,8)}-${color.nombre.substring(0,3).toUpperCase()}-${talla.nombre}-${Date.now()}-${Math.floor(Math.random()*1000)}`;
              const enOferta = Math.random() > 0.7;
              const porcentajeDescuento = enOferta ? Math.floor(Math.random()*20) + 5 : 0;
              const precioOferta = enOferta ? prodData.precioBase * (1 - porcentajeDescuento/100) : null;
              const stock = Math.floor(Math.random()*50) + 10;

              await prisma.varianteProducto.create({
                data: {
                  productoId: producto.id,
                  sku: sku,
                  precioBase: prodData.precioBase,
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
            }
            ordenVariante++;
          }
        }
      }
    }
  }

  console.log('\n🎉 Seed finalizado!');
  console.log(`✅ Categorías padre creadas: ${categoriasPadreCreadas}`);
  console.log(`✅ Subcategorías creadas: ${subcategoriasCreadas}`);
  console.log(`✅ Productos creados: ${productosCreados}`);
  console.log(`✅ Variantes creadas: ${variantesCreadas}`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
