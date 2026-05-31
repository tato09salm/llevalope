import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Buscando productos...');

  const productos = await prisma.producto.findMany({
    include: {
      categoria: true,
      variantes: true,
      imagenes: true,
    },
  });

  console.log('📦 Productos encontrados:', productos.length);
  
  productos.forEach((p, i) => {
    console.log(`\n--- Producto ${i + 1} ---`);
    console.log('ID:', p.id);
    console.log('Nombre:', p.nombre);
    console.log('Slug:', p.slug);
    console.log('Activo:', p.activo);
    console.log('Categoría:', p.categoria?.nombre);
    console.log('Variantes:', p.variantes.length);
    console.log('Imágenes:', p.imagenes.length);
  });
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
