import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando la creación de proveedores y órdenes de compra...');

  // 1. Crear 2 proveedores
  const proveedor1 = await prisma.proveedor.upsert({
    where: { ruc: '20123456789' },
    update: {},
    create: {
      nombre: 'Distribuidora Textil del Perú S.A.C.',
      ruc: '20123456789',
      contacto: 'Juan Pérez',
      correo: 'juan.perez@distritextil.pe',
      telefono: '987654321',
      direccion: 'Av. Javier Prado Este 1234, San Isidro, Lima',
      pais: 'Perú',
      activo: true,
      calificacion: 4.8,
      notas: 'Proveedor principal de telas y textiles de alta calidad',
    }
  });

  const proveedor2 = await prisma.proveedor.upsert({
    where: { ruc: '20987654321' },
    update: {},
    create: {
      nombre: 'Importadora Moda Global E.I.R.L.',
      ruc: '20987654321',
      contacto: 'María López',
      correo: 'maria.lopez@modaglobal.pe',
      telefono: '912345678',
      direccion: 'Jr. de la Unión 567, Miraflores, Lima',
      pais: 'Perú',
      activo: true,
      calificacion: 4.5,
      notas: 'Proveedor especializado en prendas de vestir importadas',
    }
  });

  console.log('✅ Proveedores creados:', { proveedor1, proveedor2 });

  // 2. Obtener productos y variantes para las órdenes
  const productos = await prisma.producto.findMany({
    take: 3,
    include: {
      variantes: {
        take: 2,
      }
    }
  });

  if (productos.length === 0) {
    console.log('⚠️ No hay productos para crear órdenes de compra');
    return;
  }

  // 3. Crear la primera orden de compra
  const numeroOrden1 = `OC-${Date.now()}-1`;
  const itemsOrden1 = productos.slice(0, 2).flatMap((producto, i) =>
    producto.variantes.slice(0, 1).map((variante) => {
      const precioUnit = variante.precioBase.toNumber() * 0.8; // 80% del precio de venta
      const cantidad = 10 + i * 5; // Cantidades variables
      const subtotal = precioUnit * cantidad;

      return {
        productoId: producto.id,
        varianteId: variante.id,
        cantidadPedida: cantidad,
        precioUnit,
        subtotal,
      };
    })
  );

  const totalOrden1 = itemsOrden1.reduce((sum, item) => sum + item.subtotal, 0);

  const orden1 = await prisma.ordenCompra.create({
    data: {
      numeroOrden: numeroOrden1,
      proveedorId: proveedor1.id,
      estado: 'CONFIRMADA',
      subtotal: totalOrden1,
      descuento: 0,
      total: totalOrden1,
      notas: 'Primera orden de compra de prueba',
      items: {
        create: itemsOrden1,
      },
    },
    include: { items: true },
  });

  // 4. Crear la segunda orden de compra
  const numeroOrden2 = `OC-${Date.now()}-2`;
  const itemsOrden2 = productos.slice(1, 3).flatMap((producto, i) =>
    producto.variantes.slice(0, 2).map((variante) => {
      const precioUnit = variante.precioBase.toNumber() * 0.75; // 75% del precio de venta
      const cantidad = 5 + i * 10; // Cantidades variables
      const subtotal = precioUnit * cantidad;

      return {
        productoId: producto.id,
        varianteId: variante.id,
        cantidadPedida: cantidad,
        precioUnit,
        subtotal,
      };
    })
  );

  const totalOrden2 = itemsOrden2.reduce((sum, item) => sum + item.subtotal, 0);

  const orden2 = await prisma.ordenCompra.create({
    data: {
      numeroOrden: numeroOrden2,
      proveedorId: proveedor2.id,
      estado: 'EN_TRANSITO',
      subtotal: totalOrden2,
      descuento: 0,
      total: totalOrden2,
      notas: 'Segunda orden de compra de prueba',
      items: {
        create: itemsOrden2,
      },
    },
    include: { items: true },
  });

  console.log('✅ Órdenes de compra creadas:', { orden1, orden2 });
  console.log('🎉 Seed de proveedores y órdenes completada con éxito!');
}

main()
  .catch((e) => {
    console.error('❌ Error en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
