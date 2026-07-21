
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('📊 Datos existentes en la BD:');
  
  // Categorías (incluyendo jerarquía)
  const categoriasPadre = await prisma.categoria.findMany({
    where: { categoriaPadreId: null },
    include: { subcategorias: true },
  });
  console.log(`\n✅ Categorías padre (${categoriasPadre.length}):`);
  categoriasPadre.forEach(padre => {
    console.log(`  📁 ${padre.nombre} (id: ${padre.id}, slug: ${padre.slug})`);
    padre.subcategorias.forEach(sub => {
      console.log(`    📂 ${sub.nombre} (id: ${sub.id}, slug: ${sub.slug})`);
    });
  });
  
  // Colores
  const colores = await prisma.color.findMany();
  console.log(`\n🎨 Colores (${colores.length}):`);
  colores.forEach(c => console.log(`  - ${c.nombre} (id: ${c.id}, hex: ${c.hex})`));
  
  // Tallas
  const tallas = await prisma.size.findMany();
  console.log(`\n📏 Tallas (${tallas.length}):`);
  tallas.forEach(t => console.log(`  - ${t.nombre} (id: ${t.id})`));
  
  // Tallas Colecciones
  const tallasColecciones = await prisma.sizeCollection.findMany();
  console.log(`\n📦 Colecciones de tallas (${tallasColecciones.length}):`);
  tallasColecciones.forEach(tc => console.log(`  - ${tc.nombre} (id: ${tc.id})`));
  
  // Productos existentes
  const productos = await prisma.producto.findMany({
    include: {
      categoria: true,
      variantes: true,
    }
  });
  console.log(`\n🛍️  Productos existentes (${productos.length}):`);
  productos.forEach(p => {
    console.log(`  - ${p.nombre} (${p.categoria.nombre}, variantes: ${p.variantes.length})`);
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
