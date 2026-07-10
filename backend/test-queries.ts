
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Testing database queries...');
  
  try {
    // Test 1: Get all categories
    console.log('\n📋 Test 1: Getting all categories...');
    const categories = await prisma.categoria.findMany();
    console.log(`✅ Found ${categories.length} categories:`, categories.map(c => ({ id: c.id, nombre: c.nombre, slug: c.slug, activa: c.activa })));
    
    // Test 2: Get all products
    console.log('\n📦 Test 2: Getting all products...');
    const products = await prisma.producto.findMany();
    console.log(`✅ Found ${products.length} products:`, products.map(p => ({ id: p.id, nombre: p.nombre, slug: p.slug, activo: p.activo })));
    
    // Test 3: Get product by slug (if there are any)
    if (products.length > 0) {
      console.log('\n🔍 Test 3: Getting product by slug...');
      const productBySlug = await prisma.producto.findUnique({
        where: { slug: products[0].slug },
        include: {
          categoria: true,
          marca: true,
          imagenes: true,
          variantes: { include: { color: true, size: true, imagenes: true } },
          resenas: true,
        },
      });
      console.log(`✅ Found product by slug ${products[0].slug}:`, productBySlug);
    }

    console.log('\n🎉 All queries succeeded!');
  } catch (error) {
    console.error('❌ Error during testing:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
