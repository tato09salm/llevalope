
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Checking database...');
  
  // Check proveedores
  const proveedores = await prisma.proveedor.findMany();
  console.log('\n=== Proveedores ===');
  console.log(`Total: ${proveedores.length}`);
  proveedores.forEach(p => {
    console.log(`- ${p.nombre} (RUC: ${p.ruc}, Activo: ${p.activo})`);
  });

  // Check ordenes de compra
  const ordenes = await prisma.ordenCompra.findMany({ include: { proveedor: true } });
  console.log('\n=== Órdenes de Compra ===');
  console.log(`Total: ${ordenes.length}`);
  ordenes.forEach(o => {
    console.log(`- ${o.numeroOrden} | ${o.proveedor?.nombre} | S/. ${o.total.toNumber()}`);
  });

  console.log('\n✅ Check complete');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
